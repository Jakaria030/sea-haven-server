# Sea Haven
#### Backend server for seamless hotel booking management

## Purpose
The server-side application for Sea Haven is designed to manage and handle backend functionalities of the hotel booking platform. It ensures secure data management, facilitates smooth user interactions, and powers features like authentication, room filtering, and booking operations.

## Key Features
**🔐 Secure Authentication with JWT** <br>
**📊 RESTful API Endpoints** <br>
**💾 MongoDB Integration for Data Storage** <br>
**📉 Efficient Data Filtering and Queries** <br>
**⚙️ Middleware for Enhanced Security** <br>
**🚀 Deployed on Vercel for High Availability** <br>

## Technologies Used
The backend application is powered by the following technologies:
- **Backend Framework:** Node.js, Express.js
- **Database:** MongoDB
- **Authentication:** JSON Web Tokens (JWT)
- **Hosting Platform:** Vercel

## **NPM Packages**
The following npm packages were utilized:

- [`express`](https://www.npmjs.com/package/express): Fast, unopinionated, minimalist web framework for Node.js.
- [`mongodb`](https://www.npmjs.com/package/mongodb): MongoDB driver for Node.js to interact with MongoDB database.
- [`jsonwebtoken`](https://www.npmjs.com/package/jsonwebtoken): Library to create and verify JSON Web Tokens (JWT) for authentication.
- [`dotenv`](https://www.npmjs.com/package/dotenv): Loads environment variables from a `.env` file into `process.env`.
- [`cors`](https://www.npmjs.com/package/cors): Middleware to enable Cross-Origin Resource Sharing.
- [`cookie-parser`](https://www.npmjs.com/package/cookie-parser): Middleware to parse cookies in incoming requests.

## Getting Started
Follow these steps to set up and run the server locally:

1. Clone the repository:
   ```bash
   git clone https://github.com/Jakaria030/sea-haven-server.git
   ```
2. Navigate to the project directory:
   ```bash
   cd sea-haven-server
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Create a `.env` file in the root directory and add the following:
   ```env
   PORT=5000
   MONGO_URI=your-mongodb-connection-string
   JWT_SECRET=your-jwt-secret
   ```
5. Start the server:
   ```bash
   npm start
   ```