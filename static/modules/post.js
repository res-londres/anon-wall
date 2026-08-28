
import { escapeHTML } from './helpers/misc.js';

export let posts = [];
export let currentPostIndex = null; 

export function createPost() {
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

export function renderPosts() {
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

    let postsReversed = [...posts].reverse();
    let html = '';
    postsReversed.forEach((post, index) => {
        html += createPostHTML(post, index);
    });
    wall.innerHTML = html;
}

export function createPostHTML(post, index) {
    const commentsCount = post.comments ? post.comments.length : 0;
    const likeIcon = post.liked ? 'fa-solid fa-heart' : 'fa-regular fa-heart';
    const postContentPreview = post.content.length > 500 ? post.content.slice(0, 497) + '...' : post.content
    
    return `
        <div class="post-card" onclick="post.openPostModal(${index})">
            <div class="post-header">
                <span class="post-attribution">${escapeHTML(post.attribution)}</span>
                <span class="post-time">${post.time}</span>
            </div>
            <div class="post-subject">${escapeHTML(post.subject)}</div>
            <div class="post-content-preview">${escapeHTML(postContentPreview)}</div>
            <div class="post-footer" onclick="event.stopPropagation();">
                <button class="post-action-button ${post.liked ? 'liked' : ''}" onclick="post.toggleLike(${index})">
                    <span class="like-icon"><i class="${likeIcon}"></i></span>
                    <span class="like-count">${post.likes}</span>
                </button>
                <button class="post-action-button" onclick="post.openPostModal(${index})">
                    <span class="comment-icon"><i class="fa-regular fa-comment"></i></span>
                    <span>${commentsCount}</span>
                </button>
            </div>
        </div>
    `;
}

// ---------- post-modal---------- //
export function openPostModal(index) {
    currentPostIndex = index;
    const post = posts[index];
    if (!post) return;
    
    const modalContent = document.getElementById('post-detail-content');
    modalContent.innerHTML = createPostModalHTML(post, index);
    
    document.getElementById('post-modal').style.display = 'flex';
    document.body.style.overflow = 'hidden'; // prevent scrolling behind modal
}

export function closePostModal() {
    document.getElementById('post-modal').style.display = 'none';
    document.body.style.overflow = '';
    currentPostIndex = null;
}

export function createPostModalHTML(post, index) {
    const commentsCount = post.comments ? post.comments.length : 0;
    const likeIcon = post.liked ? 'fa-solid fa-heart' : 'fa-regular fa-heart';

    let commentsHTML = '';
    if (post.comments && post.comments.length > 0) {
        let commentsReversed = [...post.comments].reverse();
        commentsReversed.forEach((comment, commentIndex) => {
            const commentLikeIcon = comment.liked ? 'fa-solid fa-heart' : 'fa-regular fa-heart';
            commentsHTML += `
                <div class="modal-comment-item">
                    <div class="modal-comment-left">
                        <span class="modal-comment-attribution">${escapeHTML(comment.attribution)}</span>
                        <span class="modal-comment-text">${escapeHTML(comment.content)}</span>
                    </div>
                    <button class="modal-comment-like-button ${comment.liked ? 'liked' : ''}" onclick="post.toggleCommentLike(${index}, ${commentIndex})">
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
                <button class="post-action-button ${post.liked ? 'liked' : ''}" onclick="post.toggleLikeModal(${index})">
                    <span class="like-icon"><i class="${likeIcon}"></i></span>
                    <span class="like-count">${post.likes}</span>
                </button>
                <button class="post-action-button" onclick=post.closePostModal()>
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
                       onkeypress="if(event.key==='Enter') post.submitCommentModal(${index})">
                <button class="modal-comment-submit" onclick="post.submitCommentModal(${index})">Reply</button>
            </div>
        </div>
    `;
}

// ---------- modal-actions ---------- //
export function toggleLikeModal(index) {
    const post = posts[index];
    if (post) {
        post.liked = !post.liked;
        post.likes += post.liked ? 1 : -1;
        
        const modalContent = document.getElementById('post-detail-content');
        modalContent.innerHTML = createPostModalHTML(post, index);
        
        renderPosts();
    }
}

export function submitCommentModal(index) {
    const commentInput = document.getElementById('modal-comment-input');
    const comment = commentInput.value.trim();
    if (!comment) return;
    
    const post = posts[index];
    if (post) {
        post.comments.push({
            attribution: 'anon', // Temporary
            content: comment,
            likes: 0,
            liked: false,
            time: 'Just now..' // Temporary
        });
        
        commentInput.value = '';
        
        const modalContent = document.getElementById('post-detail-content');
        modalContent.innerHTML = createPostModalHTML(post, index);
        
        renderPosts();
        
        const modalContentScroll = document.querySelector('.post-modal-content');
        const modalCommentsSection = document.querySelector('.modal-comments-section');
        if (modalContentScroll && modalCommentsSection) {
            modalContentScroll.scrollTop = modalCommentsSection.offsetTop;
        }
    }
}

export function toggleLike(index) {
    const post = posts[index];
    if (post) {
        post.liked = !post.liked;
        post.likes += post.liked ? 1 : -1;
        renderPosts();
    }
}

export function toggleCommentLike(postIndex, commentIndex) {
    const post = posts[postIndex];
    if (!post || !post.comments || !post.comments[commentIndex]) return;
    
    const comment = post.comments[commentIndex];
    comment.liked = !comment.liked;
    comment.likes += comment.liked ? 1 : -1;
    
    const modalContent = document.getElementById('post-detail-content');
    modalContent.innerHTML = createPostModalHTML(post, postIndex);
    
    renderPosts();
}

