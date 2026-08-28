
import secrets

MAX_ATTEMPTS = 100
MAX_USERNAME_LENGTH = 20
TAG_RANGE = 10000

def generate_user_id(username, existing_ids):
    username = username[:MAX_USERNAME_LENGTH]
    for _ in range(MAX_ATTEMPTS):
        tag = secrets.randbelow(TAG_RANGE)
        tag_str = str(tag).zfill(5)
        user_id = f'{username}#{tag_str}'
        if user_id not in existing_ids:
            return user_id

