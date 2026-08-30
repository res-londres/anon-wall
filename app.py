
from flask import Flask, render_template, request, jsonify
from flask_socketio import SocketIO, emit
import helpers.cookie as cookie
import helpers.database as db
import helpers.id as id
import helpers.misc as misc

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'

socketio = SocketIO(app, cors_allowed_origins='*')

active_users = {}
# ---------- routing ---------- #
@app.route('/')
def home():
    return render_template('index.html')

@app.route('/check_session')
def check_session():
    '''HTTP endpoint to check if user has a session'''
    print(f'[HTTP] checking cookie..')
    user_id = cookie.get_user_cookie()
    if user_id:
        user = db.Users.get_user_by_id(user_id)
        if user:
            print(f'[HTTP] cookie found: {user_id}') 
            return jsonify({
                'active': True,
                'user': {
                    'user_data': user,
                    'user_id': user['user_id'],
                    'username': user['username'],
                }
            })
    print(f'[HTTP] no active session')
    return jsonify({'active': False})

# ---------- sign-up ----------- #
@socketio.on('sign-up')
def handle_sign_up(data):
    print(f'[SIGN-UP] new user signing up..')
    username = data['username']
    print(f'[SIGN-UP] username found: {username}')
    existing_ids = {user.get('user_id') for user in active_users.values()}
    print(f'[SIGN-UP] existing ids found: {existing_ids}')
    try:
        user_id = id.generate_user_id(username, existing_ids)
        print(f'[SIGN-UP] id generated: {user_id}')  
    except ValueError:
        emit('join_error', {'reason': 'bad_name'})
        return
    user_data = db.Users.create_user(user_id, username)
    print(f'[SIGN-UP] user created: {user_data}')
    socket_id = request.sid
    print(f'[SIGN-UP] sid requested: {socket_id}')
    db.Users.update_user_socket_id(user_id, socket_id)
    print(f'[SIGN-UP] user socket id updated..')
    misc.store_in_active_users(active_users, user_id, socket_id, user_data)
    print(f'[SIGN-UP] new user stored in active users: {active_users}')
    print(f'[SIGN-UP] sign up success: {user_id}')
    emit('sign-up-success', {
        'user_data': user_data,
        'user_id': user_id, 
        'username': username,
        'set_cookie': True
    })

# ---------- etc ---------- #
@socketio.on('connect')
def handle_connect():
    print('[CONNECT] someone connects..')

@socketio.on('disconnect')
def handle_disconnect():
    print('[DISCONNECT] someone disconnects..')

if __name__ == '__main__':
    socketio.run(app, debug=True)