import express from 'express';

const port = Number(process.env.PORT ?? 3000);

const app = express();

// Liveness only; P0-B11 adds db, Valkey and storage checks.
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

const server = app.listen(port, () => {
  console.log(`api listening on :${port}`);
});

for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.on(signal, () => server.close(() => process.exit(0)));
}
