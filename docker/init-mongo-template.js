db.createUser(
  {
    user: "USER_REF",
    pwd: "PASS_REF",
    roles: [ { role: "readWrite", db: "DB_REF" } ]
  }
)
exit