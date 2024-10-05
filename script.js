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
    let token = localStorage.getItem('token');

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
                content.innerHTML = '<h2>Welcome to Project Dark Triad</h2><p>Explore various psychological assessments to gain insights into different personality traits and models.</p>';
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
                if (!token) {
                    content.innerHTML = '<h2>Assessments</h2><p>Please log in to view available assessments.</p>';
                } else {
                    fetchAssessments();
                }
                break;
            case 'results':
                if (!token) {
                    content.innerHTML = '<h2>Results</h2><p>Please log in to view your results.</p>';
                } else {
                    fetchResults();
                }
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
                token = data.token;
                localStorage.setItem('token', token);
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
                token = data.token;
                localStorage.setItem('token', token);
                loadPage('home');
            } else {
                alert(`Login failed: ${data.message}`);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred during login.');
        }
    }

    async function fetchAssessments() {
        try {
            const response = await fetch('/api/assessments', {
                headers: {
                    'x-access-token': token
                }
            });
            const assessments = await response.json();
            let html = '<h2>Available Assessments</h2><ul>';
            assessments.forEach(assessment => {
                html += `<li><a href="#" class="assessment" data-id="${assessment.assessment_id}">${assessment.assessment_name}</a></li>`;
            });
            html += '</ul>';
            content.innerHTML = html;

            document.querySelectorAll('.assessment').forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    startAssessment(e.target.dataset.id);
                });
            });
        } catch (error) {
            console.error('Error:', error);
            content.innerHTML = '<h2>Assessments</h2><p>Error loading assessments. Please try again later.</p>';
        }
    }

    async function startAssessment(assessmentId) {
        try {
            const response = await fetch(`/api/assessment/${assessmentId}/questions`, {
                headers: {
                    'x-access-token': token
                }
            });
            const questions = await response.json();
            let html = `<h2>${questions[0].assessment_name}</h2><form id="assessmentForm">`;
            questions.forEach(question => {
                html += `
                    <div>
                        <p>${question.question_text}</p>
                        <input type="range" min="1" max="5" value="3" class="slider" id="q${question.question_id}">
                        <div class="slider-labels">
                            <span>Strongly Disagree</span>
                            <span>Strongly Agree</span>
                        </div>
                    </div>
                `;
            });
            html += '<button type="submit">Submit</button></form>';
            content.innerHTML = html;

            document.getElementById('assessmentForm').addEventListener('submit', (e) => {
                e.preventDefault();
                submitAssessment(assessmentId, questions);
            });
        } catch (error) {
            console.error('Error:', error);
            content.innerHTML = '<h2>Assessment</h2><p>Error loading assessment. Please try again later.</p>';
        }
    }

    async function submitAssessment(assessmentId, questions) {
        const answers = questions.map(question => ({
            questionId: question.question_id,
            value: parseInt(document.getElementById(`q${question.question_id}`).value)
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
            if (response.ok) {
                alert('Assessment submitted successfully!');
                loadPage('results');
            } else {
                alert(`Submission failed: ${result.message}`);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while submitting the assessment.');
        }
    }

    async function fetchResults() {
        try {
            const response = await fetch('/api/user/results', {
                headers: {
                    'x-access-token': token
                }
            });
            const results = await response.json();
            let html = '<h2>Your Assessment Results</h2>';
            if (results.length === 0) {
                html += '<p>You have not completed any assessments yet.</p>';
            } else {
                results.forEach(result => {
                    html += `
                        <div class="result">
                            <h3>${result.assessment_name}</h3>
                            <p>Total Score: ${result.total_score}</p>
                            <p>Completed on: ${new Date(result.completed_at).toLocaleString()}</p>
                            <details>
                                <summary>Detailed Results</summary>
                                <pre>${JSON.stringify(JSON.parse(result.result_details), null, 2)}</pre>
                            </details>
                        </div>
                    `;
                });
            }
            content.innerHTML = html;
        } catch (error) {
            console.error('Error:', error);
            content.innerHTML = '<h2>Results</h2><p>Error loading results. Please try again later.</p>';
        }
    }

    // Load the home page by default
    loadPage('home');
});
