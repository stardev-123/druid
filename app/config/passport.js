const passport = require('passport');
const bcrypt = require('bcrypt');
const LocalStrategy = require('passport-local');

const db = require('../db');


passport.use(new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password',
},
(async (email, password, done) => {
  const user = await db.oneOrNone('SELECT id, email_address, first_name, last_name, password, card_number, card_exp, role FROM users WHERE email_address = $1', [email]);
  if (!user) {
    return done(null, false, { message: 'Incorrect username.' });
  }
  const matches = await bcrypt.compare(password, user.password).catch(_err => done(null, false, { message: 'You must register' }));

  if (!matches) {
    return done(null, false, { message: 'Password is incorrect.' });
  }
  return done(null, user);
})));

module.exports = passport;
