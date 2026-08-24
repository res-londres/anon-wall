from flask import Flask, render_template, request, jsonify
from flask_socketio import SocketIO, emit
import helpers as help

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'

socketio = SocketIO(app, cors_allowed_origins='*')

# ---------- routing ---------- #
@app.route('/')
def home():
    return render_template('index.html')

@app.route('/check_session')
def check_session():
    '''HTTP endpoint to check if user has a session'''
    print(f'[HTTP] checking cookie..')
    user_id = help.Cookies.get_user_cookie()
    if user_id:
        print(f'[HTTP] cookie found: {user_id}')
        return jsonify({'active': True})
    print(f'[HTTP] no active session')
    return jsonify({'active': False})

# ---------- sign-up ----------- #
@socketio.on('sign-up')
def handle_sign_up(data):
    print(f'[SIGN-UP] new user signing up..')
    username = data['username']
    existing_ids = [] # TODO: change this when we work on database
    try:
        user_id = help.ID.generate_user_id(username, existing_ids)
    except ValueError:
        emit('join_error', {'reason': 'bad_name'})
        return
    print(f'[SIGN-UP] sign up success: {user_id}')
    emit('sign-up-success', {'user_id': user_id, 'username': username,'set_cookie': True})

# ---------- etc ---------- #
@socketio.on('connect')
def handle_connect():
    print('[CONNECT] someone connects..')

@socketio.on('disconnect')
def handle_disconnect():
    print('[DISCONNECT] someone disconnects..')

if __name__ == '__main__':
    socketio.run(app, debug=True)