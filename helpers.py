import os
import secrets
from dotenv import load_dotenv
from flask import request
import psycopg2

load_dotenv()

# ---------- cookie ---------- #
class Cookies:
    # cookies are set and removed in the client
    @staticmethod
    def get_user_cookie():
        return request.cookies.get('user_id')

# ---------- id-generation ---------- #
class ID:
    MAX_ATTEMPTS = 100
    MAX_USERNAME_LENGTH = 20
    TAG_RANGE = 10000
    @staticmethod
    def generate_user_id(username, existing_ids):
        username = username[:ID.MAX_USERNAME_LENGTH]
        for _ in range(ID.MAX_ATTEMPTS):
            tag = secrets.randbelow(ID.TAG_RANGE)
            tag_str = str(tag).zfill(5)
            user_id = f'{username}#{tag_str}'
            if user_id not in existing_ids:
                return user_id

# ---------- database-connection ---------- #
class DB:
    @staticmethod
    def get_db_connection():
        database_url = os.getenv('DATABASE_URL')
        if not database_url:
            raise ValueError('[DB] DATABASE_URL not found in .env')
        return psycopg2.connect(database_url)

    @staticmethod
    def get_conn_cur(cursor=psycopg2.extensions.cursor):
        conn = DB.get_db_connection()
        return conn, conn.cursor(cursor_factory=cursor)

    @staticmethod
    def close_conn_cur(conn, cur, commit=False):
        if commit:
            conn.commit()
        cur.close()
        conn.close()

# ---------- misc ----------- #
class Misc:
    @staticmethod
    def convert_datetime_to_isoformat(dict_obj, values):
        if not dict_obj: return
        for value in values:
            if dict_obj.get(value):
                dict_obj[value] = dict_obj[value].isoformat()