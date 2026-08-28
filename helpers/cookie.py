
from flask import request

def get_user_cookie():
    return request.cookies.get('user_id')