# core/db

Database Module — Sovereign Hive v11.0

## Classes

- `Database` — Thread-safe SQLite connection manager with WAL mode.

## Functions

- `init_db()` — Initialize all database tables with full schema.
- `get_db()` — Get database connection.
- `close_db()` — Close database connection.
- `get_conn()` — Get thread-local database connection, reconnecting if closed.
- `close_conn()` — Close the thread-local connection.

## Links

[[core.config]]
