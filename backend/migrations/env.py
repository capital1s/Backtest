# pyright: basic
# This file uses Alembic's dynamically created context object
# Type checking is disabled for this migration environment file
# mypy: ignore-errors
# pylint: skip-file
import os
import sys

from alembic import context  # type: ignore[import,attr-defined]
from sqlalchemy import engine_from_config, pool

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

# Alembic context attributes are dynamically added at runtime
config = context.config


def run_migrations_offline():
    context.configure(
        url=config.get_main_option("sqlalchemy.url"),
        literal_binds=True,
    )
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online():
    config_section = config.get_section(config.config_ini_section) or {}
    connectable = engine_from_config(
        config_section,
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )
    with connectable.connect() as connection:
        context.configure(connection=connection)
        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
