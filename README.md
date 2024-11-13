# Solublog

Solublog is a welcoming and professional tech blogging platform designed to help developers share questions, answers, and insights. It creates a supportive environment where users can engage in discussions and grow as a community.

## Table of Contents

1. [Project Overview](#project-overview)
2. [Features](#features)
3. [Tech Stack](#tech-stack)
4. [Getting Started](#getting-started)
5. [Backend API Documentation](#backend-api-documentation)
6. [Frontend Pages and Components](#frontend-pages-and-components)
7. [Running Tests](#running-tests)
8. [Contributing](#contributing)
9. [License](#license)

---

## Project Overview

Solublog is a full-featured blog platform aimed at developers. Users can create posts, rate content, reply to discussions, and connect with other users. The backend API handles user authentication, post management, notifications, and more, while the frontend offers a seamless and responsive interface for an optimal user experience.

## Features

- **User Authentication**: Includes signup, login, logout, email confirmation, and password reset.
- **Post Management**: Users can create, read, update, delete, and rate posts.
- **Replies and Threads**: Dedicated reply pages for focused discussions.
- **Notifications and Search**: Notification and search features for easy navigation.
- **Profile Customization**: Detailed profiles with name, bio, skills, and social links.
- **Responsive Design**: Works well on both desktop and mobile devices.

## Tech Stack

### Backend

- **Node.js** and **Express.js**: Server-side logic and API development.
- **MongoDB**: Database to store posts, users, and other data.
- **Redis**: Caching for session management.
- **Mocha**: For backend testing.

### Frontend

- **React**: Frontend framework for UI development.
- **Axios**: HTTP client for API requests.
- **React Router**: Navigation between pages.
- **CSS**: For styling and responsive design.

---

## Getting Started

### Prerequisites

- **Node.js** and **npm** (required for backend and frontend setup)
- **MongoDB** and **Redis** (running locally or on a server)

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/your-username/solublog.git
   cd solublog

   ```

2. **Install dependencies:**

   - **Backend**:
     ```bash
     cd backend
     npm install
     ```
   - **Frontend**:
     ```bash
     cd frontend
     npm install
     ```

3. **Set up environment variables:**

   Create `.env` files in both the `backend` and `frontend` directories. Example for backend:

   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/solublog
   REDIS_URL=redis://localhost:6379
   JWT_SECRET=your_jwt_secret

   ```

4. \*\*Start the application

   - **Backend**:
     ```bash
     npm run start-server
     ```
   - **Frontend**:
     ```bash
     cd frontend
     npm start
     ```

## Backend API Documentation

### Authentication

- POST /register - Register a new user.
- GET /connect - Login with email and password.
- GET /disconnect - Logout.
- POST /request-password-reset - Request a password reset link.
- POST /reset-password/:token - Reset password with token.

### Blog Posts

- POST /blogs - Create a new blog post.
- GET /blogs - Get all blog posts.
- GET /blogs/:id - Get a specific blog post by ID.
- PUT /blogs/:id - Update a blog post by ID.
- DELETE /blogs/:id - Delete a blog post by ID.
- POST /blogs/:id/rate - Rate a blog post with a 5-star rating.

### User Profile

- GET /users/me - Retrieve logged-in user details.
- PUT /users/me/:id - Update profile information.
- GET /users - Get all users.
- GET /users/:id - Get a specific user by ID.

### Notifications & Search

- GET /notifications - Get user notifications.
- GET /blogs/s/search - Search for posts.

## Frontend Pages and Components

### Main Pages

- **Home Page**: Displays all blog posts with options for logged-in users to create posts and rate/reply to existing posts.
- **Login & Registration Pages**: Auth pages with form validation and feedback messages.
- **Profile Page**: Editable fields for name, bio, profile picture, skills, and social links.
- **Create Blog Page**: Simple form for writing and submitting blog posts.
- **Notifications Page**: Lists user notifications.
- **Reply Thread Page**: Displays a post and its replies, allowing users to interact within a discussion thread.
- **Search Page**: Search results for keywords.

### Core Components

- **Hegiader**: A fixed header for navigation, adapts to login status.
- **PostCard**: Renders individual posts with rating and reply options.
- **RatingPopup**: Pop-up for rating a post with a 5-star rating system.
- **UserCard**: Displays user information on the Users page.
- **NotificationCard**: Renders individual notifications.

## Running Tests

### Backend Tests

Run Mocha tests for the backend:

```bash
cd backend
npm test
```

### Frontend Tests

You can also add tests using React Testing Library or Jest for frontend components.
