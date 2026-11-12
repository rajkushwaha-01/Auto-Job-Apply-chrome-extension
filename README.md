# Auto Job Apply Autofill — Chrome Extension

An automated job application assistant designed for technical roles. This Chrome extension automatically fills your saved profile into job application forms across major ATS platforms including **Greenhouse**, **Lever**, **Ashby**, **Workable**, and **Workday**.

---

## Supported Job Boards

- **Greenhouse** (`boards.greenhouse.io`, `job-boards.greenhouse.io`)
- **Lever** (`jobs.lever.co`)
- **Ashby** (`jobs.ashbyhq.com`)
- **Workable** (`apply.workable.com`)
- **Workday** (`*.myworkdayjobs.com`)

---

## Prerequisites

1. **Google Chrome** (or any Chromium-based browser like Brave, Edge, or Arc).
2. **Backend Server Running**: The extension connects to `http://localhost:3000` by default.
   - Ensure your backend API server is running with the following endpoints:
     - `POST /api/auth/login` — Authenticates user and returns `{ token: "..." }`.
     - `GET /api/autofill/me` — Returns the user's saved autofill profile `{ profile: { ... } }`.

> **Note:** If your backend is hosted remotely, update `API_BASE` in [`popup.js`](popup.js) and [`background.js`](background.js), and add the URL to `host_permissions` in [`manifest.json`](manifest.json).

---

## How to Install in Google Chrome (Step-by-Step)

### Step 1: Open Chrome Extensions Page
1. Open Google Chrome.
2. In the address bar, type:
   ```text
   chrome://extensions/
   ```
   and press **Enter**.
   *(Alternatively: Click the 3-dot menu in Chrome top-right → **Extensions** → **Manage Extensions**).*

### Step 2: Enable Developer Mode
- In the top-right corner of the Extensions page, toggle the switch for **Developer mode** to **ON**.
- You will see three new buttons appear: **Load unpacked**, **Pack extension**, and **Update**.

### Step 3: Load the Extension
1. Click the **Load unpacked** button in the top-left corner.
2. In the folder picker window, navigate to and select this extension folder:
   ```text
   c:\Users\rajku\Desktop\extension
   ```
   *(Select the folder containing `manifest.json` and click **Select Folder**).*
3. **Auto Job Apply Autofill** will now appear in your list of installed extensions.

### Step 4: Pin Extension to Toolbar
1. Click the **puzzle piece icon** (Extensions) in the top-right of your Chrome toolbar.
2. Locate **Auto Job Apply Autofill** in the list.
3. Click the **Pin icon** next to it so the icon stays visible in your toolbar.

---

## How to Use

1. **Sign In**:
   - Click the extension icon in your Chrome toolbar.
   - Enter your email and password.
   - Click **Login** (or press Enter).
   - Once authenticated, the popup displays **Logged in ✓**.

2. **Navigate to a Job Application**:
   - Open any job application page on Greenhouse, Lever, Ashby, Workable, or Workday.
   - Scroll to the application form.

3. **Autofill the Form**:
   - Click the extension icon.
   - Click **Autofill this page**.
   - Your name, email, phone, location, LinkedIn, GitHub, portfolio, resume, and experience details will populate automatically.

---

## Reloading After Making Code Changes

When editing files like `popup.html`, `popup.js`, `content.js`, or `background.js`:
1. Go back to `chrome://extensions/`.
2. Locate the **Auto Job Apply Autofill** card.
3. Click the **circular refresh icon** (Reload) on the card.
4. If you have a job page open, refresh that page (`F5` or `Ctrl+R`) so the updated content script is loaded.

---

## Troubleshooting

| Issue | Solution |
| :--- | :--- |
| **"Could not reach this page..."** | Refresh the job board webpage and reopen the popup. Content scripts inject when the page loads. |
| **"Login failed" or "Request failed: Failed to fetch"** | Ensure your backend server is running on `http://localhost:3000` and reachable. |
| **"No token found"** | Open the extension popup, log in with your credentials, then try again. |
| **Changes not showing in popup** | Close the popup, reload the extension on `chrome://extensions/`, and reopen the popup. |
| **Workday page not filling** | Workday often requires creating an account or signing in first. Reach the actual form inputs before clicking Autofill. |

---



