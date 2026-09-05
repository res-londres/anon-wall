
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
    get_user_data(session_data)
    return jsonify(session_data)

def get_user_data(session_data):
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
    
# ---------- sign-up ----------- #
@socketio.on('sign-up')
def handle_sign_up(data):
    print(f'[SIGN-UP] new user signing up..')
    username = data['username']
    alt_name = data['alt_name'] # first alt name upon signup
    existing_ids = {user.get('user_id') for user in active_users.values()}
    try:
        user_id = id.generate_user_id(username, existing_ids)
    except ValueError:
        emit('join_error', {'reason': 'bad_name'})
        return
    db.AltNames.create_alt_name(user_id, alt_name, is_default=True)
    user_data = db.Users.create_user(user_id, username)
    socket_id = request.sid
    db.Users.update_user_socket_id(user_id, socket_id)
    misc.store_in_active_users(active_users, user_id, socket_id, user_data)
    print(f'[SIGN-UP] sign up success: {user_data}')
    emit('sign-up-success', {
        'user_data': user_data,
        'user_id': user_id, 
        'username': username,
        'alt_names': [alt_name],
        'set_cookie': True
    })

# ---------- post ---------- #
@socketio.on('create-post')
def handle_create_post(data):
    post = data['post']
    post = db.Posts.create_post(post['user_id'], post['attribution'], post['subject'], post['content'])
    emit('create-post-success', {
        'post_data': post,
        'post_id': post['post_id'],
    })

@socketio.on('submit-comment')
def handle_submit_comment(data):
    comment = data['comment']
    print(f'[HANDLE-SUBMIT-COMMENT] comment BEFORE: {comment}')
    comment = db.Comments.create_comment(comment['post_id'], comment['user_id'], comment['attribution'], comment['content'])
    print(f'[HANDLE-SUBMIT-COMMENT] comment AFTER: {comment}')
    emit('submit-comment-success', {
        'comment_data': comment,
        'comment_id': comment['comment_id'],
    })

# ---------- likes ---------- #
@socketio.on('toggle-post-like')
def handle_toggle_post_like(data):
    user_id = data['user_id']
    post_id = data['post_id']
    db.PostLikes.toggle_post_like(user_id, post_id)

@socketio.on('toggle-comment-like')
def handle_toggle_comment_like(data):
    user_id = data['user_id']
    comment_id = data['comment_id']
    db.CommentLikes.toggle_comment_like(user_id, comment_id)

# ---------- post modal ---------- #
@socketio.on('open-post-modal')
def handle_open_post_modal(data):
    user_id = data['user_id']
    post_id = data['post_id']
    comments = db.Comments.get_comments(post_id)
    liked_comments = db.CommentLikes.get_user_liked_comments_in_post(user_id, post_id, [comment['comment_id'] for comment in comments])
    emit('open-post-modal-success', {
        'post_id': post_id,
        'comments': comments,
        'liked_comments': liked_comments,
    })

# ---------- fetch posts ---------- #
@socketio.on('fetch-global-posts')
def handle_fetch_global_posts(data):
    print('[FETCH-POSTS] fetching posts and user liked posts..')
    user_id = data['user_id']
    posts = db.Posts.get_posts()
    liked_posts = db.PostLikes.get_user_liked_posts(user_id, [post['post_id'] for post in posts])
    print('[FETCH-POSTS] fetched!')
    emit('fetch-global-posts-success', {
        'posts': posts,
        'liked_posts': liked_posts,
    })

@socketio.on('fetch-user-posts')
def handle_fetch_user_posts(data):
    user_id = data['user_id']
    print('[FETCH-USER-POSTS] fetching user posts and liked posts..')
    posts = db.Posts.get_posts_by_user(user_id)
    liked_posts = db.PostLikes.get_user_liked_posts(user_id, [post['post_id'] for post in posts])
    print('[FETCH-USER-POSTS] fetched!')
    emit('fetch-user-posts-success', {
        'posts': posts,
        'liked_posts': liked_posts,
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