module.exports = {
    apps: [
        {
            name: "SocioboardFeedsServices",
            script: "./app.js",
            watch: false,           
            env_development: {
                "PORT": 3002,
                "NODE_ENV": "development",
                "exec_mode" : "cluster"
            }
        }
    ]
}