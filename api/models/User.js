const sha256 = require('js-sha256')

class User {
  constructor(username, password, isadmin, phonenumber) {
    this.username = username;
    this.password = password;
    this.isadmin = isadmin;
    this.phonenumber = phonenumber;
  }

  validPassword(password) {
    return sha256(password) === this.password;
  }
}
module.exports = User;