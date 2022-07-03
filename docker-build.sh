#!/bin/bash
# make temporary copy of source code
cp -r ./socioboard-api ./docker/socioboard/
cp -r ./socioboard-web-php ./docker/socioboard/
cd docker

# pull cached image
#docker pull localhost:5051/socioboard/socioboard:latest

# build without caching
docker build -t socioboard/socioboard ./socioboard

# build with caching
#docker build --cache-from localhost:5051/socioboard/socioboard:latest -t socioboard/socioboard ./socioboard
#docker rmi localhost:5051/socioboard/socioboard
#docker tag socioboard/socioboard:latest localhost:5051/socioboard/socioboard:latest
#docker push localhost:5051/socioboard/socioboard:latest

# create docker network
docker network create --subnet=172.16.32.0/16 --gateway=172.16.32.1 scb-net

# remove temporary copy of source code
rm -rf ./socioboard/socioboard-api ./socioboard/socioboard-web-php