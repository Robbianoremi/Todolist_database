const express = require('express');
var cors = require('cors')
const mysql = require('mysql2');
const fs = require('fs');

const key = fs.readFileSync('./key.pem');

const cert = fs.readFileSync('./cert.pem');
const https = require('https');

const app = express();

const server = https.createServer({key: key, cert: cert }, app);



const port = 3000;
app.use(express.json());
app.use(cors())

// informations de connexion databases
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'todolist',
    port: '3306'
})
// connexion
db.connect(err => {
    if (err) {
        console.log('Erreur de connexion à la base données' + err);
        return;
    }
    console.log('connecté à la base de données')
})

app.get('/tasks', (req, res) => {
  db.query('SELECT * FROM task', (err, results) => {
    if(err){
        res.status(500).send(err);
    }else {
        res.json(results);
    }
  });
});

app.get(`/tasks/:id`, (req, res) => {
    let id = req.params.id;
    db.query(`SELECT * FROM task WHERE idtask= ${id}`, (err, results) => {
      if(err){
          res.status(500).send(err);
      }else {
          res.json(results);
      }
    });
  }); 


  app.get('/', (req, res) => { res.send('this is an secure server') });



server.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
})



app.post('/tasks', (req, res) => {
  const { tasktitle, taskcontent } = req.body;
  const status_idstatus = 2; // Default value set to 2
  const isFinished = 0;
  const query = 'INSERT INTO `task` (`taskTitle`, `taskContent`, `createdAt`, `isFinished`, `status_idstatus`) VALUES (?, ?, NOW(), ?, ?)';

  db.query(query, [tasktitle, taskcontent, isFinished, status_idstatus], (err, results) => {
      if (err) {
          res.status(500).json({ error: 'Error adding the task: ' + err.message });
      } else {
          res.status(201).json({ message: "Task successfully added", id: results.insertId });
      }
  });
});








