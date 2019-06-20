module.exports = (req, res, next) => {
    if (req.body.userScopeIsAdmin) {
        next();
    } else {
        res.status(200).json({ code: 401, status: "failed", message: "Sorry, Only admin's has access!" });
    }
};