export default (req, res, next) => {
  req.userScope = {...req.body}
  next()
}