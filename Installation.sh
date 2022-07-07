# This Script was tested on Linux

# Make sure you have MySQL & MongoDB Setup, and the Database details are updated in the Config File (Common/Sequelize-cli/config) before running this Script

echo -e "$(tput setaf 1)Make sure you have MySQL & MongoDB Setup, and the Database details are updated in the Config File (Common/Sequelize-cli/config) before running this Script$(tput setaf 7)"

# Script Countdown
for (( i=15; i>0; i--)); do
    printf "\rStarting script in $i seconds.  Hit any key to cancel."
    read -s -n 1 -t 1 key
    if [ $? -eq 0 ]
    then
        printf "\nScript Cancelled\n"
        exit  
    fi
done


echo -e "$(tput setaf 7)\nResuming script"

# 0) Installs all npm dependencies

echo -e "$(tput setaf 1)0) Installs Swagger-Autogen npm dependency"

npm i swagger-autogen@latest -g

# 1) All-in-One Command - Installs all microservices and updates Database

echo -e "$(tput setaf 1)1) All-in-One Command - Installs all microservices and updates Database Tables$(tput setaf 7)"

cd socioboard-api/User && npm install && cd ../Feeds && npm install && cd ../Common && npm install && cd ../Update && npm install && cd ../Publish && npm install && cd ../Notification && npm install && cd ../Admin && npm install && cd ../Common/Sequelize-cli && export NODE_ENV=development && npx sequelize-cli db:migrate && npx sequelize-cli db:seed --seed 20210303111816-initialize_application_informations.cjs

# 2) All-in-One Command - Generates all Swagger Files

echo -e "$(tput setaf 1)2) All-in-One Command - Generates all Swagger Files$(tput setaf 7)"

cd ../../../socioboard-api/User && npm run swagger && cd ../Feeds && npm run swagger && cd ../Publish && npm run swagger && cd ../Notification && npm run swagger && cd ../Update && npm run swagger && cd ../../

# 3) All-in-One Command - Starts all Microservices in PM2

echo -e "$(tput setaf 1)3) All-in-One Command - Starts all Microservices in PM2$(tput setaf 7)"

npm i pm2 -g && export NODE_ENV=development && cd socioboard-api/User && pm2 start user.server.js && cd ../Feeds && pm2 start feeds.server.js && cd ../Publish && pm2 start publish.server.js && cd ../Notification && pm2 start notify.server.js && cd ../Update && pm2 start update.server.js && cd ../Admin && pm2 start admin.server.js && pm2 status && cd ../../
