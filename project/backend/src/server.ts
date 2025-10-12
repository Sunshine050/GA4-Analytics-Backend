// src/server.ts
import app from './app.js';
import { serverConfig } from './config/ga4.config.js'; // เพิ่ม .js สำหรับ ES Modules หลัง compile

const PORT = serverConfig.port;

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`📊 GA4 Analytics API ready`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});
