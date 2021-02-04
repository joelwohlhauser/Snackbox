const passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy
const queries = require('../services/queries')

passport.use(new LocalStrategy(
  async function (username, password, done) {
    // find user
    const user = await queries.getUser(username);

    if (!user) {
      return done(null, false, { message: 'Incorrect username.' })
    }
    if (!user.validPassword(password)) {
      return done(null, false, { message: 'Incorrect password.' })
    }
    return done(null, user);
  }
))
