
import os
import psycopg2
from dotenv import load_dotenv
from psycopg2.extras import RealDictCursor
from .misc import convert_datetime_to_isoformat

load_dotenv()

USER_COLUMNS = ('user_id', 'socket_id', 'username', 'is_deleted', 'deleted_at', 'created_at')

# ---------- HELPER ---------- #
class DBHelp:
    @staticmethod
    def get_db_connection():
        database_url = os.getenv('DATABASE_URL')
        if not database_url:
            raise ValueError('[DB] DATABASE_URL not found in .env')
        return psycopg2.connect(database_url)

    @staticmethod
    def get_conn_cur(cursor=psycopg2.extensions.cursor):
        conn = DBHelp.get_db_connection()
        return conn, conn.cursor(cursor_factory=cursor)

    @staticmethod
    def close_conn_cur(conn, cur, commit=False):
        if commit:
            conn.commit()
        cur.close()
        conn.close()


# ---------- USERS ---------- #
class Users:
    @staticmethod
    def create_user(user_id, username):
        conn, cur = DBHelp.get_conn_cur()
        cur.execute('''
            INSERT INTO users (user_id, username)
            VALUES (%s, %s)
        ''', (user_id, username))
        DBHelp.close_conn_cur(conn, cur, commit=True)
        return {
            'user_id': user_id,
            'username': username,
            'is_deleted': False,
            'created_at': None,
        }

    @staticmethod
    def get_user_by_id(user_id, include_deleted=False):
        conn, cur = DBHelp.get_conn_cur(cursor=RealDictCursor)
        query = 'SELECT * FROM users WHERE user_id = %s'
        if not include_deleted:
            query += ' AND is_deleted = FALSE'
        cur.execute(query, (user_id,))
        user = cur.fetchone()
        DBHelp.close_conn_cur(conn, cur)
        convert_datetime_to_isoformat(user, ('created_at', 'deleted_at'))
        return user

    @staticmethod
    def get_user_by_username(username, include_deleted=False):
        # THING IS, USERS CAN HAVE SAME USERNAMES. WHATS THE POINT OF THIS? JUST GET USER BY ID
        conn, cur = DBHelp.get_conn_cur(cursor=RealDictCursor)
        query = 'SELECT * FROM users WHERE username = %s'
        if not include_deleted:
            query += ' AND is_deleted = FALSE'
        cur.execute(query, (username,))
        user = cur.fetchone()
        DBHelp.close_conn_cur(conn, cur)
        convert_datetime_to_isoformat(user, ('created_at', 'deleted_at'))
        return user

    @staticmethod
    def update_user_socket_id(user_id, socket_id):
        conn, cur = DBHelp.get_conn_cur()
        cur.execute('''
            UPDATE users SET socket_id = %s
            WHERE user_id = %s AND is_deleted = FALSE
        ''', (socket_id, user_id))
        DBHelp.close_conn_cur(conn, cur, commit=True)

    @staticmethod
    def soft_delete_user(user_id):
        conn, cur =DBHelp.get_conn_cur()
        cur.execute('''
            UPDATE users 
            SET is_deleted = TRUE, deleted_at = NOW() 
            WHERE user_id = %s
        ''', (user_id,))
        DBHelp.close_conn_cur(conn, cur, commit=True)

    @staticmethod
    def get_all_users(*cols):
        conn, cur = DBHelp.get_conn_cur(cursor=RealDictCursor)
        columns = ', '.join(col for col in cols if col in USER_COLUMNS)
        if not columns:
            columns = '*'
        cur.execute(f'SELECT {columns} FROM users ORDER BY created_at DESC')
        users = cur.fetchall()
        DBHelp.close_conn_cur(conn, cur)
        if columns == '*' or 'created_at' in cols or 'deleted_at' in cols:
            fields_to_convert = []
            if 'created_at' in cols or columns == '*':
                fields_to_convert.append('created_at')
            if 'deleted_at' in cols or columns == '*':
                fields_to_convert.append('deleted_at')
            for user in users:
                convert_datetime_to_isoformat(user, tuple(fields_to_convert))
        return users

# ---------- ALT NAMES ----------- #
class AltNames:
    @staticmethod 
    def create_alt_name(user_id, alt_name, is_default=False):
        conn, cur = DBHelp.get_conn_cur()
        cur.execute('SELECT COUNT(*) FROM alt_names WHERE user_id = %s', (user_id,))
        count = cur.fetchone()[0]
        if count == 0:
            is_default = True
        cur.execute('''
            INSERT INTO alt_names (user_id, alt_name, is_default)
            VALUES (%s, %s, %s)
            ON CONFLICT (user_id, alt_name) DO NOTHING
        ''', (user_id, alt_name, is_default))
        DBHelp.close_conn_cur(conn, cur, commit=True)

    @staticmethod 
    def get_alt_names(user_id):
        conn, cur = DBHelp.get_conn_cur(cursor=RealDictCursor)
        cur.execute('''
            SELECT * FROM alt_names 
            WHERE user_id = %s 
            ORDER BY is_default DESC, alt_name
        ''', (user_id,))
        alts = cur.fetchall()
        DBHelp.close_conn_cur(conn, cur)
        return alts

    @staticmethod 
    def get_default_alt(user_id):
        conn, cur = DBHelp.get_conn_cur(cursor=RealDictCursor)
        cur.execute('''
            SELECT alt_name FROM alt_names 
            WHERE user_id = %s AND is_default = TRUE
        ''', (user_id,))
        result = cur.fetchone()
        DBHelp.close_conn_cur(conn, cur)
        return result['alt_name'] if result else None

    @staticmethod 
    def set_default_alt(user_id, alt_name):
        conn, cur = DBHelp.get_conn_cur()
        cur.execute('''
            UPDATE alt_names SET is_default = FALSE 
            WHERE user_id = %s
        ''', (user_id,))
        cur.execute('''
            UPDATE alt_names SET is_default = TRUE 
            WHERE user_id = %s AND alt_name = %s
        ''', (user_id, alt_name))
        DBHelp.close_conn_cur(conn, cur, commit=True)

    @staticmethod 
    def delete_alt_name(user_id, alt_name):
        conn, cur = DBHelp.get_conn_cur()
        cur.execute('''
            DELETE FROM alt_names 
            WHERE user_id = %s AND alt_name = %s
        ''', (user_id, alt_name))
        DBHelp.close_conn_cur(conn, cur, commit=True)

# ---------- POSTS ---------- #
class Posts:
    @staticmethod 
    def create_post(user_id, attribution, subject, content):
        conn, cur = DBHelp.get_conn_cur(cursor=RealDictCursor)
        cur.execute('''
            INSERT INTO posts (user_id, attribution, subject, content)
            VALUES (%s, %s, %s, %s)
            RETURNING *
        ''', (user_id, attribution, subject, content))
        post = cur.fetchone()
        DBHelp.close_conn_cur(conn, cur, commit=True)
        convert_datetime_to_isoformat(post, ('created_at', 'deleted_at'))
        return post

    @staticmethod 
    def get_posts(limit=50, include_deleted=False):
        conn, cur = DBHelp.get_conn_cur(cursor=RealDictCursor)
        query = '''
            SELECT p.*, 
                COUNT(c.comment_id) as comment_count
            FROM posts p
            LEFT JOIN comments c ON p.post_id = c.post_id AND c.is_deleted = FALSE
        '''
        if not include_deleted:
            query += ' WHERE p.is_deleted = FALSE'
        query += '''
            GROUP BY p.post_id
            ORDER BY p.created_at DESC 
            LIMIT %s
        '''
        cur.execute(query, (limit,))
        posts = cur.fetchall()
        DBHelp.close_conn_cur(conn, cur)
        for post in posts:
            convert_datetime_to_isoformat(post, ('created_at', 'deleted_at'))
        return posts

    @staticmethod 
    def get_post_by_id(post_id, include_deleted=False):
        conn, cur = DBHelp.get_conn_cur(cursor=RealDictCursor)
        query = 'SELECT * FROM posts WHERE post_id = %s'
        if not include_deleted:
            query += ' AND is_deleted = FALSE'
        cur.execute(query, (post_id,))
        post = cur.fetchone()
        DBHelp.close_conn_cur(conn, cur)
        convert_datetime_to_isoformat(post, ('created_at', 'deleted_at'))
        return post

    @staticmethod 
    def soft_delete_post(post_id):
        conn, cur = DBHelp.get_conn_cur()
        cur.execute('''
            UPDATE posts 
            SET is_deleted = TRUE, deleted_at = NOW() 
            WHERE post_id = %s
        ''', (post_id,))
        DBHelp.close_conn_cur(conn, cur, commit=True)

    @staticmethod 
    def restore_post(post_id):
        conn, cur = DBHelp.get_conn_cur()
        cur.execute('''
            UPDATE posts 
            SET is_deleted = FALSE, deleted_at = NULL 
            WHERE post_id = %s
        ''', (post_id,))
        DBHelp.close_conn_cur(conn, cur, commit=True)

    @staticmethod 
    def like_post(post_id):
        conn, cur = DBHelp.get_conn_cur()
        cur.execute('''
            UPDATE posts SET likes = likes + 1
            WHERE post_id = %s AND is_deleted = FALSE
        ''', (post_id,))
        DBHelp.close_conn_cur(conn, cur, commit=True)

# ---------- COMMENTS ---------- #
class Comments:
    @staticmethod 
    def create_comment(post_id, user_id, attribution, content):
        conn, cur = DBHelp.get_conn_cur(cursor=RealDictCursor)
        cur.execute('''
            INSERT INTO comments (post_id, user_id, attribution, content)
            VALUES (%s, %s, %s, %s)
            RETURNING *
        ''', (post_id, user_id, attribution, content))
        comment = cur.fetchone()
        DBHelp.close_conn_cur(conn, cur, commit=True)
        convert_datetime_to_isoformat(comment, ('created_at', 'deleted_at'))
        return comment

    @staticmethod 
    def get_comments(post_id, include_deleted=False):
        conn, cur = DBHelp.get_conn_cur(cursor=RealDictCursor)
        query = '''
            SELECT * FROM comments 
            WHERE post_id = %s
        '''
        if not include_deleted:
            query += ' AND is_deleted = FALSE'
        query += ' ORDER BY created_at ASC'
        cur.execute(query, (post_id,))
        comments = cur.fetchall()
        DBHelp.close_conn_cur(conn, cur)
        for comment in comments:
            convert_datetime_to_isoformat(comment, ('created_at', 'deleted_at'))
        return comments

    @staticmethod 
    def soft_delete_comment(comment_id):
        conn, cur = DBHelp.get_conn_cur()
        cur.execute('''
            UPDATE comments 
            SET is_deleted = TRUE, deleted_at = NOW() 
            WHERE comment_id = %s
        ''', (comment_id,))
        DBHelp.close_conn_cur(conn, cur, commit=True)

    @staticmethod 
    def restore_comment(comment_id):
        conn, cur = DBHelp.get_conn_cur()
        cur.execute('''
            UPDATE comments 
            SET is_deleted = FALSE, deleted_at = NULL 
            WHERE comment_id = %s
        ''', (comment_id,))
        DBHelp.close_conn_cur(conn, cur, commit=True)

    @staticmethod 
    def like_comment(comment_id):
        conn, cur = DBHelp.get_conn_cur()
        cur.execute('''
            UPDATE comments SET likes = likes + 1
            WHERE comment_id = %s AND is_deleted = FALSE
        ''', (comment_id,))
        DBHelp.close_conn_cur(conn, cur, commit=True)
