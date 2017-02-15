const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080;
app.set("view engine", "ejs")
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));


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



var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};


//urls

app.get("/urls", (req, res) => {
  let templateVars = {urls: urlDatabase};
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
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


//urls/new
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});


///urls/:id

app.get("/urls/:id", (req, res) => {
  let templateVars = { shortURL: req.params.id,
    urls:urlDatabase
   };
  res.render("urls_show", templateVars);
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





app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.post("/urls/:id/delete", (req,res) => {
  delete urlDatabase[req.params.id];
  res.redirect("http://localhost:8080/urls/")
});


app.get("/", (req, res) => {
  res.end("Hello!\n");
});



app.get("/hello", (req, res) => {
  res.end("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});

