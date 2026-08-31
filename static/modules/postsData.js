
export let posts = [];               // [{post_id: ..., user_id: .., attribution: .., etc}, ..]
export let currentPostID = null;
export let comments = [];            // {post_id: [{comment_id: .., post_id: .., etc}, {another_comment}], another_post, ..}

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