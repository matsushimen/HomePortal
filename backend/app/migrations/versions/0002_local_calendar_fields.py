"""add local calendar fields"""

from alembic import op
import sqlalchemy as sa


revision = "0002"
down_revision = "0001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("event", sa.Column("all_day", sa.Boolean(), nullable=False, server_default="0"))
    op.add_column("event", sa.Column("notes", sa.Text(), nullable=True))
    op.add_column("event", sa.Column("created_by", sa.String(length=100), nullable=True))
    op.execute("UPDATE event SET source = 'local' WHERE source IS NULL")
    op.alter_column("event", "source", existing_type=sa.String(length=20), server_default="local")
    op.execute("UPDATE event SET all_day = 0 WHERE all_day IS NULL")
    op.alter_column("event", "all_day", server_default=None)


def downgrade() -> None:
    op.alter_column("event", "source", existing_type=sa.String(length=20), server_default=None)
    op.drop_column("event", "created_by")
    op.drop_column("event", "notes")
    op.drop_column("event", "all_day")
