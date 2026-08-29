
def convert_datetime_to_isoformat(dict_obj, values):
    if not dict_obj: return
    for value in values:
        if dict_obj.get(value):
            dict_obj[value] = dict_obj[value].isoformat()

def store_in_active_users(active_users, user_id, socket_id, user_data):
    active_users[user_id] = {
        'user_id': user_id,
        'socket_id': socket_id,
        'username': user_data['username'],
        'is_deleted': user_data['is_deleted'],
        'created_at': user_data['created_at'],
    }