 ![Socioboard API](http://i.imgur.com/aKbFCOy.png "Your Open-source Social Media Dashboard")
==========
Socioboard Api's is created with Node.js, Express, MongoDB and Sequelize ORM. Socioboard Api are classified to four micro services. They are namely 

> User Services - Responsible for Managing User, Team, Payment, App Insights and Admin functionalities.

> Publish Services – Responsible for Managing Media Uploads, Scheduling, Publish now and Report functionalities through respective Social Network Api's.

> Feed Services – Responsible for fetching Feeds from Social network API's and various popular trending networks such as Pixabay, Imgur, Daily motion, Flickr and so on. 

> Notification Services – Responsible for sending emails and notify the user activities through Socket.io

**Configuration Setup**
============

***Step 1: Install all dependency for microservices*** 
```shell
socioboard-api/user> npm install
socioboard-api/publish> npm install
socioboard-api/feeds> npm install
socioboard-api/notification> npm install
socioboard-api/library> npm install
```

***Step 2: Add the Mysql database creds***
```shell
socioboard-api/library\sequelize-cli\config>start config.json

# Setup the db creds on development environment
#    "username": "<<db_username>>",
#    "password": null,
#    "database": "<<db_name>>",
#    "host": "127.0.0.1",
#    "dialect": "mysql",
```

***Step 3: Execute the Seqeulize-cli to initialize the Mysql***
```shell

# Set the node_env as development
socioboard-api/library/sequelize-cli> set node_env=development

# Lets migrate all neccessary tables
socioboard-api/library/sequelize-cli> ../node_modules/.bin/sequelize db:migrate

# Lets seeds the initial configuration for the application
socioboard-api/library/sequelize-cli> ../node_modules/.bin/sequelize db:seed —seed 20190213051930-initialize_application_info.js
```

***Step 4: Add the social network API Keys in config for each services***
```shell
# Update the client secrets of all social networks and application

socioboard-api/user/config> start development.json
socioboard-api/user/config> start default.json

socioboard-api/publish/config> start development.json
socioboard-api/publish/config> start default.json

socioboard-api/feeds/config> start development.json
socioboard-api/feeds/config> start default.json

socioboard-api/notification/config> start development.json
socioboard-api/notification/config>start default.json
```

***Step 5: Add the redirect urls in social networks***

> Facebook - <host_name>/facebook-callback

> Twitter - <host_name>/twitter/callback

> Google - <host_name>/google-callback

> LinkedIn - <host_name>/linkedIn-callback

> Pinterest - <host_name>/pinterest-callback

> Instagram - <host_name>/instagram-callback

Also, please add <host_name>/addSocialProfile redirect url to all above networks. 

***Step 6: Run micro services***
```shell
# Please verify nodemon has been installed or not.

# Start User micro services
socioboard-api/user> set node_env=development
socioboard-api/user> nodemon app.js

socioboard-api/publish> set node_env=development
socioboard-api/publish> nodemon app.js

socioboard-api/feeds> set node_env=development
socioboard-api/feeds> nodemon app.js

socioboard-api/notification> set node_env=development
socioboard-api/notification> nodemon app.js

```