module.exports = {
    apps: [
        {
            name: "SocioboardPublisherServices",
            script: "./app.js",
            watch: false,           
            env_development: {
                "PORT": 3001,
                "NODE_ENV": "development",
                "exec_mode" : "cluster"
            }            
        }
    ]
}