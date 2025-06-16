# 技術仕様書 (TECH_SPEC.md)

## プラットフォーム選択
**Webアプリケーション** - ブラウザベースのリアルタイム多人数ゲーム

## 技術スタック

### フロントエンド
- **フレームワーク**: React 18+ (TypeScript)
- **UI ライブラリ**: Material-UI または Tailwind CSS
- **状態管理**: Zustand または Redux Toolkit
- **リアルタイム通信**: Socket.IO Client
- **ルーティング**: React Router
- **ビルドツール**: Vite

### バックエンド
- **Runtime**: Node.js 18+
- **フレームワーク**: Express.js (TypeScript)
- **リアルタイム通信**: Socket.IO Server
- **認証**: JWT (JSON Web Token)
- **データベース**: MongoDB または PostgreSQL
- **ORM/ODM**: Mongoose (MongoDB) または Prisma (PostgreSQL)

### インフラ・デプロイ
- **フロントエンド**: Vercel または Netlify
- **バックエンド**: Railway, Render, または Heroku
- **データベース**: MongoDB Atlas または Supabase
- **環境管理**: Docker (開発環境)

## アーキテクチャ

### システム構成
```
[クライアント (React)] ←→ [API Server (Express)] ←→ [Database]
                    ↕
            [WebSocket Server (Socket.IO)]
```

### データフロー
1. **ゲーム作成**: REST API でゲームルーム作成
2. **プレイヤー参加**: WebSocket接続でリアルタイム参加
3. **ゲーム進行**: Socket.IO でゲーム状態同期
4. **結果保存**: REST API でゲーム結果をDB保存

## データベース設計

### コレクション/テーブル設計

#### Games (ゲーム)
```typescript
interface Game {
  id: string;
  roomCode: string; // 6桁のルームコード
  hostId: string;
  status: 'waiting' | 'playing' | 'finished';
  theme: string; // お題
  maxPlayers: number;
  currentRound: number;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Players (プレイヤー)
```typescript
interface Player {
  id: string;
  gameId: string;
  name: string;
  socketId: string;
  cardNumber?: number; // 1-100
  expression?: string; // プレイヤーの表現
  position?: number; // 並び順
  isReady: boolean;
  joinedAt: Date;
}
```

#### GameHistory (ゲーム履歴)
```typescript
interface GameHistory {
  id: string;
  gameId: string;
  theme: string;
  players: PlayerResult[];
  success: boolean;
  completedAt: Date;
}

interface PlayerResult {
  name: string;
  cardNumber: number;
  expression: string;
  finalPosition: number;
}
```

## API設計

### REST API エンドポイント
```
POST   /api/games              # ゲーム作成
GET    /api/games/:roomCode    # ゲーム情報取得
POST   /api/games/:id/join     # ゲーム参加
DELETE /api/games/:id/leave    # ゲーム退出
GET    /api/themes             # お題一覧取得
```

### WebSocket イベント
```typescript
// クライアント → サーバー
'join-room': { roomCode: string, playerName: string }
'player-ready': { playerId: string }
'submit-expression': { playerId: string, expression: string }
'update-positions': { positions: PlayerPosition[] }
'reveal-cards': {}

// サーバー → クライアント
'room-joined': { gameState: GameState }
'player-joined': { player: Player }
'player-left': { playerId: string }
'game-started': { gameState: GameState }
'expression-submitted': { playerId: string }
'positions-updated': { positions: PlayerPosition[] }
'game-finished': { result: GameResult }
'error': { message: string }
```

## セキュリティ考慮事項

### 入力検証
- プレイヤー名: 最大20文字、英数字と日本語
- 表現文: 最大100文字
- ルームコード: 6桁の英数字

### レート制限
- API呼び出し: 100req/min/IP
- WebSocket接続: 10接続/min/IP

### データ保護
- 機密情報なし（匿名ゲーム）
- ゲーム履歴は24時間後自動削除

## パフォーマンス要件

### レスポンス時間
- API応答: < 200ms
- WebSocketレイテンシ: < 50ms
- ゲーム状態同期: < 100ms

### 同時接続数
- 1ゲーム最大10人
- サーバー全体で100ゲーム同時進行可能

## 開発環境

### 必要ツール
- Node.js 18+
- npm または yarn
- Docker (オプション)
- MongoDB または PostgreSQL

### 環境変数
```
# Server
PORT=3001
DATABASE_URL=mongodb://localhost:27017/ito
JWT_SECRET=your-secret-key
CORS_ORIGIN=http://localhost:3000

# Client
VITE_API_URL=http://localhost:3001
VITE_SOCKET_URL=http://localhost:3001
```

## 今後の拡張予定

### Phase 2
- ユーザーアカウント機能
- ゲーム統計・ランキング
- カスタムお題作成

### Phase 3
- 音声チャット機能
- リプレイ機能
- トーナメント機能