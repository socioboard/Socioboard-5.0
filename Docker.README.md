# Socioboard Docker Containers
Docker version developed and maintained by https://github.com/vaughngx4.

NOTE 1: Currently, the application is created to run in development mode WITH debugging on by default, as well as having several API vulnerabilities. This is a potential security risk and I would advise to not expose the application or the API to the internet.

NOTE 2: Running on the `localhost` domain is no longer supported due to the addition of SSL and how the application is built. If you would like to run on your local machine, you will need to have an external DNS(setting in your hosts file doesn't work as the socioboard container also needs to be able to resolve hostnames) like your router, AdGuard or PiHole for example, set to the external IP of your local machine(i.e. 192.168.1.101). You will also need to expose ports 80 and 443 on your local machine. See `docker/nginx/ssl/SSL.README.md` for a list of subdomains.

## Installation
Clone source code and cd into directory:
```bash
git clone https://github.com/socioboard/Socioboard-5.0.git
cd Socioboard-5.0
```

Create .env and change variables(I use vi but use whatever text editor you have):
```bash
cp docker/.env.example docker/.env
vi docker/.env
```

Prepare MongoDB files(this needs to be done whenever you change any mongo related settings in .env i.e new database):
```bash
./docker-set-mongo-init.sh
```

NOTE 1: Twilio API is required for the user API(registration, login etc.) to work. Fill correct details(You can create a free acount here: https://www.twilio.com/try-twilio)

Twilio `Account SID` and `Auth Key` can be found in the API Keys section. To get a `Service ID` you will need to go the `Twilio Console` click on `Verify`, then `Services` and create a SocioBoard service.

NOTE 2: If you would like to change the subdomains, be sure to change the URL scheme in `docker/socioboard/init.sh`, `docker/socioboard/config.sh`, `docker/socioboard-web/init.sh` and in `docker/nginx/nginx-socioboard.conf`.

You can also provide your own SSL certificate if necessary(see `docker/nginx/ssl/SSL.README.md`)

Pull Docker images:
```bash
docker-compose -f docker/docker-compose.yaml pull
```

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

### Changing Exposed Ports:
If port(s) 80 and/or 443 are in use on your system, but your proxy frontend still expects traffic on port(s) 80 and/or 443 you will need to edit `docker/docker-compose.yaml` and change `"${HTTPS_PORT}:${HTTPS_PORT}"` to `"8443:${HTTPS_PORT}"` for example.

If you would like to change the ports the application is served on(i.e you would visit socio.mydomain.com:8443 to use the application) simply change the port(s) in your docker `.env` file.

NOTE: When serving https on a port other than 443, the http redirect will no longer work. You will either have to modify the redirect in `docker/nginx/nginx-socioboard.conf` or handle it with your own reverse proxy(if you're using your own reverse proxy AND non standard ports I'd suggest handling the redirect there or leaving the http port out entirely).

## Creating an Account
Navigate to your endpoint(`https://socio.mydomain.example) and create a new user by signing up. You will receive a message in the top right corner stating "Registration Failed - Unauthorized", this means you've registered but the activation link could not be emailed(no email set up).

There are 2 ways to edit users:
### Method 1 - CLI:
The following command will manually activate ALL users as well as assign the highest available package and set expiry date to a much later date (30th December 2999 i.e ~never). Replace username, password and database with those set in .env earlier:
```bash
docker exec -it socioboard-mysql sh -c "mysql --user=scbadmin --password=sqlpass --database=scbsql < /perma-act-users.sql"
```

### Method 2 - GUI:
There is now an optional admin panel(enabled by default, but can be disabled via `.env`) that is served at `/admin` (https://socio.mydomain.example/admin). Default login details are - email: `admin@scb.example` and password: `scb@123`. I recommend you change these in the `.env` file as well.

After logging in, click on your database(there should only be 1 database). Scroll down to the `User Activations` section(table), find your user(you can match users based on the data in `User Details` section(table)), click the 3 dots to the right of the user and click on `edit`. Here you can set `Activation Status` (`0` means not activated, `1` means activated), `User Plan` (ranges from `0` to `7`) and `Account Expire Date`.

Done! You can now log in :)

## Building from source
Build docker images from source:
```bash
./docker-build.sh
```
Building images may take some time depending on your internet speed. Build can fail due to slow connections.

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
