# Billboardio - Billboard Advertising Platform

A full-stack web application connecting billboard owners with advertisers. Built with HTML, CSS, JavaScript, Node.js, Express, and MongoDB.

## Features

### For Billboard Owners
- Create and manage billboard listings
- Upload images and set pricing
- Receive and manage booking requests
- Approve or reject advertiser bookings
- Track billboard availability status

### For Advertisers
- Browse available billboards
- Search and filter by location, price, and size
- Send booking requests to owners
- Track booking status
- View owner contact information

### For Administrators
- Manage all users (owners and advertisers)
- Approve or reject billboard listings
- View all bookings and resolve conflicts
- Access platform statistics and analytics
- Monitor system activities

## Tech Stack

**Frontend:**
- HTML5
- CSS3 (Custom styling)
- Vanilla JavaScript

**Backend:**
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- Bcrypt for password hashing

## Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

.env.example

Create a file named .env.example in your project folder.

Copy all the variable names from .env without the values, like this:

DB_URL=
API_KEY=
PORT=


"Copy .env.example to .env and fill in your own values."


### Setup Steps

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/billboardio.git
cd billboardio
