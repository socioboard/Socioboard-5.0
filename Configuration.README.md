# How To Configure SocioBoard
## The Config Files:
The following refers to the `development.json` file in:

- `socioboard-api/User/config/`
- `socioboard-api/Update/config/`
- `socioboard-api/Feeds/config/`
- `socioboard-api/Notification/config/`
- `socioboard-api/Publish/config/`

OR

The `.env` file, if you're using Docker.

### API Detials:
The Twilio API is required for the user API(registration, login etc.) to work. Fill correct details.

Twilio `Account SID` and `Auth Key` can be found in the API Keys section. To get a `Service ID` you will need to go the `Twilio Console` click on `Verify`, then `Services` and create a SocioBoard service.

In order to use facebook functionality(i.e. schedule a post to facebook) we will need to fill in facebook API details. The same goes for all other supported social networks. Here are some links to get you started with each API:

- Twilio: https://www.twilio.com/try-twilio
- Facebook: https://developers.facebook.com/docs/development/register
- Google: https://console.cloud.google.com/apis
- GitHub: https://docs.github.com/en/developers/apps/building-github-apps/creating-a-github-app
- Twitter: https://developer.twitter.com/en/docs/twitter-api/getting-started/getting-access-to-the-twitter-api
- LinkedIn: https://docs.microsoft.com/en-us/linkedin/shared/authentication/getting-access?view=li-lms-2022-06
- Instagram: https://developers.facebook.com/docs/instagram-api
- TikTok: https://developers.tiktok.com/signup (not sure where these configs are, yet. Feel free to fix docs if you know.)
- Pinterest: https://developers.pinterest.com/account-setup/
- Bitly: https://bitly.com/pages/pricing
- Tiny Link: https://tinylink.is/user/register
- SendGrid: https://docs.sendgrid.com/for-developers/sending-email/api-getting-started
- DailyMotion: https://developers.dailymotion.com/api/
- Giphy: https://developers.giphy.com/docs/api/
- NewsAPI: https://newsapi.org/docs/get-started
- PixaBay: https://pixabay.com/accounts/register/?source=&next=/api/docs/
- Flickr: https://identity.flickr.com/login?redir=https%3A%2F%2Fwww.flickr.com%2Fservices%2Fapps%2Fcreate%2Fapply%2F
- Imgur: https://imgur.com/signin?redirect=https%3A%2F%2Fapi.imgur.com%2Foauth2%2Faddclient
- YouTube: https://developers.google.com/youtube/v3/getting-started

### URL, Scheme & Ports:
You must also change all instances of urls to that of your setup(this is done mostly automatically in the Docker setup, see `Docker.README.md for details).

## Creating an Account
Navigate to your endpoint(`http://localhost:8000 by default) and create a new user by signing up. You will receive a message in the top right corner stating "Registration Failed - Unauthorized", this means you've registered but the activation link could not be emailed(no email set up).

There are 2 ways to finish setting up users:

### Method 1 - CLI:
#### Docker:
The following command will manually activate ALL users as well as assign the highest available package and set expiry date to a much later date (30th December 2999 i.e ~never). Replace username, password and database with those set in .env earlier:
```bash
docker exec -it socioboard-mysql sh -c "mysql --user=scbadmin --password=sqlpass --database=scbsql < /perma-act-users.sql"
```

#### Standard Install:
First we log in to MySQL via the command line(change user, password and database to whatever you set in configs): 
```bash
mysql --user=scbadmin --password=sqlpass --database=scbsql
```

Next, we set activation status, upgrade users to platinum and set expiration to a much later date and then exit the mysql command line:
```sql
update user_activations set activation_status = 1;
update user_activations set user_plan = 7;
update user_activations set account_expire_date = "2999-12-30";
exit
```

### Method 2 - GUI:
There is now an optional admin panel(enabled by default, but can be disabled via `.env` in docker or via `socioboard-api/Admin/config/development.json` in standard install) that is served on port 8080 at `/admin` (http://localhost:8080/admin by default). Default login details are - email: `admin@scb.example` and password: `scb@123`. I recommend you change these in the config file mentioned above.

After logging in, click on your database(there should only be 1 database). Scroll down to the `User Activations` section(table), find your user(you can match users based on the data in `User Details` section(table)), click the 3 dots to the right of the user and click on `edit`. Here you can set `Activation Status` (`0` means not activated, `1` means activated), `User Plan` (ranges from `0` to `7`) and `Account Expire Date`.

Done! You can now log in :)
