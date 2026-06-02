# Finox Project Backlog & Future Enhancements

This file is used to track features, ideas, and technical debt that we want to implement in the future.

## 🚀 Future Enhancements

### Backend & Database
- [ ] **Database-driven Notifications (Hybrid Approach)**
  - *Context*: Currently, dashboard notifications (budget alerts, recent transactions) are computed on-the-fly in the Angular frontend (`TrackerService`).
  - *Goal*: Create a `Notifications` table in the backend to store event-based alerts (e.g., "Monthly report ready", "Large expense logged").
  - *Features*: Implement "Mark as Read" functionality, push notifications, and maintain a historical audit log of alerts.
  - *Note*: Keep state-based alerts (like "You are currently over budget") calculated on-the-fly, and only store discrete events in the DB.

### Frontend
- [ ] (Add your future frontend ideas here)

## 🛠️ Technical Debt
- [ ] (Track refactoring tasks here)
