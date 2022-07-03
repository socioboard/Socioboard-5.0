db.createUser(
  {
    user: "scbadmin",
    pwd: "7gFAbhejodamBAC3pkKLFYEI1CeFLR5xH0xe2Oavd6AjrpsX4BhlcidJFGuVJatM",
    roles: [ { role: "readWrite", db: "scbmongo" } ]
  }
)
exit