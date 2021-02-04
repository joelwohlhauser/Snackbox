const passport = require('passport')
const queries = require('./queries')
const sha256 = require('js-sha256')
const jwt = require('jsonwebtoken')
const request = require('request')

const serverSecret = 'S:DKLFjlfjwlur32.fJASLDkjq/1qqwaspb,3x.tn2jlfjsda';

const generateJWT = (user) => {
  const expiry = new Date()
  expiry.setDate(expiry.getDate() + 1)
  return jwt.sign({
    username: user.username,
    password: user.password,
    exp: Math.round(expiry.getTime() / 1000)
  }, serverSecret);
}

const register = async (req, res) => {
  if (!req.body.username || !req.body.password || !req.body.phonenumber) {
    res.status(400).json({ message: 'All fields required!' })
    return
  }

  const existingUser = await queries.getUser(req.body.username)

  if (existingUser) {
    res.status(409).json({ resource: `${req.body.username} exists already` })
    return
  }

  const user = {
    username: req.body.username,
    password: sha256(req.body.password),
    phonenumber: req.body.phonenumber
  }

  await queries.createUser(user);
  const token = await generateJWT(user)
  res.status(200).json({ token })
}

const login = (req, res) => {
  if (!req.body.username || !req.body.password) {
    res.status(400).json({ message: 'All fields required!' })
    return
  }

  passport.authenticate('local', { failureRedirect: '/login', session: false }, async (err, user, info) => {
    if (err) {
      console.log('err :', err)
      res.status(404).json(err)
      return
    }
    if (user) {
      const token = await generateJWT(user.username)
      res.status(200).json({ token })
    }
  })(req, res);
}

const sendSMSToken = async (req, res) => {
  const user = await queries.getUser(req.body.username)
  if (!user) {
    // user not found
    res.status(404).json('User not found')
    return
  }
  const payload = {
    "mobileNumber": user.phonenumber,
    "message": `Use the code ${req.body.token} to authenticate with Snackbox.`
  };

  request({
    uri: '   SMS Token API url    ',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Api-Key': '   SMS Token API key   ',
    },
    body: JSON.stringify(payload),
  }, (error, response) => {
    if (error) {
      res.status(400).json('Error with SMS API')
      return
    }
    res.status(200).json({ response })
  });
}


const checkJwt = async (sentUsername, sentJwt) => {
  var user = await queries.getUser(sentUsername);
  if (user === undefined) {
    return false;
  }

  try {
    var decodedPayload = jwt.verify(sentJwt, serverSecret);
    return true;
  } catch (err) {
    console.log(err);
    console.log("request: invalid token: " + sentUsername + "/" + sentJwt);
    return false;
  }
}

const googleLogin = async (req, res) => {
  try {
    let user = await queries.getUser(req.body.username)
    if (!user) {
      user = {
        username: req.body.username,
        email: req.body.email
      }
      await queries.createGoogleUser(user)
    }
    const token = await generateJWT(user.username)
    res.status(200).json({ token })
  } catch (error) {
    res.status(400).json({ error })
    return
  }

}

module.exports = {
  login,
  register,
  sendSMSToken,
  checkJwt,
  generateJWT,
  googleLogin
}