
import { userProfile } from './userProfile';
import * as miscHelp from './helpers/misc.js';

export function getAltNames() {
    return userProfile.alt_names || [];
}

export function addAltName(altName) {
    if (!userProfile.alt_names) {
        userProfile.alt_names = [];
    }
    userProfile.alt_names.push(altName);
}

export function confirmAddAlt(button) {
    const container = button.closest('.add-alt-container');
    const input = container.querySelector('.add-alt-input');
    const altName = input.value.trim();
    if (!altName || !miscHelp.isAlphanumeric(altName)) {
        alert('Please enter a valid alphanumeric alt name!');
        return;
    }
    if ((userProfile.alt_names || []).length >= 3) {
        alert('You already have 3 alt names!');
        return;
    }
    socket.emit('add-alt-name', {
        user_id: userProfile.user_id,
        alt_name: altName
    });
}

export function cancelAddAlt(button) {
    const container = button.closest('.add-alt-container');
    container.style.display = 'none';
    container.querySelector('.add-alt-input').value = '';
}

// event handler
document.querySelectorAll('.alt-name-select').forEach(function(select) {
    select.addEventListener('change', function() {
        const container = this.closest('.post-creator').querySelector('.add-alt-container');
        if (this.value === '+add') {
            container.style.display = 'flex';
            container.querySelector('.add-alt-input').focus();
            this.value = this.querySelector('option:not([value="+add"])')?.value || '';
        } else {
            container.style.display = 'none';
        }
    });
});