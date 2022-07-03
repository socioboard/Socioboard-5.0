#!/bin/bash
# mysql
cd /usr/socioboard/app/socioboard-api/Common/Sequelize-cli/config/
config=$(cat config.json)
config=$(echo $config | jq --arg a "$SQL_DB_USER" '.development.username = $a')
config=$(echo $config | jq --arg a "$SQL_DB_NAME" '.development.database = $a')
config=$(echo $config | jq --arg a "$SQL_DB_PASS" '.development.password = $a')
config=$(echo $config | jq --arg a "socioboard-mysql" '.development.host = $a')
rm -f config.json
echo $config > config.json

# apply configs to config files
cd /
./config.sh "/usr/socioboard/app/socioboard-api/User/config/development.json"
./config.sh "/usr/socioboard/app/socioboard-api/Update/config/development.json"
./config.sh "/usr/socioboard/app/socioboard-api/Feeds/config/development.json"
./config.sh "/usr/socioboard/app/socioboard-api/Notification/config/development.json"
./config.sh "/usr/socioboard/app/socioboard-api/Publish/config/development.json"

cd /usr/socioboard/app/socioboard-web-php/
cp example.env .env
sed -i "s;<<Laravel Key>>;${LARAVEL_KEY};g" .env
sed -i "s;APP_ENV=local;APP_ENV=development;g" .env
sed -i "s;<<php domain>>;https://${DOMAIN}/;g" .env
sed -i "s;<<USER NODE SERIVE>>;http://${DOMAIN}:3000/;g" .env
sed -i "s;<<FEEDS NODE SERIVE>>;http://${DOMAIN}:3001/;g" .env
sed -i "s;<<PUBLISH NODE SERVICE>>;http://${DOMAIN}:3002/;g" .env
sed -i "s;<<UPDATE NODE SERVICE>>;http://${DOMAIN}:3003/;g" .env
sed -i "s;# API_URL_NOTIFICATION=http://localhost:3004/;API_URL_NOTIFICATION=http://${DOMAIN}:3004/;g" .env

# init mysql db
while [ ! -e "/data/db.init" ];do
    echo "Initializing MySQL Database"
    cd /usr/socioboard/app/
    cd ./socioboard-api/Common/Sequelize-cli && \
    export NODE_ENV=development && \
    npx sequelize-cli db:migrate && \
    npx sequelize-cli db:seed --seed seeders/20210303111816-initialize_application_informations.cjs
    touch /data/db.init
    break;
done