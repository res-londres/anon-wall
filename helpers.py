import secrets
from flask import request

# ---------- cookie helpers ---------- #
class Cookies:
    # cookies are set and removed in the client
    @staticmethod
    def get_user_cookie():
        return request.cookies.get('user_id')

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