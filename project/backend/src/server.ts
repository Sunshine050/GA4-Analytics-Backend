import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import app from './app.js';
import { serverConfig } from './config/ga4.config.js'; // สำหรับ ES Modules หลัง compile

dotenv.config();

// ---------- Load GA4 Service Account ----------

// Local development
if (process.env.NODE_ENV !== 'production') {
  const localPath = path.resolve('./service-account.json'); // อยู่ใน backend folder
  if (fs.existsSync(localPath)) {
    process.env.GOOGLE_APPLICATION_CREDENTIALS = localPath;
    console.log('✅ Using local service-account.json for GA4');
  } else {
    console.warn('⚠️ Local service-account.json not found!');
  }
}

// Production (Render / Vercel)
if (process.env.NODE_ENV === 'production') {
  const secretPath = '/etc/secrets/service-account.json'; // Path ของ Secret File บน Render
  if (fs.existsSync(secretPath)) {
    process.env.GOOGLE_APPLICATION_CREDENTIALS = secretPath;
    console.log('✅ Using Render Secret File for GA4');
  } else {
    console.warn('⚠️ Render Secret File not found! Check path.');
  }
}

// ---------- Start server ----------
const PORT = process.env.PORT || serverConfig.port || 3001;

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`📊 GA4 Analytics API ready`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});
