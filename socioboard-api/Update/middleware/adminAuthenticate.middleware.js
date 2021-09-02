export default (req, res, next) => {
  /* #swagger.ignore = true */
  req.body.userScopeIsAdmin ? next() : res.status(200).json({ code: 401, status: 'failed', message: "Sorry, Only admin's has access!" });
};
