const express = require('express');
const crypto = require("crypto");
const cookieParser = require("cookie-parser");
const app = express();


app.use(cookieParser());

const PORT = 3000;

//Mock database of urls
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

//Mock data of actual users
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

//generates random hexidecimal code, you have to enter half of the digits you want
function generateRandomString(num) {
  return crypto.randomBytes(num).toString('hex');
}

//this returns true if email is already a registered user
function getUserByEmail (email){
  return Object.values(users).some(user => user.email === email);
};

//returns ID of submitted email
function returnUserIDbyEmail (email){
  return Object.keys(users).find(ID => {
    if(users[ID].email === email){
    return ID;
    }
  })
}

//this functions makes sure that the user hasn't left blank inputs
function checkIfEmailAndPasswordAreStrings (email, password){
  if(email === "" || password === ""){
    return false
  }
  return true;
}

//takes in two passwords and returns true if they match
function comparePasswords(inputPassword, userPassword){
  if(inputPassword === userPassword){
    return true;
  }
  return false;
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

//loads page for a new URL

app.get("/urls/new", (req, res)=>{
  const ID = req.cookies["user_id"];
  const templateVars = {
    user: users[ID] ? users[ID] : false
  };
  res.render('urls_new', templateVars);
});

//loads register pages
app.get("/register", (req,res)=>{

  const ID = req.cookies["user_id"];

  console.log(ID);
  const templateVars = {
    user: users[ID] ? users[ID] : false
  }
  if(!ID){
    res.render("url_registration", templateVars);
  }else{
    res.redirect("/urls")
  }
  
});


app.get("/login", (req,res)=>{

  const ID = req.cookies["user_id"];

  const templateVars = {
    user: users[ID] ? users[ID] : false
  }

  if(!ID){
    res.render("url_login", templateVars);
  }else{
    res.redirect("/urls");
  }
  
  
})

//gets specific page for url based on id of link
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

//handles delete action and removes link from database
app.post("/urls/:id/delete",(req,res)=>{
  
  delete urlDatabase[req.params.id];

  res.redirect('/urls');

});

//redefines long url, allows user to edit long url
app.post("/urls/:id/edit", (req, res)=>{
  
  urlDatabase[req.params.id] = req.body.longUrl;
  res.redirect('/urls');
});

app.post("/login", (req, res)=>{
// checks if input isn't blank
  if(!checkIfEmailAndPasswordAreStrings(req.body.email, req.body.password)){
    res.status(403).send('Forbidden: Required username and password');

  }
  //if user email doesn't exist make them register
  if(!getUserByEmail(req.body.email)){
    res.status(403).send("Register for an account");
  }else{

    const ID = returnUserIDbyEmail(req.body.email);
   //compares passwords
    if(!comparePasswords(req.body.password, users[ID].password)){
      res.status(403).send("Incorrect password");
    }else{
      res.cookie("user_id", ID);
      res.redirect("/urls");
    }
  }

  
});

app.post("/logout", (req,res) =>{

  //this clears the browsers cookie data
  res.clearCookie("user_id");
  res.redirect("/login");
});

app.post("/register", (req, res)=>{

  
  
  if(!checkIfEmailAndPasswordAreStrings(req.body.email, req.body.password)){
    res.status(400);
  }
  //checks if email exists already
  if(getUserByEmail(req.body.email)){
    res.status(400);
  }

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