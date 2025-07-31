const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({ secret: 'adminSecret', resave: false, saveUninitialized: true }));

const ADMIN_USER = 'root';
const ADMIN_PASS = 'Neogrcz8+';

app.get('/admin/login', (req, res) => {
  res.send(`
    <form method="POST" action="/admin/login">
      <input name="username" placeholder="Username" required />
      <input name="password" type="password" placeholder="Password" required />
      <button type="submit">Login</button>
    </form>
  `);
});

app.post('/admin/login', (req, res) => {
  const { username, password } = req.body;
  if (username === ADMIN_USER && password === ADMIN_PASS) {
    req.session.admin = true;
    res.redirect('/admin');
  } else {
    res.send('Login fehlgeschlagen!');
  }
});

app.use('/admin', (req, res, next) => {
  if (!req.session.admin) return res.redirect('/admin/login');
  next();
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin-dashboard.html'));
});

app.listen(3001, () => {
  console.log('Admin-Frontend läuft auf Port 3001');
});
