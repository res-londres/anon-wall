from flask import request

# ---------- cookie helpers ---------- #
class Cookies:
    # cookies are set and removed in the client
    @staticmethod
    def get_user_cookie():
        return request.cookies.get('user_id')