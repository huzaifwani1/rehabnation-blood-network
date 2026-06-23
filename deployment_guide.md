# RehabNation Blood Network - Render Deployment Guide

Follow these steps to deploy the production backend publicly to Render.

## 1. Verified Environment Variables
The backend web service requires the following environment variables to be set in the Render Control Panel under **Environment**:

* `MONGODB_URI`: The connection string provided by MongoDB Atlas:
  `mongodb+srv://huzaifwani7777_db_user:rGXHjIjTFPHrn1aX@cluster0.yuglo9k.mongodb.net/rehabnation?retryWrites=true&w=majority`
* `JWT_SECRET`: A secure random string used to encrypt JWT signatures (e.g., `supersecretjwtsecretkey123!`).
* `NODE_ENV`: Set to `production`.
* `PORT`: Set to `10000` (Render's default port, or left blank as Render overrides it automatically).

---

## 2. Command Verification
* **Build Command:** `npm install`
* **Start Command:** `node server.js` or `npm start`
* **Root Directory:** `backend` (Ensure Render points to this subfolder if deploying from a monorepo).

---

## 3. MongoDB Atlas Network Access Configuration
To allow the Render web service to connect to your MongoDB Atlas cluster:
1. Log in to your [MongoDB Atlas Dashboard](https://cloud.mongodb.com/).
2. Navigate to **Network Access** under the Security section in the left sidebar.
3. Click **Add IP Address**.
4. Select **Allow Access From Anywhere** (IP Address `0.0.0.0/0`). 
   > [!NOTE]
   > This is required for Render services because Render's free tier web services do not have static outbound IP addresses.
5. Click **Confirm** to save.

---

## 4. CORS Settings Verification
In [server.js](file:///Users/gadgetzone/Projects/Rehabnation%20blood%20network/backend/server.js), CORS is configured using:
```javascript
app.use(cors());
```
This enables wildcard origin access (`Access-Control-Allow-Origin: *`), which is correct and required to support:
* **Vercel Frontend:** Any dynamic frontend URL.
* **Android Application:** Requests originating from Capacitor WebViews (`capacitor://localhost` or `http://localhost`).
* **Custom Domains:** Any future domain without needing code-level adjustments.

---

## 5. Render Deployment Instructions (Step-by-Step)
1. Push your repository code to GitHub, GitLab, or Bitbucket.
2. Sign in to your [Render Dashboard](https://dashboard.render.com/).
3. Click **New** -> **Web Service**.
4. Connect the Git repository containing your RehabNation project.
5. Configure the Web Service settings:
   * **Name:** `rehabnation-backend`
   * **Region:** Select the region closest to your users.
   * **Root Directory:** `backend`
   * **Runtime:** `Node`
   * **Build Command:** `npm install`
   * **Start Command:** `node server.js`
6. Click **Advanced** and add the following **Environment Variables**:
   * `MONGODB_URI` = `mongodb+srv://huzaifwani7777_db_user:rGXHjIjTFPHrn1aX@cluster0.yuglo9k.mongodb.net/rehabnation?retryWrites=true&w=majority`
   * `JWT_SECRET` = `supersecretjwtsecretkey123!`
   * `NODE_ENV` = `production`
7. Click **Create Web Service**.

Once deployed, Render will provide a public URL like `https://rehabnation-backend.onrender.com`.

---

## 6. Production Integration Tests & Verification
Once the backend is live, execute these tests using the production API URL:

### A. Member Registration
- **Action:** POST to `/api/auth/register` with complete donor signup profiles.
- **Verification:** Receive a `201 Created` response containing a fresh `token` and the user profile. Ensure the record appears in your Atlas database under the `users` collection.

### B. Sign In Verification
- **Action:** POST to `/api/auth/login` with your credentials.
- **Verification:** Receive a `200 OK` response with a valid JWT. Validate that the token is stored in the browser's `localStorage` as `rehabnation_token`.

### C. Create Blood Request
- **Action:** POST to `/api/requests` with patient details.
- **Verification:** Receive a `201 Created` response showing the matching donor count. Verify the request is saved in the `bloodrequests` collection.

### D. Search Donors
- **Action:** GET `/api/users/search?blood_type=A%2B&district=Srinagar`
- **Verification:** Ensure it returns a list of compatible donors from the district.

### E. Notifications
- **Action:** GET `/api/notifications` with the bearer token.
- **Verification:** Verify that matching donor accounts receive real-time request alerts.

---

## 7. Production Deployment Checklist
- [ ] Code committed and pushed to GitHub.
- [ ] IP Address `0.0.0.0/0` (Allow Access From Anywhere) added to Atlas Network Access.
- [ ] Web Service created on Render pointing to `backend` directory.
- [ ] `MONGODB_URI` and `JWT_SECRET` environment variables set on Render.
- [ ] Backend server successfully starts without logs crashing.
- [ ] Production API URL mapped in the frontend environment variable `VITE_API_URL`.
- [ ] Frontend successfully built for deployment (`npm run build`).
- [ ] Safe area offsets verified on punch-hole / notched device layouts.
- [ ] Tested end-to-end user journeys (Register -> Request -> Match -> Outcome).
