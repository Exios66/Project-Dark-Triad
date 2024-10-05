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
                content.innerHTML = `
                    <h2>Register</h2>
                    <form id="registerForm">
                        <input type="text" id="username" placeholder="Username" required>
                        <input type="email" id="email" placeholder="Email" required>
                        <input type="password" id="password" placeholder="Password" required>
                        <button type="submit">Register</button>
                    </form>
                `;
                document.getElementById('registerForm').addEventListener('submit', register);
                break;
            case 'login':
                content.innerHTML = `
                    <h2>Login</h2>
                    <form id="loginForm">
                        <input type="email" id="loginEmail" placeholder="Email" required>
                        <input type="password" id="loginPassword" placeholder="Password" required>
                        <button type="submit">Login</button>
                    </form>
                `;
                document.getElementById('loginForm').addEventListener('submit', login);
                break;
            case 'assessments':
                // TODO: Implement assessments page
                content.innerHTML = '<h2>Assessments</h2><p>Coming soon...</p>';
                break;
            case 'results':
                // TODO: Implement results page
                content.innerHTML = '<h2>Results</h2><p>Coming soon...</p>';
                break;
        }
    }

    async function register(e) {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            const response = await fetch('/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, email, password }),
            });
            const data = await response.json();
            if (response.ok) {
                alert('Registration successful!');
                localStorage.setItem('token', data.token);
                loadPage('home');
            } else {
                alert(`Registration failed: ${data.message}`);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred during registration.');
        }
    }

    async function login(e) {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        try {
            const response = await fetch('/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });
            const data = await response.json();
            if (response.ok) {
                alert('Login successful!');
                localStorage.setItem('token', data.token);
                loadPage('home');
            } else {
                alert(`Login failed: ${data.message}`);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred during login.');
        }
    }

    // Load the home page by default
    loadPage('home');
});