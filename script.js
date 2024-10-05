'use strict';

document.addEventListener("DOMContentLoaded", () => {
    const introSection = document.getElementById("intro");
    const content = document.getElementById("content");

    // Show intro section immediately
    introSection.style.opacity = "1";
    content.classList.add("hidden");

    // After 0.5 seconds, fade out intro and show content
    setTimeout(() => {
        introSection.style.opacity = "0";
        setTimeout(() => {
            introSection.classList.add("hidden");
            content.classList.remove("hidden");
        }, 500); // Wait for the fade-out transition to complete
    }, 500);

    // Initialize other functionalities
    initializeDarkMode();
    initializeModals();
    initializeSettings();
});

// Function to initialize dark mode
function initializeDarkMode() {
    const darkModeToggle = document.getElementById('darkModeToggle');
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    
    // Set initial mode
    document.body.classList.toggle('dark-mode', isDarkMode);
    updateDarkModeToggle(isDarkMode);
    
    darkModeToggle.addEventListener('click', toggleDarkMode);
}

// Function to toggle dark mode
function toggleDarkMode() {
    const isDarkMode = document.body.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', isDarkMode);
    updateDarkModeToggle(isDarkMode);

    // Update chart colors if a chart exists
    if (window.resultsChart) {
        updateChartColors(isDarkMode);
    }
}

// Add this new function to update the toggle button
function updateDarkModeToggle(isDarkMode) {
    const darkModeToggle = document.getElementById('darkModeToggle');
    darkModeToggle.textContent = isDarkMode ? '☀️ Light Mode' : '🌙 Dark Mode';
    darkModeToggle.setAttribute('aria-label', isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode');
}

// Function to update chart colors
function updateChartColors(isDarkMode) {
    const textColor = isDarkMode ? '#ecf0f1' : '#333';
    const gridColor = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';

    window.resultsChart.options.scales.r.pointLabels.color = textColor;
    window.resultsChart.options.scales.r.grid.color = gridColor;
    window.resultsChart.options.plugins.legend.labels.color = textColor;
    window.resultsChart.update();
}

// Assessment questions
const assessments = {
    sdt3: [
        { question: "It's not wise to tell your secrets.", trait: "Machiavellianism" },
        { question: "I like to use clever manipulation to get my way.", trait: "Machiavellianism" },
        { question: "Whatever it takes, you must get the important people on your side.", trait: "Machiavellianism" },
        { question: "Avoid direct conflict with others because they may be useful in the future.", trait: "Machiavellianism" },
        { question: "It's wise to keep track of information that you can use against people later.", trait: "Machiavellianism" },
        { question: "You should wait for the right time to get back at people.", trait: "Machiavellianism" },
        { question: "There are things you should hide from other people because they don't need to know.", trait: "Machiavellianism" },
        { question: "Make sure your plans benefit you, not others.", trait: "Machiavellianism" },
        { question: "Most people can be manipulated.", trait: "Machiavellianism" },
        { question: "People see me as a natural leader.", trait: "Narcissism" },
        { question: "I hate being the center of attention.", trait: "Narcissism", reversed: true },
        { question: "Many group activities tend to be dull without me.", trait: "Narcissism" },
        { question: "I know that I am special because everyone keeps telling me so.", trait: "Narcissism" },
        { question: "I like to get acquainted with important people.", trait: "Narcissism" },
        { question: "I feel embarrassed if someone compliments me.", trait: "Narcissism", reversed: true },
        { question: "I have been compared to famous people.", trait: "Narcissism" },
        { question: "I am an average person.", trait: "Narcissism", reversed: true },
        { question: "I insist on getting the respect I deserve.", trait: "Narcissism" },
        { question: "I like to get revenge on authorities.", trait: "Psychopathy" },
        { question: "I avoid dangerous situations.", trait: "Psychopathy", reversed: true },
        { question: "Payback needs to be quick and nasty.", trait: "Psychopathy" },
        { question: "People often say I'm out of control.", trait: "Psychopathy" },
        { question: "It's true that I can be mean to others.", trait: "Psychopathy" },
        { question: "People who mess with me always regret it.", trait: "Psychopathy" },
        { question: "I have never gotten into trouble with the law.", trait: "Psychopathy", reversed: true },
        { question: "I enjoy having sex with people I hardly know.", trait: "Psychopathy" },
        { question: "I'll say anything to get what I want.", trait: "Psychopathy" }
    ],
    dirtyDozen: [
        { question: "I tend to manipulate others to get my way.", trait: "Machiavellianism" },
        { question: "I have used deceit or lied to get my way.", trait: "Machiavellianism" },
        { question: "I have used flattery to get my way.", trait: "Machiavellianism" },
        { question: "I tend to exploit others towards my own end.", trait: "Machiavellianism" },
        { question: "I tend to lack remorse.", trait: "Psychopathy" },
        { question: "I tend to be unconcerned with the morality of my actions.", trait: "Psychopathy" },
        { question: "I tend to be callous or insensitive.", trait: "Psychopathy" },
        { question: "I tend to be cynical.", trait: "Psychopathy" },
        { question: "I tend to want others to admire me.", trait: "Narcissism" },
        { question: "I tend to want others to pay attention to me.", trait: "Narcissism" },
        { question: "I tend to seek prestige or status.", trait: "Narcissism" },
        { question: "I tend to expect special favors from others.", trait: "Narcissism" }
    ],
    sdt4: [
        { question: "It's not wise to tell your secrets.", trait: "Machiavellianism" },
        { question: "I like to use clever manipulation to get my way.", trait: "Machiavellianism" },
        { question: "Whatever it takes, you must get the important people on your side.", trait: "Machiavellianism" },
        { question: "Avoid direct conflict with others because they may be useful in the future.", trait: "Machiavellianism" },
        { question: "It's wise to keep track of information that you can use against people later.", trait: "Machiavellianism" },
        { question: "You should wait for the right time to get back at people.", trait: "Machiavellianism" },
        { question: "There are things you should hide from other people because they don't need to know.", trait: "Machiavellianism" },
        { question: "People see me as a natural leader.", trait: "Narcissism" },
        { question: "I have a unique talent for persuading people.", trait: "Narcissism" },
        { question: "Group activities tend to be dull without me.", trait: "Narcissism" },
        { question: "I know that I am special because everyone keeps telling me so.", trait: "Narcissism" },
        { question: "I have a great deal of natural talent.", trait: "Narcissism" },
        { question: "I like to show off every now and then.", trait: "Narcissism" },
        { question: "I'm likely to become a future star in some area.", trait: "Narcissism" },
        { question: "People who mess with me always regret it.", trait: "Psychopathy" },
        { question: "You should take advantage of other people before they do it to you.", trait: "Psychopathy" },
        { question: "People often say I'm out of control.", trait: "Psychopathy" },
        { question: "I sometimes get into trouble for breaking rules.", trait: "Psychopathy" },
        { question: "I tend to fight against authorities and their rules.", trait: "Psychopathy" },
        { question: "I've been in more fights than most people of my age and gender.", trait: "Psychopathy" },
        { question: "I tend to dive in, then ask questions later.", trait: "Psychopathy" },
        { question: "I love to watch YouTube clips of people fighting.", trait: "Sadism" },
        { question: "I enjoy watching violent sports.", trait: "Sadism" },
        { question: "Some people deserve to suffer.", trait: "Sadism" },
        { question: "Just for kicks, I've said mean things on social media.", trait: "Sadism" },
        { question: "I know how to hurt someone with words alone.", trait: "Sadism" },
        { question: "I enjoy making jokes at the expense of others.", trait: "Sadism" },
        { question: "I have fantasies about hurting people who have wronged me.", trait: "Sadism" }
    ],
    machIV: [
        { question: "Never tell anyone the real reason you did something unless it is useful to do so.", trait: "Machiavellianism" },
        { question: "The best way to handle people is to tell them what they want to hear.", trait: "Machiavellianism" },
        { question: "One should take action only when sure it is morally right.", trait: "Machiavellianism", reversed: true },
        { question: "Most people are basically good and kind.", trait: "Machiavellianism", reversed: true },
        { question: "It is safest to assume that all people have a vicious streak and it will come out when they are given a chance.", trait: "Machiavellianism" },
        { question: "Honesty is the best policy in all cases.", trait: "Machiavellianism", reversed: true },
        { question: "There is no excuse for lying to someone else.", trait: "Machiavellianism", reversed: true },
        { question: "Generally speaking, people won't work hard unless they're forced to do so.", trait: "Machiavellianism" },
        { question: "All in all, it is better to be humble and honest than to be important and dishonest.", trait: "Machiavellianism", reversed: true },
        { question: "When you ask someone to do something for you, it is best to give the real reasons for wanting it rather than giving reasons which carry more weight.", trait: "Machiavellianism", reversed: true },
        { question: "Most people who get ahead in the world lead clean, moral lives.", trait: "Machiavellianism", reversed: true },
        { question: "Anyone who completely trusts anyone else is asking for trouble.", trait: "Machiavellianism" },
        { question: "The biggest difference between most criminals and other people is that the criminals are stupid enough to get caught.", trait: "Machiavellianism" },
        { question: "Most people are brave.", trait: "Machiavellianism", reversed: true },
        { question: "It is wise to flatter important people.", trait: "Machiavellianism" },
        { question: "It is possible to be good in all respects.", trait: "Machiavellianism", reversed: true },
        { question: "P.T. Barnum was wrong when he said that there's a sucker born every minute.", trait: "Machiavellianism", reversed: true },
        { question: "It is hard to get ahead without cutting corners here and there.", trait: "Machiavellianism" },
        { question: "People suffering from incurable diseases should have the choice of being put painlessly to death.", trait: "Machiavellianism" },
        { question: "Most people forget more easily the death of their parents than the loss of their property.", trait: "Machiavellianism" }
    ]
};

let currentAssessment = '';
let currentQuestionIndex = 0;
let answers = {};
let autoProgressEnabled = false;
let autoProgressTimer;

// Function to initialize settings
function initializeSettings() {
    const autoProgressToggle = document.getElementById('autoProgressToggle');
    autoProgressToggle.addEventListener('change', (e) => {
        autoProgressEnabled = e.target.checked;
        localStorage.setItem('autoProgressEnabled', autoProgressEnabled);
    });

    // Load saved setting
    autoProgressEnabled = localStorage.getItem('autoProgressEnabled') === 'true';
    autoProgressToggle.checked = autoProgressEnabled;
}

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
                        <input type="radio" name="answer" value="${value}" onchange="handleAnswerSelection()">
                        ${value} - ${getScaleLabel(value)}
                    </label>
                `).join('')}
            </div>
        </div>
        <button onclick="submitAnswer()">Next</button>
        ${autoProgressEnabled ? '<div id="autoProgressBar"></div>' : ''}
    `;

    updateProgressBar();

    if (autoProgressEnabled) {
        startAutoProgressTimer();
    }
}

function getScaleLabel(value) {
    const labels = ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'];
    return labels[value - 1];
}

// Add this function to handle answer selection
function handleAnswerSelection() {
    if (autoProgressEnabled) {
        clearTimeout(autoProgressTimer);
        startAutoProgressTimer();
    }
}

// Add this function to start the auto-progress timer
function startAutoProgressTimer() {
    let timeLeft = 5;
    const autoProgressBar = document.getElementById('autoProgressBar');
    autoProgressBar.style.width = '100%';

    function updateTimer() {
        timeLeft--;
        const progress = (timeLeft / 5) * 100;
        autoProgressBar.style.width = `${progress}%`;

        if (timeLeft > 0) {
            autoProgressTimer = setTimeout(updateTimer, 1000);
        } else {
            submitAnswer();
        }
    }

    autoProgressTimer = setTimeout(updateTimer, 1000);
}

function submitAnswer() {
    if (autoProgressEnabled) {
        clearTimeout(autoProgressTimer);
    }

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
        if (autoProgressEnabled) {
            startAutoProgressTimer();
        }
    }
}

function updateProgressBar() {
    const progressBar = document.getElementById('progressBar');
    const progress = ((currentQuestionIndex + 1) / assessments[currentAssessment].length) * 100;
    progressBar.style.width = `${progress}%`;
    progressBar.textContent = `${Math.round(progress)}%`;
}

// Optimize assessment calculations using math.js and lodash
function calculateTraitScore(trait) {
    const traitQuestions = _.filter(assessments[currentAssessment], { trait: trait });
    const traitScores = traitQuestions.map(q => answers[q.question] || 0);
    const maxScore = traitQuestions.length * 5;
    let score = math.chain(math.sum(traitScores))
        .divide(maxScore)
        .multiply(100)
        .done();

    // Apply specific scoring methods for each assessment
    switch (currentAssessment) {
        case 'sdt3':
            score = calculateSDT3Score(trait, score);
            break;
        case 'dirtyDozen':
            score = calculateDirtyDozenScore(trait, score);
            break;
        case 'sdt4':
            score = calculateSDT4Score(trait, score);
            break;
        case 'machIV':
            score = calculateMACHIVScore(trait, score);
            break;
    }

    return score;
}

function calculateSDT3Score(trait, score) {
    // SDT3 uses a 1-5 scale, so we don't need to adjust the score
    return score;
}

function calculateDirtyDozenScore(trait, score) {
    // Dirty Dozen uses a 1-5 scale, so we don't need to adjust the score
    return score;
}

function calculateSDT4Score(trait, score) {
    // SDT4 uses a 1-5 scale, so we don't need to adjust the score
    return score;
}

function calculateMACHIVScore(trait, score) {
    // MACH-IV uses a 1-7 scale, and has some reverse-scored items
    // We need to adjust the score calculation for the 1-7 scale
    const maxScore = 7; // Maximum score per question
    const adjustedScore = (score / 100) * maxScore; // Convert percentage to 1-7 scale
    return (adjustedScore / maxScore) * 100; // Convert back to percentage
}
}

function interpretScore(trait, score) {
    let interpretation = '';
    switch (trait) {
        case 'Machiavellianism':
            if (score < 30) interpretation = 'Low Machiavellianism';
            else if (score < 60) interpretation = 'Average Machiavellianism';
            else interpretation = 'High Machiavellianism';
            break;
        case 'Narcissism':
            if (score < 30) interpretation = 'Low Narcissism';
            else if (score < 60) interpretation = 'Average Narcissism';
            else interpretation = 'High Narcissism';
            break;
        case 'Psychopathy':
            if (score < 30) interpretation = 'Low Psychopathy';
            else if (score < 60) interpretation = 'Average Psychopathy';
            else interpretation = 'High Psychopathy';
            break;
        case 'Sadism':
            if (score < 30) interpretation = 'Low Sadism';
            else if (score < 60) interpretation = 'Average Sadism';
            else interpretation = 'High Sadism';
            break;
    }
    return interpretation;
}

function showResults() {
    document.getElementById('assessmentQuestions').classList.add('hidden');
    document.getElementById('progressBarContainer').classList.add('hidden');
    document.getElementById('results').classList.remove('hidden');
    document.getElementById('resultsChart').classList.remove('hidden');

    const traits = _.uniq(assessments[currentAssessment].map(q => q.trait));
    const scores = traits.map(calculateTraitScore);

    const resultsContainer = document.getElementById('results');
    resultsContainer.innerHTML = `
        <h2>Your Results</h2>
        ${traits.map((trait, index) => `
            <p>${trait}: ${scores[index].toFixed(2)}% - ${interpretScore(trait, scores[index])}
            <span class="trait-explanation" title="${getTraitExplanation(trait)}">ℹ️</span></p>
        `).join('')}
        <button onclick="resetAssessment()">Take Another Assessment</button>
        <button onclick="exportResults()">Export Results</button>
        <button onclick="uploadStoredResults()">Upload Stored Results</button>
    `;

    createChart(traits, scores);
}

function getTraitExplanation(trait) {
    const explanations = {
        'Machiavellianism': 'Tendency to manipulate and exploit others for personal gain.',
        'Narcissism': 'Excessive self-love, grandiosity, and need for admiration.',
        'Psychopathy': 'Lack of empathy, impulsivity, and antisocial behavior.',
        'Sadism': 'Deriving pleasure from inflicting pain or humiliation on others.'
    };
    return explanations[trait] || 'No explanation available.';
}

// Optimize chart creation using Chart.js built-in features
function createChart(traits, scores) {
    const ctx = document.getElementById('resultsChart').getContext('2d');
    const isDarkMode = document.body.classList.contains('dark-mode');
    const textColor = isDarkMode ? '#ecf0f1' : '#333';
    const gridColor = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';

    window.resultsChart = new Chart(ctx, {
        type: 'radar',
        data: {
            labels: traits,
            datasets: [{
                label: 'Your Scores',
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
            scales: {
                r: {
                    angleLines: { color: gridColor },
                    grid: { color: gridColor },
                    pointLabels: { color: textColor },
                    ticks: { color: textColor },
                    suggestedMin: 0,
                    suggestedMax: 100
                }
            },
            plugins: {
                legend: { 
                    labels: { color: textColor },
                    position: 'top' 
                },
                tooltip: {
                    callbacks: {
                        label: (context) => `${context.label}: ${context.raw.toFixed(2)}%`
                    }
                }
            }
        }
    });
}

function resetAssessment() {
    if (autoProgressEnabled) {
        clearTimeout(autoProgressTimer);
    }
    document.getElementById('results').classList.add('hidden');
    document.getElementById('resultsChart').classList.add('hidden');
    document.getElementById('assessments').classList.remove('hidden');
    currentAssessment = '';
    currentQuestionIndex = 0;
    answers = {};
}

// Function to initialize modals
function initializeModals() {
    const modal = document.getElementById('articlesModal');
    const btn = document.getElementById('showScientificArticles');
    const span = document.getElementsByClassName('close')[0];

    btn.onclick = function() {
        showScientificArticles();
    }

    span.onclick = function() {
        closeModal();
    }

    window.onclick = function(event) {
        if (event.target == modal) {
            closeModal();
        }
    }
}

// Function to show scientific articles modal
function showScientificArticles() {
    const modal = document.getElementById('articlesModal');
    const articlesList = document.getElementById('articlesList');
    articlesList.innerHTML = ''; // Clear existing content

    const articles = [
        { title: "The Dark Triad of personality: A 10 year review", authors: "Furnham, A., Richards, S. C., & Paulhus, D. L.", year: 2013, journal: "Social and Personality Psychology Compass", doi: "10.1111/spc3.12018" },
        { title: "The Short Dark Triad (SD3): A Brief Measure of Dark Personality Traits", authors: "Jones, D. N., & Paulhus, D. L.", year: 2014, journal: "Assessment", doi: "10.1177/1073191113514105" },
        { title: "The Dark Tetrad: Distinguishing the Dark Triad from Sadism", authors: "Chabrol, H., Van Leeuwen, N., Rodgers, R., & Séjourné, N.", year: 2009, journal: "Personality and Individual Differences", doi: "10.1016/j.paid.2009.06.020" },
        { title: "The HEXACO model of personality structure and the importance of the H factor", authors: "Lee, K., & Ashton, M. C.", year: 2004, journal: "European Journal of Personality", doi: "10.1002/per.572" },
        { title: "The Big Five Trait taxonomy: History, measurement, and theoretical perspectives", authors: "John, O. P., & Srivastava, S.", year: 1999, journal: "Handbook of personality: Theory and research", url: "https://pages.uoregon.edu/sanjay/pubs/bigfive.pdf" }
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

// Function to close the modal
function closeModal() {
    const modal = document.getElementById('articlesModal');
    modal.style.display = 'none';
}

// Use Day.js for better date handling in export function
function exportResults() {
    const patientID = prompt("Enter the patient ID for storage:", "");
    if (!patientID) {
        alert("Patient ID is required for export.");
        return;
    }

    const exportFormat = prompt("Choose export format (txt, csv, json):", "txt");
    if (['txt', 'csv', 'json'].includes(exportFormat)) {
        const content = generateExportContent(exportFormat);
        const timestamp = dayjs().format('YYYY-MM-DD-HH-mm-ss');
        const fileName = `${patientID}_${timestamp}.${exportFormat}`;

        // For browser download
        const blob = new Blob([content], { type: `text/${exportFormat}` });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = fileName;
        a.click();

        // Simulate storing results locally
        storeResultsLocally(fileName, content);
    } else {
        alert("Invalid format. Please choose 'txt', 'csv', or 'json'.");
    }
}

// Optimize export content generation using lodash
function generateExportContent(format) {
    const traits = _.uniq(assessments[currentAssessment].map(q => q.trait));
    const scores = traits.map(calculateTraitScore);

    if (format === "txt") {
        return `Dark Triad Assessment Results
Assessment: ${currentAssessment}

${_.zip(traits, scores).map(([trait, score]) => `${trait}: ${score.toFixed(2)}% - ${interpretScore(trait, score)}`).join('\n')}`;
    } else if (format === "csv") {
        return `Trait,Score,Interpretation
${_.zip(traits, scores).map(([trait, score]) => `${trait},${score.toFixed(2)},${interpretScore(trait, score)}`).join('\n')}`;
    } else if (format === "json") {
        return JSON.stringify({
            assessment: currentAssessment,
            results: _.zipObject(traits, scores.map(score => ({
                score: score.toFixed(2),
                interpretation: interpretScore(traits[scores.indexOf(score)], score)
            })))
        }, null, 2);
    }
}

// Function to store results locally using localStorage
function storeResultsLocally(fileName, content) {
    try {
        localStorage.setItem(fileName, content);
        console.log(`File ${fileName} has been stored locally.`);
    } catch (error) {
        console.error(`Error storing file locally: ${error}`);
        alert(`Failed to store file ${fileName} locally. Error: ${error.message}`);
    }
}

// Function to upload stored results
function uploadStoredResults() {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.txt,.csv,.json';
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

// Function to parse uploaded content
function parseUploadedContent(content, fileType) {
    const parseData = (lines, separator) => {
        return lines.reduce((data, line) => {
            const [trait, score] = line.split(separator);
            if (trait && score) {
                data[trait.trim()] = parseFloat(score);
            }
            return data;
        }, {});
    };

    switch (fileType) {
        case 'csv':
            return parseData(content.split('\n').slice(1), ',');
        case 'json':
            return JSON.parse(content).results;
        default: // Assume TXT format
            return parseData(content.split('\n'), ':');
    }
}

// Function to visualize uploaded data
function visualizeUploadedData(data) {
    const traits = Object.keys(data);
    const scores = Object.values(data).map(parseFloat);

    ['assessments', 'results', 'resultsChart'].forEach(id => {
        document.getElementById(id).classList.toggle('hidden', id !== 'assessments');
    });

    const resultsContainer = document.getElementById('results');
    resultsContainer.innerHTML = `
        <h2>Uploaded Results</h2>
        <div id="dataVisualization">
            ${traits.map((trait, index) => `
                <div class="trait-container">
                    <p>${trait}: ${scores[index].toFixed(2)}% 
                    <span class="trait-explanation" title="${getTraitExplanation(trait)}">ℹ️</span></p>
                    <div class="progress-bar" style="width: ${scores[index]}%;"></div>
                </div>
            `).join('')}
        </div>
        <div id="visualizationControls">
            <button onclick="toggleChartType()">Toggle Chart Type</button>
            <button onclick="toggleDataLabels()">Toggle Data Labels</button>
            <button onclick="exportVisualization()">Export Visualization</button>
        </div>
        <button onclick="resetAssessment()">Back to Assessments</button>
    `;

    createChart(traits, scores);
    initializeDataComparison(data);
}

// Function to toggle between different chart types
function toggleChartType() {
    if (window.resultsChart.config.type === 'radar') {
        window.resultsChart.config.type = 'bar';
    } else {
        window.resultsChart.config.type = 'radar';
    }
    window.resultsChart.update();
}

// Function to toggle data labels on the chart
function toggleDataLabels() {
    const dataLabels = window.resultsChart.options.plugins.datalabels;
    dataLabels.display = !dataLabels.display;
    window.resultsChart.update();
}

// Function to export the current visualization
function exportVisualization() {
    const canvas = document.getElementById('resultsChart');
    const image = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = image;
    link.download = 'dark_triad_visualization.png';
    link.click();
}

// Function to initialize data comparison feature
function initializeDataComparison(data) {
    const comparisonContainer = document.createElement('div');
    comparisonContainer.id = 'dataComparison';
    comparisonContainer.innerHTML = `
        <h3>Compare Your Results</h3>
        <select id="comparisonSelect">
            <option value="average">Average Scores</option>
            <option value="highScorer">High Scorer Profile</option>
            <option value="lowScorer">Low Scorer Profile</option>
        </select>
        <div id="comparisonChart"></div>
    `;
    document.getElementById('results').appendChild(comparisonContainer);

    document.getElementById('comparisonSelect').addEventListener('change', (e) => {
        updateComparison(data, e.target.value);
    });

    // Initial comparison
    updateComparison(data, 'average');
}

// Function to update the comparison chart
function updateComparison(userData, comparisonType) {
    const comparisonData = getComparisonData(comparisonType);
    const traits = Object.keys(userData);
    const userScores = traits.map(trait => userData[trait]);
    const comparisonScores = traits.map(trait => comparisonData[trait]);

    const ctx = document.getElementById('comparisonChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: traits,
            datasets: [
                {
                    label: 'Your Scores',
                    data: userScores,
                    backgroundColor: 'rgba(75, 192, 192, 0.6)',
                },
                {
                    label: `${comparisonType.charAt(0).toUpperCase() + comparisonType.slice(1)} Scores`,
                    data: comparisonScores,
                    backgroundColor: 'rgba(255, 99, 132, 0.6)',
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100
                }
            }
        }
    });
}

// Function to get comparison data from stored results
async function getComparisonData(type) {
    try {
        const storedData = await fetchStoredData();
        if (!storedData || storedData.length === 0) {
            throw new Error('No stored data available');
        }

        const traits = Object.keys(storedData[0]);
        const comparisonData = {};

        if (type === 'average') {
            traits.forEach(trait => {
                const sum = storedData.reduce((acc, score) => acc + score[trait], 0);
                comparisonData[trait] = Math.round(sum / storedData.length);
            });
        } else if (type === 'highScorer') {
            traits.forEach(trait => {
                comparisonData[trait] = Math.max(...storedData.map(score => score[trait]));
            });
        } else if (type === 'lowScorer') {
            traits.forEach(trait => {
                comparisonData[trait] = Math.min(...storedData.map(score => score[trait]));
            });
        } else {
            throw new Error('Invalid comparison type');
        }

        return comparisonData;
    } catch (error) {
        console.error('Error fetching comparison data:', error);
        return null;
    }
}