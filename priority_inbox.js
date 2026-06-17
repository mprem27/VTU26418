import { logger } from './logger.js';

async function getPriorityNotifications() {
    try {
        logger("API_REQUEST_STARTED", {});

        let notifications = [];

        try {
            const response = await fetch('http://4.224.186.213/evaluation-service/notifications');
            const data = await response.json();

            if (data && data.notifications) {
                notifications = data.notifications;
            } else {
                throw new Error("API empty");
            }
        } catch (apiError) {
            logger("API_FAILED_USING_MOCK_DATA", {});
            notifications = [
                { "ID": "d1460958", "Type": "Result", "Message": "mid-sem", "Timestamp": "2026-04-22 17:51:30" },
                { "ID": "b283218f", "Type": "Placement", "Message": "CSX Corporation hiring", "Timestamp": "2026-04-22 17:51:18" },
                { "ID": "81589ada", "Type": "Event", "Message": "farewell", "Timestamp": "2026-04-22 17:51:06" },
                { "ID": "ea836726", "Type": "Result", "Message": "project-review", "Timestamp": "2026-04-22 17:50:42" },
                { "ID": "1cfce5ee", "Type": "Event", "Message": "tech-fest", "Timestamp": "2026-04-22 17:50:06" },
                { "ID": "8a7412bd", "Type": "Placement", "Message": "Advanced Micro Devices Inc. hiring", "Timestamp": "2026-04-22 17:49:42" }
            ];
        }

        logger("NOTIFICATIONS_RECEIVED", { count: notifications.length });

        const weights = {
            Placement: 3,
            Result: 2,
            Event: 1
        };

        notifications.sort((a, b) => {
            const weightA = weights[a.Type];
            const weightB = weights[b.Type];
            if (weightA !== weightB) {
                return weightB - weightA;
            }
            return new Date(b.Timestamp) - new Date(a.Timestamp);
        });

        const top10 = notifications.slice(0, 10);

        logger("TOP_10_NOTIFICATIONS", { count: top10.length });

        process.stdout.write("\n=== TOP 10 PRIORITY NOTIFICATIONS ===\n");
        top10.forEach((notification, index) => {
            process.stdout.write(`${index + 1}. ${notification.Type} - ${notification.Message}\n`);
        });
    } catch (error) {
        logger('getPriorityNotifications', { error: error.message });
    }
}

getPriorityNotifications();