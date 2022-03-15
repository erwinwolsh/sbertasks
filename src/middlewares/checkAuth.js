// eslint-disable-next-line no-undef
const { sessions } = require ('../../sessions')

const checkAuth = (req, res, next) => {
  const sidFromUser = req.cookies.sid

  if (sessions[sidFromUser]) {
    return next()
  }

  return res.redirect('/auth/signin')
}

module.exports = {
  checkAuth,
}

