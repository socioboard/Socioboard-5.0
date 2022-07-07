# Socioboard Docker Containers
Docker version developed and maintained by https://github.com/vaughngx4.
PLEASE NOTE: Currently, the application is created to run in development mode WITH debugging on by default, as well as having several API vulnerabilities. This is a potential security issue and I would advise to not expose the application(ports 8000 and 8080) or the API(ports 3000 - 3004) to the internet.
## Installation
Clone source code and cd into directory:
```bash
git clone https://github.com/socioboard/Socioboard-5.0.git
cd Socioboard-5.0
```

Build docker images from source:
```bash
chmod +x docker-build.sh
./docker-build.sh
```
Building images may take some time depending on your internet speed. Build can fail due to slow connections.

Create .env and change variables(I use vi but use whatever text editor you have):
```bash
cp docker/.env.example docker/.env
vi docker/.env
```

NOTE 1: Twilio API is required for the user API(registration, login etc.) to work. Fill correct details(You can create a free acount here: https://www.twilio.com/try-twilio)

Twilio `Account SID` and `Auth Key` can be found in the API Keys section. To get a `Service ID` you will need to go the `Twilio Console` click on `Verify`, then `Services` and create a SocioBoard service.

NOTE 2: If running behind a reverse proxy or exposing ports other than the default, be sure to change the URL scheme in the `# apply configs to config files` section of `docker/socioboard/init.sh`

Create and start containers:
```bash
docker-compose -f docker/docker-compose.yaml up -d
```

Check the status of the container by running:
```bash
docker logs socioboard
```

Once services are running, we can check the logs using:
```bash
docker exec -it socioboard su-exec socioboard pm2 logs
```
CTRL+C to exit


A `data/api` directory will be created inside the `docker` folder(you can change the docker mount in `docker-compose.yaml` to put it elsewhere). This is only for init files so that a new container would not try to initialize an existing database.

The docker network IP is not important and can be changed freely.

## Creating a user
Navigate to your endpoint(`http://localhost:8000 by default) and create a new user by signing up. You will receive a message in the top right corner stating "Registration Failed - Unauthorized", this means you've registered but the activation link could not be emailed(no email set up).

There are 2 ways to edit users:
### Method 1 - CLI:
The following command will manually activate ALL users as well as assign the highest available package and set expiry date to a much later date (30th December 2999 i.e ~never). Replace username, password and database with those set in .env earlier:
```bash
docker exec -it socioboard-mysql sh -c "mysql --username=scbadmin --password=sqlpass --database=scbsql < /perma-act-users.sql"
```

### Method 2 - GUI:
There is now an optional admin panel(enabled by default, but can be disabled via `.env`) that is served on port 8080 at `/admin` (http://localhost:8080/admin by default). Default login details are - email: `admin@scb.example` and password: `scb@123`. I recommend you change these in the `.env` file as well.

After logging in, click on your database(there should only be 1 database). Scroll down to the `User Activations` section(table), find your user(you can match users based on the data in `User Details` section(table)), click the 3 dots to the right of the user and click on `edit`. Here you can set `Activation Status` (`0` means not activated, `1` means activated), `User Plan` (ranges from `0` to `7`) and `Account Expire Date`.

Done! You can now log in :)

## Uninstalling:
### Keeping Data:
To bring down containers without affecting data run the following in the source directory:
```
docker-compose -f docker/docker-compose.yaml down
```

### Deleting Everything:
To remove all containers and data we need to remove volumes and init files like so:
```bash
docker-compose -f docker/docker-compose.yaml down --volumes
sudo rm -rf docker/data
```
