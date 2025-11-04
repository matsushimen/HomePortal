"""create initial tables"""

from datetime import datetime

from alembic import op
import sqlalchemy as sa

revision = "0001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "user",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("name", sa.String(length=100), nullable=False),
        sa.Column("role", sa.String(length=10), nullable=False, default="user"),
        sa.Column("email", sa.String(length=255), nullable=True, unique=True),
        sa.Column("password_hash", sa.String(length=255), nullable=True),
    )
    op.create_table(
        "link",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("title", sa.String(length=200), nullable=False),
        sa.Column("url", sa.String(length=500), nullable=False),
        sa.Column("tags", sa.JSON(), nullable=False, default=list),
        sa.Column("click_count", sa.Integer(), nullable=False, default=0),
        sa.Column("last_accessed_at", sa.DateTime(), nullable=True),
        sa.Column("owner_id", sa.Integer(), sa.ForeignKey("user.id"), nullable=True),
    )
    op.create_index(op.f("ix_link_title"), "link", ["title"], unique=False)
    op.create_table(
        "contact",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("name", sa.String(length=200), nullable=False),
        sa.Column("category", sa.String(length=100), nullable=False),
        sa.Column("phone", sa.String(length=30), nullable=True),
        sa.Column("hours", sa.String(length=200), nullable=True),
        sa.Column("url", sa.String(length=500), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("last_verified_at", sa.DateTime(), nullable=True),
    )
    op.create_index(op.f("ix_contact_name"), "contact", ["name"], unique=False)
    op.create_index(op.f("ix_contact_category"), "contact", ["category"], unique=False)

    op.create_table(
        "event",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("title", sa.String(length=200), nullable=False),
        sa.Column("start", sa.DateTime(), nullable=False),
        sa.Column("end", sa.DateTime(), nullable=False),
        sa.Column("source", sa.String(length=10), nullable=False, default="google"),
        sa.Column("color", sa.String(length=15), nullable=True),
        sa.Column("assignee_id", sa.Integer(), sa.ForeignKey("user.id"), nullable=True),
    )

    op.create_table(
        "todo",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("title", sa.String(length=200), nullable=False),
        sa.Column("status", sa.String(length=10), nullable=False, default="open"),
        sa.Column("due", sa.DateTime(), nullable=True),
        sa.Column("assignee_id", sa.Integer(), sa.ForeignKey("user.id"), nullable=True),
        sa.Column("repeat_rule", sa.String(length=100), nullable=True),
        sa.Column("list_id", sa.String(length=50), nullable=True),
        sa.Column("completed_at", sa.DateTime(), nullable=True),
    )
    op.create_index(op.f("ix_todo_status"), "todo", ["status"], unique=False)

    op.create_table(
        "file",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("path", sa.String(length=500), nullable=False, unique=True),
        sa.Column("tags", sa.JSON(), nullable=False, default=list),
        sa.Column("protected", sa.Boolean(), nullable=False, default=False),
        sa.Column("checksum", sa.String(length=128), nullable=False),
    )

    op.create_table(
        "audit_log",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("user.id"), nullable=True),
        sa.Column("action", sa.String(length=100), nullable=False),
        sa.Column("entity", sa.String(length=100), nullable=False),
        sa.Column("entity_id", sa.String(length=100), nullable=False),
        sa.Column("diff_json", sa.JSON(), nullable=False, default=dict),
        sa.Column("at", sa.DateTime(), nullable=False, default=datetime.utcnow),
    )

    op.create_table(
        "asset_snapshot",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("date", sa.Date(), nullable=False),
        sa.Column("account_name", sa.String(length=200), nullable=False),
        sa.Column("balance", sa.Float(), nullable=False),
        sa.Column("currency", sa.String(length=10), nullable=False),
    )
    op.create_index(op.f("ix_asset_snapshot_date"), "asset_snapshot", ["date"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_asset_snapshot_date"), table_name="asset_snapshot")
    op.drop_table("asset_snapshot")
    op.drop_table("audit_log")
    op.drop_table("file")
    op.drop_index(op.f("ix_todo_status"), table_name="todo")
    op.drop_table("todo")
    op.drop_table("event")
    op.drop_index(op.f("ix_contact_category"), table_name="contact")
    op.drop_index(op.f("ix_contact_name"), table_name="contact")
    op.drop_table("contact")
    op.drop_index(op.f("ix_link_title"), table_name="link")
    op.drop_table("link")
    op.drop_table("user")

