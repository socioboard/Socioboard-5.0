#!/bin/bash
# make temporary copy of source code
cp -r ./socioboard-api ./docker/socioboard/
cp -r ./socioboard-web-php ./docker/socioboard/
cd docker

# set mongodb init details
cp ./init-mongo-template.js ./init-mongo.js
mongo_user=$(cat .env | grep 'MONGO_USER')
IFS='=' read -a user_arr <<< $mongo_user
mongo_user=$(echo ${user_arr[1]} | tr -d '"')
mongo_pass=$(cat .env | grep 'MONGO_PASS')
IFS='=' read -a pass_arr <<< $mongo_pass
mongo_pass=$(echo ${pass_arr[1]} | tr -d '"')
mongo_db=$(cat .env | grep 'MONGO_DB_NAME')
IFS='=' read -a db_arr <<< $mongo_db
mongo_db=$(echo ${db_arr[1]} | tr -d '"')
sed -i "s;USER_REF;$mongo_user;g" init-mongo.js
sed -i "s;PASS_REF;$mongo_pass;g" init-mongo.js
sed -i "s;DB_REF;$mongo_db;g" init-mongo.js