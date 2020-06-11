// Checks to see if the email provided is in the database already
// Return the object in the databaser if true
// Return false otherwise
const getUserByEmail = (email, database) => {
  for (const user in database) {
    if (database[user].email === email) {
      return database[user];
    }
  }
  return false;
}

const urlsForUser = (id, database) => {
  const validURL = {};
  for (const url in database) {
    if (database[url].userID === id) {
      validURL[url] = database[url].longURL;
    }
  }
  return validURL;
};

const validUser = (currentID, posterID) => {
  return currentID === posterID;
};

module.exports.getUserByEmail = getUserByEmail;
module.exports.urlsForUser = urlsForUser;
module.exports.validUser = validUser;