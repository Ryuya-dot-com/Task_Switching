# Cued Task-Switching Experiment

手がかり付き課題切り替えパラダイム実装です。参加者の認知的柔軟性と実行機能を測定します。

## 概要

この実験では、参加者は2つの異なる課題（色判断・形判断）を手がかりに従って切り替えながら実行します。課題切り替えコストと課題干渉効果を測定することで、認知制御能力を評価します。

### 主な特徴
- 練習試行での視覚的ヒント表示
- リアルタイムフィードバック
- 自動データ収集とCSV出力

## セットアップ

### 必要環境
- ブラウザ（Chrome, Firefox, Safari, Edge推奨）
- ローカルサーバー環境（オプション）

### 基本セットアップ
1. リポジトリをダウンロードまたはクローン
```bash
git clone [repository-url]
cd task-switching-experiment
```

2. ファイル構成を確認
```
task-switching-experiment/
├── index.html
├── script.js
└── README.md
```

3. 実験を開始
- **方法1**: `index.html`をブラウザで直接開く
- **方法2**: ローカルサーバーを使用
```bash
# Python 3の場合
python -m http.server 8000

# Node.jsの場合
npx http-server
```

## 実験の流れ

### 1. 参加者情報入力
- 参加者ID（必須）
- 年齢（オプション）
- 性別（オプション）

### 2. 説明フェーズ
- 課題の説明を4画面で提示
- 矢印キーで前後移動可能
- Qキーで練習開始

### 3. 練習試行（10試行）
- 視覚的ヒント付きで課題を練習
- 正解キーが表示される
- エラーフィードバック有り

### 4. 本実験（50試行）
- ヒントなしで課題を実行
- ランダムに課題が切り替わる
- 反応時間と正確性を記録

### 5. 結果表示
- 正答率
- 平均反応時間
- 課題切り替えコスト
- 課題干渉効果
- CSVファイルのダウンロード

## 操作方法

### 実験中の操作
| キー | 機能 |
|------|------|
| **B** | 黄色刺激（色課題）/ 円（形課題）に反応 |
| **N** | 青色刺激（色課題）/ 四角（形課題）に反応 |

### ナビゲーション
| キー | 機能 |
|------|------|
| **スペース** | 次へ進む |
| **←** | 前の説明に戻る（説明フェーズのみ） |
| **→** | 次の説明に進む（説明フェーズのみ） |
| **Q** | 練習を開始（説明4の画面で） |

## 出力データ

### CSVファイル構造
出力されるCSVファイルには以下の情報が含まれます：

#### 試行データ列
- `participantName`: 参加者ID
- `participantAge`: 年齢
- `participantGender`: 性別
- `trial`: 現在のフェーズ内の試行番号
- `totalTrial`: 全体の試行番号
- `phase`: practice（練習）または main（本実験）
- `task`: color（色）または shape（形）
- `stimulus`: 刺激の詳細名
- `stimulusShape`: circle または rectangle
- `stimulusColor`: yellow または blue
- `congruent`: 一致/不一致条件（true/false）
- `taskSwitch`: 課題切り替えの有無（true/false）
- `correctResponse`: 正解キー
- `actualResponse`: 実際の反応キー
- `rt`: 反応時間（ミリ秒）
- `status`: CORRECT / WRONG / TIMEOUT
- `timestamp`: タイムスタンプ

#### 統計サマリー
ファイル末尾に以下の統計情報が自動追加されます：
- Accuracy（正答率）
- Average RT（平均反応時間）
- Switch cost（課題切り替えコスト）
- Interference effect（課題干渉効果）

## カスタマイズ

`script.js`の冒頭にある`config`オブジェクトで実験パラメータを調整できます：

```javascript
const config = {
    cueDisplayTime: 350,      // 手がかり表示時間（ms）
    cueDelay: 750,            // 手がかり後の遅延（ms）
    interTrialInterval: 1000,  // 試行間間隔（ms）
    responseTimeout: 2000,     // 反応制限時間（ms）
    trainingTrials: 10,        // 練習試行数
    realTrials: 50            // 本実験試行数
};
```

## トラブルシューティング

### キー入力が反応しない場合
- ブラウザウィンドウがアクティブか確認
- 日本語入力モードをOFFにする
- 他のタブやアプリケーションを閉じる

### データがダウンロードされない場合
- ブラウザのポップアップブロックを確認
- ダウンロードフォルダのアクセス権限を確認

# ライセンス
このプロジェクトは教育・研究目的で自由に使用できます。商用利用の際はご相談ください。

# 連絡先
質問や要望がある場合は、メール(komuro.4121(at)gmail.com)へご連絡ください。
