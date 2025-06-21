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
