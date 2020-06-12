const express = require('express');
const app = express();
const PORT = 8080;
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const { v4: uuid } = require('uuid');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const { getUserByEmail, urlsForUser, validUser } = require('./helpers')


app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieSession({ name: 'session', keys : ['dk233a6fnma1lm538wlz', 'kaskcn1k3jsal4n1l']}))
app.set('view engine', 'ejs');

const urlDatabase = {
  'b2xVn2': { longURL: 'http://lighthouselabs.ca', userID: 'userRandomID' },
  '9sm5xK': { longURL: 'http://www.google.com', userID: 'user2RandomID' }
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

// GET ROUTES
app.get('/login', (req, res) => {
  const id = req.session.user_id;
  const user = users[id];
  const templateVars = { user };
  if (id) {
    return res.redirect('/urls')
  }
  return res.render('login', templateVars);
});

app.get('/register', (req, res) => {
  const id = req.session.user_id;
  const user = users[id];
  const templateVars = { user };
  if (id) {
    return res.redirect('/urls')
  }
  return res.render('register', templateVars);
});

app.get('/', (req, res) => {
  const id = req.session.user_id;
  const user = users[id];
  const templateVars = { user };
  if (!templateVars.user) {
    return res.redirect('/login');
  } else {
    return res.redirect('/urls');
  }
});

app.get('/urls', (req, res) => {
  const id = req.session.user_id;
  const user = users[id];
  const validURL = urlsForUser(id, urlDatabase);
  const templateVars = { urls: validURL, user };
  return res.render('urls_index', templateVars);
});

app.get('/urls/new', (req, res) => {
  const id = req.session.user_id;
  const user = users[id];
  const templateVars = { user };
  if (!templateVars.user) {
    return res.redirect('/login');
  }
  return res.render('urls_new', templateVars);
});

app.get('/urls/:shortURL', (req, res) => {
  const id = req.session.user_id;
  const user = users[id];
  const shortURL = req.params.shortURL
  const url = urlDatabase[shortURL];
  let longURL;
  let validUser;
  if (url) {
    longURL = url.longURL;
    validUser = id === url.userID ? true : false;
  }
  console.log(longURL);
  const templateVars = { shortURL, longURL, user, validUser };
  return res.render('urls_show', templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const url = urlDatabase[req.params.shortURL];
  if (url) {
    console.log("HERE");
    return res.redirect(url.longURL);
  } else {
    return res.send('That shortURL doesn\'t exist')
  }
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.get('/hello', (req, res) => {
  res.send('<html><bodyy>Hello <b>World</b></body></html>\n');
});

// POSTS ROUTES
app.post('/register', (req, res) => {
  const id = uuid().split('-')[0].slice(0,6);
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
        throw Error('Error occured when registering ', err);
      }
  
      const newUser = {
        email,
        password: hashPassword,
        id: id
      };
      users[id] = newUser;
      req.session.user_id = id;
      return res.redirect('/urls');
    });
  }
});

app.post('/urls', (req, res) => {
  const shortURL = uuid().split('-')[0].slice(0, 6);
  const longURL = req.body.longURL;
  const userID = req.session.user_id;
  if (longURL) {
    urlDatabase[shortURL] = { longURL, userID };
  }
  if (userID) {
    return res.redirect(302, `/urls/${shortURL}`);
  }
  return res.send('Please login to create a shortURL');
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const user = getUserByEmail(email, users)

  if (user) {
    bcrypt.compare(password, user.password, (err, result) => {  
      if (result) {
        req.session.user_id = user.id;
        return res.redirect('/urls/');
      } else {
        return res.sendStatus(403);
      }
    })
  }
});

app.post('/logout', (req, res) => {
  req.session['user_id'] = null;
  return res.redirect('/urls/');
});

app.post('/urls/:id', (req, res) => {
  const databaseID = urlDatabase[req.params.id].userID;
  const shortURL = req.params.id;
  const userID = req.session.user_id;
  const newURL = req.body.newURL;
  if (!userID) {
    return res.send('You don\'t have authorization to do this action');
  } else if (validUser(userID, databaseID)) {
    urlDatabase[shortURL] = { longURL: newURL, userID };
  } else {
    return res.send('You don\'t have authorization to do this action');
  }
  return res.redirect('/urls');
});

app.post('/urls/:id/delete', (req, res) => {
  const userID = req.session.user_id;
  const databaseID = urlDatabase[req.params.id].userID;
  const id = req.params.id;

  if (!userID) {
    return res.send('You don\'t have authorization to do this action');
  } else if (validUser(userID, databaseID)) {
    delete urlDatabase[id];
  } else {
    return res.send('You don\'t have authorization to do this action');
  }
  return res.redirect('/urls');
});


app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}!`);
});

//_JtUWsV_WhJz1L80hnhJk_YeX5M
//eyJ1c2VyX2lkIjoiMTc0ODNjIn0=