#  We need to update Folders case

# Un comment the Below lines to install packages in all Micro-services

# cd ./socioboard-api/User & npm install & cd ../Feeds & npm install & cd ../Common  & npm install & cd ../Update & npm install & cd ../Publush & npm install & cd ../Notification & npm install & cd ..

# end of package install command


# Chat service will be added soon

# Setting up DataBase - Sequelize
# NODE_ENV is set to  development as default.


#  un comment the below line to set-up DataBase.
# cd ./socioboard-api/Common/Sequelize-cli & set NODE_ENV=development & npx sequelize-cli db:migrate & npx sequelize-cli db:seed --seed 20210303111816-initialize_application_informations.cjs
# end of DataBase configuration command


# If you want all in one simple click, Please use the following command.
# ! Note: Node ENV default is developement.

# Pre Requirements

NODE_ENV=development

# DataBase Requirements
 
#  ! MySQL database
#  ! mongo database

# All in one command ( Install Packages & setups Data Base )
cd ./socioboard-api/User & npm install & cd ../Feeds & npm install & cd ../Common & npm install & cd ../Update & npm install & cd ../Publush & npm install & cd ../Notification & npm install & cd ../Common/Sequelize-cli & set NODE_ENV=development & npx sequelize-cli db:migrate & npx sequelize-cli db:seed --seed 20210303111816-initialize_application_informations.cjs


#  Once all are success

# To start services with pm2

npm i pm2 -g & set NODE_ENV=development & cd ./socioboard-api/User & pm2 user.service.js & cd ../Feeds & pm2 feeds.service.js & ../Publish & pm2 publish.service.js & cd ../Notification & pm2 notify.service.js & cd ../Update & pm2 update.service.js & pm2 status

# ! NOTE: For linux user use export NODE_ENV=developement inplace of set NODE_ENV=development




