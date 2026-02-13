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

## Part 2: Prepare Your Code (I have done this)

I have already added two files to your project to make this easy:
1.  `Procfile`: Tells Render how to start your app.
2.  `render.yaml`: Configures the server settings.

**Action Required**:
1.  **Check your Git Remote**:
    Your current remote is: `https://github.com/greencredits/green.git`
    
    *If you own this repository*, just run:
    ```bash
    git push origin main
    ```

    *If you do NOT own this repository* (e.g. you downloaded it), verify you have your own GitHub repository:
    1. Create a new repository on GitHub.
    2. Run these commands in your terminal:
    ```bash
    git remote set-url origin <YOUR_NEW_REPO_URL>
    git push -u origin main
    ```

---

## Part 3: Deploy to Render

1.  **Create Render Account**: Go to [dashboard.render.com](https://dashboard.render.com/) and log in with GitHub.
2.  **New Web Service**:
    *   Click **New +** -> **Web Service**.
    *   Connect your **GitHub repository**.
3.  **Configure**:
    *   **Name**: `greencredits-app` (or whatever you like).
    *   **Region**: Closest to you (e.g., Singapore).
    *   **Branch**: `main` (or master).
    *   **Runtime**: `Node`.
    *   **Build Command**: `npm install`
    *   **Start Command**: `npm start`
    *   **Instance Type**: **Free**.
4.  **Environment Variables (Crucial!)**:
    Scroll down to "Environment Variables" and add these:

    | Key | Value |
    | :--- | :--- |
    | `MONGODB_URI` | *Paste your MongoDB connection string from Part 1* |
    | `NODE_ENV` | `production` |
    | `JWT_SECRET` | *Type a random secret key (e.g., `mySecretKey123`)* |
    | `SESSION_SECRET` | *Type another random secret key* |

5.  **Deploy**:
    *   Click **Create Web Service**.
    *   Render will start building your app. This takes 2-3 minutes.

---

## 🎉 Success!
Once the deployment finishes, Render will verify the service is live. You will see a URL like `https://greencredits-app.onrender.com`.

### ⚠️ Important Limitations of Free Tier
1.  **Spin Down**: If no one visits your site for 15 minutes, the server "sleeps". The next person to visit will wait ~30 seconds for it to wake up.
2.  **File Uploads**: Files uploaded to `uploads/` **will be lost** when the server restarts or sleeps.
    *   *Solution*: For a real production app, you need to switch to cloud storage (like AWS S3 or Cloudinary) for handling image uploads.
