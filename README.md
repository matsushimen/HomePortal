# HomePortal

HomePortal は、家庭内のリンク・連絡先・資産・予定・ToDo を一元管理する自宅向けポータルです。Docker Compose を使って手早く構築でき、LAN 内での利用を前提とした軽量な運用モデルを提供します。

## 主要機能
- **リンク集**: タグ・検索・クリック数を備えたブックマーク管理。
- **連絡先 / 資産管理**: 連絡先の整理、資産 CSV インポートと月次サマリ。
- **カレンダー**: アプリ内データで動く日/週/月ビュー。終日・カラー・メモ・作成者を設定可能。
- **共有 ToDo**: 担当・期限・完了操作を備えたチェックリスト。
- **メール + パスワード認証**: 必要に応じて JWT 認証を有効化し、クッキーでセッション管理。
- **自動バックアップ**: SQLite とアップロードファイルを毎日アーカイブ。
- **CI/CD**: GitHub Actions で lint / test / build / Playwright を自動実行。

## 技術構成
| レイヤー | 技術 | 補足 |
| --- | --- | --- |
| フロントエンド | Next.js 15, TypeScript, Tailwind CSS, SWR | App Router 構成、PWA ベース拡張が可能 |
| バックエンド | FastAPI, SQLModel, SQLite, Alembic | JWT 認証・マイグレーション管理 |
| インフラ | Docker Compose, Caddy, Cron | `frontend` / `backend` / `proxy` / `db` / `backup` の 5 サービス |
| テスト | pytest, Playwright | GitHub Actions による自動検証 |

```
backend/    FastAPI アプリケーション
frontend/   Next.js アプリケーション
infra/      docker-compose.yml・Caddy・バックアップスクリプト
docs/       補足ドキュメント（API 仕様など）
```

## 前提条件
- Docker Engine 24 以降 / Docker Compose v2
- Node.js 20.x（ローカルでフロントをビルドする場合）
- Python 3.11（ローカルでバックエンドを実行する場合）

## 初期セットアップ
1. リポジトリを取得します。
   ```bash
   git clone <this-repo>
   cd homeportal
   ```
2. `.env` を作成し、必要な値を設定します。
   ```bash
   cp .env.example .env
   ```
   主要な項目:
   - `NEXT_PUBLIC_APP_NAME`: 画面に表示するアプリ名
   - `APP_AUTH_ENABLED`: 認証を有効化する場合は `true`
   - `DEFAULT_ADMIN_EMAIL`, `DEFAULT_ADMIN_PASSWORD`: 認証 ON 時の初期管理者
   - `SECRET_KEY`: JWT 署名用の十分な長さの乱数

3. 既存データベースを保持している場合は Alembic マイグレーションを実行して最新スキーマに合わせます。
   ```bash
   sudo docker compose exec -e PYTHONPATH=/app backend alembic stamp 0001
   sudo docker compose exec -e PYTHONPATH=/app backend alembic upgrade head
   ```

## ビルド & 起動
### Docker Compose
```bash
cd infra
docker compose up backend frontend -d
```
- フロント: <http://localhost:3000>
- バックエンド API: <http://localhost:8000>

ポートが競合する場合は環境変数で上書きします。
```bash
FRONTEND_PORT=3100 BACKEND_PORT=8100 docker compose up backend frontend -d
```

リバースプロキシを含めた構成で起動するには以下を利用してください。
```bash
docker compose up --profile proxy -d
```

### 認証を有効化する
`.env` に以下を設定し、バックエンドを再起動します。
```env
APP_AUTH_ENABLED=true
DEFAULT_ADMIN_EMAIL=admin@example.com
DEFAULT_ADMIN_PASSWORD=change-me
```
初回起動時に指定したメールアドレスで管理者アカウントが作成され、`/login` からサインインできます。

## 開発・テスト
### バックエンド
```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt pytest httpx pytest-asyncio
pytest
```

### フロントエンド
```bash
cd frontend
npm install
npm run lint
npm run build
npm run dev   # 開発サーバー (http://localhost:3000)
```

### Playwright E2E
```bash
npx playwright install --with-deps
PLAYWRIGHT_BASE_URL=http://127.0.0.1:3000 npm run test:e2e
```

## CI/CD
`.github/workflows/ci.yml` では以下を自動実行します。
1. バックエンド: 依存インストール → pytest
2. フロントエンド: lint → build
3. 立ち上げたバックエンド/フロントに対して Playwright スモークテスト

CI が失敗した場合はローカルで同じコマンドを再現し、修正後に push してください。

## API ドキュメント
REST API の仕様は [docs/api.md](docs/api.md) を参照してください。

## バックアップと復旧
- `infra/backup` コンテナが `backup.sh` を毎日実行し、SQLite とアップロードディレクトリを tar.gz で 7 世代保持します。
- 復旧手順: スタック停止 → 最新アーカイブを `db-data` / `uploads-data` に展開 → `.env` を戻して `docker compose up -d`。

## 運用上の注意
- 外部公開する場合は必ず認証を有効化し、`SECRET_KEY` を十分な長さに変更してください。
- カレンダーはアプリ内データで稼働します（Google 等との連携は未実装）。
- TLS が必要な場合は `infra/Caddyfile` を編集し、ACME 証明書などに対応させてください。
