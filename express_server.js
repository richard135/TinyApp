const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080;
app.set("view engine", "ejs");
var cookieSession = require('cookie-session');
app.use(cookieSession({
  name: 'session',
  keys: ["hellohellohello"]
}));
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));
const cookieParser = require('cookie-parser');
app.use(cookieParser());
const bcrypt = require('bcrypt');


const urlDatabase = {
  "b2xVn2": { shortURL: "b2xVn2", longURL: "http://www.lighthouselabs.ca", userID: "userRandomID"},
  "9sm5xK": { shortURL: "9sm5xK", longURL: "http://www.google.ca", userID: "userRandomID2"}
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

function generateRandomString() {
  const chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  var total = "";
  for ( var i = 0; i < 6; i++) {
    min = Math.ceil(1);
    max = Math.floor(chars.length - 1);
    random = Math.floor(Math.random() * (chars.length - 1)) + 1;
    total += chars[random];
  }
  return total;
}


function getCurrentUserUrls(id){
  let urls = [];
  for (let shortURL in urlDatabase){
    if(urlDatabase[shortURL].userID === id){
      urls.push(urlDatabase[shortURL]);
    }
  }
  return urls;
}


app.get("/", (req, res) => {
  let currentUser = req.session.user_id;
  if (currentUser) {
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});




app.get("/urls", (req, res) => {
  let currentUser = req.session.user_id;
  if (currentUser){
    let urls = getCurrentUserUrls(currentUser.id);
    res.render("urls_index", {urls: urls, user: req.session.user_id});
  } else {
    res.status(401).send('Please visit http://localhost:8080/login');
  }
});

//urls/new
app.get("/urls/new", (req, res) => {
  if (req.session.user_id) {
    res.render("urls_new", {user: req.session.user_id});
  }else {
    res.status(401).send('Please visit http://localhost:8080/login');
  }
});

app.post("/urls/new", (req, res) => {
  let temp = generateRandomString();
  let longURL = req.body.longURL;
  longURL = longURL.indexOf('http://') !== -1 ?  urlDatabase[temp] = {shortURL: temp, longURL: req.body.longURL, userID: req.session.user_id.id } : urlDatabase[temp] = {shortURL: temp, longURL: "https://" + req.body.longURL, userID: req.session.user_id.id };
  console.log(urlDatabase);
  res.redirect("http://localhost:8080/urls/" + temp);
});

//u/shortURL

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL].longURL;
  console.log(longURL);
  res.redirect(longURL);
});






app.get("/urls/:shortURL", (req, res) => {
  const currentUser = req.session.user_id;
  const url = urlDatabase[req.params.shortURL];
  if (currentUser) {
    res.render("urls_show", {user: currentUser, url: url});
  } else {
    res.status(401).send('Please visit http://localhost:8080/login');
  }
  if (req.params.shortURL === null){
    res.status(404).send('Please visit http://localhost:8080/login');
  }
});

app.post("/urls/:shortURL/delete", (req, res) => {
  let currentUser = req.session.user_id;
  let url = urlDatabase[req.params.shortURL];
  if ( currentUser.id === url.userID){
    delete urlDatabase[req.params.shortURL];
    res.redirect("http://localhost:8080/urls/");
  }else {
    res.status(401).send('Bad credentials');
  }
});

app.post("/urls/:shortURL", (req, res) => {
  let shortURL =  urlDatabase[req.params.shortURL];
  let longURL =  req.body.longURL;
  urlDatabase[req.params.shortURL]["longURL"] = "https://" + longURL;
  res.redirect("http://localhost:8080/urls/");
});




//Login
app.post("/login", (req, res) => {
  let user;
  let currentUser = req.session.user_id;
  for (let x in users) {
    if (users[x]['email'] === req.body.email) {
      user = users[x];
      console.log(x);
      break;
    }
  }
  if (user) {
    if (bcrypt.compareSync(req.body.password, user.password)) {
      req.session.user_id =  user;
      res.redirect('/urls');
    }else {
      res.status(401).send('Bad credentials');
    }
  }
  res.status(401).send('Bad credentials');
});

app.get("/login", (req, res ) => {
  res.render("urls_login", {user: req.session.user_id});
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//LogOut
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("http://localhost:8080/urls");
});

//Register
app.get("/register", (req, res) => {
  res.render("urls_register", {user: req.session.user_id});
});

app.post("/u/register", (req, res) => {
  res.redirect("http://localhost:8080/register");
});

app.post("/register", (req, res) => {
  const hashed_password = bcrypt.hashSync(req.body.password, 10);
  if (req.body.email === '' || hashed_password === '') {
    return res.status(400).login('Please enter email or password');
  }
  for (var user in users) {
    if (users[user].email === req.body.email) {
      return res.status(400).send('Please enter a new email');
    }
  }
  let randomID = generateRandomString();
  users[randomID] = {id: randomID,
    email: req.body.email,
    password: hashed_password
  };
  req.session.user_id = randomID;
  res.redirect("http://localhost:8080/urls");
});

app.get("/hello", (req, res) => {
  res.end("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});


