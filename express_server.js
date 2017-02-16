const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080;
app.set("view engine", "ejs")
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
const cookieParser = require('cookie-parser')
app.use(cookieParser())

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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
}

function generateRandomString() {
const chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
var total = ""
  for ( var i = 0; i < 6; i++) {
    min = Math.ceil(1);
    max = Math.floor(chars.length-1);
    random = Math.floor(Math.random() *(chars.length-1))+1;
    total += chars[random];
  }
  return total;
}





app.get("/", (req, res) => {
  res.redirect("/urls");
});

//urls

app.get("/urls", (req, res) => {
  res.render("urls_index", {user: req.cookies["user_id"], urls:urlDatabase, shortURL: req.params.id});
});

//urls/new
app.get("/urls/new", (req, res) => {
  res.render("urls_new", {user: req.cookies["user_id"]});
});

app.post("/urls/new", (req, res) => {
  let temp = generateRandomString()
  let longURL = req.body.longURL;
  longURL = longURL.indexOf('http://') !== -1 ?  urlDatabase[temp] = req.body.longURL : urlDatabase[temp] = "https://"+ req.body.longURL
  console.log(urlDatabase);
  res.redirect("http://localhost:8080/urls/" + temp);
});

//u/shortURL

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL]
  res.redirect(longURL);
});




///urls/:id

app.get("/urls/:id", (req, res) => {
  res.render("urls_show", {user: req.cookies["user_id"], urls:urlDatabase, shortURL: req.params.id});
});

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("http://localhost:8080/urls/")
});

app.post("/urls/:id", (req, res) => {
  let longURL = req.body.longURL;
  longURL = longURL.indexOf('http://') !== -1 ?  urlDatabase[req.params.id] = req.body.longURL : urlDatabase[req.params.id] = "https://"+ req.body.longURL
  res.redirect("http://localhost:8080/urls/" + req.params.id);
});


//Login
app.post("/login", (req, res) => {
let user;
  for (let x in users) {
    if (users[x].email === req.body.email) {
      user = users[x];
      console.log(x);
      break;
    }
  }
  if (user) {
    if (user.password === req.body.password) {
    res.cookie('user_id', user);
    res.redirect('/urls/');
    }
    else res.status(401).send('Bad credentials');
  }
  res.status(401).send('Bad credentials')
});

app.get("/login", (req,res ) => {
  res.render("urls_login", {user: req.cookies["user_id"]});
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.post("/urls/:id/delete", (req,res) => {
  delete urlDatabase[req.params.id];
  res.redirect("http://localhost:8080/urls/")
});

//LogOut
app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect("http://localhost:8080/urls");
});

//Register
app.get("/register", (req, res) => {
  res.render("urls_register", {user: req.cookies["user_id"]});
});

app.post("/u/register", (req, res) => {
  res.redirect("http://localhost:8080/register");
});

app.post("/register", (req, res) => {
  if (req.body.email === '' || req.body.password === ''){
    return res.status(400).login('Please enter email or password');
  }
  for (var user in users) {
    if (users[user].email === req.body.email) {
    return res.status(400).send('Please enter a new email');
    };
  }
  let randomID = generateRandomString();
  users[randomID] = { id:  randomID,
  email: req.body.email,
  password: req.body.password
  }
  let permUser = users[randomID];
  res.cookie('user_id', permUser);
  console.log(users);
  res.redirect("http://localhost:8080/urls");
});


//if user.password === req.body password, then send cookie
//for password else { res.status(401).send('bad credentials')}
//else return

app.get("/hello", (req, res) => {
  res.end("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});


