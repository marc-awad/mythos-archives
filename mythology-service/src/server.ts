// src/server.ts

import app from './app';
import config from './config';

const PORT = config.port;

app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║   🏛️  MYTHOLOGY SERVICE STARTED        ║
╠════════════════════════════════════════╣
║  Port: ${PORT}                           ║
║  Environment: ${config.nodeEnv}        ║
║  Lore Service: ${config.loreServiceUrl} ║
╚════════════════════════════════════════╝
  `);
  console.log(`Stats endpoint: http://localhost:${PORT}/mythology/stats`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});
