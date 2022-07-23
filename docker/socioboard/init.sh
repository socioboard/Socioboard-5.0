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

# if non standard https port, change URL scheme, else leave blank
port=""
while [[ $HTTPS_PORT != "443" ]];do
    port=":$HTTPS_PORT"
    break;
done

# apply configs to config files
cd /
./config.sh "/usr/socioboard/app/socioboard-api/User/config/development.json"
./config.sh "/usr/socioboard/app/socioboard-api/Update/config/development.json"
./config.sh "/usr/socioboard/app/socioboard-api/Feeds/config/development.json"
./config.sh "/usr/socioboard/app/socioboard-api/Notification/config/development.json"
./config.sh "/usr/socioboard/app/socioboard-api/Publish/config/development.json"
./config.sh "/usr/socioboard/app/socioboard-api/Admin/config/development.json"

cd /usr/socioboard/app/socioboard-web-php/
cp example.env .env
sed -i "s;<<Laravel Key>>;${LARAVEL_KEY};g" .env
sed -i "s;APP_ENV=local;APP_ENV=development;g" .env
sed -i "s;<<php domain>>;https://socio.${BASE_DOMAIN}${port}/;g" .env
sed -i "s;<<USER NODE SERVICE>>;https://socio-api.${BASE_DOMAIN}${port}/;g" .env
sed -i "s;<<FEEDS NODE SERVICE>>;https://socio-feeds.${BASE_DOMAIN}${port}/;g" .env
sed -i "s;<<PUBLISH NODE SERVICE>>;https://socio-publish.${BASE_DOMAIN}${port}/;g" .env
sed -i "s;<<UPDATE NODE SERVICE>>;https://socio-update.${BASE_DOMAIN}${port}/;g" .env
sed -i "s;<<NOTIFICATION NODE SERVICE>>;https://socio-notifications.${BASE_DOMAIN}${port}/;g" .env

# init mysql db
while [ ! -e "/data/db.init" ];do
    echo "Initializing MySQL Database"
    cd /usr/socioboard/app/socioboard-api/Common/Sequelize-cli
    dbi=$(ls seeders | grep '[0-9]*initialize_application_informations.cjs')
    export NODE_ENV=development && \
    su-exec node npx sequelize-cli db:migrate && \
    su-exec node npx sequelize-cli db:seed --seed seeders/$dbi && \
    touch /data/db.init
    while [ ! -e "/data/db.init" ];do
        echo "MySQL Database Initialization Failed, Retrying"
        break;
    done
done

# init certificates
while [ ! -e "/ssl/cert.pem" ];do
    echo "No SSL certificate found, generating"
    openssl req -subj "/CN=*.$BASE_DOMAIN/O=SocioBoard/C=US" -new -newkey rsa:2048 -sha256 -days 365 -nodes -x509 -keyout /ssl/key.pem -out /ssl/cert.pem
    break;
done

# trust cert to avoid curl errors
echo "Updating certificate store"
cp /ssl/cert.pem /usr/local/share/ca-certificates/
update-ca-certificates

# generate swagger files for api endpoints
echo "Generating Swagger files"
cd /usr/socioboard/app/socioboard-api/User && npm run swagger
cd ../Feeds && npm run swagger
cd ../Publish && npm run swagger
cd ../Notification && npm run swagger
cd ../Update && npm run swagger
