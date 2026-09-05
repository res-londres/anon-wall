
import { socket } from './socket.js';
import { userProfile } from './userProfile.js';
import { posts, userPosts, comments, setPosts, setUserPosts, userLikedPosts, setUserLikedPosts, userLikedComments, setUserLikedComments, setCurrentPostID, getPostByID, getCommentByID } from './postsData.js';
import { escapeHTML, formatTime, sortByLikes } from './helpers/misc.js';

// ----------- posts ----------- //
export function createPost(postCreatorElement) {
    const user_id = userProfile.user_id;
    const username = userProfile.username;
    const postSubject = postCreatorElement.querySelector('.post-subject-input');
    const postContent = postCreatorElement.querySelector('.post-content-input');
    const subject = postSubject.value.trim();
    const content = postContent.value.trim();
    if (!content) return;
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
    wall.innerHTML = '';
    let html = '';
    posts.forEach(function(post) {
        html += createPostHTML(post['post_id']);
    });
    wall.innerHTML = html;
}

export function renderUserPosts() {
    const userWall = document.getElementById('user-wall');
    if (userPosts.length === 0) {
        userWall.innerHTML = `
            <div class="empty-wall">
                <div class="empty-icon"><i class="fa-solid fa-leaf"></i></div>
                <p>No posts yet..</p>
            </div>
        `;
        return;
    }
    userWall.innerHTML = '';
    let html = '';
    userPosts.forEach(function(post) {
        html += createPostHTML(post['post_id']);
    });
    userWall.innerHTML = html;
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

// ------------- toggle-like --------------- //
export function toggleLike(postID) {
    const post = getPostByID(postID);
    // optimistic feeedback
    const isCurrentlyLiked = postID in userLikedPosts;
    const newLikedState = !isCurrentlyLiked;
    if (newLikedState) {
        userLikedPosts[postID] = true;
        post.likes += 1;
    } else {
        delete userLikedPosts[postID];
        post.likes -= 1;
    }
    renderPosts();
    socket.emit('toggle-post-like', {
        user_id: userProfile.user_id,
        post_id: postID
    });
}

export function toggleCommentLike(postID, commentID) {
    const comment = getCommentByID(postID, commentID);
    // optmistic feedback
    const isCurrentlyLiked = (postID in userLikedComments) && (commentID in userLikedComments[postID]);
    const newLikedState = !isCurrentlyLiked;
    if (!(postID in userLikedComments)) {
        userLikedComments[postID] = {};
    }
    if (newLikedState) {
        userLikedComments[postID][commentID] = true;
        comment.likes += 1;
    } else {
        delete userLikedComments[postID][commentID];
        comment.likes -= 1;
    }
    renderPostModal(postID);
    renderPosts();
    socket.emit('toggle-comment-like', {
        user_id: userProfile.user_id,
        comment_id: commentID
    });
}

// ---------- html-creators ------------- //
export function createPostHTML(postID) {
    const post = getPostByID(postID);
    const userLikedPost = postID in userLikedPosts; 
    const classPostLiked = userLikedPost ? 'liked' : ''; 
    const likeIcon = userLikedPost ? 'fa-solid fa-heart' : 'fa-regular fa-heart'; 
    const likesCount = post.likes;
    const commentsCount = post.comment_count ? post.comment_count : 0; 
    const commentIcon = 'fa-regular fa-comment';
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
                <button class="post-action-button ${classPostLiked}" data-action="likePost" data-postid="${postID}">
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
            const commentLikesCount = comment.likes;
            const commentLiked = (postID in userLikedComments) && (commentID in userLikedComments[postID]);
            const commentLikeIcon = commentLiked ? 'fa-solid fa-heart' : 'fa-regular fa-heart'; 
            const classCommentLiked = commentLiked ? 'liked' : '';

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

export function createPostModalHTML(postID, fetchingComments = false) {
    const post = getPostByID(postID);
    const userLikedPost = postID in userLikedPosts;
    const classPostLiked = userLikedPost ? 'liked' : '';
    const likeIcon = userLikedPost ? 'fa-solid fa-heart' : 'fa-regular fa-heart'; 
    const likesCount = post.likes;
    const commentsCount = post.comment_count;
    const commentIcon = 'fa-regular fa-comment';
    const commentsHTML = fetchingComments ? createLoadingCommentsHTML() : createCommentsHTML(post, postID);
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
                <button class="post-action-button ${classPostLiked}" data-action="likePost" data-postid="${postID}">
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

export function createLoadingCommentsHTML() {
    return `
        <div class="loading-modal-comments">
            <div class="loading-spinner"></div>
            <span>Loading comments...</span>
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

// for fetching, caching comments 
socket.on('open-post-modal-success', function(data) {
    const postID = data.post_id;
    const postComments = data.comments;
    const likedComments = data.liked_comments;
    comments[postID] = postComments;
    setUserLikedComments(likedComments, postID);
    renderPostModal(postID);
});

// fetching posts
socket.on('fetch-global-posts-success', function(data) {
    const newPosts = data.posts;
    const likedPosts = data.liked_posts;
    setUserLikedPosts(likedPosts);
    setPosts(newPosts);
    renderPosts();
});

socket.on('fetch-user-posts-success', function(data) {
    const newPosts = data.posts;
    const likedPosts = data.liked_posts;
    setUserLikedPosts(likedPosts);
    setUserPosts(newPosts);
    renderUserPosts();
});

// ----------- event-handlers ----------- //
// click events
document.addEventListener('click', function(event) {
    const actionElement = event.target.closest('[data-action]');
    if (actionElement) {
        const action = actionElement.dataset.action;
        const postID = actionElement.hasAttribute('data-postid') ? parseInt(actionElement.dataset.postid) : null;   
        const commentID = actionElement.hasAttribute('data-commentid') ? parseInt(actionElement.dataset.commentid) : null;
        const creatorID = actionElement.hasAttribute('data-creatorid') ? actionElement.dataset.creatorid : null;
        const postCreatorElement = creatorID ? document.querySelector(`.post-creator[data-creatorid="${creatorID}"]`) : null;
        
        event.stopPropagation();
        if (action === 'doNothing') {
            return;
        } else if (action === 'createPost') {
            createPost(postCreatorElement);
        } else if (action === 'openPostModal') {
            openPostModal(postID);
        } else if (action === 'closePostModal') {
            closePostModal();
        } else if (action === 'likePost') {
            toggleLike(postID);
        } else if (action === 'likeComment') {
            toggleCommentLike(postID, commentID);
        } else if (action === 'submitComment') {
            submitCommentModal(postID);
        } 
    }
});

// keydown events
document.addEventListener('keydown', function(event) {
    if (event.key === 'Enter' && event.shiftKey) {
        return; 
    }
    if (event.key !== 'Enter') return;
    const actionElement = event.target.closest('[data-action]');
    if (actionElement) {
        const action = actionElement.dataset.action;
        const postID = actionElement.hasAttribute('data-postid') ? parseInt(actionElement.dataset.postid) : null;
        const creatorID = actionElement.hasAttribute('data-creatorid') ? actionElement.dataset.creatorid : null;
        const postCreatorElement = creatorID ? document.querySelector(`.post-creator[data-creatorid="${creatorID}"]`) : null;

        event.stopPropagation();
        event.preventDefault();
        if (action === 'enterSubject') {
            const contentInput = postCreatorElement.querySelector('.post-content-input');
            contentInput.focus();
            if (contentInput.value.length > 0) {
                const end = contentInput.value.length;
                contentInput.setSelectionRange(end, end);
            } else {
                contentInput.setSelectionRange(0, 0);
            }
        } else if (action === 'enterContent') {
            createPost(postCreatorElement);
        } else if (action === 'enterComment') {
            submitCommentModal(postID);
        }
    }
});

// ---------- helpers ---------- //
export function toggleUserPostLike(postID) {
    if (postID in userLikedPosts) {
        delete userLikedPosts[postID];
    } else {
        userLikedPosts[postID] = true;
    }
}

export function toggleUserCommentLike(postID, commentID) {
    if (postID in userLikedComments) {
        if (commentID in userLikedComments[postID]) {
            delete userLikedComments[postID][commentID];
        } else {
            userLikedComments[postID][commentID] = true;
        }
    } else {
        userLikedComments[postID] = {};
        userLikedComments[postID][commentID] = true;
    }
}