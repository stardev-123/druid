exports.index = (req, res) => {
  if (req.session.user && req.session.user.id) {
    return res.redirect('/users');
  }
  return res.render('index');
};
