import os
import datetime
import psycopg2
import psycopg2.extras


def get_connection():
    return psycopg2.connect(
        host=os.environ["DB_HOST"],
        dbname=os.environ["DB_NAME"],
        user=os.environ["DB_USER"],
        password=os.environ["DB_PASSWORD"],
    )


def _serialize(row):
    """Convert date/datetime values to ISO strings for JSON serialization."""
    return {
        k: v.isoformat() if isinstance(v, (datetime.date, datetime.datetime)) else v
        for k, v in dict(row).items()
    }


def get_all_projects():
    with get_connection() as conn:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            cur.execute("SELECT * FROM projects ORDER BY id")
            return [_serialize(row) for row in cur.fetchall()]

def get_project_by_id(project_id):
    with get_connection() as conn:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            cur.execute("SELECT * FROM projects WHERE id = %s", (project_id,))
            row = cur.fetchone()
            return _serialize(row) if row else None


def get_user_wallet_seed(user_id):
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT user_wallet_seed FROM users WHERE id = %s", (user_id,))
            row = cur.fetchone()
            return row[0] if row else None


'''
Write to a single project on filtered through it's id
'''
def update_project_wallet(project_id, wallet_seed) -> int:
    conn = get_connection()
    cur = conn.cursor()

    cur.execute("UPDATE projects SET project_wallet_seed = %s WHERE id = %s", (wallet_seed, project_id))

    conn.commit()
    conn.close()

    return 1

def update_user_wallet(user_id, wallet_seed):
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                "UPDATE users SET user_wallet_seed = %s WHERE id = %s",
                (wallet_seed, user_id),
            )
    return 1


def get_projects_by_flag(flag):
    allowed = {"is_featured", "is_recommended", "is_popular"}
    if flag not in allowed:
        raise ValueError(f"Invalid flag: {flag}")
    with get_connection() as conn:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            cur.execute(f"SELECT * FROM projects WHERE {flag} = TRUE ORDER BY id")
            return [_serialize(row) for row in cur.fetchall()]


def get_all_users():
    with get_connection() as conn:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            cur.execute("SELECT id, username, user_wallet_seed FROM users ORDER BY id")
            return [_serialize(row) for row in cur.fetchall()]


def get_user_by_id(user_id):
    with get_connection() as conn:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            cur.execute(
                "SELECT id, username, user_wallet_seed FROM users WHERE id = %s",
                (user_id,),
            )
            row = cur.fetchone()
            return _serialize(row) if row else None


def login_user(username, password):
    with get_connection() as conn:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            cur.execute(
                "SELECT id, username, user_wallet_seed FROM users WHERE username = %s AND password = %s",
                (username, password),
            )
            row = cur.fetchone()
            return _serialize(row) if row else None


def create_escrow(user_id, project_id, amount, escrow_type,
                  condition_hex, fulfillment_hex, escrow_sequence,
                  escrow_account, destination):
    with get_connection() as conn:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            cur.execute(
                """INSERT INTO escrows
                   (user_id, project_id, amount, escrow_type, condition_hex,
                    fulfillment_hex, escrow_sequence, escrow_account, destination)
                   VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                   RETURNING id""",
                (user_id, project_id, amount, escrow_type, condition_hex,
                 fulfillment_hex, escrow_sequence, escrow_account, destination),
            )
            row = cur.fetchone()
            return row["id"] if row else None
