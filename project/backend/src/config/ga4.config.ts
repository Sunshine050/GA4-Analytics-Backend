import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

export const ga4Config = {
  propertyId: process.env.GA4_PROPERTY_ID || '',
  measurementId: process.env.GA4_MEASUREMENT_ID || '',
  credentialsPath: process.env.GOOGLE_APPLICATION_CREDENTIALS || path.join(process.cwd(), 'service-account.json'),
  bigQueryProjectId: process.env.GOOGLE_CLOUD_PROJECT || 'sharp-cosmos-474810-a0',
  bigQueryDataset: process.env.BIGQUERY_DATASET || 'analytics_508163701',
};

export const serverConfig = {
  port: process.env.PORT || 3000,
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
};