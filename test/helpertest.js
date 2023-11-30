const { assert } = require('chai');

const { getUserByEmail } = require('../helper');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers)
    const expectedUserID = "userRandomID";
    assert.deepEqual(user,expectedUserID, "user ids match");
  });
  it('should return undefined if it can not find user', function() {
    const user = getUserByEmail("fakeuser@example.com", testUsers)
    const expectedUserID = undefined;
    assert.deepEqual(user,expectedUserID, "comes back undefined");
  });
});