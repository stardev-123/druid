const bcrypt = require('bcrypt');
const md5 = require('md5');
const { v4: uuid } = require('uuid');
const db = require('../db');
const mailer = require('../mailer');

exports.signUp = async (req, res) => {
  const { firstName, lastName, email, password, confirmPassword } = req.body;
  const erros = [];

  if (!firstName || !lastName || !email || !password || !confirmPassword) {
    erros.push({ message: 'Please enter all fields' });
  }

  if (password.length < 6) {
    erros.push({ message: 'Password should be at least 6 characters' });
  }

  if (password !== confirmPassword) {
    erros.push({ message: 'Passwords do not match' });
  }

  if (erros.length > 0) {
    return res.json({ success: false, data: erros });
  }

  const hashPassword = bcrypt.hashSync(password, 10);
  const user = await db.oneOrNone('SELECT status FROM users WHERE email_address = $1', [email]);
  if (user) {
    if (user.status !== 3) {
      erros.push({ message: 'User already registered.' });
      return res.json({ success: false, data: erros });
    }
    await db.none('UPDATE users SET first_name = $1, last_name = $2, password = $3, created_at = now(), status = 0 WHERE email_address = $4',
      [firstName, lastName, hashPassword, email]);
    return res.redirect('/login');
  }
  await db.none(`INSERT INTO users(first_name, last_name, email_address, password, role, created_at)
      VALUES ($1, $2, $3, $4, 'admin', NOW())`, [firstName, lastName, email, hashPassword]);
  return res.redirect('/login');
};

exports.getUserListAPI = async (req, res) => {
  const resData = await db.manyOrNone('SELECT id, first_name, last_name, created_at, status, email_address, updated_at FROM users');
  resData.forEach((value, index) => {
    resData[index].token = uuid();
  });
  return res.json({ data: resData });
};

exports.getUserInfo = async (req, res) => {
  const { id } = req.body;
  const user = await db.oneOrNone('SELECT email_address, first_name, last_name, status FROM users WHERE id = $1', [id]);
  if (!user) return res.status(404).json({ success: false });
  return res.json({ user });
};

exports.updateUserInfo = async (req, res) => {
  const { id, firstName, lastName, email, status } = req.body;

  if (id || email || status) {
    await db.none('UPDATE users SET email_address=$1, status = $2,first_name = $3, last_name = $4, updated_at = NOW() WHERE id=$5',
      [email, status, firstName, lastName, id]).catch(err => {
      console.error(err);
      return res.status(500).json({ success: false });
    });
    return res.json({ success: true });
  }
  return res.status(422);
};

exports.suspendUser = async (req, res) => {
  const { id } = req.body;
  if (id) {
    await db.none('UPDATE users SET status = 2, updated_at = NOW() WHERE id=$1', [id]).catch(err => {
      console.error(err);
      return res.status(500).json({ success: false });
    });
  }
  return res.json({ success: true });
};

exports.inviteUser = async (req, res) => {
  const { email } = req.body;
  const hashemail = md5(email);
  const data = await db.oneOrNone('SELECT email_address FROM users WHERE email_address = $1', [email]);
  if (data) {
    return res.json({ success: false, message: 'The account registered already.' });
  }
  await mailer.send({
    from: process.env.INVITE_SEND_EMAIL || 'no-reply@druid.app',
    to: email,
    subject: `${req.session.user.first_name} ${req.session.user.last_name} has invited you to join Druid`,
    text: `Hello,

${req.session.user.first_name} ${req.session.user.last_name} has invited you to sign up for Druid.
Please visit ${process.env.SERVERHOST || 'localhost:3000'}/signup/${hashemail}

  Thank you.
  DRUID Management Team`,
  }).catch(err => {
    console.error('Issue sending mail invite:', err);
    return res.json({ success: false, message: 'An error occurred during the mail invite.' });
  });

  await db.none('INSERT INTO users(email_address, status, invited_at) VALUES ($1, $2, NOW())', [email, 3]);
  return res.json({ success: true });
};

exports.inviteVerify = async (req, res) => {
  const { token } = req.params;
  const users = await db.any('SELECT * FROM users WHERE status = 3').catch(err => {
    console.error(err);
    return res.status(500).json({ success: false });
  });
  if (!users) return res.status(404).json({ success: false });
  const user = users.find(u => token === md5(u.email));
  if (user) {
    return res.render('signup', { email: user.email });
  }
  return res.status(422).json({ success: false });
};

exports.getReportData = async (req, res) => {
  let { year, month } = req.body;
  const d = new Date();

  if (!year || !month) {
    year = d.getFullYear();
    month = d.getMonth();
  }

  const startDate = new Date(year, month, 1);
  const endDate = new Date(year, month + 1, 0);
  const datas = await db.manyOrNone('SELECT people_data::JSON, people_id, created_at FROM druid_data WHERE "mode" != \'BASELINE\' AND created_at BETWEEN $[startDate] AND $[endDate] ORDER BY people_id, created_at', { startDate, endDate });
  const resData = {};
  const dayData = [];
  datas.forEach(data => {
    try {
      const datai = data.people_data;
      const peopleID = data.people_id;
      resData[peopleID] = resData[peopleID] || [];
      const date = new Date(data.created_at);
      const day = date.getDate();
      if (resData[peopleID][day - 1]) {
        resData[peopleID][day - 1].score += Number(datai.totalScore);
        resData[peopleID][day - 1].count += 1;
      } else {
        resData[peopleID][day - 1] = {
          score: Number(datai.totalScore),
          day,
          count: 1,
        };
      }
    } catch (e) {
      console.log(e);
    }
  });

  Object.keys(resData).forEach(index => {
    Object.keys(resData[index]).forEach(ind => {
      if (resData[index][ind]) {
        resData[index][ind] = resData[index][ind].score / resData[index][ind].count;
      }
    });
  });

  const daysOfMonth = new Date(year, month, 0).getDate();
  for (let i = 1; i <= daysOfMonth; i += 1) {
    dayData.push(i);
  }

  res.json({
    success: true,
    data: resData,
    allDay: dayData,
    resYear: year,
    resMonth: Number(month),
  });
};
