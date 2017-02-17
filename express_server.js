const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080;
app.set("view engine", "ejs")
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
const cookieParser = require('cookie-parser')
app.use(cookieParser())

const urlDatabase = {
  "b2xVn2": { shortURL: "b2xVn2", longURL: "http://www.lighthouselabs.ca", userID : "userRandomID"},
  "9sm5xK": { shortURL: "9sm5xK", longURL: "http://www.google.ca", userID : "userRandomID2"}
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


function getCurrentUserUrls(id){
  let urls = [];
  for (let shortURL in urlDatabase){
    if(urlDatabase[shortURL].userID === id){
      urls.push(urlDatabase[shortURL]);
    }
  }
  return urls;
}

app.get("/urls", (req, res) => {
  let currentUser = req.cookies["user_id"];
  if (currentUser){
    console.log(currentUser, 'hi');
    let urls = getCurrentUserUrls(currentUser.id);
    console.log(urls);
    res.render("urls_index", {urls: urls, user: req.cookies["user_id"]});
  }
  else {
    res.redirect("/login");
  }
});

//urls/new
app.get("/urls/new", (req, res) => {
  if (req.cookies["user_id"]) {
    res.render("urls_new", {user: req.cookies["user_id"]});
  }
  else {
    res.redirect("/login");
  }
});

app.post("/urls/new", (req, res) => {
  let temp = generateRandomString()
  let longURL = req.body.longURL;
  longURL = longURL.indexOf('http://') !== -1 ?  urlDatabase[temp] = {shortURL: temp, longURL: req.body.longURL, userID: req.cookies["user_id"].id }: urlDatabase[temp] = {shortURL: temp, longURL: "https://"+ req.body.longURL, userID: req.cookies["user_id"].id }
  console.log(urlDatabase);
  res.redirect("http://localhost:8080/urls/" + temp);
});

//u/shortURL

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL].longURL
  console.log(longURL);
  res.redirect(longURL);
});




///urls/:id

app.get("/urls/:shortURL", (req, res) => {
  const currentUser = req.cookies["user_id"];
  const url = urlDatabase[req.params.shortURL];

  if (currentUser) {
    res.render("urls_show", {
      user: currentUser,
      url: url,
    });
  }
});

app.post("/urls/:shortURL/delete", (req, res) => {
  let currentUser = req.cookies["user_id"];
  let url = urlDatabase[req.params.shortURL];
      console.log("=============>current user:", currentUser);
    console.log("-------------->url.userID:", url.userID)
  if ( currentUser.id === url.userID){
    delete urlDatabase[req.params.shortURL];
    res.redirect("http://localhost:8080/urls/");
  }
  else {
    res.status(401).send('Bad credentials');
  }
});

app.post("/urls/:shortURL", (req, res) => {
  let url =  urlDatabase[req.params.shortURL];
  let longURL = "https://"+ url.longURL
  res.redirect("http://localhost:8080/urls/" + req.params.shortURL);
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
      res.redirect('/urls');
    }
    else {
      res.status(401).send('Bad credentials');
    }
  }
  res.status(401).send('Bad credentials')
});

app.get("/login", (req,res ) => {
  res.render("urls_login", {user: req.cookies["user_id"]});
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
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
  if (req.body.email === '' || req.body.password === '') {
    return res.status(400).login('Please enter email or password');
  }
  for (var user in users) {
    if (users[user].email === req.body.email) {
      return res.status(400).send('Please enter a new email');
    };
  }
  let randomID = generateRandomString();
  users[randomID] = {
    id:  randomID,
    email: req.body.email,
    password: req.body.password
  }
  res.cookie('user_id', randomID);
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


