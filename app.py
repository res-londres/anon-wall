
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
    session_data = {'active': False}
    user_id = cookie.get_user_cookie()
    if user_id:
        user = db.Users.get_user_by_id(user_id)
        if user:
            print(f'[HTTP] cookie found: {user_id}') 
            session_data['active'] = True
            session_data['user'] = {
                'user_data': user,
                'user_id': user['user_id'],
                'username': user['username'],
            }
    else: print(f'[HTTP] no active session')
    recent_posts = db.Posts.get_posts()
    print(f'[HTTP] recent posts: {recent_posts}')
    session_data['posts'] = recent_posts
    return jsonify(session_data)

# ---------- sign-up ----------- #
@socketio.on('sign-up')
def handle_sign_up(data):
    print(f'[SIGN-UP] new user signing up..')
    username = data['username']
    existing_ids = {user.get('user_id') for user in active_users.values()}
    try:
        user_id = id.generate_user_id(username, existing_ids)
    except ValueError:
        emit('join_error', {'reason': 'bad_name'})
        return
    user_data = db.Users.create_user(user_id, username)
    socket_id = request.sid
    db.Users.update_user_socket_id(user_id, socket_id)
    misc.store_in_active_users(active_users, user_id, socket_id, user_data)
    print(f'[SIGN-UP] sign up success: {user_data}')
    emit('sign-up-success', {
        'user_data': user_data,
        'user_id': user_id, 
        'username': username,
        'set_cookie': True
    })

# ---------- post ---------- #
@socketio.on('create-post')
def handle_create_post(data):
    post = data['post']
    print(f'[HANDLE-CREATE-POST] post data before: {post}')
    post = db.Posts.create_post(post['user_id'], post['attribution'], post['subject'], post['content'])
    print(f'[HANDLE-CREATE-POST] post data after: {post}')
    emit('create-post-success', {
        'post_data': post,
        'post_id': post['post_id'],
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