//this returns true if email is already a registered user
function getUserByEmail (email, users){
  
   for(let userID in users){
    if(users[userID].email === email){
      return userID;
    }
   }
  return undefined;
};

//generates random hexidecimal code, you have to enter half of the digits you want
function generateRandomString(num) {
  return crypto.randomBytes(num).toString('hex');
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
  return bcrypt.compareSync(inputPassword, userPassword);
}

function urlsForUser(ID, urlDatabase){
  const userUrls = {}

  for(let id in urlDatabase){
    if(urlDatabase[id].userID === ID){
      userUrls[id] = urlDatabase[id];
    }
  }

  return userUrls;
}

module.exports = { getUserByEmail,
  generateRandomString,
  checkIfEmailAndPasswordAreStrings,
  comparePasswords,
  urlsForUser
 }