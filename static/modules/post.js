
import { escapeHTML } from './helpers/misc.js';

// ----------- event-handlers ----------- //
document.getElementById('post-creator').addEventListener('click', function(event) {
    const actionElement = event.target.closest('[data-action]');
    if (actionElement) {
        const action = actionElement.dataset.action;
        
        event.stopPropagation();
        if (action === 'createPost') {
            createPost();
        }
    }
});

document.getElementById('wall').addEventListener('click', function(event) {
    const actionElement = event.target.closest('[data-action]');
    if (actionElement) {
        const action = actionElement.dataset.action;
        const postIndex = actionElement.hasAttribute('data-postindex') ? parseInt(actionElement.dataset.postindex) : null;
        
        event.stopPropagation();
        if (action === 'doNothing') {
        } else if (action === 'likePost') {
            toggleLike(postIndex);
        } else if (action === 'openPostModal') {
            openPostModal(postIndex);
        }
    }
});

document.getElementById('post-modal').addEventListener('click', function(event) {
    const actionElement = event.target.closest('[data-action');
    if (actionElement) {
        const action = actionElement.dataset.action;
        const postIndex = actionElement.hasAttribute('data-postindex') ? parseInt(actionElement.dataset.postindex) : null;
        const commentIndex = actionElement.hasAttribute('data-commentindex') ? parseInt(actionElement.dataset.commentindex) : null;
        
        event.stopPropagation();
        if (action === 'closePostModal') {
            closePostModal();
        } else if (action === 'likePost') {
            toggleLikeModal(postIndex);
        } else if (action === 'likeComment') {
            toggleCommentLike(postIndex, commentIndex);
        } else if (action === 'submitComment') {
            submitCommentModal(postIndex);
        }
    }
});

// ----------- posts ----------- //
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

    let html = '';
    for (let postIndex = posts.length - 1; postIndex >= 0; postIndex--) {
        html += createPostHTML(posts[postIndex], postIndex);
    }
    wall.innerHTML = html;
}

export function createPostHTML(post, postIndex) {
    const classLiked = post.liked ? 'liked' : '';
    const commentsCount = post.comments ? post.comments.length : 0;
    const commentIcon = 'fa-regular fa-comment';
    const likesCount = post.likes;
    const likeIcon = post.liked ? 'fa-solid fa-heart' : 'fa-regular fa-heart';
    const postAttribution = escapeHTML(post.attribution);
    const postContentPreview = escapeHTML(post.content.length > 500 ? post.content.slice(0, 497) + '...' : post.content);
    const postSubject = escapeHTML(post.subject);
    const postTime = post.time;
    
    return `
        <div class="post-card" data-action="openPostModal" data-postindex="${postIndex}">
            <div class="post-header">
                <span class="post-attribution">${postAttribution}</span>
                <span class="post-time">${postTime}</span>
            </div>
            <div class="post-subject">${postSubject}</div>
            <div class="post-content-preview">${postContentPreview}</div>
            <div class="post-footer" data-action="doNothing">
                <button class="post-action-button ${classLiked}" data-action="likePost" data-postindex="${postIndex}">
                    <span class="like-icon"><i class="${likeIcon}"></i></span>
                    <span class="like-count">${likesCount}</span>
                </button>
                <button class="post-action-button" data-action="openPostModal" data-postindex="${postIndex}">
                    <span class="comment-icon"><i class="${commentIcon}"></i></span>
                    <span>${commentsCount}</span>
                </button>
            </div>
        </div>
    `;
}

// ---------- post-modal---------- //
export function openPostModal(postIndex) {
    currentPostIndex = postIndex;
    const post = posts[postIndex];
    if (!post) return;
    
    const modalContent = document.getElementById('post-detail-content');
    modalContent.innerHTML = createPostModalHTML(post, postIndex);
    
    document.getElementById('post-modal').style.display = 'flex';
    document.body.style.overflow = 'hidden'; // prevent scrolling behind modal
}

export function closePostModal() {
    document.getElementById('post-modal').style.display = 'none';
    document.body.style.overflow = '';
    currentPostIndex = null;
}

export function createCommentsHTML(comments, postIndex) {
    const commentsCount = comments ? comments.length : 0;

    let commentsHTML = '';
    if (comments && commentsCount > 0) {
        for (let commentIndex = commentsCount - 1; commentIndex >= 0; commentIndex--) {
            const comment = comments[commentIndex];
            const commentAttribution = escapeHTML(comment.attribution);
            const commentContent = escapeHTML(comment.content);
            const commentLikeIcon = comment.liked ? 'fa-solid fa-heart' : 'fa-regular fa-heart';
            const commentLikesCount = comment.likes;
            const classCommentLiked = comment.liked ? 'liked' : '';

            commentsHTML += `
                <div class="modal-comment-item" data-commentindex="${commentIndex}">
                    <div class="modal-comment-left">
                        <span class="modal-comment-attribution">${commentAttribution}</span>
                        <span class="modal-comment-text">${commentContent}</span>
                    </div>
                    <button class="modal-comment-like-button ${classCommentLiked}" data-action="likeComment" data-postindex="${postIndex}" data-commentindex="${commentIndex}">
                        <i class="${commentLikeIcon}"></i>
                        <span class="modal-comment-like-count">${commentLikesCount}</span>
                    </button>
                </div>
            `;
        }
    } else {
        commentsHTML = `
            <div class="empty-modal-comments">No comments yet..</div>
        `;
    }
    return commentsHTML;
}

export function createPostModalHTML(post, postIndex) {
    const classLiked = post.liked ? 'liked' : '';
    const comments = post.comments;
    const commentIcon = 'fa-regular fa-comment';
    const commentsCount = post.comments ? post.comments.length : 0;
    const commentsHTML = createCommentsHTML(comments, postIndex);
    const likeIcon = post.liked ? 'fa-solid fa-heart' : 'fa-regular fa-heart';
    const likesCount = post.likes;
    const postAttribution = escapeHTML(post.attribution);
    const postContent = escapeHTML(post.content);
    const postSubject = escapeHTML(post.subject);

    return `
        <div class="modal-post-card">
            <div class="modal-post-header">
                <span class="modal-post-attribution">${postAttribution}</span>
                <span class="modal-post-time">${post.time}</span>
            </div>
            <div class="modal-post-subject">${postSubject}</div>
            <div class="modal-post-content">${postContent}</div>
            <div class="modal-post-footer">
                <button class="post-action-button ${classLiked}" data-action="likePost" data-postindex="${postIndex}">
                    <span class="like-icon"><i class="${likeIcon}"></i></span>
                    <span class="like-count">${likesCount}</span>
                </button>
                <button class="post-action-button" data-action="closePostModal">
                    <span class="comment-icon"><i class="${commentIcon}"></i></span>
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
                       id="modal-comment-input" data-postindex="${postIndex}">
                <button class="modal-comment-submit" data-action="submitComment" data-postindex="${postIndex}">Reply</button>
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

