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

###Query Analysis
    Given Query:
        SELECT * FROM notifications
        WHERE studentID = 1042
        AND isRead = false
        ORDER BY createdAt ASC;

    **Is this query accurate?**
    Yes. This query fetches all unread notifications of student 1042 and displays them in ascending order based on creation time.

    **Why is it slow?**
    The database contains around 5,000,000 notifications.Without proper indexes, the database may scan a large number of rows before finding the required records.The ORDER BY clause also requires sorting, which increases execution time.

    **What would you change?**
    I would create a composite index on studentID, isRead and createdAt.
    
    {
        CREATE INDEX idx_notifications
        ON notifications(studentID, isRead, createdAt);
    }

    **What would be the likely computation cost?**
    Without index:The database may perform a full table scan.
    With index:The database can directly locate matching records, significantly reducing query execution time.
    
    **Should we add indexes on every column?**
    No.Adding indexes on every column increases storage usage and slows down insert and update operations.Indexes should only be created on frequently searched columns.

    **Write a query to find all students who got a placement notification in the last 7 days.**
    {
        SELECT DISTINCT studentID
        FROM notifications
        WHERE notificationType = 'Placement'
        AND createdAt >= NOW() - INTERVAL 7 DAY;
    }

# Stage 4

### The Problem
Currently, notifications are fetched from the database whenever a student loads the page. If thousands of students access the application at the same time (like during placement season), the database will receive too many requests, connection pools will exhaust, and the application will become extremely slow.

### Solution
I would use a REDIS CACHE to drastically reduce the number of database queries.
When a notification is requested, the application first checks Redis. If the data is available in Redis, it is returned immediately. If not, it is fetched from MySQL, returned to the user, and simultaneously stored in Redis for future requests.

#### Advantages

1. Faster API response times (milliseconds).
2. Significantly reduced load on the MySQL database.
3. Much better user experience.

#### Disadvantages

1. Adds infrastructure complexity .
2. Cache invalidation is tricky.

### Recommended Approach

1. Redis Cache.
2. Pagination .
3. WebSockets.
This combination perfectly balances database load and real-time user experience.

# Stage 5

### Problems In The Current Implementation
When looking at this pseudocode, the biggest issue is that it processes notifications one student at a time synchronously. 
1. It's incredibly slow For 50,000 students, this loop will take hours to finish. 
2. No fault tolerance if the external email service fails for 200 students midway through the loop, the script will crash. Those students, and everyone after them, will simply miss their notifications.
3. No retry mechanism If an email fails to send, there is no way to catch the error and try again.

### Should Saving To Database And Sending Emails Happen Together?

"Definitely not". 
Database operations are fast, reliable, and happen on our own servers. Sending emails relies on external third-party services, which are slow and can easily fail due to network issues or rate limits. If we couple them together, a slow email API will drag down our overall system performance. They must be separated.

### Improved Solution
To make this reliable for a large campus, I would introduce an asynchronous Message Queue.

Execution flow:
1. HR clicks "Notify All".
2. Notifications are saved to the database.
3. Notifications are pushed to the application through WebSockets.
4. Email jobs are added to a queue.
5. Background workers process the queue and send emails.
6. Failed emails are retried automatically.

Revised Pseudocode

def notify_all(student_ids, message):
    save_notifications_to_db(student_ids, message)
    push_to_app(student_ids, message)

    for student_id in student_ids:
        add_to_email_queue(student_id, message)
def email_worker(job):
    try:
        send_email(job.student_id, job.message)
    except Exception:
        # If the external API fails, automatically retry later
        retry_email(job)