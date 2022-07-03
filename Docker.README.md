# Socioboard Docker Containers
Docker version developed and maintained by https://github.com/vaughngx4.
PLEASE NOTE: Currently, the application is created to run in development mode WITH debugging on by default, as well as having several API vulnerabilities. This is a potential security issue and I would advise to not expose the application(port 8000) or the API(ports 3000 - 3004) to the internet.
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

Create and start containers:
```bash
docker-compose -f docker/docker-compose.yaml up -d
```

A `data/api` directory will be created inside the `docker` folder(you can change the docker mount in `docker-compose.yaml` to put it elsewhere). This is only for init files so that a new container would not try to initialize an existing database.

The docker network IP is not important and can be changed freely.

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
