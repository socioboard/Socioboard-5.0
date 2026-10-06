# Deployment runbook

As of 2026-10-06 · See also: [Infra](infra.md#staging-pm2), [Architecture](architecture.md#environments-and-domains), [Media storage](backend/modules/media.md#nas-storage), [Developer apps](developer-apps.md)

Staging was set up end to end on 2026-10-06 and is live at `https://app-dev.socioboard.ai`. This page records exactly how, so production can be built the same way without anything forgotten. Follow the sections in order on a new server; [Production](#production-what-changes) lists what must differ.

Secrets and infrastructure details never go in this file: the repo is public. Passwords, tokens, server and NAS addresses, SSH ports and user names live in the team's password manager (entry "Socioboard staging") and in the server's env file; here they appear as `<secret>` or `<from the password manager>`.

## How it fits together

```
Browser / social networks
        │  https://app-dev.socioboard.ai
        ▼
Cloudflare (DNS, proxy, TLS at the edge)
        ▼
nginx :443 (Let's Encrypt cert, real visitor IP from CF-Connecting-IP)
   ├── /api/            → 127.0.0.1:3000  socioboard-api     (PM2; WebSockets on /api/socket.io)
   ├── /public-media/   → 127.0.0.1:3000  socioboard-api     (signed media links networks fetch)
   └── /                → 127.0.0.1:3001  socioboard-web     (PM2 static server, app routes → index.html)

socioboard-worker (PM2, no port): publishing, scheduling, media processing (ffmpeg)

On the same server, local only:
   PostgreSQL 16 :5432      Valkey 8 :6380 (PM2)      OpenObserve :5080/:5081 (PM2)

Media: NAS API http://<NAS API host>:<port>/socioboard-dev (upload/delete, server side)
       public reads https://media.globussoft.com/socioboard-dev/stream/...
```

- **One domain** for the app and its API (API under `/api`): the session cookie stays first-party, no CORS, one certificate, and every network's login redirect is on it. Decided 2026-10-06 after weighing a separate `api-dev` subdomain.
- **PM2, not Docker**, on staging (decided 2026-10-06, DevOps' preference). The Docker images still build and pass a smoke test in CI and remain the route for self-hosting.

## Environments

| | Staging | Production |
| --- | --- | --- |
| App URL | `https://app-dev.socioboard.ai` | To decide: `app.socioboard.ai`? (the docs still say `socioboard.com`) |
| Server | Address, SSH port, user and key in the password manager (key login, no sudo) | A server of its own (see Production) |
| Branch deployed | `6.0` (becomes `main` after the repo migration) | Tagged releases |
| Data | Test accounts only | Customers |

## Who does what

| DevOps (needs sudo or admin) | Engineering (the app user, no sudo) |
| --- | --- |
| Server, user account, SSH key, firewall | Node (nvm), pnpm, PM2 |
| PostgreSQL install, database and user, backups | Valkey and OpenObserve under PM2 (user-level binaries) |
| nginx site, Let's Encrypt certificate, Cloudflare DNS and settings | Clone, env file, deploys, migrations |
| `pm2 startup` for the app user (once, needs sudo) | `pm2 save` after process changes |
| SMTP relay; NAS API token | Checks after every deploy |

## The server

| | Staging |
| --- | --- |
| Size | 8 vCPU, 7.8 GB RAM, 4 GB swap, 196 GB disk (about 150 GB free) |
| OS | Ubuntu 24.04.5 LTS |
| Shared? | Yes: other Globussoft projects run on it (their own PM2 services, MySQL, PHP-FPM, nginx sites). Our processes use about 1.3 GB RAM |
| The app user's home | `~/socioboard` (code), `~/socioboard.env` (settings), `~/data/openobserve`, `~/data/uploads`, `~/.local/bin` (valkey-server, ffmpeg, ffprobe), `~/.local/share/valkey` (Valkey data), `~/.config/valkey/valkey.conf`, `~/openobserve` (binary), `~/logs` |

## Versions

| Software | Staging | Notes |
| --- | --- | --- |
| Node.js | 24.21.0 (nvm, in the user's home) | Must be 24 (the build targets it) |
| pnpm | 12.3.4 (`npm i -g pnpm@12.3.4` under nvm) | Matches `packageManager` in `package.json` |
| PM2 | 7.0.4 | |
| PostgreSQL | 16.15 (Ubuntu package, shared) | CI tests on 17; 16 works. Production: 17 |
| Valkey | 8.0.2 (user binary, port 6380) | 8.x |
| OpenObserve | v1.0.4 (the binary DevOps placed is the Enterprise build) | Free tier; the open-source build is the plan's choice and a drop-in swap |
| ffmpeg / ffprobe | 7.0.2 static build in `~/.local/bin` | 5.1 or newer |
| nginx | 1.24 | |

## Setup, step by step

### 1. Server access (DevOps)
1. Create the app user with an SSH key (SSH on a non-standard port); give engineering the key. Record the address, port, user and key in the password manager.
2. Firewall: 80 and 443 open. Everything else closed from outside (see [Still open](#still-open-on-staging) for staging's exception).

### 2. Node, pnpm and PM2 (app user)
```bash
# nvm, then Node 24
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
. ~/.nvm/nvm.sh && nvm install 24
npm install -g pnpm@12.3.4 pm2
```

### 3. PostgreSQL (DevOps)
1. Install PostgreSQL (staging uses the server's 16; production 17 from apt.postgresql.org).
2. Create a database and a user that owns it, reachable on `127.0.0.1:5432` with a password.
3. **Names use underscores:** staging is `socioboard_staging_db` / `socioboard_staging_usr`. The first message about them said hyphens, and the app couldn't log in until the names were corrected; give engineering the names exactly as created.
4. Backups: daily plus point-in-time, one restore tested (P0-I6). **Not confirmed on staging yet.**

### 4. Valkey (app user)
1. Binary at `~/.local/bin/valkey-server`, config at `~/.config/valkey/valkey.conf`:
   ```
   bind 127.0.0.1 -::1
   port 6380
   requirepass <secret>
   dir "/home/<user>/.local/share/valkey"
   appendonly yes
   maxmemory-policy noeviction
   save 3600 1 300 100 60 10000
   ```
   **`appendonly yes` and `maxmemory-policy noeviction` are required:** scheduled posts are jobs stored in Valkey; without them a restart or memory pressure silently drops posts. Staging started with `appendonly no`; it was switched on 2026-10-06 (`CONFIG SET appendonly yes` + `CONFIG REWRITE`).
2. Run it under PM2, so it comes back after a reboot (staging's first Valkey was started by hand as a daemon and wouldn't have; moved under PM2 on 2026-10-06, all keys kept):
   ```bash
   pm2 start ~/.local/bin/valkey-server --name valkey --time -- ~/.config/valkey/valkey.conf --daemonize no
   ```
   The config says `daemonize yes`; `--daemonize no` overrides it so PM2 can watch the process.

### 5. OpenObserve (app user)
1. Binary at `~/openobserve`, data in `~/data/openobserve/`. Start it under PM2, listening on the machine only, with usage pings to its vendor off:
   ```bash
   cd ~ && ZO_DATA_DIR=$HOME/data/openobserve/ ZO_HTTP_ADDR=127.0.0.1 ZO_GRPC_ADDR=127.0.0.1 ZO_TELEMETRY=false \
     pm2 start ./openobserve --name openobserve --time
   ```
   The first start creates the root user from `ZO_ROOT_USER_EMAIL` / `ZO_ROOT_USER_PASSWORD` (both in the password manager).
2. **Never start `./openobserve` by hand while the PM2 one runs:** two copies on one data folder can damage it (a hand-started copy on staging failed on its ports, luckily).
3. Viewing it: an SSH tunnel, then `http://localhost:15080` (15080 avoids a local OpenObserve on 5080):
   ```bash
   ssh -i <key.pem> -p <ssh port> -N -L 15080:127.0.0.1:5080 <user>@<server>
   ```
4. The app sends to it with `OTEL_EXPORTER_OTLP_ENDPOINT=http://127.0.0.1:5080/api/default` and `OTEL_EXPORTER_OTLP_HEADERS=Authorization=Basic%20<base64 of email:password>` (see [infra](infra.md#observability)).

### 6. ffmpeg (app user)
Static build in `~/.local/bin` (`ffmpeg`, `ffprobe`). It is on the PATH only in a login shell, which PM2 started over SSH or at boot doesn't have, so the env file names both paths (`FFMPEG_PATH`, `FFPROBE_PATH`). Without ffmpeg, videos still upload but get no duration or thumbnail.

### 7. Code and settings (app user)
1. Clone (the repo is public):
   ```bash
   git clone --branch 6.0 --single-branch https://github.com/Socioboard-developers/Socioboard-5.0.git ~/socioboard
   ```
2. Settings file outside the checkout, readable by the user only:
   ```bash
   touch ~/socioboard.env && chmod 600 ~/socioboard.env
   echo 'export SOCIOBOARD_ENV_FILE=$HOME/socioboard.env' >> ~/.bashrc
   ```
   The PM2 config and the deploy script read `SOCIOBOARD_ENV_FILE` (default `/etc/socioboard/staging.env`).
3. Generate the two app secrets **on the server**, so they're never shown:
   ```bash
   AUTH=$(node -e 'console.log(require("crypto").randomBytes(32).toString("base64url"))')
   ENC=$(node -e 'console.log("k1:"+require("crypto").randomBytes(32).toString("base64"))')
   printf 'AUTH_SECRET=%s\nENCRYPTION_KEYS=%s\n' "$AUTH" "$ENC" >> ~/socioboard.env; unset AUTH ENC
   ```
   **Back up `ENCRYPTION_KEYS` in the password manager.** It encrypts every network token; if it's lost, every connected social account has to reconnect.
4. Add passwords and tokens without them appearing on screen or in shell history:
   ```bash
   read -rsp "Value: " V; echo; printf 'NAME=%s\n' "$V" >> ~/socioboard.env; unset V
   ```

**The env file on staging** (`~/socioboard.env`, mode 600):

| Variable | Staging value | Notes |
| --- | --- | --- |
| `NODE_ENV` | `production` | Refuses the example secrets |
| `LOG_LEVEL` | `info` | |
| `API_PORT` | `3000` | |
| `APP_URL` | `https://app-dev.socioboard.ai` | Every callback and link is derived from it |
| `TRUST_PROXY` | `loopback` | nginx is on the same machine and passes the real IP |
| `MEDIA_PUBLIC_URL` | `https://app-dev.socioboard.ai/public-media` | Signed links networks fetch (Instagram images, TikTok). TikTok verifies this URL prefix |
| `DATABASE_URL` | `postgresql://socioboard_staging_usr:<secret>@127.0.0.1:5432/socioboard_staging_db` | |
| `REDIS_URL` | `redis://:<secret>@127.0.0.1:6380` | Valkey |
| `AUTH_SECRET` | `<secret>` (generated) | |
| `ENCRYPTION_KEYS` | `<secret>` (generated) | Back up |
| `OTEL_EXPORTER_OTLP_ENDPOINT` | `http://127.0.0.1:5080/api/default` | |
| `OTEL_EXPORTER_OTLP_HEADERS` | `Authorization=Basic%20<secret>` | |
| `MAIL_FROM` | `"Socioboard <no-reply@socioboard.ai>"` | |
| `SMTP_URL` | **not set yet** | Without it emails are only logged; nobody can verify an email |
| `STORAGE_DRIVER` | `nas` | |
| `NAS_API_URL` | `http://<NAS API host>:<port>/socioboard-dev` (from the password manager) | Must include the bucket |
| `NAS_PUBLIC_URL` | `https://media.globussoft.com` | Only the path is stored in the database; changing this moves every file's address |
| `NAS_API_TOKEN` | `<secret>` (`<access key>:<secret>`) | From the NAS team |
| `STORAGE_TEMP_DIR` | `/home/<app user>/data/uploads` | Uploads wait here until sent to the NAS |
| `FFMPEG_PATH`, `FFPROBE_PATH` | `/home/<app user>/.local/bin/ffmpeg`, `…/ffprobe` | |
| Network app keys (`META_APP_ID`, …) | not set yet | Development apps; see step 12 |

### 8. First deploy (app user)
```bash
cd ~/socioboard && deploy/staging/deploy.sh
```
It fast-forwards the checkout, runs `pnpm install --frozen-lockfile` and `pnpm build`, applies database migrations (`pnpm db:deploy`), starts or reloads the PM2 processes from `deploy/staging/ecosystem.config.cjs`, saves the PM2 list, and waits for `/api/health`. It stops rather than lose local changes on the server.

### 9. PM2 processes and reboot (app user + DevOps once)

| PM2 name | What | Port |
| --- | --- | --- |
| `socioboard-api` | `node apps/api/dist/main.mjs` | 3000 |
| `socioboard-worker` | `node apps/worker/dist/main.mjs` | none |
| `socioboard-web` | PM2's static server for `apps/web/dist`, SPA mode | 3001 |
| `valkey` | `valkey-server ~/.config/valkey/valkey.conf --daemonize no` | 6380, local |
| `openobserve` | `~/openobserve` | 5080/5081, local |

- App processes: one instance each in fork mode (never cluster: live updates hold sockets per process), settings through Node's `--env-file`, 40 s to stop cleanly (the apps finish in-flight work on SIGINT within 35 s).
- **Reboot:** DevOps runs `pm2 startup` for the app user once (a systemd unit, `pm2-<user>`, that runs `pm2 resurrect`); after any change to the process list, run `pm2 save`. Staging's unit is enabled and its saved list holds all five processes.

### 10. Domain, Cloudflare and nginx (DevOps)
1. **DNS:** `app-dev.socioboard.ai` → the server, proxied by Cloudflare (orange cloud).
2. **Certificate:** Let's Encrypt with certbot on the server (`/etc/letsencrypt/live/app-dev.socioboard.ai/`), renewed by `certbot.timer`. Set Cloudflare's SSL mode to **Full (strict)**.
3. **nginx site** (`/etc/nginx/sites-enabled/app-dev-socioboard.conf`; the repo's reference is `deploy/staging/nginx.conf`):
   - `/api/` → `http://127.0.0.1:3000`, with `proxy_http_version 1.1`, `Upgrade` and `Connection "upgrade"` (WebSockets), `Host`, `X-Forwarded-For`, `X-Forwarded-Proto`, 300 s timeouts.
   - `/public-media/` → `http://127.0.0.1:3000`, `proxy_buffering off`.
   - `/` → `http://127.0.0.1:3001`.
   - Port 80 redirects to HTTPS.
   - **Real visitor IP behind Cloudflare:** `real_ip_header CF-Connecting-IP;` and one `set_real_ip_from` per range at <https://www.cloudflare.com/ips/> (22 on 2026-10-06). Without it, every visitor gets Cloudflare's IP and all of them share one rate limit.
   - **Body size:** uploads arrive in parts of up to 16 MB at `/api/storage/upload/`. Staging's global `client_max_body_size 1024M` (in `/etc/nginx/nginx.conf`) covers it; a server without such a global needs at least `client_max_body_size 20m` on that path (the repo's reference config has the block).
4. **Cloudflare rules:** bot protection must not challenge `/public-media/*` or `/api/oauth/*` (networks fetch media and redirect back there).

### 11. Media storage on the NAS (NAS team + engineering)
- The NAS API (from the NAS team): `POST <NAS_API_URL>/upload` with form fields `key` and `file`, `DELETE <NAS_API_URL>/stream/<key>`, bearer token; files public at `<NAS_PUBLIC_URL>/<bucket>/stream/<key>`, no expiry. How the app uses it: [media](backend/modules/media.md#nas-storage).
- The NAS refuses a file whose name extension doesn't match its type (415). The app's keys always match.
- Uploads go **browser → our API → NAS**: the API host needs disk in `STORAGE_TEMP_DIR` for files in flight (up to 1 GB per video).
- Big uploads use the NAS's direct address over **plain HTTP** (an IP and port, in the password manager): Cloudflare in front of `media.globussoft.com` caps a request at 100 MB. Accepted for staging; the token and files cross the network unencrypted.
- The NAS refused one connection for a moment during the first test; sends now retry up to 3 times.

### 12. Network developer apps (engineering)
Each network's **development** app gets the staging callback `https://app-dev.socioboard.ai/api/oauth/<network>/callback` (`facebook`, `instagram`, `linkedin`, `x`, `youtube`, `pinterest`, `tiktok`, `snapchat`, `tumblr`, `bitly`), then its keys go in the env file and the apps are restarted (`pm2 reload socioboard-api socioboard-worker --update-env`). Per-network details: [developer apps](developer-apps.md).

## What was done on 2026-10-06, in order
The staging setup as it happened, each item pointing at its step above; tick these off for production.

1. Server checked (read-only): OS, CPU, memory, disk, what's installed, which ports are taken, other projects on it. → [The server](#the-server)
2. DevOps prepared: the app user and key, nvm with Node 24, PM2, the OpenObserve binary, a Valkey binary and config, the Postgres database and user. → steps 1–5
3. Code cloned to `~/socioboard`, pnpm installed, dependencies installed and the three apps built on the server. → steps 2, 7
4. OpenObserve started under PM2 on 127.0.0.1 with its vendor pings off; its login checked from the server. → step 5
5. Env file written with the URLs and `NODE_ENV=production`; `AUTH_SECRET` and `ENCRYPTION_KEYS` generated on the server; the database, Valkey and OpenObserve passwords added by hand. → step 7
6. Valkey checked through the env file: login and `noeviction` fine, `appendonly` was off and was turned on (saved to its config). → step 4
7. ffmpeg (static 7.0.2) installed in `~/.local/bin`; its full paths added to the env file after PM2 couldn't find it. → step 6
8. First deploy failed at the database login: the names had underscores, not hyphens; fixed in the env file, then all six migrations applied and the three apps started. → steps 3, 8
9. Web moved from port 8080 to 3001 at DevOps' request (PM2 config and nginx reference updated, redeployed). → step 9
10. DevOps: DNS through Cloudflare, Let's Encrypt certificate, the nginx site. Checked from outside: HTTPS redirect, app pages, `/api/health`, Socket.IO polling and the WebSocket upgrade (101), `/public-media/`. → step 10
11. DevOps added the real visitor IP from Cloudflare (`CF-Connecting-IP`, all 22 ranges, checked against Cloudflare's list). → step 10
12. Ports 3000 and 3001 found reachable from the internet; left open on purpose for staging. → [Still open](#still-open-on-staging)
13. DevOps set up `pm2 startup` for the app user; the PM2 list saved. → step 9
14. Media storage: S3 dropped for cost, an S3 server on the NAS ruled out (DevOps couldn't host it), so the app gained a NAS storage driver for the NAS team's upload/delete API. Checked against the real NAS (upload, public read, ranges, overwrite, delete), then staging switched to it (`STORAGE_DRIVER=nas`, the `StoredObject` migration). → step 11
15. End-to-end media check through the public domain: sign-up and verification (link from the API log, no SMTP yet), a workspace, an image upload with its thumbnail, a 17 MB video in two parts, files served from the NAS. The NAS refused one connection during the first video; sends now retry. → step 11, [Checks](#checks-after-a-deploy)
16. Valkey, found running outside PM2 (it wouldn't have come back after a reboot), moved under PM2 with all its data; the PM2 list saved again. → steps 4, 9

## Day to day

| Task | Command (app user, in `~/socioboard`) |
| --- | --- |
| Deploy the latest `6.0` | `deploy/staging/deploy.sh` |
| See processes | `pm2 ls` |
| Logs | `pm2 logs socioboard-api --lines 100` (also `socioboard-worker`, `socioboard-web`, `valkey`, `openobserve`); nginx: `~/socioboard-access.log`, `~/logs/socioboard-error.log` |
| Restart after an env change | `pm2 reload socioboard-api socioboard-worker --update-env` |
| Roll back | `git checkout <previous commit>`, then `pnpm install --frozen-lockfile && pnpm build && pm2 reload socioboard-api socioboard-worker socioboard-web`. Migrations aren't rolled back: a release that changed the database needs a forward fix instead |
| After changing the PM2 list | `pm2 save` |

## Checks after a deploy

```bash
pm2 ls                                                     # all five online, restarts not climbing
curl -s http://127.0.0.1:3000/api/health                   # {"status":"ok","checks":{"db":"ok","valkey":"ok","storage":"ok"}}
curl -s -o /dev/null -w "%{http_code}\n" https://app-dev.socioboard.ai/login              # 200
curl -s -o /dev/null -w "%{http_code}\n" https://app-dev.socioboard.ai/api/v1/networks    # 401 (no session)
curl -s "https://app-dev.socioboard.ai/api/socket.io/?EIO=4&transport=polling" | head -c 40   # 0{"sid":...
```
Then, in the browser: sign in, open a page (live updates connect), upload an image (it should show its size and thumbnail). The full media path was checked on 2026-10-06 with a script: image upload, processing and thumbnail, a 17 MB video in two parts, files served from `media.globussoft.com`.

## Lessons from setting up staging

| What happened | Rule |
| --- | --- |
| Postgres refused the login: the names were sent with hyphens, created with underscores | Copy names from the server, not from a message |
| Valkey had `appendonly no`, and was started by hand (gone after a reboot) | `appendonly yes`, `noeviction`, and under PM2 |
| ffmpeg found in an SSH login but not by PM2 | Full paths in `FFMPEG_PATH` / `FFPROBE_PATH` |
| The built API crashed at start outside Docker: Bull Board's files weren't found in a workspace checkout | Fixed in code (it resolves through `@socioboard/core`); test a PM2 start whenever the build changes |
| `deploy.sh` lost its executable bit (committed from Windows) | `git update-index --chmod=+x` |
| OpenObserve "wrong credentials" in the browser | A local OpenObserve held port 5080; tunnel to 15080 |
| A second OpenObserve started by hand | One copy only, under PM2 |
| The NAS URL lacked its bucket | `NAS_API_URL` ends with `/socioboard-dev` |
| Visitors appeared as Cloudflare IPs | `real_ip_header CF-Connecting-IP` with Cloudflare's ranges |
| Theme switch and animations felt slow on the deployed app | Fixed in code; worth a look on the real server after UI changes |

## Still open on staging

| Item | Owner | Why it matters |
| --- | --- | --- |
| **SMTP relay** (`SMTP_URL`) | DevOps | Nobody can verify an email or accept an invitation |
| **Postgres backups** (daily + point-in-time, one restore tested) | DevOps | P0-I6 |
| Ports **3000 and 3001 reachable from the internet** | Left open on purpose (2026-10-06) | Skips Cloudflare, HTTPS and nginx; close for production |
| Deploy on every merge | Engineering | Manual (`deploy.sh`) for now |
| Network developer apps pointed at the staging callbacks, keys in the env file | Engineering + you | Needed to connect accounts on staging |
| Cloudflare SSL mode "Full (strict)" | DevOps | Confirm |
| NAS's DSM admin page open to the internet (ports 5000/5001) | DevOps / NAS team | Restrict to office or VPN |
| Test data: accounts `nas-check-…@example.test`, workspaces "Staging NAS check …" | Engineering | Remove when convenient |

## Production: what changes

Do every step above, with these differences:

1. **Domain:** decide it (`app.socioboard.ai` or `app.socioboard.com`) and update `APP_URL`, `MEDIA_PUBLIC_URL`, the nginx site, the certificate, and every network's **production** app callbacks. Network reviews (Meta, TikTok, Google) are tied to these exact URLs.
2. **A server of its own**, not shared with other projects. Size for real traffic; the worker's video work is the heaviest part.
3. **Firewall:** only 80 and 443 (and SSH from the office/VPN). Ports 3000, 3001, 5080, 5081, 5432 and 6380 closed from outside.
4. **PostgreSQL 17**, with backups and point-in-time recovery from day one, and a tested restore.
5. **Secrets:** generate new `AUTH_SECRET` and `ENCRYPTION_KEYS` (never reuse staging's); store them in the password manager or a secret manager.
6. **Storage:** the NAS API over **HTTPS** (the token and files must not cross the internet in plain text), or S3; and a decision on whether public links without expiry are acceptable for customer media (S3 keeps them private with expiring links). Back up the media.
7. **SMTP** with SPF, DKIM and DMARC on the sending domain.
8. **Deploy:** tagged releases rather than a branch; automate the deploy; keep a rollback plan for releases with migrations.
9. **Monitoring:** OpenObserve dashboards and alert rules, an uptime check on `/api/health` (Uptime Kuma), and SMTP so the app's built-in alerts reach platform admins (P5-I2).
10. **Network apps:** production apps, reviewed, with their own keys; development apps stay on staging.
11. **Legal pages** (`/privacy`, `/terms`, `/data-deletion`) live before any network review.
