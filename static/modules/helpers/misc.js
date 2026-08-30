
export function escapeHTML(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

export function isAlphanumeric(str) {
    return /^[a-zA-Z0-9]+$/.test(str);
}

export function resetSignUpState() {
    document.getElementById('username-input').value = '';
    const signUpButton = document.getElementById('sign-up-button');
    signUpButton.disabled = false;
    signUpButton.textContent = 'Sign up';
}

export function showScreen(screenName) {
    const screens = ['loading', 'sign-up', 'main'];
    screens.forEach(name => {
        document.getElementById(`${name}-container`).style.display = 'none';
    });
    const displayMap = {
        loading: 'flex',
        'sign-up': 'flex',
        main: 'grid'
    };
    document.getElementById(`${screenName}-container`).style.display = displayMap[screenName];
}

export function formatTime(isoString) {
    const now = new Date();
    const then = new Date(isoString);
    const diffMs = now - then;
    
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    const diffWeek = Math.floor(diffDay / 7);
    const diffMonth = Math.floor(diffDay / 30);
    const diffYear = Math.floor(diffDay / 365);
    
    if (diffSec < 60) return 'Just now';
    if (diffMin < 60) return `${diffMin}m`;
    if (diffHour < 24) return `${diffHour}h`;
    if (diffDay < 7) return `${diffDay}d`;
    if (diffWeek < 4) return `${diffWeek}w`;
    if (diffMonth < 12) return `${diffMonth}mo`;
    if (diffYear < 2) return `${diffYear}y`;
    
    // fallback: show actual date
    return then.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
    });
}