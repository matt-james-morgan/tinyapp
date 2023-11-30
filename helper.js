//this returns true if email is already a registered user
function getUserByEmail (email, users){
  
   for(let userID in users){
    if(users[userID].email === email){
      return userID;
    }
   }
  return undefined;
};

module.exports = { getUserByEmail }