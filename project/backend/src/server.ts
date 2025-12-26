import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import app from './app.js';
import { serverConfig } from './config/ga4.config.js';

// ---------- Load environment variables ----------
dotenv.config();

// ---------- Resolve base directory ----------
const BASE_DIR = process.cwd();

// ---------- Load GA4 Service Account ----------

// Local development
if (process.env.NODE_ENV !== 'production') {
  const localPath = path.join(BASE_DIR, 'service-account.json');

  if (fs.existsSync(localPath)) {
    process.env.GOOGLE_APPLICATION_CREDENTIALS = localPath;
    console.log('✅ Using local service-account.json for GA4');
  } else {
    console.warn('⚠️ Local service-account.json not found!');
  }
}

// Production (Render / Vercel)
if (process.env.NODE_ENV === 'production') {
  // Render Secret File path
  const secretPath = '/etc/secrets/service-account.json';

  if (fs.existsSync(secretPath)) {
    process.env.GOOGLE_APPLICATION_CREDENTIALS = secretPath;
    console.log('✅ Using production Secret File for GA4');
  } else {
    console.warn('⚠️ Production Secret File not found! Check secret path.');
  }
}

// ---------- Start server ----------
const PORT = Number(process.env.PORT || 8000);


app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log('📊 GA4 Analytics API ready');
  console.log(`🔗 Health check: /health`);
});
