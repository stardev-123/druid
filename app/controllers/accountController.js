const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const md5 = require('md5');
const db = require('../db');
const mailer = require('../mailer');

exports.updateProfile = async (req, res) => {
  const { firstName, lastName, emailAddress } = req.body;
  await db.none('UPDATE users SET first_name = $1, last_name = $2, email_address = $3 WHERE id = $4', [firstName, lastName, emailAddress, req.session.user.id]);
  req.session.user.first_name = firstName;
  req.session.user.last_name = lastName;
  req.session.user.email_address = emailAddress;
  res.json({ success: true });
};

exports.updatePassword = async (req, res) => {
  const { password } = req.body;
  await db.none('UPDATE users SET password = $1 WHERE id=$2', [password, req.session.user.id]);
  res.json({ success: true });
};

exports.saveCard = async (req, res) => {
  const { stripeToken, billingCardLast4, billingCardExpMonth, billingCardExpYear } = req.body;
  const cardExpDate = `${billingCardExpMonth}/${billingCardExpYear}`.padStart(7, '0');
  await db.none('UPDATE users SET card_number = $1, card_exp = $2, token = $3 WHERE id=$4', [billingCardLast4, cardExpDate, stripeToken, req.session.user.id]);
  req.session.user.card_number = billingCardLast4;
  req.session.user.card_exp = cardExpDate;
  res.json({ success: true });
};

exports.removeCard = async (req, res) => {
  await db.none('UPDATE users SET card_number = $1 WHERE id = $2', ['', req.session.user.id]);
  req.session.user.card_number = '';
  req.session.user.card_created = '';
  res.json({ success: true });
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  const user = await db.oneOrNone('SELECT first_name, last_name FROM users WHERE email_address = $1', [email]);
  if (!user) {
    return res.json({ success: false, message: 'You are not a registered user.' });
  }
  const hashemail = md5(email);
  const token = jwt.sign({
    date: Date.now(),
    reqEmail: email,
  }, 'secret');
  await db.none('UPDATE users SET password_reset_token=$1, password_reset_token_expiresat=$2+$3 WHERE email_address=$4',
    [token, Date.now(), process.env.passwordResetTokenTTL, email]);
  await mailer.send({
    from: process.env.INVITE_SEND_EMAIL || 'no-reply@druid.app',
    to: email,
    subject: 'Password reset instructions',
    text: `Dear,${user.first_name} ${user.last_name}

Someone requested a password reset for your account. If this was not you, please disregard this email. 
Otherwise, simply click the Link below:
${process.env.SERVERHOST || 'localhost:3000'}/password/new/${token}/${hashemail}

  Sincerely.
  DRUID Management Team`,
  }).catch(err => {
    console.error('Issue sending mail verify:', err);
    return res.json({ success: false, message: 'An error occurred during the mail verify.' });
  });
  return res.json({ success: true });
};

exports.passwordNewVerify = async (req, res) => {
  const { token, hashemail } = req.params;
  const user = await db.oneOrNone('SELECT password_reset_token_expiresat, email_address FROM users WHERE password_reset_token=$1', [token]);
  if (!user || user.password_reset_token_expiresat <= Date.now()
      || md5(user.email_address) !== hashemail) {
    return res.json('It is incorrect the information');
  }
  req.session.token = token;
  return res.redirect('/new/password');
};

exports.newPassword = async (req, res) => {
  const { password } = req.body;
  const user = await db.one('SELECT password_reset_token_expiresat, email_address FROM users WHERE password_reset_token=$1', [req.session.token]);
  if (!user) {
    return res.json({ success: false });
  }
  if (user.password_reset_token_expiresat <= Date.now()) {
    return res.json({ success: false, message: 'It is invalidToken' });
  }
  const hashPassword = bcrypt.hashSync(password, 10);
  await db.none('UPDATE users SET password=$1, password_reset_token_expiresat=\'\', password_reset_token=\'\' WHERE email_address=$2',
    [hashPassword, user.email_address]);
  req.session.token = '';
  return res.json({ success: true, message: 'It was kept exactly.' });
};
