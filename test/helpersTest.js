const { assert } = require('chai');

const { getUserByEmail, urlsForUser, validUser } = require('../helpers.js');

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

const testDatabase = {
  'b2xVn2': { longURL: 'http://lighthouselabs.ca', userID: 'userRandomID' },
  '9sm5xK': { longURL: 'http://www.google.com', userID: 'user2RandomID' }
};

describe('getUserByEmail', function () {
  it('should return a user with valid email', function () {
    const user = getUserByEmail("user@example.com", testUsers)
    const expectedOutput = "userRandomID";
    assert.equal(user.id, expectedOutput);
  });
  it('should return a false for incorrect email', () => {
    const user = getUserByEmail("random@email.com", testUsers)
    const expectedOutput = false;
    assert.equal(user, false);
  })
  it('should return a false for empty string', () => {
    const user = getUserByEmail("", testUsers)
    const expectedOutput = false;
    assert.equal(user, false);
  })
  it('should return a false for null', () => {
    const user = getUserByEmail(null, testUsers)
    const expectedOutput = false;
    assert.equal(user, false);
  })
});

describe('urlsForUser', () => {
  it('Should return http://lighthouselabs.ca for userRandomID', () => {
    const actual = urlsForUser('userRandomID', testDatabase);
    const expected = { b2xVn2: 'http://lighthouselabs.ca' };
    assert.deepEqual(actual, expected);
  });
  it('Should return nothing for randomOutsiderID', () => {
    const actual = urlsForUser('userRandomID', testDatabase);
    const expected = { b2xVn2: 'http://lighthouselabs.ca' };
    assert.deepEqual(actual, expected);
  });
  it('Should return nothing for userId that doesn\'t match user2RandomID', () => {
    const actual = urlsForUser('userRandomID', testDatabase);
    const expected = { b2xVn2: 'http://lighthouselabs.ca' };
    assert.deepEqual(actual, expected);
  });
});
describe('validUser', () => {
  it('returns true for randomUserID for randomUserID', () => {
    const actual = validUser('randomUserID', 'randomUserID');
    const expected = true;
    assert.equal(actual, expected);
  });
  it('returns false for userID for randomUserID', () => {
    const actual = validUser('userID', 'randomUserID');
    const expected = false;
    assert.equal(actual, expected);
  });
  it('returns false for empty string for randomUserID', () => {
    const actual = validUser('', 'randomUserID');
    const expected = false;
    assert.equal(actual, expected);
  });
  it('returns true for empty string for empty string', () => {
    const actual = validUser('', '');
    const expected = true;
    assert.equal(actual, expected);
  });
});