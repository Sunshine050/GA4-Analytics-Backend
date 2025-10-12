# Google Analytics 4 Dashboard

แดชบอร์ดสำหรับแสดงข้อมูล Google Analytics 4 แบบเรียลไทม์

## โครงสร้างโปรเจค

```
project/
├── backend/          # Express.js API Server
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── middleware/
│   │   ├── app.ts
│   │   └── server.ts
│   ├── .env
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
│
└── frontend/         # React + Vite Dashboard
    ├── src/
    │   ├── components/
    │   ├── services/
    │   ├── types/
    │   └── App.tsx
    ├── .env
    ├── package.json
    └── vite.config.ts
```

## การติดตั้ง

### 1. ติดตั้ง Backend

```bash
cd backend
npm install
```

### 2. ตั้งค่า Backend Environment

สร้างไฟล์ `backend/.env`:

```env
GOOGLE_APPLICATION_CREDENTIALS=./service-account.json
GA4_PROPERTY_ID=334194756
GA4_MEASUREMENT_ID=G-6WCW21TL7G
PORT=3000
FRONTEND_URL=http://localhost:5173
```

### 3. ใส่ Service Account JSON

วาง Service Account JSON ไฟล์ของคุณที่ `backend/service-account.json`

วิธีการได้ Service Account:
1. ไปที่ [Google Cloud Console](https://console.cloud.google.com)
2. เลือกโปรเจค
3. ไปที่ IAM & Admin > Service Accounts
4. สร้าง Service Account ใหม่หรือเลือกที่มีอยู่
5. สร้าง Key (JSON) และดาวน์โหลด
6. ย้ายไฟล์ไปที่ `backend/service-account.json`

### 4. ติดตั้ง Frontend

```bash
cd frontend
npm install
```

### 5. ตั้งค่า Frontend Environment

สร้างไฟล์ `frontend/.env`:

```env
VITE_API_URL=http://localhost:3000/api
```

## การรันโปรเจค

### รัน Backend (Terminal 1)

```bash
cd backend
npm run dev
```

Backend จะรันที่ `http://localhost:3000`

### รัน Frontend (Terminal 2)

```bash
cd frontend
npm run dev
```

Frontend จะรันที่ `http://localhost:5173`

## API Endpoints

### GET /api/analytics

ดึงข้อมูลการวิเคราะห์

Query Parameters:
- `start`: วันเริ่มต้น (ค่าเริ่มต้น: "30daysAgo")
- `end`: วันสิ้นสุด (ค่าเริ่มต้น: "today")

Response:
```json
{
  "totalVisitors": 100,
  "totalPageViews": 500,
  "totalSessions": 200,
  "activeUsers": 50,
  "bounceRate": 0.34,
  "averageSessionDuration": 120,
  "topPages": [...]
}
```

### GET /api/analytics/live

ดึงข้อมูลผู้ใช้ที่ออนไลน์อยู่

Response:
```json
{
  "count": 5
}
```

### GET /api/analytics/detailed

ดึงข้อมูลการวิเคราะห์แบบละเอียด

Query Parameters:
- `start`: วันเริ่มต้น
- `end`: วันสิ้นสุด

Response:
```json
{
  "chartData": [...],
  "sources": [...],
  "pages": [...],
  "countries": [...],
  "devices": [...]
}
```

## ฟีเจอร์

- 📊 แสดงข้อมูลผู้เข้าชมแบบเรียลไทม์
- 📈 กราฟแสดงแนวโน้มการเข้าชม
- 🌍 แสดงข้อมูลตามประเทศ
- 📱 แสดงข้อมูลตามอุปกรณ์
- 🔗 แสดงแหล่งที่มาของการเข้าชม
- 📄 แสดงหน้าที่ได้รับความนิยม

## เทคโนโลยีที่ใช้

### Backend
- Node.js + Express.js
- TypeScript
- Google Analytics Data API
- CORS

### Frontend
- React 18
- TypeScript
- Vite
- Tailwind CSS
- Lucide React (icons)

## หมายเหตุ

- ต้องมี Service Account ที่มีสิทธิ์เข้าถึง GA4 Property
- ต้องเปิด Google Analytics Data API ใน Google Cloud Console
