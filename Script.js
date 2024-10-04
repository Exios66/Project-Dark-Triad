// script.js

/* Dark Mode Toggle */
const darkModeToggle = document.getElementById('darkModeToggle');
const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');

const currentTheme = localStorage.getItem('theme');
if (currentTheme === 'dark') {
    document.body.classList.add('dark-mode');
    darkModeToggle.textContent = '☀️';
} else if (currentTheme === 'light') {
    document.body.classList.remove('dark-mode');
    darkModeToggle.textContent = '🌙';
} else if (prefersDarkScheme.matches) {
    document.body.classList.add('dark-mode');
    darkModeToggle.textContent = '☀️';
}

darkModeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    let theme = 'light';
    if (document.body.classList.contains('dark-mode')) {
        theme = 'dark';
        darkModeToggle.textContent = '☀️';
    } else {
        darkModeToggle.textContent = '🌙';
    }
    localStorage.setItem('theme', theme);
    updateChartColors();
});

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

/* Hide Introduction Screen After 3 Seconds */
setTimeout(() => {
    const intro = document.getElementById('intro');
    intro.style.opacity = '0';
    setTimeout(() => {
        intro.style.display = 'none';
    }, 1000);
}, 3000);

/* Assessment Data */
const assessments = {
    sdt3: [
        { question: "It's not wise to tell your secrets.", trait: "Machiavellianism" },
        { question: "People see me as a natural leader.", trait: "Narcissism" },
        { question: "I like to get revenge on authorities.", trait: "Psychopathy" },
        // Additional questions go here...
    ],
    // Add other assessments here
};

/* Variables to Track Assessment State */
let currentAssessment = '';
let currentQuestionIndex = 0;
let answers = {};
let autoAdvanceTimer;

/* Function to Start an Assessment */
function startAssessment(assessment) {
    currentAssessment = assessment;
    currentQuestionIndex = 0;
    answers = {};
    document.getElementById('assessments').classList.add('hidden');
    document.getElementById('assessmentQuestions').classList.remove('hidden');
    document.getElementById('progressBarContainer').classList.remove('hidden');
    showQuestion();
}

/* Function to Display a Question */
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

/* Function to Start Auto-Advance Timer */
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

/* Function to Reset Auto-Advance Timer */
function resetAutoAdvance() {
    clearInterval(autoAdvanceTimer);
    startAutoAdvance();
}

/* Function to Get Scale Label */
function getScaleLabel(value) {
    const labels = ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'];
    return labels[value - 1];
}

/* Function to Submit an Answer */
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

/* Function to Update Progress Bar */
function updateProgressBar() {
    const progressBar = document.getElementById('progressBar');
    const progress = ((currentQuestionIndex + 1) / assessments[currentAssessment].length) * 100;
    progressBar.style.width = `${progress}%`;
    progressBar.textContent = `${Math.round(progress)}%`;
    progressBar.setAttribute('aria-valuenow', progress.toFixed(0));
}

/* Function to Display Results */
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
        <button onclick="uploadStoredResults()" id="uploadButton" class="hidden">Upload Stored Results</button>
    `;

    createChart(traits, scores);
}

/* Function to Get Trait Explanation */
function getTraitExplanation(trait) {
    const explanations = {
        'Machiavellianism': 'Tendency to manipulate and exploit others for personal gain.',
        'Narcissism': 'Excessive self-love, grandiosity, and need for admiration.',
        'Psychopathy': 'Lack of empathy, impulsivity, and antisocial behavior.',
        // ...add other trait explanations here.
    };
    return explanations[trait] || 'No explanation available.';
}

/* Function to Create Results Chart */
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
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                borderColor: 'rgb(255, 99, 132)',
                pointBackgroundColor: 'rgb(255, 99, 132)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgb(255, 99, 132)'
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

/* Function to Reset Assessment */
function resetAssessment() {
    document.getElementById('results').classList.add('hidden');
    document.getElementById('resultsChart').classList.add('hidden');
    document.getElementById('assessments').classList.remove('hidden');
    document.getElementById('uploadButton').classList.remove('hidden');
    currentAssessment = '';
    currentQuestionIndex = 0;
    answers = {};
}

/* Function to Export Results */
function exportResults() {
    const patientID = prompt("Enter the patient ID for storage:", "");
    if (!patientID) {
        alert("Patient ID is required for export.");
        return;
    }

    const exportFormat = prompt("Choose export format (txt or csv):", "txt");
    if (exportFormat === "txt" || exportFormat === "csv") {
        const content = generateExportContent(exportFormat);
        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        const fileName = `${patientID}_${timestamp}.${exportFormat}`;

        // For browser download
        const blob = new Blob([content], { type: `text/${exportFormat}` });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = fileName;
        a.click();

        // Placeholder for storing results locally
        storeResultsLocally(fileName, content);
    } else {
        alert("Invalid format. Please choose 'txt' or 'csv'.");
    }
}

/* Placeholder Function to Store Results Locally */
function storeResultsLocally(fileName, content) {
    console.log(`Storing file: ${fileName}`);
    console.log(`Content: ${content}`);
    alert(`File ${fileName} has been stored locally. (This is a simulation)`);
}

/* Function to Generate Export Content */
function generateExportContent(format) {
    const traits = Object.keys(answers);
    const scores = traits.map(trait => {
        const maxScore = assessments[currentAssessment].filter(q => q.trait === trait).length * 5;
        return (answers[trait] / maxScore) * 100;
    });

    if (format === "txt") {
        let content = `Dark Triad Assessment Results\n`;
        content += `Assessment: ${currentAssessment}\n\n`;
        traits.forEach((trait, index) => {
            content += `${trait}: ${scores[index].toFixed(2)}%\n`;
        });
        return content;
    } else if (format === "csv") {
        let content = "Trait,Score\n";
        traits.forEach((trait, index) => {
            content += `${trait},${scores[index].toFixed(2)}\n`;
        });
        return content;
    }
}

/* Function to Upload Stored Results */
function uploadStoredResults() {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.txt,.csv';
    fileInput.onchange = (event) => {
        const file = event.target.files[0];
        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target.result;
            const uploadedData = parseUploadedContent(content, file.name.split('.').pop());
            visualizeUploadedData(uploadedData);
        };
        reader.readAsText(file);
    };
    fileInput.click();
}

/* Function to Parse Uploaded Content */
function parseUploadedContent(content, fileType) {
    if (fileType === 'csv') {
        const lines = content.split('\n');
        const data = {};
        lines.slice(1).forEach(line => {
            const [trait, score] = line.split(',');
            if (trait && score) {
                data[trait.trim()] = parseFloat(score);
            }
        });
        return data;
    } else {
        // Assume TXT format
        const lines = content.split('\n');
        const data = {};
        lines.forEach(line => {
            const [trait, score] = line.split(':');
            if (trait && score) {
                data[trait.trim()] = parseFloat(score);
            }
        });
        return data;
    }
}

/* Function to Visualize Uploaded Data */
function visualizeUploadedData(data) {
    const traits = Object.keys(data);
    const scores = traits.map(trait => data[trait]);

    document.getElementById('assessments').classList.add('hidden');
    document.getElementById('results').classList.remove('hidden');
    document.getElementById('resultsChart').classList.remove('hidden');

    const resultsContainer = document.getElementById('results');
    resultsContainer.innerHTML = `
        <h2>Uploaded Results</h2>
        ${traits.map((trait, index) => `
            <p>${trait}: ${scores[index].toFixed(2)}% 
            <span class="trait-explanation" title="${getTraitExplanation(trait)}">ℹ</span></p>
        `).join('')}
        <button onclick="resetAssessment()">Back to Assessments</button>
    `;

    createChart(traits, scores);
}

/* Function to Show Statistics Options */
function showStatisticsOptions() {
    document.getElementById('assessments').classList.add('hidden');
    document.getElementById('statisticsOptions').classList.remove('hidden');
}

/* Function to Show Scientific Articles */
function showScientificArticles() {
    const modal = document.getElementById('articlesModal');
    const articlesList = document.getElementById('articlesList');
    articlesList.innerHTML = ''; // Clear existing content

    const articles = [
        { title: "The Dark Triad of personality: A 10 year review", authors: "Furnham, A., Richards, S. C., & Paulhus, D. L.", year: 2013, journal: "Social and Personality Psychology Compass", doi: "10.1111/spc3.12018" },
        // ... (other articles)
    ];

    articles.forEach(article => {
        const li = document.createElement('li');
        li.innerHTML = `<strong>${article.title}</strong><br>
                        ${article.authors} (${article.year})<br>
                        ${article.journal}<br>
                        ${article.doi ? `DOI: <a href="https://doi.org/${article.doi}" target="_blank">${article.doi}</a>` : 
                          article.url ? `URL: <a href="${article.url}" target="_blank">${article.url}</a>` : ''}`;
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
