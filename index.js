const express = require('express');
const app = express();
const PORT = 3000;


const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
}

//uses ejs middlware
app.set("view engine", "ejs");

//Prints hello when visiting homepage
app.get("/", (req,res)=>{
  res.send("Hello");
})

app.get("/urls.json", (req, res)=>{
  res.json(urlDatabase);
});

//this tell browser to render urls_index and we pass template vars to the file
app.get("/urls", (req, res)=>{
  const templateVars = {urls: urlDatabase};
  res.render("urls_index", templateVars);
})

app.get("/urls/:id", (req, res)=>{
 
  const templateVars = {id: req.params.id, longUrl: urlDatabase[req.params.id]}
  res.render("url_show", templateVars);
})

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, ()=>{
  console.log(`Express server listening on port ${PORT}`)
})