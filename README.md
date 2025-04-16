# AI Platform

This repository contains the frontend and backend components of the AI Platform project. The frontend is built with Next.js, TypeScript, and Tailwind CSS, while the backend serves as the API.

## Tech Stack

### Frontend

- **Framework:** [Next.js](https://nextjs.org/) (App Router)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **UI Library:** [React](https://reactjs.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Real-time:** [Socket.IO Client](https://socket.io/docs/v4/client-api/)
- **State Management:** React Context API (for Authentication)

### Backend

- API server for authentication, admin functions, and real-time features
- MongoDB database integration
- Socket.IO server for real-time communication

## Prerequisites

- **Node.js:** Version 18.x or later
- **npm or yarn:** For package management

## Setup Instructions

### Backend Setup

1. **Navigate to the backend directory:**

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Configure environment variables:**
   Create a `.env` file in the backend directory with appropriate settings.

4. **Start the backend server:**
   ```bash
   npm start
   ```
   The backend server typically runs on http://localhost:5001.

### Frontend Setup

1. **Navigate to the frontend directory:**

   ```bash
   cd ai-platform/frontend
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Configure environment variables:**
   Create a `.env.local` file in the frontend directory:

   ```
   NEXT_PUBLIC_BACKEND_API_URL=http://localhost:5001/api
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```
   The frontend application will be available at http://localhost:3000.

## Project Structure

### Frontend Structure

```
frontend/
├── src/
│   ├── app/              # Next.js App Router routes
│   ├── components/       # Reusable React components
│   ├── contexts/         # React Context providers
│   ├── hooks/            # Custom React hooks
│   ├── utils/            # Utility functions
│   └── services/         # API service functions
```

## Features

### Authentication

- Admin login system with JWT tokens
- Protected admin routes
- Role-based access control

### Admin Panel

- User management (list, view, edit)
- System log viewer with pagination
- Admin-specific dashboard

### Real-time Features

- WebSocket integration via Socket.IO
- Real-time event handling

## Accessing the Application

1. Ensure both backend and frontend servers are running
2. Navigate to http://localhost:3000 in your browser
3. For admin access, go to http://localhost:3000/admin/login

## Development Notes

- Admin users must be configured in the backend MongoDB database
- Authentication tokens are stored in localStorage (development only)
- The AdminRouteGuard component protects admin routes from unauthorized access
