#!/bin/bash

if [ -z "$BASH_VERSION" ]
then
    exec bash "$0" "$@"
fi

# if non standard https port, change URL scheme, else leave blank
port=""
while [[ $HTTPS_PORT != "443" ]];do
    port=":$HTTPS_PORT"
    break;
done

# set config
echo "Setting Configs"
cd /usr/socioboard/app/socioboard-web-php/
cp example.env .env
sed -i "s;<<Laravel Key>>;${LARAVEL_KEY};g" .env
sed -i "s;APP_ENV=local;APP_ENV=production;g" .env
sed -i "s;APP_DEBUG=true;APP_DEBUG=false;g" .env
sed -i "s;<<php domain>>;https://socio.${BASE_DOMAIN}${port}/;g" .env
sed -i "s;<<USER NODE SERVICE>>;https://socio-api.${BASE_DOMAIN}${port}/;g" .env
sed -i "s;<<FEEDS NODE SERVICE>>;https://socio-feeds.${BASE_DOMAIN}${port}/;g" .env
sed -i "s;<<PUBLISH NODE SERVICE>>;https://socio-publish.${BASE_DOMAIN}${port}/;g" .env
sed -i "s;<<UPDATE NODE SERVICE>>;https://socio-update.${BASE_DOMAIN}${port}/;g" .env
sed -i "s;<<NOTIFICATION NODE SERVICE>>;https://socio-notifications.${BASE_DOMAIN}${port}/;g" .env

# start frontend
echo "Setting Laravel Key"
cd /usr/socioboard/app/socioboard-web-php
echo -e "yes\n" | php8 artisan key:generate
