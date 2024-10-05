// script.js

/* Dark Mode Toggle */
const darkModeToggle = document.getElementById('darkModeToggle');
const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');

function initializeDarkMode() {
    const currentTheme = localStorage.getItem('theme');
    if (currentTheme === 'dark' || (currentTheme !== 'light' && prefersDarkScheme.matches)) {
        document.body.classList.add('dark-mode');
        darkModeToggle.textContent = '☀️';
    } else {
        document.body.classList.remove('dark-mode');
        darkModeToggle.textContent = '🌙';
    }
}

function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    const isDarkMode = document.body.classList.contains('dark-mode');
    darkModeToggle.textContent = isDarkMode ? '☀️' : '🌙';
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    updateChartColors();
}

darkModeToggle.addEventListener('click', toggleDarkMode);

initializeDarkMode();

/* Function to Update Chart Colors Based on Theme */
function updateChartColors() {
    const isDarkMode = document.body.classList.contains('dark-mode');
    const newColor = isDarkMode ? '#ecf0f1' : '#333';

    if (window.resultsChart) {
        window.resultsChart.options.scales.r.pointLabels.color = newColor;
        window.resultsChart.options.plugins.legend.labels.color = newColor;
        window.resultsChart.update();
    }
}

/* Function to Start Assessment */
async function startAssessment(assessmentType) {
    try {
        const response = await fetch(`/api/assessment/${assessmentType}/questions`, {
            headers: {
                'x-access-token': localStorage.getItem('token')
            }
        });
        if (!response.ok) {
            throw new Error('Failed to fetch questions');
        }
        const questions = await response.json();
        displayQuestions(questions);
    } catch (error) {
        console.error('Error starting assessment:', error);
        alert('Failed to start assessment. Please try again.');
    }
}

/* Function to Display Questions */
function displayQuestions(questions) {
    currentQuestions = questions;
    currentQuestionIndex = 0;
    answers = [];
    
    const questionContainer = document.getElementById('question');
    questionContainer.innerHTML = '';
    questionContainer.classList.remove('hidden');
    
    document.getElementById('results').classList.add('hidden');
    document.getElementById('resultsChart').classList.add('hidden');
    
    displayCurrentQuestion();
}

/* Function to Display Current Question */
function displayCurrentQuestion() {
    const question = currentQuestions[currentQuestionIndex];
    const questionContainer = document.getElementById('question');
    questionContainer.innerHTML = `
        <h2>Question ${currentQuestionIndex + 1}</h2>
        <p>${question.question_text}</p>
        <div class="likert-scale">
            ${createLikertScale()}
        </div>
        <button onclick="nextQuestion()">Next</button>
    `;
    updateProgressBar();
}

/* Function to Create Likert Scale */
function createLikertScale() {
    let scale = '';
    for (let i = 1; i <= 5; i++) {
        scale += `
            <label>
                <input type="radio" name="answer" value="${i}" required>
                ${i}
            </label>
        `;
    }
    return scale;
}

/* Function to Handle Next Question */
function nextQuestion() {
    const selectedAnswer = document.querySelector('input[name="answer"]:checked');
    if (!selectedAnswer) {
        alert('Please select an answer before proceeding.');
        return;
    }
    
    answers.push({
        questionId: currentQuestions[currentQuestionIndex].question_id,
        value: parseInt(selectedAnswer.value),
        trait: currentQuestions[currentQuestionIndex].trait_name
    });
    
    currentQuestionIndex++;
    
    if (currentQuestionIndex < currentQuestions.length) {
        displayCurrentQuestion();
    } else {
        submitAssessment();
    }
}

/* Function to Submit Assessment */
async function submitAssessment() {
    try {
        const response = await fetch(`/api/assessment/${currentQuestions[0].assessment_id}/submit`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-access-token': localStorage.getItem('token')
            },
            body: JSON.stringify({ answers })
        });
        if (!response.ok) {
            throw new Error('Failed to submit assessment');
        }
        const result = await response.json();
        showResults(result);
    } catch (error) {
        console.error('Error submitting assessment:', error);
        alert('Failed to submit assessment. Please try again.');
    }
}

/* Function to Update Progress Bar */
function updateProgressBar() {
    const progressBar = document.getElementById('progressBar');
    if (!progressBar) return;

    const progress = ((currentQuestionIndex + 1) / currentQuestions.length) * 100;
    progressBar.style.width = `${progress}%`;
    progressBar.textContent = `${Math.round(progress)}%`;
    progressBar.setAttribute('aria-valuenow', progress.toFixed(0));
}

/* Function to Display Results */
function showResults(result) {
  const resultSection = document.getElementById('results');
  resultSection.innerHTML = '';

  const totalScore = result.totalScore;
  const resultDetails = result.resultDetails;

  const h2 = document.createElement('h2');
  h2.textContent = 'Assessment Results';
  resultSection.appendChild(h2);

  const p = document.createElement('p');
  p.textContent = `Total Score: ${totalScore}`;
  resultSection.appendChild(p);

  const ul = document.createElement('ul');
  for (const trait in resultDetails) {
    const li = document.createElement('li');
    li.textContent = `${trait}: ${resultDetails[trait].average.toFixed(2)}`;
    ul.appendChild(li);
  }
  resultSection.appendChild(ul);

  createChart(Object.keys(resultDetails), Object.values(resultDetails).map(d => d.average));

  document.getElementById('question').classList.add('hidden');
  resultSection.classList.remove('hidden');
  document.getElementById('resultsChart').classList.remove('hidden');
}

/* Function to Create Results Chart */
function createChart(traits, scores) {
    const ctx = document.getElementById('resultsChart');
    if (!ctx) return;

    const isDarkMode = document.body.classList.contains('dark-mode');
    const textColor = isDarkMode ? '#ecf0f1' : '#333';

    if (window.resultsChart) {
        window.resultsChart.destroy();
    }

    window.resultsChart = new Chart(ctx, {
        type: 'radar',
        data: {
            labels: traits,
            datasets: [{
                label: 'Your Scores',
                data: scores,
                backgroundColor: 'rgba(0, 160, 160, 0.2)',
                borderColor: 'rgb(0, 160, 160)',
                pointBackgroundColor: 'rgb(0, 160, 160)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgb(0, 160, 160)'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            elements: {
                line: {
                    borderWidth: 3
                }
            },
            scales: {
                r: {
                    angleLines: {
                        display: false
                    },
                    suggestedMin: 0,
                    suggestedMax: 100,
                    pointLabels: {
                        color: textColor,
                        font: {
                            family: 'Lato, sans-serif',
                            size: 14
                        }
                    },
                    ticks: {
                        backdropColor: 'transparent',
                        color: textColor
                    }
                }
            },
            plugins: {
                legend: {
                    labels: {
                        color: textColor,
                        font: {
                            family: 'Lato, sans-serif'
                        }
                    }
                }
            }
        }
    });
}

/* Function to Show Statistics Options */
function showStatisticsOptions() {
    // Implement statistics options display
    console.log('Showing statistics options');
}

/* Function to Show History and Background */
function showHistoryAndBackground() {
    // Implement history and background display
    console.log('Showing history and background');
}

/* Function to Show Scientific Articles */
function showScientificArticles() {
    const modal = document.getElementById('articlesModal');
    const articlesList = document.getElementById('articlesList');
    articlesList.innerHTML = '';

    const articles = [
        {
            title: "The Dark Triad of Personality: A 10 Year Review",
            authors: "Furnham, A., Richards, S. C., & Paulhus, D. L.",
            year: 2013,
            journal: "Social and Personality Psychology Compass",
            doi: "10.1111/spc3.12018"
        },
        {
            title: "The Dark Triad and the seven deadly sins",
            authors: "Veselka, L., Giammarco, E. A., & Vernon, P. A.",
            year: 2014,
            journal: "Personality and Individual Differences",
            doi: "10.1016/j.paid.2014.01.055"
        },
        {
            title: "The Dark Tetrad: Structural Properties and Location in the Personality Space",
            authors: "Book, A., Visser, B. A., & Volk, A. A.",
            year: 2015,
            journal: "Journal of Personality",
            doi: "10.1111/jopy.12102"
        }
    ];

    articles.forEach(article => {
        const li = document.createElement('li');
        li.innerHTML = `<strong>${article.title}</strong><br>
                        ${article.authors} (${article.year})<br>
                        ${article.journal}<br>
                        DOI: <a href="https://doi.org/${article.doi}" target="_blank">${article.doi}</a>`;
        articlesList.appendChild(li);
    });

    modal.style.display = 'block';
}

/* Function to Close Modal */
function closeModal() {
    const modal = document.getElementById('articlesModal');
    modal.style.display = 'none';
}

/* Close Modal When Clicking Outside of It */
window.onclick = function(event) {
    const modal = document.getElementById('articlesModal');
    if (event.target == modal) {
        modal.style.display = 'none';
    }
}

// Initialize event listeners and other setup
document.addEventListener('DOMContentLoaded', () => {
    const content = document.getElementById('content');
    const nav = document.querySelector('nav');
    const darkModeToggle = document.getElementById('darkModeToggle');
    let token = localStorage.getItem('token');

    // Function to update navigation based on authentication status
    function updateNavigation() {
        if (token) {
            nav.innerHTML = `
                <ul>
                    <li><a href="#" id="home">Home</a></li>
                    <li><a href="#" id="assessments">Assessments</a></li>
                    <li><a href="#" id="results">Results</a></li>
                    <li><a href="#" id="logout">Logout</a></li>
                </ul>
            `;
        } else {
            nav.innerHTML = `
                <ul>
                    <li><a href="#" id="home">Home</a></li>
                    <li><a href="#" id="register">Register</a></li>
                    <li><a href="#" id="login">Login</a></li>
                </ul>
            `;
        }
    }

    // Dark mode toggle
    darkModeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
    });

    // Navigation event listener
    nav.addEventListener('click', (e) => {
        e.preventDefault();
        if (e.target.tagName === 'A') {
            const page = e.target.id;
            loadPage(page);
        }
    });

    // Function to load pages
    function loadPage(page) {
        switch (page) {
            case 'home':
                content.innerHTML = '<h2>Welcome to Project Dark Triad</h2><p>Explore your personality traits through our comprehensive assessments.</p>';
                break;
            case 'register':
                showRegistrationForm();
                break;
            case 'login':
                showLoginForm();
                break;
            case 'assessments':
                if (token) fetchAssessments();
                else content.innerHTML = '<p>Please login to view assessments.</p>';
                break;
            case 'results':
                if (token) fetchResults();
                else content.innerHTML = '<p>Please login to view your results.</p>';
                break;
            case 'logout':
                logout();
                break;
        }
    }

    // Registration form
    function showRegistrationForm() {
        content.innerHTML = `
            <h2>Register</h2>
            <form id="registerForm">
                <input type="text" id="username" placeholder="Username" required>
                <input type="email" id="email" placeholder="Email" required>
                <input type="password" id="password" placeholder="Password" required>
                <button type="submit">Register</button>
            </form>
        `;
        document.getElementById('registerForm').addEventListener('submit', handleRegister);
    }

    // Login form
    function showLoginForm() {
        content.innerHTML = `
            <h2>Login</h2>
            <form id="loginForm">
                <input type="email" id="email" placeholder="Email" required>
                <input type="password" id="password" placeholder="Password" required>
                <button type="submit">Login</button>
            </form>
        `;
        document.getElementById('loginForm').addEventListener('submit', handleLogin);
    }

    // Handle registration
    async function handleRegister(e) {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            const response = await fetch('/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password })
            });
            const data = await response.json();
            if (data.auth) {
                token = data.token;
                localStorage.setItem('token', token);
                updateNavigation();
                loadPage('home');
            }
        } catch (error) {
            console.error('Registration error:', error);
        }
    }

    // Handle login
    async function handleLogin(e) {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            const response = await fetch('/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await response.json();
            if (data.auth) {
                token = data.token;
                localStorage.setItem('token', token);
                updateNavigation();
                loadPage('home');
            }
        } catch (error) {
            console.error('Login error:', error);
        }
    }

    // Fetch assessments
    async function fetchAssessments() {
        try {
            const response = await fetch('/api/assessments', {
                headers: { 'x-access-token': token }
            });
            const assessments = await response.json();
            displayAssessments(assessments);
        } catch (error) {
            console.error('Error fetching assessments:', error);
        }
    }

    // Display assessments
    function displayAssessments(assessments) {
        let html = '<h2>Available Assessments</h2><ul>';
        assessments.forEach(assessment => {
            html += `<li><a href="#" data-id="${assessment.assessment_id}">${assessment.assessment_name}</a></li>`;
        });
        html += '</ul>';
        content.innerHTML = html;

        // Add event listeners to assessment links
        document.querySelectorAll('#content ul a').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const assessmentId = e.target.dataset.id;
                startAssessment(assessmentId);
            });
        });
    }

    // Start an assessment
    async function startAssessment(assessmentId) {
        try {
            const response = await fetch(`/api/assessment/${assessmentId}/questions`, {
                headers: { 'x-access-token': token }
            });
            const questions = await response.json();
            displayQuestions(questions, assessmentId);
        } catch (error) {
            console.error('Error fetching questions:', error);
        }
    }

    // Display questions
    function displayQuestions(questions, assessmentId) {
        let html = `<h2>Assessment</h2><form id="assessmentForm" data-id="${assessmentId}">`;
        questions.forEach(question => {
            html += `
                <div class="question">
                    <p>${question.question_text}</p>
                    <input type="range" min="1" max="5" value="3" class="slider" id="q${question.question_id}" data-trait="${question.trait_name}">
                    <div class="slider-labels">
                        <span>Strongly Disagree</span>
                        <span>Strongly Agree</span>
                    </div>
                </div>
            `;
        });
        html += '<button type="submit">Submit Assessment</button></form>';
        content.innerHTML = html;

        document.getElementById('assessmentForm').addEventListener('submit', (e) => handleAssessmentSubmit(e, questions));
    }

    // Handle assessment submission
    async function handleAssessmentSubmit(e, questions) {
        e.preventDefault();
        const assessmentId = e.target.dataset.id;
        const answers = questions.map(question => ({
            questionId: question.question_id,
            value: parseInt(document.getElementById(`q${question.question_id}`).value),
            trait: question.trait_name
        }));

        try {
            const response = await fetch(`/api/assessment/${assessmentId}/submit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-access-token': token
                },
                body: JSON.stringify({ answers })
            });
            const result = await response.json();
            displayResults(result);
        } catch (error) {
            console.error('Error submitting assessment:', error);
        }
    }

    // Display assessment results
    function displayResults(result) {
        let html = '<h2>Assessment Results</h2>';
        html += `<p>Total Score: ${result.totalScore}</p>`;
        html += '<h3>Trait Scores:</h3><ul>';
        for (const [trait, details] of Object.entries(result.resultDetails)) {
            html += `<li>${trait}: ${details.average.toFixed(2)}</li>`;
        }
        html += '</ul>';
        content.innerHTML = html;
    }

    // Fetch user's past results
    async function fetchResults() {
        try {
            const response = await fetch('/api/user/results', {
                headers: { 'x-access-token': token }
            });
            const results = await response.json();
            displayPastResults(results);
        } catch (error) {
            console.error('Error fetching results:', error);
        }
    }

    // Display past results
    function displayPastResults(results) {
        let html = '<h2>Your Past Results</h2>';
        if (results.length === 0) {
            html += '<p>You have not completed any assessments yet.</p>';
        } else {
            html += '<ul>';
            results.forEach(result => {
                html += `
                    <li>
                        <h3>${result.assessment_name}</h3>
                        <p>Date: ${new Date(result.completed_at).toLocaleDateString()}</p>
                        <p>Total Score: ${result.total_score}</p>
                        <button class="view-details" data-result='${JSON.stringify(result)}'>View Details</button>
                    </li>
                `;
            });
            html += '</ul>';
        }
        content.innerHTML = html;

        // Add event listeners to "View Details" buttons
        document.querySelectorAll('.view-details').forEach(button => {
            button.addEventListener('click', (e) => {
                const result = JSON.parse(e.target.dataset.result);
                displayResultDetails(result);
            });
        });
    }

    // Display detailed results for a specific assessment
    function displayResultDetails(result) {
        let html = `<h2>${result.assessment_name} Details</h2>`;
        html += `<p>Date: ${new Date(result.completed_at).toLocaleDateString()}</p>`;
        html += `<p>Total Score: ${result.total_score}</p>`;
        html += '<h3>Trait Scores:</h3><ul>';
        const details = JSON.parse(result.result_details);
        for (const [trait, score] of Object.entries(details)) {
            html += `<li>${trait}: ${score.average.toFixed(2)}</li>`;
        }
        html += '</ul>';
        html += '<button id="backToResults">Back to Results</button>';
        content.innerHTML = html;

        document.getElementById('backToResults').addEventListener('click', fetchResults);
    }

    // Logout function
    function logout() {
        token = null;
        localStorage.removeItem('token');
        updateNavigation();
        loadPage('home');
    }

    // Initial setup
    updateNavigation();
    loadPage('home');
});