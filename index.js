const express = require('express');
const crypto = require("crypto");
const cookieParser = require("cookie-parser");
const app = express();

app.use(cookieParser());

const PORT = 3000;


const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  123456 : {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  234567: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

function generateRandomString(num) {
  return crypto.randomBytes(num).toString('hex');
  
}

//uses ejs middlware
app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));


//this tell browser to render urls_index and we pass template vars to the file
app.get("/urls", (req, res)=>{
  const ID = req.cookies["user_id"];
  //cookie-parses needs ot be installed to read req.cookies
  const templateVars = {
    urls: urlDatabase,
    user: users[ID] ? users[ID] : false
  };
  console.log(templateVars.user)
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res)=>{
  const ID = req.cookies["user_id"];
  const templateVars = {
    user: users[ID] ? users[ID] : false
  };
  res.render('urls_new', templateVars);
});

app.get("/urls/register", (req,res)=>{
  const ID = req.cookies["user_id"];

  const templateVars = {
    user: users[ID] ? users[ID] : false
  }
  
  res.render("url_registration", templateVars);
})


app.get("/urls/:id", (req, res)=>{
  const ID = req.cookies["user_id"];
  const templateVars = {
    id: req.params.id, 
    longUrl: urlDatabase[req.params.id],
    user: users[ID] ? users[ID] : false
  };

  res.render("url_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  const longUrl = urlDatabase[req.params.id];
  res.redirect(`${longUrl}`);
});


app.post("/urls", (req, res) => {
  const shortUrl = generateRandomString(3);
  
  urlDatabase[shortUrl] = req.body.longUrl;

  res.redirect(`urls/${shortUrl}`); // Respond with 'Ok' (we will replace this)
});

app.post("/urls/:id/delete",(req,res)=>{
  
  delete urlDatabase[req.params.id];

  res.redirect('/urls');

});

app.post("/urls/:id/edit", (req, res)=>{
  
  urlDatabase[req.params.id] = req.body.longUrl;
  res.redirect('/urls');
});

app.post("/login", (req,res)=>{
  res.cookie("username", req.body.username);
  res.redirect("/urls");
});

app.post("/logout", (req,res) =>{

  //this clears the browsers cookie data
  res.clearCookie("user_id");
  res.redirect("/urls");
});

app.post("/register", (req, res)=>{
  const ID = generateRandomString(3);
  users[ID] = {};
  users[ID]["email"] = req.body.email;
  users[ID]["password"] = req.body.password;
  users[ID]["id"] = ID;


  res.cookie("user_id", users[ID].id);
  res.redirect("/urls");
})


app.listen(PORT, ()=>{
  console.log(`Express server listening on port ${PORT}`);
});