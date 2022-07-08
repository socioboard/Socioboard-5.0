#!/bin/bash
# set up mysqli ping
sed -i "s;HOST_REF;socioboard-mysql;g" /sql-ping.php
sed -i "s;USER_REF;$SQL_DB_USER;g" /sql-ping.php
sed -i "s;PASS_REF;$SQL_DB_PASS;g" /sql-ping.php
sed -i "s;DB_REF;$SQL_DB_NAME;g" /sql-ping.php

# wait for mysql db to be ready
ready=""
while [[ $(echo $ready | grep -o 'Ready') != 'Ready' ]];do
    echo "Waiting for MySQL database to be ready"
    ready=$(php8 /sql-ping.php)
#    echo "Latest response:"
#    echo $ready
    sleep 5;
done
echo "MySQL database is ready"

# init
initdone="init-done"
while [ ! -e $initdone ];do
    echo "Running first time setup"
    bash /init.sh
    echo "Setup complete"
    touch init-done
    break;
done

# start api
cd /usr/socioboard/app/
echo "Starting API"
npm i pm2 -g && \
export NODE_ENV=development && \
cd ./socioboard-api/User && su-exec socioboard pm2 start user.server.js && \
cd ../Feeds && su-exec socioboard pm2 start feeds.server.js && \
cd ../Publish && su-exec socioboard pm2 start publish.server.js && \
cd ../Notification && su-exec socioboard pm2 start notify.server.js && \
cd ../Update && su-exec socioboard pm2 start update.server.js && \
cd ../Admin && su-exec socioboard pm2 start admin.server.js

# start frontend
echo "Starting Frontend"
cd /usr/socioboard/app/socioboard-web-php
php8 artisan key:generate
su-exec socioboard php8 artisan serve --host=0.0.0.0 --port=8000
echo "Running"
tail -f > /dev/null
