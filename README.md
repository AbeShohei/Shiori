# 旅のしおり (Travel Itinerary) - MERN Stack

旅行計画管理アプリケーションです。新しい旅行を作成し、AIによるプラン生成、スケジュール管理、予算管理などの機能を提供します。

## 技術スタック

### フロントエンド
- React 18
- TypeScript
- Vite
- Tailwind CSS
- Lucide React (アイコン)
- Axios (HTTP通信)

### バックエンド
- Node.js
- Express.js
- TypeScript
- MongoDB (Mongoose)
- CORS

## 機能

- 🗺️ **旅行作成**: 基本情報入力からAIプラン生成まで
- 📅 **スケジュール管理**: 日別のスケジュール作成・編集
- 🏨 **宿泊管理**: 部屋割りとメンバー管理
- 💰 **予算管理**: 支出記録と予算配分
- 📝 **メモ機能**: 旅行に関するメモ作成
- 🎒 **荷物リスト**: パッキングリスト管理
- 🏛️ **観光地管理**: おすすめスポットの管理
- 🤖 **AI推薦**: 興味に基づいたスポット推薦

## セットアップ

### 前提条件
- Node.js (v16以上)
- MongoDB (ローカルまたはMongoDB Atlas)

### インストール

1. リポジトリをクローン
```bash
git clone <repository-url>
cd ai-app
```

2. 依存関係をインストール
```bash
# フロントエンド
npm install

# バックエンド
cd backend
npm install
cd ..
```

3. 環境変数を設定
```bash
# backend/.env ファイルを作成
PORT=5000
MONGODB_URI=mongodb://localhost:27017/travel-app
JWT_SECRET=your-secret-key-here
NODE_ENV=development
```

### 開発サーバーの起動

#### フロントエンドのみ
```bash
npm run dev
```

#### バックエンドのみ
```bash
npm run backend
```

#### フロントエンド + バックエンド（推奨）
```bash
npm run dev:full
```

### ビルド

```bash
# フロントエンド
npm run build

# バックエンド
npm run backend:build
```

## 使用方法

1. アプリケーションを起動
2. 「新しい旅行を作成」ボタンをクリック
3. 旅行の基本情報を入力
4. AIによるプラン生成を待つ
5. 生成されたプランを確認して旅行を作成
6. 各タブで詳細な管理を行う

## API エンドポイント

### 旅行管理
- `GET /api/travels` - 全ての旅行を取得
- `GET /api/travels/:id` - 特定の旅行を取得
- `POST /api/travels` - 新しい旅行を作成
- `PUT /api/travels/:id` - 旅行を更新
- `DELETE /api/travels/:id` - 旅行を削除

## プロジェクト構造

```
ai-app/
├── src/                    # フロントエンド
│   ├── components/         # Reactコンポーネント
│   ├── services/          # APIサービス
│   ├── types/             # TypeScript型定義
│   └── ...
├── backend/               # バックエンド
│   ├── src/
│   │   ├── config/        # 設定ファイル
│   │   ├── models/        # MongoDBモデル
│   │   ├── routes/        # APIルート
│   │   └── middleware/    # ミドルウェア
│   └── ...
└── ...
```

## ライセンス

MIT License

## 貢献

プルリクエストやイシューの報告を歓迎します。 