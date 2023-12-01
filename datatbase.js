const bcrypt = require("bcryptjs");


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

module.exports = {
  users,
  urlDatabase
}