## 📌 Title & Description

# Stack Server

This is the backend repo for the real-time chat application Stack, built with Express.js, Node.js, and MongoDB. It handles authentication, real-time messaging via Socket.IO, and data persistence.

*This is the repo containing the frontend part built on Next js*

The frontend repo is available [here](https://github.com/sizan14789/stack)

--- 

### Live Link 

[**Click here**](https://stack-sizan.vercel.app) or copy and paste https://stack-sizan.vercel.app/login

<br />

---

### Preview

*In the frontend repo readme. [Click here](https://github.com/sizan14789/stack) to see.*

<br />

---

### 🚀 Features

* 🔑 User authentication using JWT

* 💬 Real-time messaging with Socket.IO

* 🗂️ Private chat handling

* 📁 (Upcoming) Image/file storage via Cloudinary

* 📝 REST APIs for user management and messages

<br />

---

### 🛠️ Tech Stack

**Backend:** Express.js, Node.js

**Database:** MongoDB

**Realtime:** Socket.IO

**Auth:** JWT 

**Deployment:** Render

<br />

---

### ⚙️ Installation & Setup (Backend)

#### Clone the server repo:

```
git clone https://github.com/sizan14789/stack-server.git
```
#### Then set up the *_.env_* file

```ini

PORT=3001
SERVER_URL="http://localhost:3001"
FRONTEND_URL=your frontend url

STAGE='dev'

JWT_SECRET=your secret key 

MONGO_URL= database link

```
#### Install modules
```
npm i
```
#### Run
```
npm run dev
```

Your server is live at [http://localhost:3001](http://localhost:3001) 

