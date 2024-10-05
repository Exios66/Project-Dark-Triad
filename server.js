const express = require('express');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const rateLimit = require("express-rate-limit");
const winston = require('winston');
const NodeCache = require("node-cache");
const sqlite3 = require('sqlite3').verbose();

// At the top of the file
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;
const myCache = new NodeCache({ stdTTL: 600, checkperiod: 120 }); // Cache for 10 minutes

// SQLite database setup
const db = new sqlite3.Database('./database.sqlite', (err) => {
  if (err) {
    console.error('Error opening database', err);
  } else {
    console.log('Database connected');
  }
});

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.headers['x-access-token'];
  if (!token) return res.status(403).json({ auth: false, message: 'No token provided.' });
  
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(500).json({ auth: false, message: 'Failed to authenticate token.' });
    
    req.userId = decoded.id;
    next();
  });
};

// Middleware to verify admin status
const verifyAdmin = async (req, res, next) => {
  try {
    const result = await db.get('SELECT is_admin FROM Users WHERE user_id = ?', [req.userId]);
    if (result && result.is_admin) {
      next();
    } else {
      res.status(403).json({ message: 'Access denied' });
    }
  } catch (error) {
    console.error('Error verifying admin status:', error);
    res.status(500).json({ message: 'Error verifying admin status' });
  }
};

// User registration
app.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const result = await db.run(
      'INSERT INTO Users (username, email, password) VALUES (?, ?, ?)',
      [username, email, hashedPassword]
    );
    
    const token = jwt.sign({ id: result.lastID }, process.env.JWT_SECRET, {
      expiresIn: 86400 // expires in 24 hours
    });
    
    res.status(201).json({ auth: true, token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error registering user' });
  }
});

// User login
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const result = await db.get('SELECT * FROM Users WHERE email = ?', [email]);
    if (!result) return res.status(404).json({ message: 'User not found' });
    
    const user = result;
    const passwordIsValid = await bcrypt.compare(password, user.password);
    if (!passwordIsValid) return res.status(401).json({ auth: false, token: null });
    
    const token = jwt.sign({ id: user.user_id }, process.env.JWT_SECRET, {
      expiresIn: 86400 // expires in 24 hours
    });
    
    res.json({ auth: true, token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error logging in' });
  }
});

// Protected route example
app.get('/user', verifyToken, async (req, res) => {
  try {
    const result = await db.get('SELECT user_id, username, email FROM Users WHERE user_id = ?', [req.userId]);
    if (!result) return res.status(404).json({ message: 'User not found' });
    
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching user data' });
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Fetch questions for a specific assessment (with caching)
app.get('/api/assessment/:assessmentId/questions', verifyToken, async (req, res) => {
  const cacheKey = `questions_${req.params.assessmentId}`;
  const cachedQuestions = myCache.get(cacheKey);
  
  if (cachedQuestions) {
    return res.json(cachedQuestions);
  }

  try {
    const result = await db.all(
      'SELECT q.question_id, q.question_text, q.question_order, t.trait_name ' +
      'FROM Questions q ' +
      'LEFT JOIN Trait_Descriptions t ON q.trait_id = t.trait_id ' +
      'WHERE q.assessment_id = ? ' +
      'ORDER BY q.question_order',
      [req.params.assessmentId]
    );
    myCache.set(cacheKey, result);
    res.json(result);
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({ message: 'Error fetching questions' });
  }
});

// Submit assessment results
app.post('/api/assessment/:assessmentId/submit', verifyToken, async (req, res) => {
  const { answers } = req.body;
  const userId = req.userId;
  const assessmentId = req.params.assessmentId;

  const client = await db.run('BEGIN');

  try {
    let totalScore = 0;
    const resultDetails = {};
    for (let answer of answers) {
      totalScore += answer.value;
      if (answer.trait) {
        if (!resultDetails[answer.trait]) {
          resultDetails[answer.trait] = { score: 0, count: 0 };
        }
        resultDetails[answer.trait].score += answer.value;
        resultDetails[answer.trait].count++;
      }
    }

    // Calculate average scores for each trait
    for (let trait in resultDetails) {
      resultDetails[trait].average = resultDetails[trait].score / resultDetails[trait].count;
    }

    // Insert the overall result
    const result = await db.run(
      'INSERT INTO Assessment_Results (user_id, assessment_id, total_score, result_details) VALUES (?, ?, ?, ?)',
      [userId, assessmentId, totalScore, JSON.stringify(resultDetails)]
    );

    // Insert individual answers
    const answerInsertPromises = answers.map(answer => 
      db.run('INSERT INTO Answers (user_id, question_id, answer_value) VALUES (?, ?, ?)',
        [userId, answer.questionId, answer.value])
    );
    await Promise.all(answerInsertPromises);

    await db.run('COMMIT');

    res.json({ message: 'Assessment results submitted successfully', totalScore, resultDetails });
  } catch (error) {
    await db.run('ROLLBACK');
    console.error('Error submitting assessment results:', error);
    res.status(500).json({ message: 'Error submitting assessment results' });
  } finally {
    client.release();
  }
});

// Configure logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'user-service' },
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

// Apply rate limiter to all requests
app.use(limiter);

// Update error handling to use logger
app.use((err, req, res, next) => {
  logger.error(`${err.status || 500} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
  res.status(500).send('Something broke!');
});

// Fetch user's past assessment results (with caching)
app.get('/api/user/results', verifyToken, async (req, res) => {
  const cacheKey = `user_results_${req.userId}`;
  const cachedResults = myCache.get(cacheKey);

  if (cachedResults) {
    return res.json(cachedResults);
  }

  try {
    const result = await db.all(
      'SELECT ar.result_id, a.assessment_name, ar.total_score, ar.result_details, ar.completed_at ' +
      'FROM Assessment_Results ar ' +
      'JOIN Assessments a ON ar.assessment_id = a.assessment_id ' +
      'WHERE ar.user_id = ? ' +
      'ORDER BY ar.completed_at DESC',
      [req.userId]
    );
    myCache.set(cacheKey, result);
    res.json(result);
  } catch (error) {
    console.error('Error fetching user results:', error);
    res.status(500).json({ message: 'Error fetching results' });
  }
});

// Admin route to view all questions
app.get('/api/admin/questions', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const result = await db.all(
      'SELECT q.*, a.assessment_name, t.trait_name ' +
      'FROM Questions q ' +
      'JOIN Assessments a ON q.assessment_id = a.assessment_id ' +
      'LEFT JOIN Trait_Descriptions t ON q.trait_id = t.trait_id'
    );
    res.json(result);
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({ message: 'Error fetching questions' });
  }
});

// Admin route to view overall statistics (with caching)
app.get('/api/admin/statistics', verifyToken, verifyAdmin, async (req, res) => {
  const cacheKey = 'admin_statistics';
  const cachedStats = myCache.get(cacheKey);

  if (cachedStats) {
    return res.json(cachedStats);
  }

  try {
    const stats = {};
    
    const userCountResult = await db.get('SELECT COUNT(*) as count FROM Users');
    stats.userCount = userCountResult.count;

    const assessmentCountResult = await db.get('SELECT COUNT(*) as count FROM Assessment_Results');
    stats.assessmentCount = assessmentCountResult.count;

    const averageScoresResult = await db.all(
      'SELECT a.assessment_name, AVG(ar.total_score) as average_score ' +
      'FROM Assessment_Results ar ' +
      'JOIN Assessments a ON ar.assessment_id = a.assessment_id ' +
      'GROUP BY ar.assessment_id, a.assessment_name'
    );
    stats.averageScores = averageScoresResult;

    myCache.set(cacheKey, stats, 3600); // Cache for 1 hour
    res.json(stats);
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({ message: 'Error fetching statistics' });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});