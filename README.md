# BeatBox-sidur: Karaoke Scheduling System

![Schedule Interface](https://res.cloudinary.com/dqfhbqcwv/image/upload/v1743504053/Screenshot_2025-04-01_at_13.40.19_ecngvv.png)
![Employee Management](https://res.cloudinary.com/dqfhbqcwv/image/upload/v1743504054/Screenshot_2025-04-01_at_13.39.05_zldlke.png)
![Login Portal](https://res.cloudinary.com/dqfhbqcwv/image/upload/v1743504055/Screenshot_2025-04-01_at_13.12.30_y0ssiz.png)



## Overview

BeatBox-sidur is a drag-and-drop scheduling application for karaoke venues. It enables efficient room and staff management with independent scheduling for multiple branches.

## Key Features

- **Drag-and-Drop Interface**: Intuitive scheduling with visual color-coding
- **Multi-Branch Support**: Each branch manages their own schedules and employees
- **Role-Based Access**: Admin oversight with branch-specific permissions
- **Schedule Sharing**: Export and share schedules via WhatsApp
- **Color-Coded System**: Visual identification with unique employee colors
- **Hebrew Interface**: Fully localized for Hebrew-speaking users

## Technologies

### Backend

- Node.js & Express
- MongoDB database
- JWT authentication
- RESTful API architecture

### Frontend

- React with Redux state management
- Tailwind CSS for responsive styling
- DND Kit for drag-and-drop functionality
- Shadcn UI components
- Mobile-responsive design

## How It Works

### Schedule Management

1. Create employees with unique colors
2. Drag employees to schedule positions
3. Move assignments with drag-and-drop
4. Export schedules as images for sharing

### Branch Management

- Five supported branches: מוקד, תל אביב, פתח תקווה, ראשון לציון, ראש העין
- Each branch has independent employee roster and schedule
- Admins can manage all branches centrally

## Installation

```bash
# Clone repository
git clone https://github.com/your-username/beatbox-sidur.git
cd beatbox-sidur

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

The application includes automatic initialization that sets up the database structure on first run.

---

© 2025 BeatBox-sidur Karaoke Management System. All rights reserved.
