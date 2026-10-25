# 👑 VividWake Admin Analytics Dashboard

A modern, high-performance Next.js administrative mission control to visualize live **SessionFlow user journeys**, device breakdowns, and conversion funnels for **VividWake**.

---

## 🔒 Security Gate
* **Master Password:** `romeoPistol`
* Connects directly to **MongoDB Atlas** (`vividwake` cluster).

---

## ⚡ Running Locally

```bash
cd C:\Users\Administrator\Desktop\vividwake-admin
npm run dev
```
Open **[http://localhost:3001](http://localhost:3001)** in your browser!

---

## ☁️ Deploying to Vercel (100% Free Forever)

1. Push this folder to a GitHub repository (e.g. `vividwake-admin`).
2. Go to **[vercel.com](https://vercel.com/)** and click **"Add New" ➔ "Project"**.
3. Import `vividwake-admin`.
4. In **Environment Variables**, add:
   * `MONGO_URL` = `mongodb+srv://gagankumar8294_db_user:oQvMSXfMZjYotGT7@cluster0.kfodfcn.mongodb.net/vividwake?retryWrites=true&w=majority`
   * `ADMIN_PASSWORD` = `romeoPistol`
5. Click **"Deploy"**.  
   *(Vercel gives you an instant free URL like `https://vividwake-admin.vercel.app`)*

---

## 📊 Features & Views

* **KPI Summary Header:** Real-time metrics for Total Sessions, Unique Devices, Previews Streamed, Downloads Completed, Set to Lock Screen, and Freed Storage.
* **Date Filter Pills:** Last 7 days quick-pills + All Time.
* **Session List (Left Column):** Device model, Android OS version, IP address, dwell time, and action count.
* **Session Journey Flow (Right Column):** Interactive chronological tree showing every single user tap, tab switch, video preview dwell time, and download completion.
* **Auto-Refresh:** Live sync every 15 seconds.
