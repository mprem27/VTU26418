# Stage1

## Core Actions Supported:
1. Fetch notifications.
2. Mark notification as read.

## REST API Contract

###1. Fetch Notifications

Endpoints: `Get /api/v1/notifications`

Headers:
`Authorization: Bearer <pre-authorized-token>`
`Content-Type: application/json`

Response (200 OK):
{
  "status": "success",
  "data": [
    {
      "id": "123",
      "type": "Placement",
      "message": "Interview scheduled",
      "isRead": false,
      "timestamp": "2026-04-22 17:51:18"
    }
  ]
}

2. Mark as Read
`PATCH /api/v1/notifications/{id}/read`
Headers: `Authorization: Bearer <token>`
Response (200 OK): {"status": "success"}

## Real-Time Mechanism
To push real-time updates without polling, the system will use WebSockets (WSS). The client establishes a persistent connection, and the server pushes the JSON payload directly to the client when a new event occurs.

## Stage 2
