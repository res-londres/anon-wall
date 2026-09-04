
import { userProfile } from './userProfile.js';

document.getElementById('profile-actions').addEventListener('click', function(event) {
    const actionElement = event.target.closest('[data-action]');
    if (actionElement) {
        const action = actionElement.dataset.action;
        
        event.stopPropagation();
        if (action === 'showPrivateUsername') {
            const privateUsernameElement = document.getElementById('private-username');
            const showPrivateUsernameButton = document.getElementById('show-private-username-button');
            const isHidden = privateUsernameElement.classList.toggle('hidden');
            if (isHidden) {
                privateUsernameElement.textContent = '[HIDDEN USERNAME]';
                showPrivateUsernameButton.innerHTML = '<i class="fa-regular fa-eye"></i>';
            } else {
                privateUsernameElement.textContent = userProfile.username;
                showPrivateUsernameButton.innerHTML = '<i class="fa-regular fa-eye-slash"></i>';
            }
        } else if (action === 'copyUserID') {
            const userID = userProfile.user_id;
            navigator.clipboard.writeText(userID).then(function() {
                console.log('[PROFILE] user id copied to clipboard: ', userID);
            }).catch(function(err) {
                console.error('[PROFILE] could not copy user id: ', err);
            });
        }
    }
});