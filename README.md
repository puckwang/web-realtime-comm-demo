# Web Realtime Communication Demo

A demo project built with **.NET** (backend) and **React** (frontend) to showcase and compare four common realtime
communication techniques:

- ✅ Polling
- ✅ Long Polling
- ✅ WebHook
- ✅ Server-Sent Events (SSE)

This project helps developers understand the strengths, trade-offs, and practical implementations of various realtime
communication models.

## 🌐 Overview

Realtime communication is essential in modern web applications. This demo illustrates how data can be delivered from
server to client using different approaches:

| Method                   | Description                                          | Push or Poll |
|--------------------------|------------------------------------------------------|--------------|
| Polling                  | Client repeatedly sends requests at intervals        | Poll         |
| Long Polling             | Client sends request and waits until server responds | Poll         |
| Server-Sent Events (SSE) | Server pushes data via a persistent HTTP connection  | Push         |
| WebHook                  | Server actively sends data to a third-party endpoint | Push         |

## 🛠️ Tech Stack

| Layer      | Technology                     |
|------------|--------------------------------|
| Backend    | .NET 10 (ASP.NET Core Web API) |
| Frontend   | NextJS 15 + React 19           |
| Transport  | HTTP, EventStream (for SSE)    |
| Deployment | Docker or .NET + NextJS        |

## 📂 Project Structure

```plaintext
.
├── backend/             # ASP.NET Core API
├── frontend/            # NextJS
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- [.NET 10 SDK](https://dotnet.microsoft.com/download) or later
- [Node.js](https://nodejs.org/) 20 or later
- [npm](https://www.npmjs.com/)

### Starting the Application

#### Backend

1. Navigate to the backend directory:
   ```bash
   cd backend/WebRealtimeCommDemo
   ```

2. Build and run the .NET application:
   ```bash
   dotnet build
   dotnet run
   ```

3. The backend API will be available at `http://localhost:5001`

#### Frontend

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. The frontend application will be available at `http://localhost:3000`

### Starting with Docker

You can use Docker Compose to run both the frontend and backend services together:

1. Make sure you have [Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/)
   installed.

2. From the root directory, run:
   ```bash
   # docker
   docker-compose up -d

   # podman
   podman-compose up -d
   ```

3. The services will be available at:
    - Frontend: `http://localhost:3000`
    - Backend: `http://localhost:5001`

4. To stop the services:
   ```bash
    # docker
    docker-compose down
    
    # podman
    podman-compose down
   ```

## 🔧 Environment Variables

### Frontend

| Variable                   | Description                               | Default                 |
|----------------------------|-------------------------------------------|-------------------------|
| `NODE_ENV`                 | Environment mode (development/production) | `development`           |
| `NEXT_PUBLIC_API_BASE_URL` | URL of the backend API                    | `http://localhost:5001` |

### Backend

| Variable                 | Description                                    | Default                 |
|--------------------------|------------------------------------------------|-------------------------|
| `ASPNETCORE_ENVIRONMENT` | Environment mode (Development/Production)      | `Development`           |
| `ASPNETCORE_URLS`        | URLs the server listens on                     | `http://+:5000`         |
| `CORS_ORIGINS`           | Allowed CORS origins (`;` semicolon-separated) | `http://localhost:3000` |
