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

function createPost() {
    const postSubject = document.getElementById('post-subject');
    const postContent = document.getElementById('post-content');
    const subject = postSubject.value.trim();
    const content = postContent.value.trim();

    const newPost = {
        attribution: 'anon', // Temporary
        subject: subject,
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
                <div class="empty-icon">${'<i class="fa-solid fa-leaf"></i>'}</div>
                <p>No posts yet..</p>
            </div>
        `;
        return;
    }
    
    let html = '';
    posts.forEach(post => {
        html += createPostHTML(post);
    });
    
    wall.innerHTML = html;
}

function createPostHTML(post) {
    return `
        <div class="post-card">
            <div class="post-header">
                <span class="post-attribution">${post.attribution}</span>
                <span class="post-time">${post.time || 'Just now'}</span>
            </div>
            <div class="post-subject">${escapeHTML(post.subject) || '[NO SUBJECT]'}</div>
            <div class="post-footer">
                <button class="like-button ${post.liked ? 'liked' : ''}">
                    <span class="like-icon">${post.liked ? '<i class="fa-solid fa-heart"></i>' : '<i class="fa-regular fa-heart"></i>'}</span>
                    <span class="like-count">${post.likes}</span>
                </button>
                <button class="comment-button">
                    <span class="comment-icon">${'<i class="fa-regular fa-comment"></i>'}</span>
                    <span>${post.comments ? post.comments.length : 0}</span>
                </button>
            </div>
            <div class="post-comments" style="${post.comments && post.comments.length > 0 ? '' : 'display:none;'}"></div>
        </div>
    `;
}

function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}