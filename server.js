const express = require('express');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const sqlite3 = require('sqlite3').verbose();
const dotenv = require('dotenv');
const rateLimit = require("express-rate-limit");
const winston = require('winston');
const NodeCache = require("node-cache");
const myCache = new NodeCache({ stdTTL: 600, checkperiod: 120 }); // Cache for 10 minutes

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// SQLite database setup
const db = new sqlite3.Database('./database.sqlite', (err) => {
  if (err) {
    console.error('Error opening database', err);
  } else {
    console.log('Database connected');
    initializeDatabase();
  }
});

function initializeDatabase() {
  const schemaSQL = fs.readFileSync(path.join(__dirname, 'sql', 'schema.sql'), 'utf8');
  const statements = schemaSQL.split(';').filter(stmt => stmt.trim() !== '');
  
  db.serialize(() => {
    db.run("PRAGMA foreign_keys = ON");

    statements.forEach(statement => {
      db.run(statement.trim(), err => {
        if (err) {
          console.error('Error executing SQL statement:', err);
          console.error('Statement:', statement);
        }
      });
    });

    console.log('Database schema initialized');
  });
}

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
const verifyAdmin = (req, res, next) => {
  db.get('SELECT is_admin FROM Users WHERE user_id = ?', [req.userId], (err, row) => {
    if (err) {
      logger.error('Error verifying admin status:', err);
      return res.status(500).json({ message: 'Error verifying admin status' });
    }
    if (row && row.is_admin) {
      next();
    } else {
      res.status(403).json({ message: 'Access denied' });
    }
  });
};

// User registration
app.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    
    db.run('INSERT INTO Users (username, email, password) VALUES (?, ?, ?)', [username, email, hashedPassword], function(err) {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'Error registering user' });
      }
      
      const token = jwt.sign({ id: this.lastID }, process.env.JWT_SECRET, {
        expiresIn: 86400 // expires in 24 hours
      });
      
      res.status(201).json({ auth: true, token });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error registering user' });
  }
});

// User login
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  
  db.get('SELECT * FROM Users WHERE email = ?', [email], async (err, user) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Error logging in' });
    }
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    const passwordIsValid = await bcrypt.compare(password, user.password);
    if (!passwordIsValid) return res.status(401).json({ auth: false, token: null });
    
    const token = jwt.sign({ id: user.user_id }, process.env.JWT_SECRET, {
      expiresIn: 86400 // expires in 24 hours
    });
    
    res.json({ auth: true, token });
  });
});

// Protected route example
app.get('/user', verifyToken, (req, res) => {
  db.get('SELECT user_id, username, email FROM Users WHERE user_id = ?', [req.userId], (err, row) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Error fetching user data' });
    }
    if (!row) return res.status(404).json({ message: 'User not found' });
    
    res.json(row);
  });
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Fetch questions for a specific assessment (with caching)
app.get('/api/assessment/:assessmentId/questions', verifyToken, (req, res) => {
  const cacheKey = `questions_${req.params.assessmentId}`;
  const cachedQuestions = myCache.get(cacheKey);
  
  if (cachedQuestions) {
    return res.json(cachedQuestions);
  }

  db.all(
    'SELECT q.question_id, q.question_text, q.question_order, t.trait_name ' +
    'FROM Questions q ' +
    'LEFT JOIN Trait_Descriptions t ON q.trait_id = t.trait_id ' +
    'WHERE q.assessment_id = ? ' +
    'ORDER BY q.question_order',
    [req.params.assessmentId],
    (err, rows) => {
      if (err) {
        logger.error('Error fetching questions:', err);
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
app.get('/api/user/results', verifyToken, (req, res) => {
  const cacheKey = `user_results_${req.userId}`;
  const cachedResults = myCache.get(cacheKey);

  if (cachedResults) {
    return res.json(cachedResults);
  }

  db.all(
    'SELECT ar.result_id, a.assessment_name, ar.total_score, ar.result_details, ar.completed_at ' +
    'FROM Assessment_Results ar ' +
    'JOIN Assessments a ON ar.assessment_id = a.assessment_id ' +
    'WHERE ar.user_id = ? ' +
    'ORDER BY ar.completed_at DESC',
    [req.userId],
    (err, rows) => {
      if (err) {
        logger.error('Error fetching user results:', err);
        return res.status(500).json({ message: 'Error fetching results' });
      }
      myCache.set(cacheKey, rows);
      res.json(rows);
    }
  );
});

// Admin route to view all questions
app.get('/api/admin/questions', verifyToken, verifyAdmin, (req, res) => {
  db.all(
    'SELECT q.*, a.assessment_name, t.trait_name ' +
    'FROM Questions q ' +
    'JOIN Assessments a ON q.assessment_id = a.assessment_id ' +
    'LEFT JOIN Trait_Descriptions t ON q.trait_id = t.trait_id',
    (err, rows) => {
      if (err) {
        logger.error('Error fetching questions:', err);
        return res.status(500).json({ message: 'Error fetching questions' });
      }
      res.json(rows);
    }
  );
});

// Admin route to view overall statistics (with caching)
app.get('/api/admin/statistics', verifyToken, verifyAdmin, (req, res) => {
  const cacheKey = 'admin_statistics';
  const cachedStats = myCache.get(cacheKey);

  if (cachedStats) {
    return res.json(cachedStats);
  }

  db.serialize(() => {
    let stats = {};
    db.get('SELECT COUNT(*) as count FROM Users', (err, row) => {
      if (err) {
        logger.error('Error fetching user count:', err);
        return res.status(500).json({ message: 'Error fetching statistics' });
      }
      stats.userCount = row.count;
    });

    db.get('SELECT COUNT(*) as count FROM Assessment_Results', (err, row) => {
      if (err) {
        logger.error('Error fetching assessment count:', err);
        return res.status(500).json({ message: 'Error fetching statistics' });
      }
      stats.assessmentCount = row.count;
    });

    db.all(
      'SELECT a.assessment_name, AVG(ar.total_score) as average_score ' +
      'FROM Assessment_Results ar ' +
      'JOIN Assessments a ON ar.assessment_id = a.assessment_id ' +
      'GROUP BY ar.assessment_id',
      (err, rows) => {
        if (err) {
          logger.error('Error fetching average scores:', err);
          return res.status(500).json({ message: 'Error fetching statistics' });
        }
        stats.averageScores = rows;
        myCache.set(cacheKey, stats, 3600); // Cache for 1 hour
        res.json(stats);
      }
    );
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});