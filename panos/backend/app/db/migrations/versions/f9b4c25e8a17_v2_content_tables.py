"""v2 content tables: ideas, research_notes, timeline_events

Revision ID: f9b4c25e8a17
Revises: e7a2d81f6c43
Create Date: 2026-06-11 16:00:00.000000

"""

from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = 'f9b4c25e8a17'
down_revision: str | None = 'e7a2d81f6c43'
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None

# visibility / contentstatus 在初版迁移已建过类型，这里只引用不重建。
VISIBILITY = postgresql.ENUM('public', 'unlisted', 'private', name='visibility', create_type=False)
CONTENT_STATUS = postgresql.ENUM(
    'draft', 'published', 'archived', name='contentstatus', create_type=False
)


def upgrade() -> None:
    op.create_table('ideas',
    sa.Column('title', sa.String(), nullable=False),
    sa.Column('summary', sa.Text(), nullable=False),
    sa.Column('body_mdx', sa.Text(), nullable=True),
    sa.Column('status', sa.Enum('seed', 'growing', 'draft', 'built', name='ideastatus'), nullable=False),
    sa.Column('visibility', VISIBILITY, nullable=False),
    sa.Column('source', sa.Text(), nullable=True),
    sa.Column('is_featured', sa.Boolean(), nullable=False),
    sa.Column('id', sa.UUID(), nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.PrimaryKeyConstraint('id', name=op.f('pk_ideas'))
    )
    op.create_table('research_notes',
    sa.Column('slug', sa.String(), nullable=False),
    sa.Column('title', sa.String(), nullable=False),
    sa.Column('excerpt', sa.Text(), nullable=False),
    sa.Column('body_mdx', sa.Text(), nullable=False),
    sa.Column('category_id', sa.UUID(), nullable=True),
    sa.Column('status', CONTENT_STATUS, nullable=False),
    sa.Column('visibility', VISIBILITY, nullable=False),
    sa.Column('progress', sa.Integer(), nullable=True),
    sa.Column('started_at', sa.Date(), nullable=True),
    sa.Column('published_at', sa.DateTime(timezone=True), nullable=True),
    sa.Column('id', sa.UUID(), nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.ForeignKeyConstraint(['category_id'], ['categories.id'], name=op.f('fk_research_notes_category_id_categories')),
    sa.PrimaryKeyConstraint('id', name=op.f('pk_research_notes')),
    sa.UniqueConstraint('slug', name=op.f('uq_research_notes_slug'))
    )
    op.create_table('timeline_events',
    sa.Column('event_date', sa.Date(), nullable=False),
    sa.Column('type', sa.Enum('research', 'project', 'writing', 'content', 'life', name='timelinetype'), nullable=False),
    sa.Column('title', sa.String(), nullable=False),
    sa.Column('description', sa.Text(), nullable=True),
    sa.Column('url', sa.Text(), nullable=True),
    sa.Column('visibility', VISIBILITY, nullable=False),
    sa.Column('is_featured', sa.Boolean(), nullable=False),
    sa.Column('sort_order', sa.Integer(), nullable=False),
    sa.Column('id', sa.UUID(), nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.PrimaryKeyConstraint('id', name=op.f('pk_timeline_events'))
    )
    op.create_index(op.f('ix_timeline_events_event_date'), 'timeline_events', ['event_date'])


def downgrade() -> None:
    op.drop_index(op.f('ix_timeline_events_event_date'), table_name='timeline_events')
    op.drop_table('timeline_events')
    op.drop_table('research_notes')
    op.drop_table('ideas')
    sa.Enum(name='ideastatus').drop(op.get_bind(), checkfirst=True)
    sa.Enum(name='timelinetype').drop(op.get_bind(), checkfirst=True)
