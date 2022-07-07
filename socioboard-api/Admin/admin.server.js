import config from 'config';
import AdminBro from 'admin-bro';
import AdminBroExpress from 'admin-bro-expressjs';
import AdminBroSequelize from 'admin-bro-sequelizejs';
import express from 'express';
import DbConnect from './resources/database/mysql.database.js';

const dbConnect = new DbConnect();
const sqlDb = await dbConnect.initialize();
const app = express();
AdminBro.registerAdapter(AdminBroSequelize);

const ADMIN = {
    email: config.get('auth.email'),
    password: config.get('auth.password')
}

const COOKIE = {
    name: config.get('auth.session_name'),
    password: config.get('auth.session_key')
}

const adminBro = new AdminBro({
    rootPath: '/admin',
    databases: [sqlDb],
    branding: { companyName: 'SocioBoard' }
});

const router = AdminBroExpress.buildAuthenticatedRouter(adminBro, {
    authenticate: async (email, password) => {
        if (ADMIN.password === password && ADMIN.email === email) { return ADMIN }
        return null
    },
    cookieName: COOKIE.name,
    cookiePassword: COOKIE.password,
});

if( config.get('enabled') === "true" ){
    app.use(adminBro.options.rootPath, router);
    app.listen(8080, () => console.log(`admin panel listening on http://${config.get('environment.domain')}:8080/admin with ${process.env.NODE_ENV} Environment!`) );
}else{ console.log('admin panel disabled.') }