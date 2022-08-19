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
sed -i "s;development;production;g" config.json

# apply configs to config files
cd /
./config.sh "/usr/socioboard/app/socioboard-api/User/config/development.json"
./config.sh "/usr/socioboard/app/socioboard-api/Update/config/development.json"
./config.sh "/usr/socioboard/app/socioboard-api/Feeds/config/development.json"
./config.sh "/usr/socioboard/app/socioboard-api/Notification/config/development.json"
./config.sh "/usr/socioboard/app/socioboard-api/Publish/config/development.json"
./config.sh "/usr/socioboard/app/socioboard-api/Admin/config/development.json"

# rename config files
cd /usr/socioboard/app/socioboard-api
cd ./User/config
mv development.json production.json
cd ../../Update/config
mv development.json production.json
cd ../../Feeds/config
mv development.json production.json
cd ../../Notification/config
mv development.json production.json
cd ../../Publish/config
mv development.json production.json
cd ../../Admin/config
mv development.json production.json

# init mysql db
while [ ! -e "/data/db.init" ];do
    echo "Initializing MySQL Database"
    cd /usr/socioboard/app/socioboard-api/Common/Sequelize-cli
    dbi=$(ls seeders | grep '[0-9]*initialize_application_informations.cjs')
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
