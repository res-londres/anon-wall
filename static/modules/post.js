
import { socket } from './socket.js';
import { userProfile } from './userProfile.js';
import { posts, comments, getPostByID, setCurrentPostID, getCommentByID } from './postsData.js';
import { escapeHTML, formatTime, sortByLikes } from './helpers/misc.js';

// ----------- posts ----------- //
export function createPost() {
    const user_id = userProfile.user_id;
    const username = userProfile.username;
    const postSubject = document.getElementById('post-subject-input');
    const postContent = document.getElementById('post-content-input');
    const subject = postSubject.value.trim();
    const content = postContent.value.trim();
    const newPost = {
        user_id: user_id,
        attribution: username, // TODO: should be alt name!
        subject: subject || '[NO SUBJECT]',
        content: content,
    };
    postSubject.value = '';
    postContent.value = '';
    socket.emit('create-post', {post: newPost});
}

// --------- render ------------- //
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
    posts.forEach(function(post) {
        html += createPostHTML(post['post_id']);
    });
    wall.innerHTML = html;
}

export function renderPostModal(postID) {
    const modalContent = document.getElementById('post-detail-content');
    const post = getPostByID(postID);
    const fetchingComments = !(postID in comments) && post.comment_count !== 0;
    modalContent.innerHTML = createPostModalHTML(postID, fetchingComments);
}

// ---------- post-modal---------- //
export function openPostModal(postID) {
    setCurrentPostID(postID);
    const post = getPostByID(postID);
    renderPostModal(postID);
    document.getElementById('post-modal').style.display = 'flex';
    document.body.style.overflow = 'hidden'; // prevent scrolling behind modal
    // for fetching comments for this post
    socket.emit('open-post-modal', {
        user_id: userProfile.user_id,
        post_id: postID
    });
}

export function closePostModal() {
    document.getElementById('post-modal').style.display = 'none';
    document.body.style.overflow = '';
    setCurrentPostID(null);
}

// ---------- modal-actions ---------- //
export function submitCommentModal(postID) {
    const commentInput = document.getElementById('modal-comment-input');
    const comment = commentInput.value.trim();
    if (!comment) return;
    
    const post = getPostByID(postID);
    const newComment = {
        post_id: post.post_id,
        user_id: post.user_id,
        attribution: post.attribution, // Temporary
        content: comment,
    };
        
    commentInput.value = '';
    socket.emit('submit-comment', {comment: newComment});
}

export function toggleLikeModal(postID) {
    const post = getPostByID(postID);
    socket.emit('toggle-post-modal-like', {
        user_id: userProfile.user_id,
        post_id: postID
    });
}

// ------------- toggle-like --------------- //
export function toggleLike(postID) {
    const post = getPostByID(postID);
    // ADD: renderPosts() here, visual feedback should be instant
    socket.emit('toggle-post-like', {
        user_id: userProfile.user_id,
        post_id: postID
    });
}

export function toggleCommentLike(postID, commentID) {
    const post = getPostByID(postID);
    // ADD: renderPosts() here, visual feedback should be instant
    socket.emit('toggle-comment-like', {
        user_id: userProfile.user_id,
        post_id: postID,
        comment_id: commentID
    });
}

// ---------- html-creators ------------- //
export function createPostHTML(postID) {
    const post = getPostByID(postID);

    const classLiked = false ? 'liked' : ''; // TODO: replace
    const commentsCount = post.comment_count ? post.comment_count : 0; 
    const commentIcon = 'fa-regular fa-comment';
    const likesCount = post.likes;
    const likeIcon = false ? 'fa-solid fa-heart' : 'fa-regular fa-heart'; // TODO: replace
    const postAttribution = escapeHTML(post.attribution);
    const postContentPreview = escapeHTML(post.content.length > 500 ? post.content.slice(0, 497) + '...' : post.content);
    const postSubject = escapeHTML(post.subject);
    const postTime = formatTime(post.created_at);
    
    return `
        <div class="post-card" data-action="openPostModal" data-postid="${postID}">
            <div class="post-header">
                <span class="post-attribution">${postAttribution}</span>
                <span class="post-time">${postTime}</span>
            </div>
            <div class="post-subject">${postSubject}</div>
            <div class="post-content-preview">${postContentPreview}</div>
            <div class="post-footer" data-action="doNothing">
                <button class="post-action-button ${classLiked}" data-action="likePost" data-postid="${postID}">
                    <span class="like-icon"><i class="${likeIcon}"></i></span>
                    <span class="like-count">${likesCount}</span>
                </button>
                <button class="post-action-button" data-action="openPostModal" data-postid="${postID}">
                    <span class="comment-icon"><i class="${commentIcon}"></i></span>
                    <span>${commentsCount}</span>
                </button>
            </div>
        </div>
    `;
}

export function createCommentsHTML(post, postID) {
    const commentsCount = post.comment_count ? post.comment_count : 0; 
    const postComments = commentsCount ? sortByLikes(comments[post.post_id]) : [];

    let commentsHTML = '';
    if (postComments && commentsCount > 0) {
        postComments.forEach(function(comment) {
            const commentID = comment['comment_id'];
            const commentAttribution = escapeHTML(comment.attribution);
            const commentContent = escapeHTML(comment.content);
            const commentLikeIcon = false ? 'fa-solid fa-heart' : 'fa-regular fa-heart'; // TODO: replace
            const commentLikesCount = comment.likes;
            const classCommentLiked = false ? 'liked' : ''; // TODO: replace

            commentsHTML += `
                <div class="modal-comment-item" data-postid="${postID}" data-commentid="${commentID}">
                    <div class="modal-comment-left">
                        <span class="modal-comment-attribution">${commentAttribution}</span>
                        <span class="modal-comment-text">${commentContent}</span>
                    </div>
                    <button class="modal-comment-like-button ${classCommentLiked}" data-action="likeComment" data-postid="${postID}" data-commentid="${commentID}">
                        <i class="${commentLikeIcon}"></i>
                        <span class="modal-comment-like-count">${commentLikesCount}</span>
                    </button>
                </div>
            `;
        });
    } else {
        commentsHTML = `
            <div class="empty-modal-comments">No comments yet..</div>
        `;
    }
    return commentsHTML;
}

export function createLoadingCommentsHTML() {
    return `
        <div class="loading-modal-comments">
            <div class="loading-spinner"></div>
            <span>Loading comments...</span>
        </div>
    `;
}

export function createPostModalHTML(postID, fetchingComments = false) {
    const post = getPostByID(postID);
    const classLiked = ''; // TODO: replace
    const commentIcon = 'fa-regular fa-comment';
    const commentsCount = post.comment_count;
    const commentsHTML = fetchingComments ? createLoadingCommentsHTML() : createCommentsHTML(post, postID);
    const likesCount = post.likes;
    const likeIcon = false ? 'fa-solid fa-heart' : 'fa-regular fa-heart'; // TODO: replace
    const postAttribution = escapeHTML(post.attribution);
    const postContent = escapeHTML(post.content);
    const postSubject = escapeHTML(post.subject);
    const postTime = formatTime(post.created_at);

    return `
        <div class="modal-post-card">
            <div class="modal-post-header">
                <span class="modal-post-attribution">${postAttribution}</span>
                <span class="modal-post-time">${postTime}</span>
            </div>
            <div class="modal-post-subject">${postSubject}</div>
            <div class="modal-post-content">${postContent}</div>
            <div class="modal-post-footer">
                <button class="post-action-button ${classLiked}" data-action="likePost" data-postid="${postID}">
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
                <input type="text" class="modal-comment-input" data-action="enterComment" data-postid="${postID}" placeholder="Write a comment..." id="modal-comment-input" maxlength="1000">
                <button class="modal-comment-submit" data-action="submitComment" data-postid="${postID}">Reply</button>
            </div>
        </div>
    `;
}

// ---------- socket-listeners ---------- //
socket.on('create-post-success', function(data) {
    const post = data.post_data;
    posts.unshift(post);
    renderPosts();
    document.querySelector('.content').scrollTop = 0;
});

socket.on('submit-comment-success', function(data) {
    const comment = data.comment_data;
    const postID = comment['post_id'];
    if (!(postID in comments)) {
        comments[postID] = [];
    }
    comments[postID].unshift(comment);
    const post = getPostByID(postID);
    post.comment_count += 1;
    
    renderPostModal(postID);
    renderPosts();
    
    const modalContentScroll = document.querySelector('.post-modal-content');
    const modalCommentsSection = document.querySelector('.modal-comments-section');
    if (modalContentScroll && modalCommentsSection) {
        modalContentScroll.scrollTop = modalCommentsSection.offsetTop;
    }
});

socket.on('toggle-post-like-success', function(data) {
    const post = getPostByID(data.post_id);
    post.likes += data.liked ? 1 : -1;
    renderPosts();
});

socket.on('toggle-comment-like-success', function(data) {
    const postID = data.post_id;
    const comment = getCommentByID(postID, data.comment_id);
    comment.likes += data.liked ? 1 : -1;
    renderPostModal(postID);
    renderPosts();
});

socket.on('toggle-post-modal-like-success', function(data) {
    const post = getPostByID(data.post_id);
    post.likes += data.liked ? 1 : -1;
    renderPostModal(data.post_id);
    renderPosts();
});

socket.on('open-post-modal-success', function(data) {
    const postID = data.post_id;
    const postComments = data.comments;
    comments[postID] = postComments;
    renderPostModal(postID);
});

// ----------- event-handlers ----------- //
// post creator
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
// posts
document.getElementById('wall').addEventListener('click', function(event) {
    const actionElement = event.target.closest('[data-action]');
    if (actionElement) {
        const action = actionElement.dataset.action;
        const postID = actionElement.hasAttribute('data-postid') ? parseInt(actionElement.dataset.postid) : null;
        
        event.stopPropagation();
        if (action === 'doNothing') {
        } else if (action === 'likePost') {
            toggleLike(postID);
        } else if (action === 'openPostModal') {
            openPostModal(postID);
        }
    }
});
// post modal
document.getElementById('post-modal').addEventListener('click', function(event) {
    const actionElement = event.target.closest('[data-action]');
    if (actionElement) {
        const action = actionElement.dataset.action;
        const postID = actionElement.hasAttribute('data-postid') ? parseInt(actionElement.dataset.postid) : null;   
        const commentID = actionElement.hasAttribute('data-commentid') ? parseInt(actionElement.dataset.commentid) : null;
        
        event.stopPropagation();
        if (action === 'closePostModal') {
            closePostModal();
        } else if (action === 'likePost') {
            toggleLikeModal(postID);
        } else if (action === 'likeComment') {
            toggleCommentLike(postID, commentID);
        } else if (action === 'submitComment') {
            submitCommentModal(postID);
        }
    }
});
// input
document.getElementById('post-creator').addEventListener('keydown', function(event) {
    if (event.key === 'Enter' && event.shiftKey) {
        return; 
    }
    if (event.key !== 'Enter') return;
    const actionElement = event.target.closest('[data-action]');
    if (actionElement) {
        const action = actionElement.dataset.action;

        event.stopPropagation();
        event.preventDefault();
        if (action === 'enterSubject') {
            const contentInput = document.getElementById('post-content-input');
            contentInput.focus();
            if (contentInput.value.length > 0) {
                const end = contentInput.value.length;
                contentInput.setSelectionRange(end, end);
            } else {
                contentInput.setSelectionRange(0, 0);
            }
        } else if (action === 'enterContent') {
            createPost();
        }
    }
});

document.getElementById('post-modal').addEventListener('keydown', function(event) {
    if (event.key === 'Enter' && event.shiftKey) {
        return; 
    }
    if (event.key !== 'Enter') return;
    const actionElement = event.target.closest('[data-action]');
    if (actionElement) {
        const action = actionElement.dataset.action;
        const postID = actionElement.hasAttribute('data-postid') ? parseInt(actionElement.dataset.postid) : null;

        event.stopPropagation();
        event.preventDefault();
        if (action === 'enterComment') {
            submitCommentModal(postID);
        }
    }
});
