document.addEventListener('DOMContentLoaded', () => {
    const content = document.getElementById('content');
    const nav = document.querySelector('nav');

    nav.addEventListener('click', (e) => {
        e.preventDefault();
        if (e.target.tagName === 'A') {
            const page = e.target.id;
            loadPage(page);
        }
    });

    function loadPage(page) {
        switch(page) {
            case 'home':
                content.innerHTML = '<h2>Welcome to Project Dark Triad</h2>';
                break;
            case 'register':
                content.innerHTML = '<h2>Register</h2><p>Registration form coming soon...</p>';
                break;
            case 'login':
                content.innerHTML = '<h2>Login</h2><p>Login form coming soon...</p>';
                break;
            case 'assessments':
                content.innerHTML = '<h2>Assessments</h2><p>Available assessments will be listed here...</p>';
                break;
            case 'results':
                content.innerHTML = '<h2>Results</h2><p>Your assessment results will appear here...</p>';
                break;
        }
    }

    // Load the home page by default
    loadPage('home');
});