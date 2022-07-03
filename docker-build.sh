#!/bin/bash
# make temporary copy of source code
cp -r ./socioboard-api ./docker/socioboard/
cp -r ./socioboard-web-php ./docker/socioboard/
cd docker

# set mongodb init details
cp ./init-mongo-template.js ./init-mongo.js
config=$(cat docker/.env)
mongo_user=$(echo $config | grep 'MONGO_USER')
IFS='=' read -a user_arr <<< $mongo_user
mongo_user=$(echo ${user_arr[1]} | tr -d '"')
mongo_pass=$(echo $config | grep 'MONGO_PASS')
IFS='=' read -a pass_arr <<< $mongo_pass
mongo_pass=$(echo ${pass_arr[1]} | tr -d '"')
mongo_db=$(echo $config | grep 'MONGO_DB_NAME')
IFS='=' read -a db_arr <<< $mongo_db
mongo_db=$(echo ${pass_arr[1]} | tr -d '"')
sed -i "s;USER_REF;$mongo_user;g" init-mongo.js
sed -i "s;PASS_REF;$mongo_pass;g" init-mongo.js
sed -i "s;DB_REF;$mongo_db;g" init-mongo.js

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