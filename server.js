const express = require('express');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const rateLimit = require("express-rate-limit");
const winston = require('winston');
const NodeCache = require("node-cache");
const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');

let db;

(async () => {
  db = await open({
    filename: './database.sqlite',
    driver: sqlite3.Database
  });
})();

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const myCache = new NodeCache({ stdTTL: 600, checkperiod: 120 }); // Cache for 10 minutes

app.use(express.static(path.join(__dirname, 'src')));
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

// User registration
app.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    
    await db.run('INSERT INTO Users (username, email, password) VALUES (?, ?, ?)', [username, email, hashedPassword]);
    
    const token = jwt.sign({ id: 1 }, process.env.JWT_SECRET, {
      expiresIn: 86400 // expires in 24 hours
    });
    
    res.status(201).json({ auth: true, token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error registering user' });
  }
});

// User login
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  
  const user = await db.get('SELECT * FROM Users WHERE email = ?', [email]);
  
  if (!user) return res.status(404).json({ message: 'User not found' });
  
  bcrypt.compare(password, user.password, (err, result) => {
    if (err || !result) return res.status(401).json({ auth: false, token: null });
    
    const token = jwt.sign({ id: user.user_id }, process.env.JWT_SECRET, {
      expiresIn: 86400 // expires in 24 hours
    });
    
    res.json({ auth: true, token });
  });
});

// Fetch available assessments
app.get('/api/assessments', verifyToken, (req, res) => {
  const rows = await db.all('SELECT * FROM Assessments');
  if (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error fetching assessments' });
  }
  res.json(rows);
});

// Fetch questions for a specific assessment
app.get('/api/assessment/:assessmentId/questions', verifyToken, (req, res) => {
  const cacheKey = `questions_${req.params.assessmentId}`;
  const cachedQuestions = myCache.get(cacheKey);
  
  if (cachedQuestions) {
    return res.json(cachedQuestions);
  }

  const rows = await db.all(
    'SELECT q.question_id, q.question_text, q.question_order, t.trait_name ' +
    'FROM Questions q ' +
    'LEFT JOIN Trait_Descriptions t ON q.trait_id = t.trait_id ' +
    'WHERE q.assessment_id = ? ' +
    'ORDER BY q.question_order',
    [req.params.assessmentId],
    (err, rows) => {
      if (err) {
        console.error('Error fetching questions:', err);
        return res.status(500).json({ message: 'Error fetching questions' });
      }
      myCache.set(cacheKey, rows);
      res.json(rows);
    }
  );
});

// Submit assessment results
app.post('/api/assessment/:assessmentId/submit', verifyToken, (req, res) => {
  const { answers } = req.body;
  const userId = req.userId;
  const assessmentId = req.params.assessmentId;

  db.serialize(() => {
    db.run('BEGIN TRANSACTION');

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
    db.run(
      'INSERT INTO Assessment_Results (user_id, assessment_id, total_score, result_details) VALUES (?, ?, ?, ?)',
      [userId, assessmentId, totalScore, JSON.stringify(resultDetails)],
      function(err) {
        if (err) {
          db.run('ROLLBACK');
          console.error('Error submitting assessment results:', err);
          return res.status(500).json({ message: 'Error submitting assessment results' });
        }

        // Insert individual answers
        const stmt = db.prepare('INSERT INTO Answers (user_id, question_id, answer_value) VALUES (?, ?, ?)');
        for (let answer of answers) {
          stmt.run(userId, answer.questionId, answer.value);
        }
        stmt.finalize();

        db.run('COMMIT', (err) => {
          if (err) {
            console.error('Error committing transaction:', err);
            return res.status(500).json({ message: 'Error submitting assessment results' });
          }
          res.json({ message: 'Assessment results submitted successfully', totalScore, resultDetails });
        });
      }
    );
  });
});

// Fetch user's past assessment results
app.get('/api/user/results', verifyToken, (req, res) => {
  const cacheKey = `user_results_${req.userId}`;
  const cachedResults = myCache.get(cacheKey);

  if (cachedResults) {
    return res.json(cachedResults);
  }

  const rows = await db.all(
    'SELECT ar.result_id, a.assessment_name, ar.total_score, ar.result_details, ar.completed_at ' +
    'FROM Assessment_Results ar ' +
    'JOIN Assessments a ON ar.assessment_id = a.assessment_id ' +
    'WHERE ar.user_id = ? ' +
    'ORDER BY ar.completed_at DESC',
    [req.userId],
    (err, rows) => {
      if (err) {
        console.error('Error fetching user results:', err);
        return res.status(500).json({ message: 'Error fetching results' });
      }
      myCache.set(cacheKey, rows);
      res.json(rows);
    }
  );
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});