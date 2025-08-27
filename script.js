// 実験設定
const config = {
    cueDisplayTime: 350,
    cueDelay: 750,
    interTrialInterval: 1000,
    responseTimeout: 2000,
    trainingTrials: 10,
    realTrials: 50
};

// 刺激定義
const colorTaskStimuli = [
    { name: "color congruent 1 left", shape: "circle", color: "yellow", correctKey: "b", congruent: true },
    { name: "color incongruent 2 left", shape: "rectangle", color: "yellow", correctKey: "b", congruent: false },
    { name: "color incongruent 2 right", shape: "circle", color: "blue", correctKey: "n", congruent: false },
    { name: "color congruent 1 right", shape: "rectangle", color: "blue", correctKey: "n", congruent: true }
];

const shapeTaskStimuli = [
    { name: "shape congruent 1 left", shape: "circle", color: "yellow", correctKey: "b", congruent: true },
    { name: "shape incongruent 2 right", shape: "rectangle", color: "yellow", correctKey: "n", congruent: false },
    { name: "shape incongruent 2 left", shape: "circle", color: "blue", correctKey: "b", congruent: false },
    { name: "shape congruent 1 right", shape: "rectangle", color: "blue", correctKey: "n", congruent: true }
];

// 実験状態
let currentScreen = 0;
let currentPhase = 'entry';
let trialData = [];
let currentTrial = 0;
let trialStartTime = 0;
let previousTask = 0;
let currentTask = 0;
let isTraining = true;
let awaitingResponse = false;
let participantInfo = {};

const instructionScreens = ['info1', 'instruction1', 'instruction2', 'instruction3', 'instruction4'];

// デバッグ用
console.log('実験スクリプトが読み込まれました。');

// 画面表示
function showScreen(screenId) {
    console.log('画面切り替え:', screenId);
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const targetScreen = document.getElementById(screenId);
    if (targetScreen) {
        targetScreen.classList.add('active');
    } else {
        console.error('画面が見つかりません:', screenId);
    }
}

// 参加者情報の処理
document.addEventListener('DOMContentLoaded', () => {
    const entryForm = document.getElementById('entryForm');
    if (entryForm) {
        entryForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const name = document.getElementById('participantName').value.trim();
            const age = document.getElementById('participantAge').value;
            const gender = document.getElementById('participantGender').value;
            
            if (!name) {
                alert('参加者IDを入力してください。');
                return;
            }
            
            participantInfo = {
                name: name,
                age: age || '未入力',
                gender: gender || '未入力',
                startTime: new Date().toISOString(),
                userAgent: navigator.userAgent
            };
            
            console.log('参加者情報:', participantInfo);
            
            currentPhase = 'instructions';
            currentScreen = 0;
            showScreen(instructionScreens[0]);
        });
    }
});

// 説明画面のナビゲーション
function nextInstruction() {
    if (currentScreen < instructionScreens.length - 1) {
        currentScreen++;
        showScreen(instructionScreens[currentScreen]);
    } else if (currentScreen === instructionScreens.length - 1) {
        startTraining();
    }
}

function previousInstruction() {
    if (currentScreen > 0 && currentScreen < instructionScreens.length) {
        currentScreen--;
        showScreen(instructionScreens[currentScreen]);
    }
}

// 練習開始
function startTraining() {
    isTraining = true;
    currentTrial = 0;
    trialData = [];
    currentPhase = 'experiment';
    runTrial();
}

// 本実験開始
function startRealExperiment() {
    showScreen('ready');
    isTraining = false;
    currentTrial = 0;
    // 練習データは保持したまま本実験を続ける
}

// 単一試行の実行
async function runTrial() {
    showScreen('trial');
    const trialContent = document.getElementById('trial-content');
    const practiceIndicator = document.getElementById('practice-indicator');
    
    // 練習試行の表示
    practiceIndicator.style.display = isTraining ? 'block' : 'none';
    
    // 課題をランダムに選択
    currentTask = Math.random() < 0.5 ? 1 : 2; // 1 = 色, 2 = 形
    const taskSwitch = currentTask !== previousTask && previousTask !== 0;
    
    // 刺激を選択
    const stimuli = currentTask === 1 ? colorTaskStimuli : shapeTaskStimuli;
    const stimulus = stimuli[Math.floor(Math.random() * stimuli.length)];
    
    // 固定点表示
    trialContent.innerHTML = '<div class="fixation">+</div>';
    await sleep(150);
    trialContent.innerHTML = '';
    await sleep(500);
    
    // 手がかり表示
    const cueClass = currentTask === 1 ? 'color-cue' : 'shape-cue';
    const cueText = currentTask === 1 ? '色' : '形';
    trialContent.innerHTML = `<div class="cue ${cueClass}">${cueText}</div>`;
    await sleep(config.cueDisplayTime);
    trialContent.innerHTML = '';
    await sleep(config.cueDelay);
    
    // 刺激表示（練習時はヒント付き）
    const shapeClass = stimulus.shape === 'circle' ? 'circle' : 'rectangle';
    let stimulusHTML = `<div class="stimulus ${shapeClass} ${stimulus.color}"></div>`;
    
    // 練習時のヒント表示
    if (isTraining) {
        let hintText = '';
        if (currentTask === 1) { // 色課題
            hintText = `<div class="practice-hint">
                <div class="hint-title">色課題</div>
                <div class="hint-keys">
                    <span class="key-hint yellow-hint">黄色 → B</span>
                    <span class="key-hint blue-hint">青色 → N</span>
                </div>
                <div class="current-answer">正解: <strong>${stimulus.correctKey.toUpperCase()}</strong></div>
            </div>`;
        } else { // 形課題
            hintText = `<div class="practice-hint">
                <div class="hint-title">形課題</div>
                <div class="hint-keys">
                    <span class="key-hint">円 → B</span>
                    <span class="key-hint">四角 → N</span>
                </div>
                <div class="current-answer">正解: <strong>${stimulus.correctKey.toUpperCase()}</strong></div>
            </div>`;
        }
        stimulusHTML += hintText;
    }
    
    trialContent.innerHTML = stimulusHTML;
    
    // 反応収集開始
    trialStartTime = Date.now();
    awaitingResponse = true;
    const response = await collectResponse(config.responseTimeout);
    awaitingResponse = false;
    
    // 反応処理
    let status = 'TIMEOUT';
    let rt = null;
    
    if (response) {
        rt = response.rt;
        status = response.key === stimulus.correctKey ? 'CORRECT' : 'WRONG';
    }
    
    // エラーフィードバック
    trialContent.innerHTML = '';
    if (status === 'WRONG') {
        trialContent.innerHTML = '<div class="feedback">間違ったキーです！</div>';
        await sleep(500);
    } else if (status === 'TIMEOUT') {
        trialContent.innerHTML = '<div class="feedback">反応が遅すぎます！</div>';
        await sleep(500);
    }
    
    trialContent.innerHTML = '';
    
    // 試行データ保存
    trialData.push({
        participantName: participantInfo.name,
        participantAge: participantInfo.age,
        participantGender: participantInfo.gender,
        trial: currentTrial + 1,
        totalTrial: trialData.length + 1,
        phase: isTraining ? 'practice' : 'main',
        task: currentTask === 1 ? 'color' : 'shape',
        stimulus: stimulus.name,
        stimulusShape: stimulus.shape,
        stimulusColor: stimulus.color,
        congruent: stimulus.congruent,
        taskSwitch: taskSwitch,
        correctResponse: stimulus.correctKey,
        actualResponse: response ? response.key : null,
        rt: rt,
        status: status,
        timestamp: new Date().toISOString()
    });
    
    previousTask = currentTask;
    await sleep(config.interTrialInterval);
    
    // 次の試行または終了
    currentTrial++;
    const maxTrials = isTraining ? config.trainingTrials : config.realTrials;
    
    if (currentTrial < maxTrials) {
        runTrial();
    } else if (isTraining) {
        startRealExperiment();
    } else {
        showResults();
    }
}

// 反応収集
function collectResponse(timeout) {
    return new Promise((resolve) => {
        let responded = false;
        const startTime = Date.now();
        
        const handleKeyPress = (e) => {
            if (!awaitingResponse || responded) return;
            
            const key = e.key.toLowerCase();
            if (key === 'b' || key === 'n') {
                responded = true;
                document.removeEventListener('keydown', handleKeyPress);
                resolve({
                    key: key,
                    rt: Date.now() - startTime
                });
            }
        };
        
        document.addEventListener('keydown', handleKeyPress);
        
        setTimeout(() => {
            if (!responded) {
                document.removeEventListener('keydown', handleKeyPress);
                resolve(null);
            }
        }, timeout);
    });
}

// 結果の計算と表示
function showResults() {
    // 本実験のデータのみを使用
    const mainTrials = trialData.filter(t => t.phase === 'main');
    const correctTrials = mainTrials.filter(t => t.status === 'CORRECT');
    const repeatTrials = correctTrials.filter(t => !t.taskSwitch);
    const switchTrials = correctTrials.filter(t => t.taskSwitch);
    const congruentTrials = correctTrials.filter(t => t.congruent);
    const incongruentTrials = correctTrials.filter(t => !t.congruent);
    
    const avgRT = mean(correctTrials.map(t => t.rt));
    const repeatRT = mean(repeatTrials.map(t => t.rt));
    const switchRT = mean(switchTrials.map(t => t.rt));
    const congruentRT = mean(congruentTrials.map(t => t.rt));
    const incongruentRT = mean(incongruentTrials.map(t => t.rt));
    
    const switchCost = switchRT - repeatRT;
    const interference = incongruentRT - congruentRT;
    
    const accuracy = (correctTrials.length / mainTrials.length * 100).toFixed(1);
    
    const resultsHTML = `
        <div style="margin-bottom: 20px;">
            <strong>参加者:</strong> ${participantInfo.name}<br>
            <strong>実施日時:</strong> ${new Date().toLocaleString('ja-JP')}
        </div>
        <div style="border-top: 2px solid #555; padding-top: 20px;">
            <strong>正答率:</strong> ${accuracy}%<br><br>
            <strong>全正答試行の平均反応時間:</strong> ${Math.round(avgRT)}ms<br>
            <strong>課題繰り返し試行の反応時間:</strong> ${Math.round(repeatRT)}ms<br>
            <strong>課題切り替え試行の反応時間:</strong> ${Math.round(switchRT)}ms<br>
            <strong style="color: #ffc107;">課題切り替えコスト:</strong> ${Math.round(switchCost)}ms<br><br>
            <strong>課題一致試行の反応時間:</strong> ${Math.round(congruentRT)}ms<br>
            <strong>課題不一致試行の反応時間:</strong> ${Math.round(incongruentRT)}ms<br>
            <strong style="color: #ffc107;">課題干渉効果:</strong> ${Math.round(interference)}ms
        </div>
    `;
    
    document.getElementById('results-content').innerHTML = resultsHTML;
    showScreen('results');
    
    // ダウンロードボタンの設定
    setTimeout(() => {
        const downloadBtn = document.getElementById('downloadBtn');
        if (downloadBtn) {
            downloadBtn.onclick = downloadData;
        }
    }, 100);
}

// ありがとう画面表示
function showThankYou() {
    showScreen('thankyou');
}

// ページ読み込み時のエラーチェック
window.addEventListener('error', (e) => {
    console.error('エラーが発生しました:', e.message, e.filename, e.lineno);
});

// ユーティリティ関数
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function mean(arr) {
    if (arr.length === 0) return 0;
    return arr.reduce((a, b) => a + b, 0) / arr.length;
}

// データのダウンロード機能
function downloadData() {
    // 統計計算
    const mainTrials = trialData.filter(t => t.phase === 'main');
    const correctTrials = mainTrials.filter(t => t.status === 'CORRECT');
    const repeatTrials = correctTrials.filter(t => !t.taskSwitch);
    const switchTrials = correctTrials.filter(t => t.taskSwitch);
    const congruentTrials = correctTrials.filter(t => t.congruent);
    const incongruentTrials = correctTrials.filter(t => !t.congruent);
    
    const avgRT = mean(correctTrials.map(t => t.rt));
    const repeatRT = mean(repeatTrials.map(t => t.rt));
    const switchRT = mean(switchTrials.map(t => t.rt));
    const congruentRT = mean(congruentTrials.map(t => t.rt));
    const incongruentRT = mean(incongruentTrials.map(t => t.rt));
    
    const switchCost = switchRT - repeatRT;
    const interference = incongruentRT - congruentRT;
    const accuracy = (correctTrials.length / mainTrials.length * 100).toFixed(1);
    
    // サマリー行を追加
    const summaryData = [
        ...trialData,
        {}, // 空行
        { participantName: '=== SUMMARY STATISTICS ===' },
        { participantName: 'Accuracy', participantAge: accuracy + '%' },
        { participantName: 'Average RT (all correct)', participantAge: Math.round(avgRT) + 'ms' },
        { participantName: 'Repeat trial RT', participantAge: Math.round(repeatRT) + 'ms' },
        { participantName: 'Switch trial RT', participantAge: Math.round(switchRT) + 'ms' },
        { participantName: 'Switch cost', participantAge: Math.round(switchCost) + 'ms' },
        { participantName: 'Congruent trial RT', participantAge: Math.round(congruentRT) + 'ms' },
        { participantName: 'Incongruent trial RT', participantAge: Math.round(incongruentRT) + 'ms' },
        { participantName: 'Interference effect', participantAge: Math.round(interference) + 'ms' }
    ];
    
    const csvContent = convertToCSV(summaryData);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    const filename = `task_switching_${participantInfo.name}_${new Date().toISOString().slice(0, 10)}.csv`;
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// CSVへの変換（UTF-8 BOM）
function convertToCSV(data) {
    if (data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const csvHeaders = headers.join(',');
    
    const csvRows = data.map(row => {
        return headers.map(header => {
            const value = row[header];
            // カンマや改行を含む値はダブルクォートで囲む
            if (value === null || value === undefined) {
                return '';
            }
            const stringValue = String(value);
            if (stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes('"')) {
                return `"${stringValue.replace(/"/g, '""')}"`;
            }
            return stringValue;
        }).join(',');
    });
    
    const BOM = '\uFEFF';
    return BOM + csvHeaders + '\n' + csvRows.join('\n');
}

// イベントリスナー
document.addEventListener('keydown', (e) => {
    if (awaitingResponse) return; // 試行中の反応を妨げない
    
    const key = e.key.toLowerCase();
    
    if (e.key === ' ') {
        e.preventDefault();
        if (currentPhase === 'instructions') {
            nextInstruction();
        } else if (document.getElementById('ready').classList.contains('active')) {
            runTrial();
        } else if (document.getElementById('results').classList.contains('active')) {
            showThankYou();
        }
    } else if (e.key === 'ArrowLeft' && currentPhase === 'instructions') {
        previousInstruction();
    } else if (e.key === 'ArrowRight' && currentPhase === 'instructions') {
        nextInstruction();
    } else if (key === 'q' && currentScreen === instructionScreens.length - 1) {
        startTraining();
    }
});
