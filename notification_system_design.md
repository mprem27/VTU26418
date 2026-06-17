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

# Stage 2

### Database Selection

I recommend using MySQL as the persistent storage solution for the notification platform.

#### Reasons
1. High Read/Write Performance.
2. Ecosystem & Replication.
3. Strong ACID Compliance

### Database Schema
#### Students Table
{
    id (INT, Primary Key)
    name (VARCHAR(255), NOT NULL)
    email (VARCHAR(255), UNIQUE, NOT NULL)
    createdAt (TIMESTAMP, Default: CURRENT_TIMESTAMP)
}

#### Notifications Table

{
    id (VARCHAR(36), Primary Key - stores UUIDs)
    studentId (INT, Foreign Key -> students.id, Indexed)
    notificationType (ENUM('Event', 'Result', 'Placement'))
    message (TEXT)
    isRead (BOOLEAN, Default: FALSE)
    createdAt (TIMESTAMP, Indexed, Default: CURRENT_TIMESTAMP)
}

### SQL Schema Initialization

CREATE TABLE students (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL,
    notification_type ENUM('Event','Result','Placement') NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

# Stage 3

