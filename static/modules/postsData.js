
export let posts = [];               // [{post_id: ..., user_id: .., attribution: .., etc}, ..]
export let currentPostID = null;
export let comments = [];            // {post_id: [{comment_id: .., post_id: .., etc}, {another_comment}], another_post, ..}
export let userLikedPosts = {};      // {post_id: true, post_id: true, ..}
export let userLikedComments = {};   // {post_id: {comment_id: true, comment_id: true, ..}, post_id: {comment_id: true, ..}, ..}

// -------- setters ---------- //
export function setPosts(newPosts) {
    posts = newPosts;
}
export function setCurrentPostID(postID) {
    currentPostID = postID;
}
export function setComments(newComments) {
    comments = newComments;
}
export function setUserLikedPosts(likes) {
    userLikedPosts = likes;
}
export function toggleUserPostLike(postID) {
    if (postID in userLikedPosts) {
        delete userLikedPosts[postID];
    } else {
        userLikedPosts[postID] = true;
    }
}
export function setUserLikedComments(likes, postID) {
    userLikedComments[postID] = likes;
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

// ---------- getters ----------- //
export function getPostByID(postID) {
    for (let postIndex = 0; postIndex < posts.length; postIndex++) {
        const post = posts[postIndex];
        if (postID === post['post_id']) {
            return post; 
        }
    }
}

export function getCommentByID(postID, commentID) {
    const postComments = comments[postID]
    for (let commentIndex = 0; commentIndex < postComments.length; commentIndex++) {
        const comment = postComments[commentIndex];
        if (commentID === comment['comment_id']) {
            return comment;
        }
    }
}