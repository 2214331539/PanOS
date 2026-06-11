"""page views

Revision ID: c4e9b03a51d2
Revises: 8c5f1a72d3b1
Create Date: 2026-06-11 10:00:00.000000

"""

from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = 'c4e9b03a51d2'
down_revision: str | None = '8c5f1a72d3b1'
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table('page_views',
    sa.Column('path', sa.String(), nullable=False),
    sa.Column('ip_hash', sa.String(), nullable=False),
    sa.Column('view_date', sa.Date(), nullable=False),
    sa.Column('id', sa.UUID(), nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.PrimaryKeyConstraint('id', name=op.f('pk_page_views')),
    sa.UniqueConstraint('path', 'ip_hash', 'view_date', name='uq_page_views_path_ip_date')
    )
    op.create_index(op.f('ix_page_views_path'), 'page_views', ['path'])


def downgrade() -> None:
    op.drop_index(op.f('ix_page_views_path'), table_name='page_views')
    op.drop_table('page_views')
