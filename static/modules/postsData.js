
export let posts = [];               // [{post_id: ..., user_id: .., attribution: .., etc}, ..]
export let currentPostIndex = null; 
export let comments = [];            // {post_id: [{comment_id: .., post_id: .., etc}, {another_comment}], another_post, ..}

// -------- setters ---------- //
export function setPosts(newPosts) {
    posts = newPosts;
}
export function setCurrentPostIndex(index) {
    currentPostIndex = index;
}
export function setComments(newComments) {
    comments = newComments;
}

// ---------- getters ----------- //
// export function getPostByID(postID) {
//     posts.forEach(function(post, postIndex) {
//         console.log(`postid: ${postID}, postid: ${post['post_id']}`);
//         if (postID === post['post_id']) {
//             console.log(`return this: ${postIndex}`);
//             return postIndex; // SHOULD RETURN THE POST, BUT FOR NOW INDEX IM WORKING ON SMTH ELSE RN
//         }
//     });
// }

// temporary function
export function getPostByID(postID) {
    for (let postIndex = 0; postIndex < posts.length; postIndex++) {
        const post = posts[postIndex];
        if (postID === post['post_id']) {
            return postIndex; // Actually stops the function
        }
    }
    return -1; // Not found
}