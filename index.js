const express = require('express');
const mysql = require('mysql2');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');

// Load environment variables
dotenv.config();

const app = express();
app.use(bodyParser.json());
app.use(cors());

// MySQL Connection
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    ssl: {
      rejectUnauthorized: true,
      ca: fs.readFileSync('./ca.pem').toString(), // Add path to your SSL CA certificate if provided by Aiven
    }
  });

db.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  console.log('Connected to MySQL database');
});

// Route to fetch all questions and answers
app.get('/questions', (req, res) => {
    const sql = 'SELECT * FROM questions';
    db.query(sql, (err, results) => {
      if (err) {
        console.error('Error fetching questions and answers:', err);
        res.status(500).send('Error fetching questions and answers');
        return;
      }
      res.json(results);
    });
  });

// Route to add a new question and answer
app.post('/add', (req, res) => {
  const { question, answer } = req.body;
  const sql = 'INSERT INTO questions (question, answer) VALUES (?, ?)';
  db.query(sql, [question, answer], (err, result) => {
    if (err) {
      console.error('Error adding question and answer:', err);
      res.status(500).send('Error adding question and answer');
      return;
    }
    res.status(201).send('Question and answer added successfully');
  });
});

// Route to delete a question and answer by id
app.delete('/delete/:id', (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM questions WHERE id = ?';
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error('Error deleting question and answer:', err);
      res.status(500).send('Error deleting question and answer');
      return;
    }
    res.send('Question and answer deleted successfully');
  });
});

// Route to edit (replace) a question and answer by id
app.put('/edit/:id', (req, res) => {
  const { id } = req.params;
  const { question, answer } = req.body;
  const sql = 'UPDATE questions SET question = ?, answer = ? WHERE id = ?';
  db.query(sql, [question, answer, id], (err, result) => {
    if (err) {
      console.error('Error editing question and answer:', err);
      res.status(500).send('Error editing question and answer');
      return;
    }
    res.send('Question and answer updated successfully');
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});