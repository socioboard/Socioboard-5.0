class TwitterHelpers {
  getFromQuery(req) {
    const { accountId, teamId } =  req.query;
  
    return  { accountId, teamId };
  }
  
  getFromBody(req) {
    const { accountId, teamId } =  req.body;
  
    return  { accountId, teamId };
  }
}

export default new TwitterHelpers();
