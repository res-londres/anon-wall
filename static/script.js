const socket = io();

// ----------init---------- //
function init() {
    // auth
    checkSession();

    // setup event listeners
    setupNavigation();

    renderPosts();
}
document.addEventListener('DOMContentLoaded', init);

// -----------auth---------- //
function checkSession() {
    fetch('/check_session')
        .then(response => response.json())
        .then(data => {
            if (data.active) {
                // auto sign up success
                console.log('[CHECK-SESSION] active session found; loggin in..');
                showScreen('main');
            } else {
                console.log('[CHECK-SESSION] active session not found; continuing to sign up..');
                showScreen('sign-up');
            }
        })
}

// ---------- cookie-helpers ---------- //
function setCookie(name, value, days) {
    let expires = '';
    if (days) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = '; expires=' + date.toUTCString();
    }
    document.cookie = name + '=' + (value || '') + expires + '; path=/; SameSite=Lax';
    console.log('[SET-COOKIE] cookie set: ', name, '=', value);
    console.log('[SET-COOKIE] all cookies: ', document.cookie);
}
function deleteCookie(name) {
    document.cookie = name + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    console.log('[DELETE-COOKIE] cookie deleted:', name);
}

// ---------- sign-up ---------- //
function signUp() {
    const usernameInput = document.getElementById('username-input');
    const username = usernameInput.value.trim();
    if (!username || !isAlphanumeric(username)) {
        const invalidUsernameMessage = document.getElementById('invalid-username-message').textContent = 'Please enter a valid alphanumeric name!';
        usernameInput.focus();
        return;
    }
    const signUpButton = document.getElementById('sign-up-button');
    signUpButton.disabled = true;
    signUpButton.textContent = 'Signing up..';
    socket.emit('sign-up', {username: username});
}
socket.on('sign-up-success', function(data) {
    if (data.set_cookie) {
        setCookie('user_id', data.user_id, 365);
    }
    showScreen('main');
    resetSignUpState();
})

// ---------nav-page-loader---------- //
function setupNavigation() {
    document.querySelectorAll('nav a').forEach(function(link) {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            var page = this.dataset.page;
            showPage(page);
        });
    });
}
function showPage(page) {
    // hide all pages
    document.querySelectorAll('.page-content').forEach(function(el) {
        el.style.display = 'none';
    });
    // show target page
    var target = document.getElementById('page-' + page);
    if (target) {
        target.style.display = 'block';
    }
    // reassign active class to active page
    document.querySelectorAll('nav a').forEach(function(el) {
        el.classList.remove('active');
    });
    document.querySelector('nav a[data-page="' + page + '"]').classList.add('active');
}

// ---------- misc-helpers ---------- //
function isAlphanumeric(str) {
    return /^[a-zA-Z0-9]+$/.test(str);
}
function resetSignUpState() {
    document.getElementById('username-input').value = '';
    const signUpButton = document.getElementById('sign-up-button');
    signUpButton.disabled = false;
    signUpButton.textContent = 'Sign up';
}
function showScreen(screenName) {
    const screens = ['loading', 'sign-up', 'main'];
    screens.forEach(name => {
        document.getElementById(`${name}-container`).style.display = 'none';
    });
    const displayMap = {
        loading: 'flex',
        'sign-up': 'flex',
        main: 'grid'
    };
    document.getElementById(`${screenName}-container`).style.display = displayMap[screenName];
}

// ----------- posts ---------- //
let posts = [];
let currentPostIndex = null; // Track which post is open in modal

function createPost() {
    const postSubject = document.getElementById('post-subject-input');
    const postContent = document.getElementById('post-content-input');
    const subject = postSubject.value.trim();
    const content = postContent.value.trim();

    const newPost = {
        attribution: 'anon', // Temporary
        subject: subject || '[NO SUBJECT]',
        content: content,
        likes: 0,
        liked: false,
        time: 'Just now', // Temporary
        comments: []
    };
    posts.push(newPost);

    postSubject.value = '';
    postContent.value = '';
    renderPosts();
    document.querySelector('.content').scrollTop = 0;
}

function renderPosts() {
    const wall = document.getElementById('wall');
    
    if (posts.length === 0) {
        wall.innerHTML = `
            <div class="empty-wall">
                <div class="empty-icon"><i class="fa-solid fa-leaf"></i></div>
                <p>No posts yet..</p>
            </div>
        `;
        return;
    }
    postsReversed = posts.reverse();
    
    let html = '';
    postsReversed.forEach((post, index) => {
        html += createPostHTML(post, index);
    });
    
    wall.innerHTML = html;
}

function createPostHTML(post, index) {
    const commentsCount = post.comments ? post.comments.length : 0;
    const likeIcon = post.liked ? 'fa-solid fa-heart' : 'fa-regular fa-heart';
    const postContentPreview = post.content.length > 500 ? post.content.slice(0, 497) + '...' : post.content
    
    return `
        <div class="post-card" onclick="openPostModal(${index})">
            <div class="post-header">
                <span class="post-attribution">${escapeHTML(post.attribution)}</span>
                <span class="post-time">${post.time}</span>
            </div>
            <div class="post-subject">${escapeHTML(post.subject)}</div>
            <div class="post-content-preview">${escapeHTML(postContentPreview)}</div>
            <div class="post-footer" onclick="event.stopPropagation();">
                <button class="post-action-button" ${post.liked ? 'liked' : ''}" onclick="toggleLike(${index})">
                    <span class="like-icon"><i class="${likeIcon}"></i></span>
                    <span class="like-count">${post.likes}</span>
                </button>
                <button class="post-action-button" onclick="openPostModal(${index})">
                    <span class="comment-icon"><i class="fa-regular fa-comment"></i></span>
                    <span>${commentsCount}</span>
                </button>
            </div>
        </div>
    `;
}

// ---------- post-modal---------- //

function openPostModal(index) {
    currentPostIndex = index;
    const post = posts[index];
    if (!post) return;
    
    const modalContent = document.getElementById('post-detail-content');
    modalContent.innerHTML = createModalHTML(post, index);
    
    document.getElementById('post-modal').style.display = 'flex';
    document.body.style.overflow = 'hidden'; // Prevent scrolling behind modal
}

function closePostModal() {
    document.getElementById('post-modal').style.display = 'none';
    document.body.style.overflow = '';
    currentPostIndex = null;
}

function createModalHTML(post, index) {
    const commentsCount = post.comments ? post.comments.length : 0;
    const likeIcon = post.liked ? 'fa-solid fa-heart' : 'fa-regular fa-heart';

    let commentsHTML = '';
    if (post.comments && post.comments.length > 0) {
        post.comments.forEach((comment, commentIndex) => {
            const commentLikeIcon = comment.liked ? 'fa-solid fa-heart' : 'fa-regular fa-heart';
            commentsHTML += `
                <div class="modal-comment-item">
                    <div class="modal-comment-left">
                        <span class="modal-comment-attribution">${escapeHTML(comment.attribution)}</span>
                        <span class="modal-comment-text">${escapeHTML(comment.content)}</span>
                    </div>
                    <button class="modal-comment-like-button ${comment.liked ? 'liked' : ''}" 
                            onclick="toggleCommentLike(${index}, ${commentIndex})">
                        <i class="${commentLikeIcon}"></i>
                        <span class="modal-comment-like-count">${comment.likes}</span>
                    </button>
                </div>
            `;
        });
    } else {
        commentsHTML = `
            <div class="empty-modal-comments">No comments yet..</div>
        `;
    }
    
    return `
        <div class="modal-post-card">
            <div class="modal-post-header">
                <span class="modal-post-attribution">${escapeHTML(post.attribution)}</span>
                <span class="modal-post-time">${post.time}</span>
            </div>
            <div class="modal-post-subject">${escapeHTML(post.subject)}</div>
            <div class="modal-post-content">${escapeHTML(post.content)}</div>
            <div class="modal-post-footer">
                <button class="post-action-button" ${post.liked ? 'liked' : ''}" onclick="toggleLikeModal(${index})">
                    <span class="like-icon"><i class="${likeIcon}"></i></span>
                    <span class="like-count">${post.likes}</span>
                </button>
                <button class="post-action-button">
                    <span class="comment-icon"><i class="fa-regular fa-comment"></i></span>
                    <span>${commentsCount}</span>
                </button>
            </div>
        </div>
        
        <div class="modal-comments-section">
            <div class="modal-comments-title">Comments (${commentsCount})</div>
            <div id="modal-comments-list">
                ${commentsHTML}
            </div>
            <div class="modal-comment-input-container">
                <input type="text" class="modal-comment-input" placeholder="Write a comment..." 
                       id="modal-comment-input" 
                       onkeypress="if(event.key==='Enter') submitCommentModal(${index})">
                <button class="modal-comment-submit" onclick="submitCommentModal(${index})">Reply</button>
            </div>
        </div>
    `;
}

// ---------- modal-actions ---------- //
function toggleLikeModal(index) {
    const post = posts[index];
    if (post) {
        post.liked = !post.liked;
        post.likes += post.liked ? 1 : -1;
        
        // Re-render the modal
        const modalContent = document.getElementById('post-detail-content');
        modalContent.innerHTML = createModalHTML(post, index);
        
        // Re-render the wall too
        renderPosts();
    }
}
function submitCommentModal(index) {
    const commentInput = document.getElementById('modal-comment-input');
    const comment = commentInput.value.trim();
    if (!comment) return;
    
    const post = posts[index];
    if (post) {
        post.comments.push({
            attribution: 'anon', // Temporary
            content: comment,
            likes: 0,
            liked: false
        });
        
        commentInput.value = '';
        
        const modalContent = document.getElementById('post-detail-content');
        modalContent.innerHTML = createModalHTML(post, index);
        
        renderPosts();
        
        // scroll to bottom 
        const modalContentScroll = document.querySelector('.post-modal-content');
        if (modalContentScroll) {
            modalContentScroll.scrollTop = modalContentScroll.scrollHeight;
        }
    }
}

function toggleLike(index) {
    const post = posts[index];
    if (post) {
        post.liked = !post.liked;
        post.likes += post.liked ? 1 : -1;
        renderPosts();
    }
}
function toggleCommentLike(postIndex, commentIndex) {
    const post = posts[postIndex];
    if (!post || !post.comments || !post.comments[commentIndex]) return;
    
    const comment = post.comments[commentIndex];
    comment.liked = !comment.liked;
    comment.likes += comment.liked ? 1 : -1;
    
    const modalContent = document.getElementById('post-detail-content');
    modalContent.innerHTML = createModalHTML(post, postIndex);
    
    renderPosts();
}

function escapeHTML(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}
