"""project links

Revision ID: 8c5f1a72d3b1
Revises: 413d1978be6c
Create Date: 2026-06-10 14:30:00.000000

"""

from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = '8c5f1a72d3b1'
down_revision: str | None = '413d1978be6c'
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table('project_links',
    sa.Column('project_id', sa.UUID(), nullable=False),
    sa.Column('type', sa.String(), nullable=False),
    sa.Column('label', sa.String(), nullable=False),
    sa.Column('url', sa.Text(), nullable=False),
    sa.Column('sort_order', sa.Integer(), nullable=False),
    sa.Column('id', sa.UUID(), nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.ForeignKeyConstraint(['project_id'], ['projects.id'], name=op.f('fk_project_links_project_id_projects'), ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id', name=op.f('pk_project_links'))
    )
    op.create_index(op.f('ix_project_links_project_id'), 'project_links', ['project_id'])


def downgrade() -> None:
    op.drop_index(op.f('ix_project_links_project_id'), table_name='project_links')
    op.drop_table('project_links')
