'use strict';

console.log('Script is running');

// ===== Module: Theme Management =====
document.addEventListener('DOMContentLoaded', () => {
    initializeDarkMode();
    initializeIntroScreen();
    initializeModals();
    initializeMenuToggle();
    populateAssessments();
    initializeScientificArticles();
});

function initializeDarkMode() {
    const darkModeToggle = document.getElementById('darkModeToggle');
    darkModeToggle.addEventListener('click', toggleDarkMode);
    updateDarkModeToggle();
}

function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    updateDarkModeToggle();
    updateChartColors();
}

function updateDarkModeToggle() {
    const darkModeToggle = document.getElementById('darkModeToggle');
    const isDarkMode = document.body.classList.contains('dark-mode');
    darkModeToggle.textContent = isDarkMode ? '☀️ Light Mode' : '🌙 Dark Mode';
    darkModeToggle.style.color = isDarkMode ? '#ecf0f1' : '#333';
}

function updateChartColors() {
    if (window.resultsChart) {
        const isDarkMode = document.body.classList.contains('dark-mode');
        const newColor = isDarkMode ? '#ecf0f1' : '#333';
        window.resultsChart.options.scales.r.pointLabels.color = newColor;
        window.resultsChart.options.plugins.legend.labels.color = newColor;
        window.resultsChart.update();
    }
}

// ===== Module: Intro Screen Logic =====
function initializeIntroScreen() {
    const intro = document.getElementById('intro');
    const content = document.getElementById('content');
    
    setTimeout(() => {
        intro.style.opacity = '0';
        setTimeout(() => {
            intro.style.display = 'none';
            content.classList.remove('hidden');
        }, 1000);
    }, 3000);
}

// ===== Module: Menu Toggle =====
function initializeMenuToggle() {
    const menuToggle = document.getElementById('menuToggle');
    const mainNav = document.getElementById('mainNav');
    menuToggle.addEventListener('click', () => {
        mainNav.classList.toggle('show');
    });
}

// ===== Module: Assessments =====
const assessments = {
    sdt3: [
        { question: "It's not wise to tell your secrets.", trait: "Machiavellianism" },
        // Add more SDT3 questions here
    ],
    dirtyDozen: [
        // Add Dirty Dozen questions here
    ],
    sdt4: [
        // Add SDT4 questions here
    ],
    machIV: [
        // Add MACH IV questions here
    ],
    mmpi: [
        // Add MMPI-style questions here
    ],
    hexaco: [
        // Add HEXACO questions here
    ],
    ocean: [
        // Add OCEAN questions here
    ]
};

let currentAssessment = '';
let currentQuestionIndex = 0;
let answers = {};
let autoAdvanceTimer;

function startAssessment(assessment) {
    currentAssessment = assessment;
    currentQuestionIndex = 0;
    answers = {};
    document.getElementById('assessments').classList.add('hidden');
    document.getElementById('assessmentQuestions').classList.remove('hidden');
    document.getElementById('progressBarContainer').classList.remove('hidden');
    showQuestion();
}

function showQuestion() {
    const questionContainer = document.getElementById('assessmentQuestions');
    const question = assessments[currentAssessment][currentQuestionIndex];
    const totalQuestions = assessments[currentAssessment].length;

    questionContainer.innerHTML = `
        <div class="question">
            <h3>Question ${currentQuestionIndex + 1} of ${totalQuestions}</h3>
            <p>${question.question}</p>
            <div class="options">
                ${[1, 2, 3, 4, 5].map(value => `
                    <label>
                        <input type="radio" name="answer" value="${value}" onchange="resetAutoAdvance()">
                        ${value} - ${getScaleLabel(value)}
                    </label>
                `).join('')}
            </div>
        </div>
        <button onclick="submitAnswer()">Next</button>
        <div id="autoAdvanceTimer"></div>
    `;

    updateProgressBar();
    startAutoAdvance();
}

function getScaleLabel(value) {
    const labels = ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'];
    return labels[value - 1];
}

function startAutoAdvance() {
    let timeLeft = 4;
    const timerDisplay = document.getElementById('autoAdvanceTimer');
    timerDisplay.textContent = `Auto-advancing in ${timeLeft} seconds...`;

    autoAdvanceTimer = setInterval(() => {
        timeLeft--;
        if (timeLeft > 0) {
            timerDisplay.textContent = `Auto-advancing in ${timeLeft} seconds...`;
        } else {
            clearInterval(autoAdvanceTimer);
            submitAnswer();
        }
    }, 1000);
}

function resetAutoAdvance() {
    clearInterval(autoAdvanceTimer);
    startAutoAdvance();
}

function submitAnswer() {
    clearInterval(autoAdvanceTimer);
    const selectedAnswer = document.querySelector('input[name="answer"]:checked');
    if (selectedAnswer) {
        const question = assessments[currentAssessment][currentQuestionIndex];
        const score = parseInt(selectedAnswer.value);
        answers[question.trait] = (answers[question.trait] || 0) + (question.reversed ? 6 - score : score);

        currentQuestionIndex++;
        if (currentQuestionIndex < assessments[currentAssessment].length) {
            showQuestion();
        } else {
            showResults();
        }
    } else {
        alert('Please select an answer before proceeding.');
        startAutoAdvance();
    }
}

function updateProgressBar() {
    const progressBar = document.getElementById('progressBar');
    const progress = ((currentQuestionIndex + 1) / assessments[currentAssessment].length) * 100;
    progressBar.style.width = `${progress}%`;
    progressBar.textContent = `${Math.round(progress)}%`;
}

// ===== Module: Results Handling =====
function showResults() {
    document.getElementById('assessmentQuestions').classList.add('hidden');
    document.getElementById('progressBarContainer').classList.add('hidden');
    document.getElementById('results').classList.remove('hidden');
    document.getElementById('resultsChart').classList.remove('hidden');

    const traits = Object.keys(answers);
    const scores = traits.map(trait => {
        const maxScore = assessments[currentAssessment].filter(q => q.trait === trait).length * 5;
        return (answers[trait] / maxScore) * 100;
    });

    const resultsContainer = document.getElementById('results');
    resultsContainer.innerHTML = `
        <h2>Your Results</h2>
        ${traits.map((trait, index) => `
            <p>${trait}: ${scores[index].toFixed(2)}% 
            <span class="trait-explanation" title="${getTraitExplanation(trait)}">ℹ</span></p>
        `).join('')}
        <button onclick="resetAssessment()">Take Another Assessment</button>
        <button onclick="exportResults()">Export Results</button>
        <button onclick="showInterpretation()">Show Detailed Interpretation</button>
    `;

    createChart(traits, scores);
}

function getTraitExplanation(trait) {
    const explanations = {
        'Machiavellianism': 'Tendency to manipulate and exploit others for personal gain.',
        'Narcissism': 'Excessive self-love, grandiosity, and need for admiration.',
        'Psychopathy': 'Lack of empathy, impulsivity, and antisocial behavior.',
        'Sadism': 'Deriving pleasure from inflicting pain or humiliation on others.',
        // Add explanations for other traits here
    };
    return explanations[trait] || 'No explanation available.';
}

function createChart(traits, scores) {
    const ctx = document.getElementById('resultsChart').getContext('2d');
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
                label: 'Scores',
                data: scores,
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgb(54, 162, 235)',
                borderWidth: 2
            }]
        },
        options: {
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
                            family: 'Lato, sans-serif'
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

function resetAssessment() {
    document.getElementById('results').classList.add('hidden');
    document.getElementById('resultsChart').classList.add('hidden');
    document.getElementById('assessments').classList.remove('hidden');
    currentAssessment = '';
    currentQuestionIndex = 0;
    answers = {};
}

// ===== Module: Interpretation Modal =====
function showInterpretation() {
    const interpretationModal = document.getElementById('interpretationModal');
    const interpretationContent = document.getElementById('interpretationContent');
    
    let content = '<h3>Interpretation of Your Results</h3>';
    Object.keys(answers).forEach(trait => {
        const score = (answers[trait] / (assessments[currentAssessment].filter(q => q.trait === trait).length * 5)) * 100;
        content += `<h4>${trait}</h4>`;
        content += `<p>Your score: ${score.toFixed(2)}%</p>`;
        content += `<p>${getDetailedInterpretation(trait, score)}</p>`;
    });
    
    interpretationContent.innerHTML = content;
    interpretationModal.style.display = 'block';
}

function getDetailedInterpretation(trait, score) {
    const interpretations = {
        'Machiavellianism': {
            low: 'You tend to be straightforward in your interactions and may prefer direct approaches in dealing with others.',
            medium: 'You show a balance between strategic thinking and straightforward approaches in your interactions.',
            high: 'You tend to be strategic and calculating in your approach to social interactions and may be skilled at manipulating situations to your advantage.'
        },
        // Add interpretations for other traits here
    };

    if (score < 33) {
        return interpretations[trait].low;
    } else if (score < 66) {
        return interpretations[trait].medium;
    } else {
        return interpretations[trait].high;
    }
}

function closeInterpretationModal() {
    document.getElementById('interpretationModal').style.display = 'none';
}

// ===== Module: Scientific Articles =====
function initializeScientificArticles() {
    const showArticlesButton = document.getElementById('showScientificArticles');
    showArticlesButton.addEventListener('click', showScientificArticles);
}

function showScientificArticles() {
    const modal = document.getElementById('articlesModal');
    const articlesList = document.getElementById('articlesList');
    articlesList.innerHTML = '';

    const articles = [
        { title: "The Dark Triad of personality: A 10 year review", authors: "Furnham, A., Richards, S. C., & Paulhus, D. L.", year: 2013, journal: "Social and Personality Psychology Compass", doi: "10.1111/spc3.12018" },
        { title: "The Short Dark Triad (SD3): A Brief Measure of Dark Personality Traits", authors: "Jones, D. N., & Paulhus, D. L.", year: 2014, journal: "Assessment", doi: "10.1177/1073191113514105" },
        // Add more articles here
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

function closeModal() {
    document.getElementById('articlesModal').style.display = 'none';
}

// ===== Module: Stroop Task =====
function startStroopTask() {
    // Implement Stroop task logic here
}

function resetStroopTask() {
    // Implement Stroop task reset logic here
}

// Make sure to expose necessary functions to the global scope
window.startAssessment = startAssessment;
window.submitAnswer = submitAnswer;
window.resetAutoAdvance = resetAutoAdvance;
window.resetAssessment = resetAssessment;
window.showInterpretation = showInterpretation;
window.closeInterpretationModal = closeInterpretationModal;
window.closeModal = closeModal;
window.startStroopTask = startStroopTask;
window.resetStroopTask = resetStroopTask;