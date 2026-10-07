---
title: Fair Traffic Nepal
emoji: 🚦
colorFrom: indigo
colorTo: blue
sdk: docker
app_port: 7860
pinned: false
---

# Fair Traffic Nepal 🚦

**Smart Traffic Violation Management and Driver Awareness System**

A full-stack web application built to modernize and automate traffic violation management in Nepal.

## Features

- 🧑‍✈️ **Traffic Officers** — Record violations, upload evidence, manage locations
- 👤 **Citizens** — View violation history, pay fines, submit appeals, track safety score
- 🏛️ **Admins** — Manage users, rules, analytics, audit logs, community service
- 📊 **Analytics** — Real-time traffic data, heatmaps, violation trends
- 🔔 **Notifications** — In-app notification system for all events
- ⚖️ **Appeals System** — Citizens can contest violations with evidence
- 🛡️ **Safety Score** — Gamified driver safety scoring system

## Tech Stack

| Layer    | Technology                        |
|----------|-----------------------------------|
| Backend  | Django 5 · DRF · JWT Auth         |
| Frontend | React 18 · Vite · Vanilla CSS     |
| Database | SQLite (dev) / PostgreSQL (prod)  |
| Server   | Gunicorn · Nginx                  |

## API Endpoints

All API endpoints are namespaced under `/api/v1/`:

- `/api/v1/accounts/` — Authentication & user management
- `/api/v1/vehicles/` — Vehicle registration & verification
- `/api/v1/violations/` — Traffic violations & payments
- `/api/v1/appeals/` — Appeal management
- `/api/v1/locations/` — GPS-based location data
- `/api/v1/notifications/` — User notifications
- `/api/v1/analytics/` — System analytics
- `/api/v1/audit/` — Audit logs
- `/admin/` — Django Admin Panel

## Demo Credentials

| Role    | Username         | Password     |
|---------|------------------|--------------|
| Admin   | admin            | admin123     |
| Officer | officer1         | officer123   |
| Citizen | citizen1         | citizen123   |

---

> Check out the configuration reference at https://huggingface.co/docs/hub/spaces-config-reference
