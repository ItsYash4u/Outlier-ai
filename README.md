# VibeCoding - AI-Powered Professional Network

A reimagination of LinkedIn with AI-powered features for career development and networking.

## Project Structure

```
vibecoding/
├── client/           # React frontend
├── server/           # Node.js backend
└── README.md
```

## Tech Stack

- Frontend: React + Vite + TailwindCSS
- Backend: Node.js + Express
- Database: MongoDB Atlas
- Authentication: JWT

## Setup Instructions

### Backend Setup
1. Navigate to server directory: `cd server`
2. Install dependencies: `npm install`
3. Create `.env` file with:
   ```
   MONGODB_URI=your_mongodb_uri
   JWT_SECRET=your_jwt_secret
   PORT=5000
   ```
4. Start server: `npm run dev`

### Frontend Setup
1. Navigate to client directory: `cd client`
2. Install dependencies: `npm install`
3. Create `.env` file with:
   ```
   VITE_API_URL=http://localhost:5000
   ```
4. Start development server: `npm run dev`

## Features

- AI-powered career coaching
- Smart profile recommendations
- Professional networking
- Real-time chat
- Personalized feed 