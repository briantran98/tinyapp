const express = require('express');
const app = express();
const PORT = 8080;
const bodyParser = require('body-parser');

const generateRandomString = () => {
  const randomString = Math.random().toString(32).substring(2,8)
  return randomString;
};

app.use(bodyParser.urlencoded({extended: true}))
app.set('view engine', 'ejs');

const urlDatabase = {
  'b2xVn2':'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com'
};

app.post('/urls', (req, res) => {
  console.log(req.body);
  randomString = generateRandomString();
  urlDatabase[randomString] = req.body.longURL;
  res.redirect(302, `/urls/${randomString}`);
})

app.get('/', (req, res) => {
  res.send('Hello!');
});

app.get('/urls', (req, res) => {
  let templateVars = {urls: urlDatabase};
  res.render('urls_index', templateVars);
});

app.get('/urls/new', (req, res) => {
  res.render('urls_new');
})

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.get('/hello', (req, res) => {
  res.send('<html><bodyy>Hello <b>World</b></body></html>\n')
});

app.get('/urls/:shortURL', (req, res) => {
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]};
  console.log(req.params);
  res.render('urls_show', templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`)
});