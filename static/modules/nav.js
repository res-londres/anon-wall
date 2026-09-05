
import { socket } from './socket.js';
import { userProfile } from './userProfile.js';

export function setupNavigation() {
    document.querySelectorAll('nav a').forEach(function(link) {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const pageName = this.dataset.page;
            const action = this.dataset.action;
            showPage(pageName);
            if (action === 'fetchGlobalPosts') {
                socket.emit('fetch-global-posts', {
                    user_id: userProfile.user_id
                });
            } else if (action === 'fetchUserPosts') {
                socket.emit('fetch-user-posts', {
                    user_id: userProfile.user_id
                });
            }
        });
    });
}

export function showPage(pageName) {
    // hide all pages
    document.querySelectorAll('.page-content').forEach(function(page) {
        page.style.display = 'none';
    });
    // show target page
    const targetPage = document.querySelector(`.page-content[data-page="${pageName}"]`);
    const contentContainer = document.querySelector('.content');
    targetPage.style.display = 'block';
    contentContainer.scrollTop = 0;
    
    // reassign active class to active page
    document.querySelectorAll('nav a').forEach(function(page) {
        page.classList.remove('active');
    });
    document.querySelector(`nav a[data-page="${pageName}"]`).classList.add('active');
}

