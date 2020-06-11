const express = require('express');
const app = express();
const PORT = 8080;
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session');
const { v4: uuid } = require('uuid');
const bcrypt = require('bcrypt');
const saltRounds = 10;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieSession({ name: 'session', keys : ['dk233a6fnma1lm538wlz', 'kaskcn1k3jsal4n1l']}))
app.use(cookieParser());
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

//HELPER FUNCTIONS
const getUserByEmail = (email, database) => {
  for (const user in database) {
    if (database[user].email === email) {
      return database[user];
    }
  }
  return false;
}

// GET ROUTES
app.get('/login', (req, res) => {
  const id = req.session.user_id;
  const user = users[id];
  const templateVars = { user };
  return res.render('login', templateVars);
});

app.get('/register', (req, res) => {
  const id = req.session.user_id;
  const user = users[id];
  const templateVars = { user };
  return res.render('register', templateVars);
});

app.get('/', (req, res) => {
  res.send('Hello!');
});

app.get('/urls', (req, res) => {
  const id = req.session.user_id;
  const user = users[id];
  const validURL = urlsForUser(id);
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
  const longURL = urlDatabase[req.params.shortURL].longURL;
  const validUser = id === urlDatabase[req.params.shortURL].userID ? true : false;
  const templateVars = { shortURL: req.params.shortURL, longURL, user, validUser };
  return res.render('urls_show', templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  return res.redirect(longURL);
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
  urlDatabase[shortURL] = { longURL, userID };
  return res.redirect(302, `/urls/${shortURL}`);
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
  // for (const user in users) {
  //   if (users[user].email === email) {
  //     bcrypt.compare(password, users[user].password, (err, result) => {  
  //       if (result) {
  //         req.session.user_id = users[user].id;
  //         return res.redirect('/urls/');
  //       } else {
  //         return res.sendStatus(403);
  //       }
  //     })
  //   }
  // }
});

app.post('/logout', (req, res) => {
  req.session['user_id'] = null;
  return res.redirect('/urls/');
});

app.post('/urls/:id', (req, res) => {
  const id = req.session.user_id;
  const databaseID = urlDatabase[req.params.id].userID;
  const shortURL = req.params.id;
  const userID = req.session.user_id;
  const newURL = req.body.newURL;
  if (validUser(id, databaseID)) {
    urlDatabase[shortURL] = { longURL: newURL, userID };
  }
  return res.redirect('/urls');
});

app.post('/urls/:shortURL/delete', (req, res) => {
  const id = req.session.user_id;
  const databaseID = urlDatabase[req.params.shortURL].userID;
  const shortURL = req.params.shortURL;
  if (validUser(id, databaseID)) {
    delete urlDatabase[shortURL];
  }
  return res.redirect('/urls');
});


app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}!`);
});

// Checks if user is in the database with email
// If user is in database check with optional password if matches supplied password
// If password isnt supplied but email matches return email
// If password is supplied and both email and password match return user object
const validateLogin = (email, password) => {
  for (const key in users) {
    if (email === users[key].email) {
      if (!password) {
        return users[key].email;
      } else if (password === users[key].password) {
        return users[key];
      }
    }
  }
};

const urlsForUser = (id) => {
  const validURL = {};
  for (const url in urlDatabase) {
    if (urlDatabase[url].userID === id) {
      validURL[url] = urlDatabase[url].longURL;
    }
  }
  return validURL;
};

const validUser = (currentID, posterID) => {
  return currentID === posterID;
};