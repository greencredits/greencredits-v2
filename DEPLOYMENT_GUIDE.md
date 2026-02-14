# 🚀 Deployment Guide: GreenCredits on Render (Free)

This guide will help you deploy your application for **FREE** using **Render** (for the server) and **MongoDB Atlas** (for the database).

---

## Part 1: Set up the Database (MongoDB Atlas)

Since you need a free database, we will use MongoDB Atlas.

1.  **Create an Account**: Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) and sign up (Google login is easiest).
2.  **Create a Cluster**:
    *   Choose **M0 Sandbox** (Free Tier).
    *   Select a provider (AWS) and region closest to you.
    *   Click **Create**.
3.  **Set Up User Access**:
    *   Go to **Database Access** (sidebar).
    *   Click **Add New Database User**.
    *   **Username**: `admin` (or your choice).
    *   **Password**: *Create a strong password and copy it!*
    *   Click **Add User**.
4.  **Network Access**:
    *   Go to **Network Access** (sidebar).
    *   Click **Add IP Address**.
    *   Choose **Allow Access from Anywhere** (0.0.0.0/0).
    *   Click **Confirm**.
5.  **Get Connection String**:
    *   Go back to **Database** (sidebar) -> Click **Connect**.
    *   Choose **Drivers**.
    *   **Copy the connection string**. It looks like this:
        `mongodb+srv://admin:<password>@cluster0.abcde.mongodb.net/?retryWrites=true&w=majority`
    *   **Replace `<password>`** with the password you created in step 3.

---

## Part 2: Upload Your Code (Drag & Drop Method)

Since Git is not fully configured on your PC, we will **upload the files manually via the browser**. This is the easiest way.

**Action Required**:
1.  **Create a New Repository**:
    *   Go to [GitHub.com/new](https://github.com/new).
    *   **Name**: `greencredits-v2`.
    *   Select **Public**.
    *   **Check** "Add a README file" (This is important for the upload button to appear).
    *   Click **Create repository**.

2.  **Upload Files**:
    *   In your new repository, click **Add file** > **Upload files**.
    *   **Drag and drop** all the files from your `greencredits_updated-main` folder into the browser window.
        *   *(Tip: Open your folder, press Ctrl+A to select all, then drag them in).*
        *   **Important**: Do NOT upload the `node_modules` folder if you see it. It's too big and unnecessary.
    *   Wait for the files to upload.
    *   Scroll down, name the commit "Initial upload", and click **Commit changes**.

Your code is now on GitHub! 🎉

---

## Part 3: Deploy to Render

1.  **Create Render Account**: Go to [dashboard.render.com](https://dashboard.render.com/) and log in with GitHub.
2.  **New Web Service**: Click **New +** -> **Web Service**.
3.  **Connect GitHub**: Select your `greencredits-v2` repository.
4.  **Settings**:
    *   **Runtime**: `Node`
    *   **Build Command**: `npm install`
    *   **Start Command**: `node server.js`
    *   **Instance Type**: Free
5.  **Environment Variables**:
    *   `MONGODB_URI`: *Paste your connection string*
    *   `NODE_ENV`: `production`
    *   `JWT_SECRET`: `randomkey`
    *   `SESSION_SECRET`: `randomkey`
6.  Click **Deploy**.

---

## Part 4: Initialize Database (CRITICAL STEP) 🛠️

Once your app is "Live", you need to create the default accounts.

1.  **Open your deployed App URL** (e.g., `https://greencredits-app.onrender.com`).
2.  **Add this to the end of the URL**:
    `/api/setup-db?secret=green2025setup`
    
    Full URL example:
    `https://greencredits-app.onrender.com/api/setup-db?secret=green2025setup`

3.  Hit **Enter**. You should see: `{"success":true,"message":"Database seeded..."}`.

---

## 🔑 Default Logins

**Super Admin**
*   **Email**: `cmo@gonda.gov.in`
*   **Password**: `SuperAdmin2025`

**Zone Officer**
*   **Email**: `officer1@gonda.gov.in`
*   **Password**: `Officer@123`

**Worker**
*   **Mobile**: `9999999991`
*   **Password**: `Worker@123`
