const db = require('../db');

exports.getUser = async params => {
  try {
    const result = await db.none('SELECT * FROM users WHERE email = $1 AND password = $2', [params.email, params.password]);
    if (typeof (result) !== 'undefined') {
      return true;
    }
    return false;
  } catch (e) {
    return e.message;
  }
};
