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
cd ./socioboard-api/User && su-exec node pm2 start user.server.js && \
cd ../Feeds && su-exec node pm2 start feeds.server.js && \
cd ../Publish && su-exec node pm2 start publish.server.js && \
cd ../Notification && su-exec node pm2 start notify.server.js && \
cd ../Update && su-exec node pm2 start update.server.js && \
cd ../Admin && su-exec node pm2 start admin.server.js

tail -f > /dev/null
