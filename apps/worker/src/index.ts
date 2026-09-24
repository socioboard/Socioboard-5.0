// BullMQ processors are registered here from P0-I5 onward.
console.log('worker started');

// Holds the event loop open until BullMQ workers do (P0-I5).
const keepAlive = setInterval(() => undefined, 1 << 30);

for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.on(signal, () => {
    clearInterval(keepAlive);
    process.exit(0);
  });
}
