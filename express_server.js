const express = require('express');
const app = express();
const PORT = 8080;
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const { v4: uuid } = require('uuid');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const { getUserByEmail, urlsForUser, validUser } = require('./helpers')

// MiddleWare
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieSession({ name: 'session', keys : ['dk233a6fnma1lm538wlz', 'kaskcn1k3jsal4n1l']}))
app.set('view engine', 'ejs');

// Databases
const urlDatabase = {};
const users = {};

app.get('/', (req, res) => {
  const userID = req.session.user_id;
  const user = users[userID];
  const templateVars = { user };
  if (!templateVars.user) {
    return res.redirect('/login');
  } else {
    return res.redirect('/urls');
  }
});

app.get('/urls', (req, res) => {
  const userID = req.session.user_id;
  const user = users[userID];
  const validURL = urlsForUser(userID, urlDatabase);
  const templateVars = { urls: validURL, user };
  return res.render('urls_index', templateVars);
});

app.post('/urls', (req, res) => {
  const shortURL = uuid().split('-')[0].slice(0, 6);
  const longURL = req.body.longURL;
  const userID = req.session.user_id;
  if (longURL) {
    urlDatabase[shortURL] = { longURL, userID };
  } else {
    return res.send('No URL was entered');
  }
  if (userID) {
    return res.redirect(302, `/urls/${shortURL}`);
  }
  return res.send('Please login to create a shortURL');
});

app.get('/urls/new', (req, res) => {
  const userID = req.session.user_id;
  const user = users[userID];
  const templateVars = { user };
  if (!templateVars.user) {
    return res.redirect('/login');
  }
  return res.render('urls_new', templateVars);
});

app.get('/urls/:shortURL', (req, res) => {
  const userID = req.session.user_id;
  const user = users[userID];
  const shortURL = req.params.shortURL
  const url = urlDatabase[shortURL];
  let longURL;
  let authorized;
  if (url) {
    longURL = url.longURL;
    authorized = validUser(userID, url.userID);
  }
  const templateVars = { shortURL, longURL, user, authorized };
  return res.render('urls_show', templateVars);
});

app.post('/urls/:id', (req, res) => {
  const userID = req.session.user_id;
  const databaseID = urlDatabase[req.params.id].userID;
  const shortURL = req.params.id;
  const newURL = req.body.newURL;
  if (validUser(userID, databaseID)) {
    urlDatabase[shortURL] = { longURL: newURL, userID };
  } else {
    return res.send('You don\'t have authorization to do this action');
  }
  return res.redirect('/urls');
});

app.post('/urls/:id/delete', (req, res) => {
  const userID = req.session.user_id;
  const databaseID = urlDatabase[req.params.id].userID;
  const shortURL = req.params.id;

  if (!userID) {
    return res.send('You don\'t have authorization to do this action');
  } else if (validUser(userID, databaseID)) {
    delete urlDatabase[shortURL];
  } else {
    return res.send('You don\'t have authorization to do this action');
  }
  return res.redirect('/urls');
});

app.get("/u/:shortURL", (req, res) => {
  const url = urlDatabase[req.params.shortURL];
  if (url) {
    return res.redirect(url.longURL);
  } else {
    return res.send('That shortURL doesn\'t exist')
  }
});

app.get('/login', (req, res) => {
  const userID = req.session.user_id;
  const user = users[userID];
  const templateVars = { user };
  if (userID) {
    return res.redirect('/urls')
  }
  return res.render('login', templateVars);
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const user = getUserByEmail(email, users)

  if (user) {
    bcrypt.compare(password, user.password, (err, result) => {  
      if (err) {
        throw new Error('Error occured during login ', err);
      }
      if (result) {
        req.session.user_id = user.userID;
        return res.redirect('/urls/');
      } else {
        return res.sendStatus(403);
      }
    })
  }
});

app.get('/register', (req, res) => {
  const userID = req.session.user_id;
  const user = users[userID];
  const templateVars = { user };
  if (userID) {
    return res.redirect('/urls')
  }
  return res.render('register', templateVars);
});

app.post('/register', (req, res) => {
  const userID = uuid().split('-')[0];
  const { email, password } = req.body;

  if (!email || !password) {
    return res.sendStatus(400);
  }

  const user = getUserByEmail(email, users)

  if (user) {
    return res.sendStatus(400);
  } else {
    bcrypt.hash(req.body.password, saltRounds, (err, hashPassword) => {
      // Store hash in your password DB.
      if (err) {
        throw new Error('Error occured when registering ', err);
      }
  
      const newUser = {
        email,
        userID,
        password: hashPassword,
      };
      users[userID] = newUser;
      req.session.user_id = userID;
      return res.redirect('/urls');
    });
  }
});

app.post('/logout', (req, res) => {
  req.session['user_id'] = null;
  return res.redirect('/urls/');
});

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}!`);
});