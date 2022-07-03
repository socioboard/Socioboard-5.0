#!/bin/bash
cp -r ./socioboard-api ./docker/socioboard/
cp -r ./socioboard-web-php ./docker/socioboard/
cd docker
docker pull localhost:5051/socioboard/socioboard:latest
docker build --cache-from localhost:5051/socioboard/socioboard:latest -t socioboard/socioboard ./socioboard
docker rmi localhost:5051/socioboard/socioboard
docker tag socioboard/socioboard:latest localhost:5051/socioboard/socioboard:latest
docker push localhost:5051/socioboard/socioboard:latest
docker network create --subnet=172.16.32.0/16 --gateway=172.16.32.1 scb-net
rm -rf ./socioboard/socioboard-api ./socioboard/socioboard-web-php