///////////////////////////////////////////////
////////// REQUIRE SECTION ////////////////////
//////////////////////////////////////////////

const express = require('express');
const methodOverride = require('method-override');
const { getUserByEmail,
  generateRandomString,
  checkIfEmailAndPasswordAreStrings,
  comparePasswords,
  urlsForUser
} = require("./helper");
const bcrypt = require("bcryptjs");
const cookieSession = require('cookie-session');

const app = express();


//////////////////////////////////////////
/////////////MIDDLE WARE /////////////////
/////////////////////////////////////////
app.use(methodOverride('_method'));

app.use(cookieSession({
  name: 'session',
  keys: ["mysecretkey"],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));


const PORT = 3000;

///////////////////////////////
////// FAKE DATABASE /////////
//////////////////////////////

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
const password1 = bcrypt.hashSync("1234", 10);
const password2 = bcrypt.hashSync("6789", 10);

//Mock data of actual users
const users = {
  123456 : {
    id: "123456",
    email: "user@example.com",
    password: password1,
    username: "userRandomID"
  },
  234567: {
    id: "234567",
    email: "user2@example.com",
    password: password2,
    username: 'user2RandomID'
  },
};



///////////////////////////////////////
//////////// ROUTING //////////////////
//////////////////////////////////////

app.get("/urls", (req, res)=>{

  const ID = req.session.user_id;
  
  if (ID === undefined) {
    res.send("<h1>Must be logged in</h1>");
    //res.redirect('/login');
  }
  
  const userUrls = urlsForUser(ID, urlDatabase);

  //cookie-parses needs it be installed to read req.cookies
  const templateVars = {
    urls: userUrls,
    user: users[ID] ? users[ID] : false
  };
  

  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res)=>{
  const ID = req.session.user_id;
  const templateVars = {
    user: users[ID] ? users[ID] : false
  };
  if (!ID) {
    res.redirect("/login");
  } else {
    res.render('urls_new', templateVars);
  }
  
});

app.get("/register", (req,res)=>{

  const ID = req.session.user_id;


  const templateVars = {
    user: users[ID] ? users[ID] : false
  };
  if (!ID) {
    res.render("url_registration", templateVars);
  } else {
    res.redirect("/urls");
  }
  
});


app.get("/login", (req,res)=>{

  const ID = req.session.user_id;

  const templateVars = {
    user: users[ID] ? users[ID] : false
  };

  

  if (!ID) {
    return res.render("url_login", templateVars);
  } else {
    return res.redirect("/urls");
  }
  
  
});


app.get("/urls/:id", (req, res)=>{

  const ID = req.session.user_id;

  //This if statment checks if user is logged in
  if (ID === undefined) {
    return res.send("<h1>Please sign in</h1>");
    //This else if checks if user has access to requested link
  } else if (urlDatabase[req.params.id].userID !== ID) {
    console.log("ID", ID);
    console.log(urlDatabase[req.params.id].userID);
    return res.send("<h1>You do not have permission</h1>");
  }

  const templateVars = {
    id: req.params.id,
    longUrl: urlDatabase[req.params.id].longUrl,
    user: users[ID] ? users[ID] : false
  };

  res.render("url_show", templateVars);
});

//redirects tiny linnk to full link
app.get("/u/:id", (req, res) => {
  
  for (let id in urlDatabase) {
    if (id === req.params.id) {
      const longUrl = urlDatabase[req.params.id].longUrl;

      res.redirect(`${longUrl}`);
    }
  }

  res.send("<h1>ID does not exist</h1>");

});


app.post("/urls", (req, res) => {

  const ID = req.session.user_id;
 
  if (!ID) {
    res.send("<h1>You Must Log In</h1>");
  } else {

    const shortUrl = generateRandomString(3);
  
    urlDatabase[shortUrl] = {};
    urlDatabase[shortUrl].longUrl = req.body.longUrl;
    urlDatabase[shortUrl].userID = req.session.user_id;
   
    res.redirect(`urls/${shortUrl}`);
  }
 
});

//handles delete action and removes link from database
app.delete("/urls/:id",(req,res)=>{
  //checks if the key exists
  if (!Object.keys(urlDatabase).find(key => key === req.params.id)) {
    res.send("<h1>Not a valid key</h1>");
  }

  const ID = req.session.user_id;
  //checks if user is logged
  if (ID === undefined) {
    res.send("<h1>Pleas log in</h1>");
  }
  //checks if user owns that ID
  if (ID !== urlDatabase[req.params.id].userID) {
    res.send("<h1>You do not have permission to delete this file</h1>");
  }

  delete urlDatabase[req.params.id];

  res.redirect('/urls');

});

//redefines long url, allows user to edit long url
app.put("/urls/:id", (req, res)=>{
  //checks if key exists
  if (!Object.keys(urlDatabase).find(key => key === req.params.id)) {
    res.send("<h1>Not a valid key</h1>");
  }
  const ID = req.session.user_id;
  //checks if user is logged in
  if (ID === undefined) {
    res.send("<h1>Pleas log in</h1>");
  }
  //check is user owns that ID
  if (ID !== urlDatabase[req.params.id].userID) {
    res.send("<h1>You do not have permission to edit this file</h1>");
  }

  urlDatabase[req.params.id].longUrl = req.body.longUrl;

  res.redirect('/urls');
});

app.post("/login", (req, res)=>{
// checks if input isn't blank
  if (!checkIfEmailAndPasswordAreStrings(req.body.email, req.body.password)) {
    res.status(403).send('Forbidden: Required username and password');

  }
  //if user email doesn't exist make them register
  if (!getUserByEmail(req.body.email, users)) {
    res.status(403).send("Register for an account");

  } else {

    const ID = getUserByEmail(req.body.email, users);
    
    //compares passwords
    if (!comparePasswords(req.body.password, users[ID].password)) {
      res.status(403).send("Incorrect password");
    } else {
      
      req.session.user_id = ID;

      res.redirect("/urls");
    }
  }

  
});

app.post("/logout", (req,res) =>{

  //this clears the browsers cookie data
  req.session = null;
  
  res.redirect("/login");
});

app.post("/register", (req, res)=>{
  
  if (!checkIfEmailAndPasswordAreStrings(req.body.email, req.body.password)) {
    res.status(400);
  }
  //checks if email exists already
  if (getUserByEmail(req.body.email, users)) {
    res.status(400);
  }

  const ID = generateRandomString(3);
  users[ID] = {};
  users[ID]["email"] = req.body.email;
  users[ID]['username'] = req.body.username;
  const encrytpedPassword = bcrypt.hashSync(req.body.password, 10);
  users[ID]["password"] = encrytpedPassword;
  users[ID]["id"] = ID;


  req.session.user_id = users[ID].id;
  res.redirect("/urls");
});

///////////////////////////
/////// START SERVER /////
//////////////////////////

app.listen(PORT, ()=>{
  console.log(`Express server listening on port ${PORT}`);
});