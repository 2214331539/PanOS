"""calendar events

Revision ID: e7a2d81f6c43
Revises: c4e9b03a51d2
Create Date: 2026-06-11 15:00:00.000000

"""

from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = 'e7a2d81f6c43'
down_revision: str | None = 'c4e9b03a51d2'
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table('calendar_events',
    sa.Column('event_date', sa.Date(), nullable=False),
    sa.Column('title', sa.String(length=120), nullable=False),
    sa.Column('id', sa.UUID(), nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.PrimaryKeyConstraint('id', name=op.f('pk_calendar_events'))
    )
    op.create_index(op.f('ix_calendar_events_event_date'), 'calendar_events', ['event_date'])


def downgrade() -> None:
    op.drop_index(op.f('ix_calendar_events_event_date'), table_name='calendar_events')
    op.drop_table('calendar_events')
