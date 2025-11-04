# HomePortal API ドキュメント

すべてのエンドポイントはバックエンドサービス（デフォルト: `http://localhost:8000`）配下の `/api` で公開されます。`APP_AUTH_ENABLED=true` の場合は、`/auth/login` で発行された JWT が `homeportal_token` クッキーまたは `Authorization: Bearer <token>` ヘッダーとして必要です。

## 認証
| メソッド | パス | 概要 | 認証 |
| --- | --- | --- | --- |
| POST | `/auth/login` | メール + パスワードでログインし、JWT を返します。成功時は `homeportal_token` クッキーが設定されます。 | 必須ではない |
| POST | `/auth/logout` | `homeportal_token` クッキーを削除します。 | 要ログイン |
| POST | `/auth/register` | 新規ユーザーを登録します。`APP_AUTH_ENABLED=true` の場合のみ許可。 | 要ログイン（管理者想定） |

リクエスト例:
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"secret"}'
```

## リンク
| メソッド | パス | 概要 | 認証 |
| --- | --- | --- | --- |
| GET | `/links` | すべてのリンクを取得 | 任意 |
| GET | `/links/search?q=&tags=` | キーワード・タグで検索 | 任意 |
| POST | `/links` | リンクを登録 | 要ログイン |
| PATCH | `/links/{id}` | リンクを更新 | 要ログイン |
| DELETE | `/links/{id}` | リンクを削除 | 要ログイン |
| POST | `/links/{id}/click` | クリック数と最終アクセス日時を更新 | 任意 |

## 連絡先
| メソッド | パス | 概要 | 認証 |
| --- | --- | --- | --- |
| GET | `/contacts` | 連絡先一覧 | 任意 |
| POST | `/contacts` | 連絡先を登録 | 要ログイン |
| PATCH | `/contacts/{id}` | 連絡先を更新 | 要ログイン |
| DELETE | `/contacts/{id}` | 連絡先を削除 | 要ログイン |

## 資産
| メソッド | パス | 概要 | 認証 |
| --- | --- | --- | --- |
| POST | `/assets/import` | CSV をアップロードし資産スナップショットを登録 | 要ログイン |
| GET | `/assets/summary?from=YYYY-MM&to=YYYY-MM` | 月次サマリを取得 | 任意 |

CSV 形式: `date,account_name,balance,currency`

## カレンダー（イベント）
| メソッド | パス | 概要 | 認証 |
| --- | --- | --- | --- |
| GET | `/events?start=&end=` | 指定期間（ISO8601）に重なるイベントを取得 | 任意 |
| POST | `/events` | イベントを作成 | 要ログイン |
| PATCH | `/events/{id}` | イベントを更新 | 要ログイン |
| DELETE | `/events/{id}` | イベントを削除 | 要ログイン |

`Event` は以下の属性を受け付けます。
```json
{
  "title": "string",
  "start": "2024-01-10T09:00:00",
  "end": "2024-01-10T10:00:00",
  "all_day": false,
  "color": "#2563eb",
  "notes": "任意のメモ",
  "created_by": "作成者名",
  "assignee_id": 1
}
```

## ToDo
| メソッド | パス | 概要 | 認証 |
| --- | --- | --- | --- |
| GET | `/todos` | ToDo 一覧 | 任意 |
| POST | `/todos` | ToDo を登録 | 要ログイン |
| PATCH | `/todos/{id}` | ToDo を更新（完了状態など） | 要ログイン |
| DELETE | `/todos/{id}` | ToDo を削除 | 要ログイン |

## ユーザー
| メソッド | パス | 概要 | 認証 |
| --- | --- | --- | --- |
| GET | `/users` | 登録ユーザー一覧 | 要ログイン |
| GET | `/me` | 自分のプロフィール | 要ログイン |

## ヘルスチェック
| メソッド | パス | 概要 | 認証 |
| --- | --- | --- | --- |
| GET | `/healthz` | アプリケーションの稼働確認 | 任意 |

---

任意の API から 401/403 が返る場合は、事前に `/auth/login` で認証し `homeportal_token` クッキーが付与されているか確認してください。
