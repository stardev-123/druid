const Router = require('express-promise-router');
const passport = require('passport');

const Home = require('./controllers/homeController');
const User = require('./controllers/userController');
const Account = require('./controllers/accountController');

const router = new Router();

router.get('/', Home.index);
router.get('/login', (_req, res) => res.render('login'));

router.get('/signup', (_req, res) => res.render('signup'));
router.get('/signup/:token', User.inviteVerify);
router.get('/users', (req, res) => {
  if (req.session.user) {
    return res.render('user_list', { user: req.session.user });
  }
  return res.redirect('/login');
});

router.get('/account', (req, res) => {
  if (req.session.user) {
    return res.render('account/overview', { user: req.session.user });
  }
  return res.redirect('/login');
});

router.get('/account/profile', (req, res) => {
  if (req.session.user) {
    return res.render('account/edit_profile', { user: req.session.user });
  }
  return res.redirect('/login');
});

router.get('/account/password', (req, res) => {
  if (req.session.user.id) {
    return res.render('account/edit_password', { user: req.session.user });
  }
  return res.redirect('/login');
});

router.get('/logout', (req, res) => {
  delete req.session.user;
  res.redirect('/');
});

router.get('/reports', (req, res) => {
  const d = new Date();
  if (req.session.user) {
    return res.render('report', { user: req.session.user, month: d.getMonth(), year: d.getFullYear() });
  }
  return res.redirect('/login');
});

router.get('/api/v1/enroll/ent/:entId/members/:mbrId/tests/:execId/start', (req, res) => {
  res.status(200).json({ success: true });
});

router.get('/terms', (_req, res) => res.render('terms'));
router.get('/password/forgot', (_req, res) => res.render('forgot-password'));
router.get('/password/new/:token/:hashemail', Account.passwordNewVerify);
router.get('/new/password', (req, res) => { res.render('new-password'); });


router.post('/login', (req, res, next) => passport.authenticate('local', { session: false }, (err, passportUser, info) => {
  if (err) {
    return next(err);
  }
  if (!passportUser && err === null) {
    return res.json({ success: false, error: info });
  }
  if (passportUser) {
    if (req.body.remember === 'on') {
      req.session.cookie.maxAge = 2628000000;
    }
    req.session.user = passportUser;
    return res.status(200).json({ user: passportUser, success: true });
  }
  return res.status(400).info;
})(req, res, next));

router.post('/signup', User.signUp);
router.post('/datatable/user', User.getUserListAPI);
router.post('/user/detail', User.getUserInfo);
router.post('/user/save', User.updateUserInfo);
router.post('/user/suspend', User.suspendUser);
router.post('/invite', User.inviteUser);
router.post('/account/update-profile', Account.updateProfile);
router.post('/account/update-password', Account.updatePassword);
router.post('/saveCard', Account.saveCard);
router.post('/removeCard', Account.removeCard);
router.post('/reportData', User.getReportData);
router.post('/account/forgot-password', Account.forgotPassword);
router.post('/account/new-password', Account.newPassword);

router.post('/api/v1/enroll/ent/:entId/members/:mbrId/tests/:execId/start', (req, res) => {
  res.status(200).json({ success: true });
});
module.exports = router;
