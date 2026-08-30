
export let posts = [];
export let currentPostIndex = null; 

// -------- setters ---------- //
export function setPosts(newPosts) {
    posts = newPosts;
}
export function setCurrentPostIndex(index) {
    currentPostIndex = index;
}