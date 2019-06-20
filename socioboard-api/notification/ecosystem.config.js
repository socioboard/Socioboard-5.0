module.exports = {
    apps: [
        {
            name: "SocioboardNotifyServices",
            script: "./app.js",
            watch: false,           
            env_development: {
                "PORT": 3003,
                "NODE_ENV": "development",
                "exec_mode": "cluster"
            }     
        }
    ]
};