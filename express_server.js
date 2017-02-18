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

app.use(function(req, res, next){
  res.locals.user = users[req.session.user_id];
  next();
});


const urlDatabase = {
  "b2xVn2": { shortURL: "b2xVn2", longURL: "http://www.lighthouselabs.ca", userID: "userRandomID"},
  "9sm5xK": { shortURL: "9sm5xK", longURL: "http://www.google.ca", userID: "userRandomID2"}
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: bcrypt.hashSync("123", 10)
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync("123", 10)
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

app.post("/urls", (req, res) => {
  let temp = generateRandomString();
  let longURL = req.body.longURL;
  let currentUser = req.session.user_id
  urlDatabase[temp] = {shortURL: temp, longURL: "https://" + longURL, userID: currentUser};
  longURL =  urlDatabase[temp]
  console.log(urlDatabase);
  console.log(req.body);
  res.redirect("/urls/" + temp);
});

app.get("/urls", (req, res) => {
  let currentUser = req.session.user_id
  if (currentUser){
    let urls = getCurrentUserUrls(currentUser);
    res.render("urls_index", {urls: urls });
  } else {
    res.status(401).render("error401");
  }
});


//urls/new
app.get("/urls/new", (req, res) => {
  if (req.session.user_id) {
    res.render("urls_new", {user: req.session.user_id});
  }else {
    res.status(401).render("error401");
  }
});

app.post("/urls/new", (req, res) => {
  let temp = generateRandomString();
  let longURL = req.body.longURL;
  let currentUser = req.session.user_id;
  urlDatabase[temp] = {shortURL: temp, longURL: "http://" + longURL, userID: currentUser };
  longURL =  urlDatabase[temp];
  console.log(urlDatabase);
  console.log(req.body);
  res.redirect("/urls/" + temp);
});

//u/shortURL

app.get("/u/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL]!= undefined) {
    let longURL = urlDatabase[req.params.shortURL].longURL;
    console.log(longURL);
    res.redirect(longURL);
  } else{
    res.status(404).render("error404");
  }
});






app.get("/urls/:shortURL", (req, res) => {
  const currentUser = req.session.user_id;
  const url = urlDatabase[req.params.shortURL];
  if (urlDatabase[req.params.shortURL] == undefined) {
   res.status(404).render("error404");
  }
  else if (url.userID == currentUser){
    res.render("urls_show", {user: currentUser, url: url});
  }
  else if (url.userID != currentUser.id){
   res.status(403).render("error403");
  } else {
   res.status(401).render("error401");
  }
});

app.post("/urls/:shortURL/delete", (req, res) => {
    delete urlDatabase[req.params.shortURL];
    res.redirect("/urls/");

});

app.post("/urls/:shortURL", (req, res) => {
  let shortURL =  urlDatabase[req.params.shortURL];
  let longURL =  req.body.longURL;
  let url = urlDatabase[req.params.shortURL];
  let currentUser = req.session.user_id;
  if (currentUser === url.userID) {
    urlDatabase[req.params.shortURL]["longURL"] = "https://" + longURL;
    res.redirect("/urls");
  } else {
    res.status(401).send('Please visit /login');
  }
});




//Login
app.post("/login", (req, res) => {
  let user;
  let currentUser = req.session.user_id;
  for (let x in users) {
    if (users[x]['email'] === req.body.email) {
      user = users[x];
      break;
    }
  }
  if (user) {
    if (bcrypt.compareSync(req.body.password, user.password)) {
      req.session.user_id =  user.id;
      res.redirect('/urls');
      return;
    }else {
      res.status(401).render("error401");
      return;
    }
  }
  res.status(401).render("error401");
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
  res.redirect("/");
});

//Register
app.get("/register", (req, res) => {
  res.render("urls_register", {user: req.session.user_id});
});


app.post("/register", (req, res) => {
  const hashed_password = bcrypt.hashSync(req.body.password, 10);
  if (req.body.email === '' || hashed_password === '') {
    return res.status(400).render('error400');
  }
  for (var user in users) {
    if (users[user].email === req.body.email) {
      return res.status(400).render('error400');
    }
  }
  let randomID = generateRandomString();
  users[randomID] = {id: randomID,
    email: req.body.email,
    password: hashed_password
  };
  req.session.user_id = randomID;
  res.redirect("/urls");
});

app.get("/hello", (req, res) => {
  res.end("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});


