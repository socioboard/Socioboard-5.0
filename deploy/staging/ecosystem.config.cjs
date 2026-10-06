// PM2 processes for staging (docs/infra.md#staging-pm2, P0-I7): web on 8080, api on 3000, and
// the worker, which takes no traffic. nginx in front routes app-dev.socioboard.ai: /api/ and
// /public-media/ to 3000, everything else to 8080 (deploy/staging/nginx.conf).
//   pm2 startOrReload deploy/staging/ecosystem.config.cjs --update-env
const path = require('node:path');

const root = path.resolve(__dirname, '../..');
// Settings and secrets live outside the checkout, so a deploy never touches them.
const envFile = process.env.SOCIOBOARD_ENV_FILE ?? '/etc/socioboard/staging.env';

// One instance each, never cluster mode: live updates hold sockets per process. The apps finish
// in-flight requests and jobs on SIGINT (hard stop after 35 s), so PM2 waits a little longer.
const node = (name, entry) => ({
  name,
  cwd: root,
  script: entry,
  node_args: `--env-file=${envFile}`,
  exec_mode: 'fork',
  instances: 1,
  kill_timeout: 40_000,
  max_restarts: 20,
  exp_backoff_restart_delay: 1_000,
  time: true,
});

module.exports = {
  apps: [
    node('socioboard-api', 'apps/api/dist/main.mjs'),
    node('socioboard-worker', 'apps/worker/dist/main.mjs'),
    {
      // The built web app is static files; PM2's own server sends app routes to index.html.
      name: 'socioboard-web',
      script: 'serve',
      env: {
        PM2_SERVE_PATH: path.join(root, 'apps/web/dist'),
        PM2_SERVE_PORT: 8080,
        PM2_SERVE_SPA: 'true',
        PM2_SERVE_HOMEPAGE: '/index.html',
      },
      time: true,
    },
  ],
};
