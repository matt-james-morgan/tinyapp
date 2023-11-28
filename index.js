const express = require('express');
const crypto = require("crypto");
const cookieParser = require("cookie-parser");
const app = express();


app.use(cookieParser());

const PORT = 3000;

//Mock database of urls
const urlDatabase = {
  b6UTxQ: {
    longUrl: "https://www.tsn.ca",
    userID: "123456",
  },
  i3BoGr: {
    longUrl: "https://www.google.ca",
    userID: "123456",
  },
  i2CiG3: {
    longUrl: "https://www.facebook.com",
    userID: "346758",
  },
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

function urlsForUser(ID){
  const userUrls = {}

  for(let id in urlDatabase){
    if(urlDatabase[id].userID === ID){
      userUrls[id] = urlDatabase[id];
    }
  }

  return userUrls;
}

//uses ejs middlware
app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));


//this tell browser to render urls_index and we pass template vars to the file
app.get("/urls", (req, res)=>{
  const ID = req.cookies["user_id"];
  
  if(ID === undefined){
    res.send("<h1>Must be logged in</h1>")
     //res.redirect('/login');
  }
  
  const userUrls = urlsForUser(ID);

  //cookie-parses needs it be installed to read req.cookies
  const templateVars = {
    urls: userUrls,
    user: users[ID] ? users[ID] : false
  };
  

  res.render("urls_index", templateVars);
});

//loads page for a new URL

app.get("/urls/new", (req, res)=>{
  const ID = req.cookies["user_id"];
  const templateVars = {
    user: users[ID] ? users[ID] : false
  };
  if(!ID){
    res.redirect("/login")
  }else{
    res.render('urls_new', templateVars);
  }
  
});

//loads register pages
app.get("/register", (req,res)=>{

  const ID = req.cookies["user_id"];


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

  //This if statment checks if user is logged in
  if(ID === undefined){
    res.send("<h1>Please sign in</h1>");
    //This else if checks if user has access to requested link
  }else if(urlDatabase[req.params.id].userID !== ID){
    res.send("<h1>You do not have permission</h1>");
  }
  const templateVars = {
    id: req.params.id, 
    longUrl: urlDatabase[req.params.id].longUrl,
    user: users[ID] ? users[ID] : false
  };

  res.render("url_show", templateVars);
});

app.get("/u/:id", (req, res) => {

  for(let id in urlDatabase){
    if(id === req.params.id){
      const longUrl = urlDatabase[req.params.id].longUrl;

      res.redirect(`${longUrl}`);
    }
  }

  res.send("<h1>ID does not exist</h1>");

});


app.post("/urls", (req, res) => {

  const ID = req.cookies["user_id"];

  if(!ID){
    res.send("<h1>You Must Log In</h1>");
  }else{
    const shortUrl = generateRandomString(3);
  
    urlDatabase[shortUrl] = req.body.longUrl;
  
    res.redirect(`urls/${shortUrl}`); 
  }
 
});

//handles delete action and removes link from database
app.post("/urls/:id/delete",(req,res)=>{
  //checks if the key exists
  if(!Object.keys(urlDatabase).find(key => key === req.params.id)){
    res.send("<h1>Not a valid key</h1>");
  }

  const ID = req.cookies["user_id"];
  //checks if user is logged
  if(ID === undefined){
    res.send("<h1>Pleas log in</h1>");
  }
  //checks if user owns that ID
  if(ID !== urlDatabase[req.params.id].userID){
    res.send("<h1>You do not have permission to delete this file</h1>");
  }

  delete urlDatabase[req.params.id];

  res.redirect('/urls');

});

//redefines long url, allows user to edit long url
app.post("/urls/:id/edit", (req, res)=>{
  //checks if key exists
  if(!Object.keys(urlDatabase).find(key => key === req.params.id)){
    res.send("<h1>Not a valid key</h1>");
  }
  const ID = req.cookies["user_id"];
  //checks if user is logged in
  if(ID === undefined){
    res.send("<h1>Pleas log in</h1>");
  }
  //check is user owns that ID
  if(ID !== urlDatabase[req.params.id].userID){
    res.send("<h1>You do not have permission to edit this file</h1>");
  }

  urlDatabase[req.params.id].longUrl = req.body.longUrl;

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