const express = require('express');
const app = express();
const PORT = 8080;
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const { v4: uuid } = require('uuid');

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.set('view engine', 'ejs');

const urlDatabase = {
  'b2xVn2':'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com'
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

app.get('/login', (req, res) => {
  const templateVars = {user: users[req.cookies.user_id]};
  res.render('login', templateVars);
});

app.get('/register', (req, res) => {
  const templateVars = {user: users[req.cookies.user_id]};
  res.render('register', templateVars);
});

app.get('/', (req, res) => {
  res.send('Hello!');
});

app.get('/urls', (req, res) => {
  const templateVars = {urls: urlDatabase, user: users[req.cookies.user_id]};
  res.render('urls_index', templateVars);
});

app.get('/urls/new', (req, res) => {
  const templateVars = {user: users[req.cookies.user_id]};
  res.render('urls_new', templateVars);
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.get('/hello', (req, res) => {
  res.send('<html><bodyy>Hello <b>World</b></body></html>\n');
});

app.get('/urls/:shortURL', (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], user: users[req.cookies.user_id]};
  res.render('urls_show', templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.post('/register', (req, res) => {
  const id = uuid().split('-')[0];
  const email = req.body.email;
  const password = req.body.password;
  if (!email || !password) {
    return res.sendStatus(400);
  }

  if (validateUser(email)) {
    return res.sendStatus(400);
  }
  
  const newUser = {
    email,
    password,
    id: id
  };
  users[id] = newUser;
  res.cookie('user_id', id);
  res.redirect('/urls');
});

app.post('/urls', (req, res) => {
  const uuid = uuid();
  urlDatabase[uuid] = req.body.longURL;
  res.redirect(302, `/urls/${uuid}`);
});

app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = (validateUser(email, password));

  if (!user) {
    return res.sendStatus(403);
  }
  
  res.cookie('user_id', user.id);
  res.redirect('/urls/');
});

app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls/');
});

app.post('/urls/:id' , (req, res) => {
  const shortURL = req.params.id;
  const newURL = req.body.newURL;
  urlDatabase[shortURL] = newURL;
  res.redirect('/urls');
});

app.post('/urls/:shortURL/delete', (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect('/urls');
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

// Checks if user is in the database with email
// If user is in database check with optional password if matches supplied password
// If password isnt supplied but email matches return email
// If password is supplied and both email and password match return user object
const validateUser = (email, password) => {
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