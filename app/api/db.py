import os
import psycopg2
import psycopg2.extras


def get_connection():
    return psycopg2.connect(
        host=os.environ["DB_HOST"],
        dbname=os.environ["DB_NAME"],
        user=os.environ["DB_USER"],
        password=os.environ["DB_PASSWORD"],
    )


def get_all_projects():
    with get_connection() as conn:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            cur.execute("SELECT * FROM projects ORDER BY id")
            return [dict(row) for row in cur.fetchall()]


def get_projects_by_flag(flag):
    allowed = {"is_featured", "is_recommended", "is_popular"}
    if flag not in allowed:
        raise ValueError(f"Invalid flag: {flag}")
    with get_connection() as conn:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            cur.execute(f"SELECT * FROM projects WHERE {flag} = TRUE ORDER BY id")
            return [dict(row) for row in cur.fetchall()]


def get_all_users():
    with get_connection() as conn:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            cur.execute("SELECT id, username, user_wallet_seed FROM users ORDER BY id")
            return [dict(row) for row in cur.fetchall()]


def get_user_by_id(user_id):
    with get_connection() as conn:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            cur.execute(
                "SELECT id, username, user_wallet_seed FROM users WHERE id = %s",
                (user_id,),
            )
            row = cur.fetchone()
            return dict(row) if row else None
