// script.js

'use strict';

// ===== Module: Theme Management =====

// Wait for the DOM to load before accessing elements
document.addEventListener('DOMContentLoaded', () => {
    // Dark Mode Toggle
    const darkModeToggle = document.getElementById('darkModeToggle');
    darkModeToggle.addEventListener('click', toggleDarkMode);

    // Initialize dark mode state
    initializeDarkMode();

    // Initialize intro screen logic
    initializeIntroScreen();

    // Initialize modal functionality
    initializeModals();
});

// Function to toggle dark mode
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    const isDarkMode = document.body.classList.contains('dark-mode');
    const darkModeToggle = document.getElementById('darkModeToggle');
    darkModeToggle.textContent = isDarkMode ? '☀️' : '🌙';
    darkModeToggle.style.color = isDarkMode ? '#ecf0f1' : '#333';

    // Update chart colors if a chart exists
    if (window.resultsChart) {
        updateChartColors();
    }
}

// Function to update chart colors
function updateChartColors() {
    const isDarkMode = document.body.classList.contains('dark-mode');
    const newColor = isDarkMode ? '#ecf0f1' : '#333';
    window.resultsChart.options.scales.r.pointLabels.color = newColor;
    window.resultsChart.options.plugins.legend.labels.color = newColor;
    window.resultsChart.update();
}

// Function to initialize dark mode state
function initializeDarkMode() {
    const darkModeToggle = document.getElementById('darkModeToggle');
    const isDarkMode = document.body.classList.contains('dark-mode');
    darkModeToggle.textContent = isDarkMode ? '☀️' : '🌙';
    darkModeToggle.style.color = isDarkMode ? '#ecf0f1' : '#333';
}

// ===== Module: Intro Screen Logic =====

// Function to initialize intro screen
function initializeIntroScreen() {
    // Hide intro screen after 3 seconds
    setTimeout(() => {
        const intro = document.getElementById('intro');
        intro.style.opacity = '0';
        setTimeout(() => {
            intro.style.display = 'none';
        }, 1000);
    }, 3000);
}

// ===== Module: Assessments Data =====

// Assessment questions and data
const assessments = {
    sdt3: [
        { question: "It's not wise to tell your secrets.", trait: "Machiavellianism" },
        // ... (Include all the SDT3 questions)
    ],
    dirtyDozen: [
        // ... (Include all the Dirty Dozen questions)
    ],
    sdt4: [
        // ... (Include all the SDT4 questions)
    ],
    machIV: [
        // ... (Include all the MACH IV questions)
    ],
    mmpi: [
        { question: "I like mechanics magazines.", trait: "Masculinity-Femininity" },
        { question: "I have a good appetite.", trait: "Hypochondriasis", reversed: true },
        { question: "I wake up fresh and rested most mornings.", trait: "Depression", reversed: true },
        { question: "My daily life is full of things that keep me interested.", trait: "Psychasthenia", reversed: true },
        { question: "I am sure I get a raw deal from life.", trait: "Paranoia" },
        // Add more MMPI-style questions here (the full MMPI has 567 questions, but you might want to use a shortened version)
    ],
    hexaco: [
        { question: "I would be quite bored by a visit to an art gallery.", trait: "Openness to Experience", reversed: true },
        { question: "I plan ahead and organize things, to avoid scrambling at the last minute.", trait: "Conscientiousness" },
        { question: "I rarely hold a grudge, even against people who have badly wronged me.", trait: "Agreeableness" },
        { question: "I feel reasonably satisfied with myself overall.", trait: "Extraversion" },
        { question: "I would feel afraid if I had to travel in bad weather conditions.", trait: "Emotionality" },
        { question: "I wouldn't use flattery to get a raise or promotion at work, even if I thought it would succeed.", trait: "Honesty-Humility" },
        { question: "I'm interested in learning about the history and politics of other countries.", trait: "Openness to Experience" },
        { question: "I often push myself very hard when trying to achieve a goal.", trait: "Conscientiousness" },
        { question: "People sometimes tell me that I am too critical of others.", trait: "Agreeableness", reversed: true },
        { question: "I rarely express my opinions in group meetings.", trait: "Extraversion", reversed: true },
        // ... (add 50 more questions to reach a total of 60)
    ],
    ocean: [
        { question: "I am the life of the party.", trait: "Extraversion" },
        { question: "I feel little concern for others.", trait: "Agreeableness", reversed: true },
        { question: "I am always prepared.", trait: "Conscientiousness" },
        { question: "I get stressed out easily.", trait: "Neuroticism" },
        { question: "I have a rich vocabulary.", trait: "Openness" },
        { question: "I don't talk a lot.", trait: "Extraversion", reversed: true },
        { question: "I am interested in people.", trait: "Agreeableness" },
        { question: "I leave my belongings around.", trait: "Conscientiousness", reversed: true },
        { question: "I am relaxed most of the time.", trait: "Neuroticism", reversed: true },
        { question: "I have difficulty understanding abstract ideas.", trait: "Openness", reversed: true },
        // ... (add 40 more questions to reach a total of 50)
    ]
};

// ===== Module: Assessment Handling =====

let currentAssessment = '';
let currentQuestionIndex = 0;
let answers = {};
let autoAdvanceTimer;

// Function to start an assessment
function startAssessment(assessment) {
    currentAssessment = assessment;
    currentQuestionIndex = 0;
    answers = {};
    document.getElementById('assessments').classList.add('hidden');
    document.getElementById('assessmentQuestions').classList.remove('hidden');
    document.getElementById('progressBarContainer').classList.remove('hidden');
    showQuestion();
}

// Function to display the current question
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

// Function to start auto-advance timer
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

// Function to reset auto-advance timer
function resetAutoAdvance() {
    clearInterval(autoAdvanceTimer);
    startAutoAdvance();
}

// Function to get scale label based on value
function getScaleLabel(value) {
    const labels = ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'];
    return labels[value - 1];
}

// Function to submit an answer and proceed to the next question
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

// Function to update the progress bar
function updateProgressBar() {
    const progressBar = document.getElementById('progressBar');
    const progress = ((currentQuestionIndex + 1) / assessments[currentAssessment].length) * 100;
    progressBar.style.width = `${progress}%`;
    progressBar.textContent = `${Math.round(progress)}%`;
}

// ===== Module: Results Handling =====

// Function to display the results
function showResults() {
    document.getElementById('assessmentQuestions').classList.add('hidden');
    document.getElementById('progressBarContainer').classList.add('hidden');
    document.getElementById('results').classList.remove('hidden');
    document.getElementById('resultsChart').classList.remove('hidden');

    let traits;
    switch (currentAssessment) {
        case 'hexaco':
            traits = ['Honesty-Humility', 'Emotionality', 'Extraversion', 'Agreeableness', 'Conscientiousness', 'Openness to Experience'];
            break;
        case 'ocean':
            traits = ['Openness', 'Conscientiousness', 'Extraversion', 'Agreeableness', 'Neuroticism'];
            break;
        case 'mmpi':
            traits = ['Hypochondriasis', 'Depression', 'Hysteria', 'Psychopathic Deviate', 'Masculinity-Femininity', 'Paranoia', 'Psychasthenia', 'Schizophrenia', 'Hypomania', 'Social Introversion'];
            break;
        default:
            traits = Object.keys(answers);
    }

    const scores = traits.map(calculateTraitScore);

    const resultsContainer = document.getElementById('results');
    resultsContainer.innerHTML = `
        <h2>Your Results</h2>
        ${traits.map((trait, index) => `
            <p>${trait}: ${scores[index].toFixed(2)}% 
            <span class="trait-explanation" title="${getTraitExplanation(trait)}">ℹ️</span></p>
        `).join('')}
        <button onclick="resetAssessment()">Take Another Assessment</button>
        <button onclick="exportResults()">Export Results</button>
        <button onclick="uploadStoredResults()" id="uploadButton">Upload Stored Results</button>
        <button onclick="showDetailedInterpretation()">Show Detailed Interpretation</button>
    `;

    createChart(traits, scores);
}

// Function to calculate trait score
function calculateTraitScore(trait) {
    const traitQuestions = assessments[currentAssessment].filter(q => q.trait === trait);
    const traitScores = traitQuestions.map(q => {
        const score = answers[q.question] || 0;
        return q.reversed ? 6 - score : score;
    });
    const maxScore = traitQuestions.length * 5;
    return (math.sum(traitScores) / maxScore) * 100;
}

// Function to get explanations for traits
function getTraitExplanation(trait) {
    const explanations = {
        'Machiavellianism': 'Tendency to manipulate and exploit others for personal gain.',
        'Narcissism': 'Excessive self-love, grandiosity, and need for admiration.',
        'Psychopathy': 'Lack of empathy, impulsivity, and antisocial behavior.',
        'Sadism': 'Deriving pleasure from inflicting pain or humiliation on others.',
        'Depression': 'Persistent feelings of sadness, hopelessness, and loss of interest in activities.',
        'Anxiety': 'Excessive worry, fear, and unease about everyday situations.',
        'Paranoia': 'Irrational and persistent thoughts of suspicion and mistrust towards others.',
        'Schizotypal Symptoms': 'Unusual perceptions, beliefs, and behaviors that may indicate a disconnection from reality.',
        'Obsessive-Compulsive Symptoms': 'Recurring, intrusive thoughts and repetitive behaviors aimed at reducing anxiety.',
        'Honesty-Humility': 'Sincerity, fairness, greed avoidance, and modesty.',
        'Emotionality': 'Fearfulness, anxiety, dependence, and sentimentality.',
        'Extraversion': 'Tendency to be sociable, lively, and cheerful.',
        'Agreeableness': 'Tendency to be forgiving, gentle, and patient.',
        'Conscientiousness': 'Tendency to be organized, diligent, and careful.',
        'Openness to Experience': 'Aesthetic appreciation, inquisitiveness, creativity, and unconventionality.',
        'Neuroticism': 'Tendency to experience negative emotions such as anxiety, anger, or depression.',
        'Hypochondriasis': 'Excessive preoccupation with one's health.',
        'Hysteria': 'Tendency to develop physical symptoms in response to stress or conflict.',
        'Psychopathic Deviate': 'Difficulty following rules and conforming to social norms.',
        'Masculinity-Femininity': 'Traditional gender roles and interests.',
        'Psychasthenia': 'Obsessive-compulsive traits and anxiety.',
        'Schizophrenia': 'Unusual thoughts and experiences.',
        'Hypomania': 'Elevated mood, increased energy, and decreased need for sleep.',
        'Social Introversion': 'Preference for solitude and avoidance of social situations.'
    };
    return explanations[trait] || 'No explanation available.';
}

// Function to create the results chart
function createChart(traits, scores) {
    const ctx = document.getElementById('resultsChart').getContext('2d');
    const isDarkMode = document.body.classList.contains('dark-mode');
    const textColor = isDarkMode ? '#ecf0f1' : '#333';

    if (window.resultsChart) {
        window.resultsChart.destroy();
    }

    let chartType;
    switch (currentAssessment) {
        case 'hexaco':
        case 'ocean':
            chartType = 'radar';
            break;
        case 'mmpi':
            chartType = 'bar';
            break;
        default:
            chartType = 'radar';
    }

    window.resultsChart = new Chart(ctx, {
        type: chartType,
        data: {
            labels: traits,
            datasets: [{
                label: 'Your Scores',
                data: scores,
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgb(54, 162, 235)',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            scales: {
                r: {
                    angleLines: { color: isDarkMode ? '#444' : '#ccc' },
                    grid: { color: isDarkMode ? '#444' : '#ccc' },
                    pointLabels: { color: textColor },
                    ticks: { color: textColor, backdropColor: 'transparent' }
                }
            },
            plugins: {
                legend: { labels: { color: textColor } }
            }
        }
    });
}

// Function to reset the assessment
function resetAssessment() {
    document.getElementById('results').classList.add('hidden');
    document.getElementById('resultsChart').classList.add('hidden');
    document.getElementById('assessments').classList.remove('hidden');
    document.getElementById('uploadButton').classList.remove('hidden');
    currentAssessment = '';
    currentQuestionIndex = 0;
    answers = {};
}

// ===== Module: Exporting and Uploading Results =====

// Function to export results
function exportResults() {
    const patientID = prompt("Enter the patient ID for storage:", "");
    if (!patientID) {
        alert("Patient ID is required for export.");
        return;
    }

    const exportFormat = prompt("Choose export format (txt, csv, json):", "txt");
    if (['txt', 'csv', 'json'].includes(exportFormat)) {
        const content = generateExportContent(exportFormat);
        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
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

// Function to generate export content
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
    } else if (format === "json") {
        const result = {};
        traits.forEach((trait, index) => {
            result[trait] = scores[index].toFixed(2);
        });
        return JSON.stringify({ assessment: currentAssessment, results: result }, null, 2);
    }
}

// Function to simulate storing results locally
function storeResultsLocally(fileName, content) {
    console.log(`Storing file: ${fileName}`);
    console.log(`Content: ${content}`);
    alert(`File ${fileName} has been stored locally. (This is a simulation)`);
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
    } else if (fileType === 'json') {
        const jsonData = JSON.parse(content);
        return jsonData.results;
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

// Function to visualize uploaded data
function visualizeUploadedData(data) {
    const traits = Object.keys(data);
    const scores = traits.map(trait => parseFloat(data[trait]));

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

// ===== Module: Statistical Analysis =====

// Function to show statistical analysis options
function showStatisticsOptions() {
    document.getElementById('assessments').classList.add('hidden');
    document.getElementById('statisticsOptions').classList.remove('hidden');
}

// Function to perform selected analysis
function performAnalysis(analysisType) {
    const fileInput = document.getElementById('dataUpload');
    if (fileInput.files.length === 0) {
        alert('Please upload a data file first.');
        return;
    }

    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onload = function(e) {
        const data = parseData(e.target.result, file.name);
        switch (analysisType) {
            case 'cronbachAlpha':
                calculateCronbachAlpha(data);
                break;
            case 'splitHalf':
                calculateSplitHalfReliability(data);
                break;
            case 'anova':
                performANOVA(data);
                break;
            case 'interItem':
                calculateInterItemValidity(data);
                break;
            case 'psychometric':
                performPsychometricAnalysis(data);
                break;
            case 'irt':
                performIRTAnalysis(data);
                break;
            case 'regression':
                performRegressionAnalysis(data);
                break;
            case 'correlation':
                performCorrelationAnalysis(data);
                break;
            case 'factorAnalysis':
                performFactorAnalysis(data);
                break;
            case 'descriptive':
                performDescriptiveStatistics(data);
                break;
            default:
                alert('Unknown analysis type.');
                break;
        }
    };

    reader.readAsText(file);
}

// Function to parse data from uploaded file
function parseData(content, fileName) {
    if (fileName.endsWith('.csv')) {
        return parseCSV(content);
    } else if (fileName.endsWith('.json')) {
        return JSON.parse(content);
    } else {
        throw new Error('Unsupported file format');
    }
}

// Function to parse CSV data
function parseCSV(csv) {
    const lines = csv.trim().split('\n');
    const headers = lines[0].split(',');
    const data = [];

    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',');
        if (values.length === headers.length) {
            const row = {};
            for (let j = 0; j < headers.length; j++) {
                row[headers[j]] = parseFloat(values[j]);
            }
            data.push(row);
        }
    }

    return data;
}

// Import math.js library for statistical calculations
// Ensure you have included the math.js script in your HTML:
// <script src="https://cdnjs.cloudflare.com/ajax/libs/mathjs/10.0.0/math.js"></script>

// Implement statistical analysis functions
function calculateCronbachAlpha(data) {
    const items = Object.keys(data[0]);
    const n = items.length;
    const itemScores = items.map(item => data.map(d => d[item]));
    const totalScores = data.map(d => items.reduce((sum, item) => sum + d[item], 0));

    const itemVariances = itemScores.map(scores => math.variance(scores));
    const totalVariance = math.variance(totalScores);
    const sumItemVariances = math.sum(itemVariances);

    const alpha = (n / (n - 1)) * (1 - (sumItemVariances / totalVariance));

    displayAnalysisResults('Cronbach\'s Alpha', `Alpha: ${alpha.toFixed(3)}`);
}

function calculateSplitHalfReliability(data) {
    const items = Object.keys(data[0]);
    const half = Math.floor(items.length / 2);
    const firstHalfItems = items.slice(0, half);
    const secondHalfItems = items.slice(half);

    const firstHalfScores = data.map(d => firstHalfItems.reduce((sum, item) => sum + d[item], 0));
    const secondHalfScores = data.map(d => secondHalfItems.reduce((sum, item) => sum + d[item], 0));

    const correlation = math.correlation(firstHalfScores, secondHalfScores);
    const reliability = (2 * correlation) / (1 + correlation);

    displayAnalysisResults('Split-Half Reliability', `Reliability: ${reliability.toFixed(3)}`);
}

function performANOVA(data) {
    const groups = {};
    Object.keys(data[0]).forEach(key => {
        groups[key] = data.map(d => d[key]);
    });

    const groupMeans = {};
    const totalMean = math.mean(Object.values(groups).flat());
    let ssBetween = 0;
    let ssWithin = 0;
    let dfBetween = Object.keys(groups).length - 1;
    let dfWithin = 0;

    Object.keys(groups).forEach(group => {
        const groupData = groups[group];
        const groupMean = math.mean(groupData);
        groupMeans[group] = groupMean;
        ssBetween += groupData.length * Math.pow(groupMean - totalMean, 2);
        ssWithin += math.sum(groupData.map(value => Math.pow(value - groupMean, 2)));
        dfWithin += groupData.length - 1;
    });

    const msBetween = ssBetween / dfBetween;
    const msWithin = ssWithin / dfWithin;
    const fStatistic = msBetween / msWithin;

    displayAnalysisResults('ANOVA', `F(${dfBetween}, ${dfWithin}) = ${fStatistic.toFixed(3)}`);
}

function calculateInterItemValidity(data) {
    const items = Object.keys(data[0]);
    const itemScores = items.map(item => data.map(d => d[item]));
    const correlations = [];

    for (let i = 0; i < items.length; i++) {
        for (let j = i + 1; j < items.length; j++) {
            const corr = math.correlation(itemScores[i], itemScores[j]);
            correlations.push(corr);
        }
    }

    const averageCorrelation = math.mean(correlations);

    displayAnalysisResults('Inter-Item Validity', `Average Inter-Item Correlation: ${averageCorrelation.toFixed(3)}`);
}

function performPsychometricAnalysis(data) {
    const items = Object.keys(data[0]);
    const itemStats = items.map(item => {
        const scores = data.map(d => d[item]);
        return {
            item: item,
            mean: math.mean(scores),
            stdDev: math.std(scores)
        };
    });

    let resultText = 'Item Statistics:\n';
    itemStats.forEach(stat => {
        resultText += `Item ${stat.item}: Mean = ${stat.mean.toFixed(2)}, Std Dev = ${stat.stdDev.toFixed(2)}\n`;
    });

    displayAnalysisResults('Psychometric Analysis', resultText);
}

function performIRTAnalysis(data) {
    // Placeholder for Item Response Theory analysis
    displayAnalysisResults('IRT Analysis', 'IRT Analysis functionality to be implemented.');
}

function performRegressionAnalysis(data) {
    const items = Object.keys(data[0]);
    if (items.length < 2) {
        alert('At least two variables are required for regression analysis.');
        return;
    }

    const xValues = data.map(d => d[items[0]]);
    const yValues = data.map(d => d[items[1]]);

    const regression = math.linearRegression(xValues, yValues);
    const rSquared = math.rSquared(xValues, yValues);

    const resultText = `Regression Equation: y = ${regression.slope.toFixed(3)}x + ${regression.intercept.toFixed(3)}\nR² = ${rSquared.toFixed(3)}`;

    displayAnalysisResults('Regression Analysis', resultText);
}

function performCorrelationAnalysis(data) {
    const items = Object.keys(data[0]);
    const correlations = [];

    for (let i = 0; i < items.length; i++) {
        for (let j = i + 1; j < items.length; j++) {
            const xValues = data.map(d => d[items[i]]);
            const yValues = data.map(d => d[items[j]]);
            const corr = math.correlation(xValues, yValues);
            correlations.push({ pair: `${items[i]} & ${items[j]}`, correlation: corr });
        }
    }

    let resultText = 'Correlation Coefficients:\n';
    correlations.forEach(corr => {
        resultText += `${corr.pair}: ${corr.correlation.toFixed(3)}\n`;
    });

    displayAnalysisResults('Correlation Analysis', resultText);
}

function performFactorAnalysis(data) {
    // Placeholder for Factor Analysis
    displayAnalysisResults('Factor Analysis', 'Factor Analysis functionality to be implemented.');
}

function performDescriptiveStatistics(data) {
    const items = Object.keys(data[0]);
    let resultText = 'Descriptive Statistics:\n';

    items.forEach(item => {
        const scores = data.map(d => d[item]);
        const mean = math.mean(scores);
        const stdDev = math.std(scores);
        const min = math.min(scores);
        const max = math.max(scores);

        resultText += `Item ${item}: Mean = ${mean.toFixed(2)}, Std Dev = ${stdDev.toFixed(2)}, Min = ${min}, Max = ${max}\n`;
    });

    displayAnalysisResults('Descriptive Statistics', resultText);
}

// Function to display analysis results
function displayAnalysisResults(title, results) {
    const resultsContainer = document.getElementById('results');
    resultsContainer.innerHTML = `
        <h2>${title}</h2>
        <pre>${results}</pre>
        <button onclick="resetStatistics()">Back to Statistics Options</button>
    `;
    document.getElementById('statisticsOptions').classList.add('hidden');
    resultsContainer.classList.remove('hidden');
}

// Function to reset statistical analysis
function resetStatistics() {
    document.getElementById('results').classList.add('hidden');
    document.getElementById('statisticsOptions').classList.remove('hidden');
}

// ===== Module: History and Background Content =====

// Function to show history and background content
function showHistoryAndBackground() {
    document.getElementById('assessments').classList.add('hidden');
    document.getElementById('historyContent').classList.remove('hidden');
}

// Function to hide history and background content
function hideHistoryAndBackground() {
    document.getElementById('historyContent').classList.add('hidden');
    document.getElementById('assessments').classList.remove('hidden');
}

// ===== Module: Modal Management =====

// Function to initialize modals
function initializeModals() {
    // Close modal when clicking outside of it
    window.onclick = function(event) {
        const modal = document.getElementById('articlesModal');
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    };
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

function showDetailedInterpretation() {
    const modal = document.getElementById('interpretationModal');
    const modalContent = document.getElementById('interpretationContent');
    modalContent.innerHTML = '';

    const traits = Object.keys(answers);
    const scores = traits.map(calculateTraitScore);

    traits.forEach((trait, index) => {
        const score = scores[index];
        const interpretation = getDetailedInterpretation(trait, score);
        modalContent.innerHTML += `
            <h3>${trait}: ${score.toFixed(2)}%</h3>
            <p>${interpretation}</p>
        `;
    });

    modal.style.display = 'block';
}

function getDetailedInterpretation(trait, score) {
    const interpretations = {
        'Honesty-Humility': {
            low: "You may tend to flatter others to get what you want and feel tempted to bend rules for personal profit. You might feel a sense of entitlement to special privileges.",
            medium: "You have a balance between modesty and assertiveness. You generally play by the rules but may occasionally bend them if the stakes are high.",
            high: "You avoid manipulating others for personal gain and feel little temptation to break rules. You're not especially motivated by social status or wealth."
        },
        'Emotionality': {
            low: "You tend to feel little anxiety, even in stressful situations. You may have less need for emotional support from others and feel detached from others' feelings.",
            medium: "You have a balanced emotional response to life. You experience normal levels of anxiety and emotional attachment to others.",
            high: "You experience fear and anxiety fairly intensely and feel a strong need for emotional support from others. You tend to empathize deeply with others' feelings."
        },
        'Extraversion': {
            low: "You tend to feel less enthusiastic and energetic about social interactions. You may prefer solitary activities and feel less comfortable in leadership roles.",
            medium: "You have a balanced approach to social interactions. You enjoy social gatherings but also value your alone time.",
            high: "You feel positively about yourself and are generally enthusiastic about social interactions. You're comfortable leading groups and talking to strangers."
        },
        'Agreeableness': {
            low: "You may be more critical in your judgments of others and more likely to hold grudges. You might express anger readily when you feel wronged.",
            medium: "You have a balanced approach to interpersonal relations. You can be forgiving but also stand up for yourself when necessary.",
            high: "You tend to be forgiving and lenient in judging others. You're usually willing to compromise and cooperate with others."
        },
        'Conscientiousness': {
            low: "You may approach tasks and obligations with a more relaxed attitude. You might prefer a flexible schedule and may sometimes procrastinate or leave tasks unfinished.",
            medium: "You have a balanced approach to tasks and obligations. You're generally organized but can also be flexible when needed.",
            high: "You tend to be very organized and disciplined, working diligently to achieve your goals. You prefer to have a set schedule and plan ahead."
        },
        'Openness to Experience': {
            low: "You may prefer familiar routines and traditional ideas. You might find abstract or theoretical concepts less engaging.",
            medium: "You have a balance between traditional and new ideas. You're open to some new experiences while also valuing familiar routines.",
            high: "You tend to be imaginative and curious about various domains of knowledge. You're likely to enjoy abstract ideas and unconventional ways of thinking."
        },
        // ... Add interpretations for OCEAN traits
    };

    if (score < 33) return interpretations[trait].low;
    if (score < 66) return interpretations[trait].medium;
    return interpretations[trait].high;
}

// Add this to your HTML file
`
<div id="interpretationModal" class="modal">
    <div class="modal-content">
        <span class="close" onclick="closeInterpretationModal()">&times;</span>
        <h2>Detailed Interpretation</h2>
        <div id="interpretationContent"></div>
    </div>
</div>
`;

// Add this function to close the interpretation modal
function closeInterpretationModal() {
    document.getElementById('interpretationModal').style.display = 'none';
}