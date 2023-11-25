const express = require('express');
const crypto = require("crypto")
const app = express();
const PORT = 3000;


const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
}

function generateRandomString(num) {
  return crypto.randomBytes(num).toString('hex');
  
}

//uses ejs middlware
app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));




//this tell browser to render urls_index and we pass template vars to the file
app.get("/urls", (req, res)=>{
  const templateVars = {urls: urlDatabase};
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res)=>{
  res.render('urls_new');
})
app.get("/urls/:id", (req, res)=>{
 
  const templateVars = {id: req.params.id, longUrl: urlDatabase[req.params.id]}
  res.render("url_show", templateVars);
})

app.get("/u/:id", (req, res) => {
  const longUrl = urlDatabase[req.params.id];
  res.redirect(`${longUrl}`)
});

app.post("/urls", (req, res) => {
  const shortUrl = generateRandomString(3);
  
  urlDatabase[shortUrl] = req.body.longUrl;
  console.log(req.body); // Log the POST request body to the console
  res.redirect(`urls/${shortUrl}`); // Respond with 'Ok' (we will replace this)
});

app.post("/urls/:id/delete",(req,res)=>{
  
  delete urlDatabase[req.params.id];

  res.redirect('/urls')

})

app.post("/urls/:id/edit", (req, res)=>{
  console.log(req.body);
  urlDatabase[req.params.id] = req.body.longUrl;
  res.redirect('/urls')
})

app.post("/login", (req,res)=>{
  res.cookie("username", req.body.username);
  res.redirect("/urls");
})
app.listen(PORT, ()=>{
  console.log(`Express server listening on port ${PORT}`)
})