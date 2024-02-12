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

// Fetch all tasks
app.get('/tasks', (req, res) => {
  db.query('SELECT * FROM task WHERE isFinished = 0 AND status_idstatus=2', (err, results) => {
      if (err) {
          res.status(500).json({ error: 'Error fetching tasks: ' + err.message });
      } else {
          res.json(results);
      }
  });
});
// Fetch tasks by status doing
app.get('/tasks/doing', (req, res) => {
  db.query('SELECT * FROM task JOIN status ON idstatus = status_idstatus WHERE idstatus=1 AND isFinished=0', (err, results) => {
      if (err) {
          res.status(500).json({ error: 'Error fetching tasks: ' + err.message });
      } else {
          res.json(results);
      }
  });
});
// Add a task
app.post('/tasks', (req, res) => {
  const { taskTitle, taskContent } = req.body;
  const status_idstatus = 2; // Default value set to 2
  const isFinished = 0;
  const query = 'INSERT INTO `task` (`taskTitle`, `taskContent`, `createdAt`, `isFinished`, `status_idstatus`) VALUES (?, ?, NOW(), ?, ?)';

  db.query(query, [taskTitle, taskContent, isFinished, status_idstatus], (err, results) => {
      if (err) {
          res.status(500).json({ error: 'Error adding the task: ' + err.message });
      } else {
          res.status(201).json({ message: "Task successfully added", id: results.insertId });
      }
  });
});
// Delete a task by its ID
app.delete('/tasks/:id', (req, res) => {
  const id = req.params.id;
  db.query('DELETE FROM task WHERE idtask = ?', [id], (err, results) => {
      if (err) {
          res.status(500).json({ error: 'Error deleting task: ' + err.message });
      } else {
          res.json({ message: "Task successfully deleted", id: id });
      }
  });
});

// Fetch a task by its ID
app.get('/tasks/:id', (req, res) => {
  const id = req.params.id;
  db.query('SELECT * FROM task WHERE idtask = ?', [id], (err, results) => {
      if (err) {
          res.status(500).json({ error: 'Error fetching task: ' + err.message });
      } else {
          res.json(results);
      }
  });
});

// Fetch tasks by their status ID
app.get('/tasks/status/:id', (req, res) => {
  const id = req.params.id;
  db.query('SELECT taskTitle, taskContent, labelStatus FROM task JOIN status ON idstatus = status_idstatus WHERE idstatus = ?', [id], (err, results) => {
      if (err) {
          res.status(500).json({ error: 'Error fetching tasks by status: ' + err.message });
      } else {
          res.json(results);
      }
  });
});

// Fetch all archived tasks with their title and the date of archiving
app.get('/archived', (req, res) => {
  db.query('SELECT taskTitle, taskContent, archivedAt, idtask FROM task JOIN archivedTask ON idtask = task_idtask', (err, results) => {
      if (err) {
          res.status(500).json({ error: 'Error fetching archived tasks: ' + err.message });
      } else {
          res.json(results);
      }
  });
});
// Update a Task Status
app.patch('/tasks/:id/status', (req, res) => {
  const idtask = req.params.id;
  const {status_idstatus} = req.body;
  const query = 'UPDATE task SET status_idstatus = ? WHERE idtask = ?';

  db.query(query, [status_idstatus, idtask], (err, results) => {
      if (err) {
          res.status(500).json({ error: 'Error adding the task: ' + err.message });
      } else {
          res.status(201).json({ message: "Status successfully modified"});
      }
  });
});
app.patch('/tasks/:id/archived', (req, res) => {
  const idtask = req.params.id;
  const { isFinished } = req.body;
  const updateQuery = 'UPDATE task SET isFinished = ? WHERE idtask = ?';

  // Mise à jour du statut de la tâche
  db.query(updateQuery, [isFinished, idtask], (err, results) => {
      if (err) {
          return res.status(500).json({ error: 'Error updating the task: ' + err.message });
      }

      // Insérer une nouvelle entrée dans archivedTask
      const insertQuery = 'INSERT INTO archivedTask (archivedAt, task_idtask) VALUES (NOW(),?)';
      
      db.query(insertQuery, [idtask], (err, results) => {
          if (err) {
              return res.status(500).json({ error: 'Error archiving the task: ' + err.message });
          }
          res.status(201).json({ message: "Task successfully archived" });
      });
  });
});

// Add tasks in archivedTask
app.post('/archived/:id', (req, res) => {
  const task_idtask = req.params.id;
  const query = 'INSERT INTO `archivedTask` (`archivedAt`,`task_idtask`) VALUES ( NOW(), ?)';

  db.query(query, [task_idtask], (err, results) => {
      if (err) {
          res.status(500).json({ error: 'Error adding the task: ' + err.message });
      } else {
          res.status(201).json({ message: "Task successfully archived", id: results.insertId });
      }
  });
});
// Fetch All Status
app.get('/status', (req, res) => {
  db.query('SELECT * FROM status', (err, results) => {
      if (err) {
          res.status(500).json({ error: 'Error fetching statuss: ' + err.message });
      } else {
          res.json(results);
      }
  });
});
// Add a status
app.post('/status', (req, res) => {
  const { labelStatus } = req.body;
  const query = 'INSERT INTO `status` (`labelStatus`) VALUES (?)';

  db.query(query, [labelStatus], (err, results) => {
      if (err) {
          res.status(500).json({ error: 'Error adding the task: ' + err.message });
      } else {
          res.status(201).json({ message: "Status successfully added", id: results.insertId });
      }
  });
});
// Update a status
app.put('/status/:id', (req, res) => {
  const idstatus = req.params.id;
  const {labelStatus} = req.body;
  const query = 'UPDATE status SET labelStatus = ? WHERE idstatus = ?';

  db.query(query, [labelStatus, idstatus], (err, results) => {
      if (err) {
          res.status(500).json({ error: 'Error adding the task: ' + err.message });
      } else {
          res.status(201).json({ message: "Status successfully modified"});
      }
  });
});
// Delete a status by its ID
app.delete('/status/:id', (req, res) => {
  const id = req.params.id;
  db.query('DELETE FROM status WHERE idstatus = ?', [id], (err, results) => {
      if (err) {
          res.status(500).json({ error: 'Error deleting status: ' + err.message });
      } else {
          res.json({ message: "Status successfully deleted", id: id });
      }
  });
});








