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


'''
Get all projects row by row
'''
def get_all_projects():
    with get_connection() as conn:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            cur.execute("SELECT * FROM projects ORDER BY id")
            return [dict(row) for row in cur.fetchall()]

def get_project_by_id(project_id):
    conn = get_connection()
    cur = conn.cursor()

    cur.execute("SELECT * FROM projects WHERE id = %s", (project_id,))
    project = cur.fetchone()

    return dict(project)

def get_user_wallet_seed(user_id):
    conn = get_connection()
    cur = conn.cursor()

    cur.execute("SELECT user_wallet_seed FROM projects WHERE id = %s", (user_id, ))


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


def login_user(username, password):
    with get_connection() as conn:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            cur.execute(
                "SELECT id, username FROM users WHERE username = %s AND password = %s",
                (username, password),
            )
            row = cur.fetchone()
            return dict(row) if row else None
        
def get_project_wallet(project_id):
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                "SELECT project_wallet_seed FROM projects WHERE id = %s",
                (project_id,),
            )
            row = cur.fetchone()
            return row[0] if row else None