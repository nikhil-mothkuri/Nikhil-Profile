# 🚀 Setting Up Your Free Dynamic Firebase Backend ($0/Month)

This project is configured to use **Firebase Spark Plan (100% Free Tier)** to provide:
1. **Dynamic In-Page Content Editing** (Logging in with `nikhilvce@gmail.com` to edit portfolio & blog content without git commits).
2. **Technical Blog** (`nikhilai.in/blog.html`) for publishing essays and architecture opinions.
3. **Reader Comments System** where visitors log in with their email address or 1-click Google account to comment and discuss.

---

### Step 1: Create a Free Firebase Project (2 Minutes)

1. Go to the [Firebase Console](https://console.firebase.google.com/) and click **"Add project"**.
2. Name your project (e.g., `nikhil-portfolio`). Google Analytics can be toggled on or off as desired.
3. Click **"Create Project"**.

---

### Step 2: Enable Authentication

1. In the left sidebar of the Firebase Console, navigate to **Build** → **Authentication**.
2. Click **"Get started"**.
3. Under the **Sign-in method** tab:
   - Click **Google** → toggle **Enable** → select your project support email (`nikhilvce@gmail.com`) → click **Save**.
   - Click **Email/Password** → toggle **Enable** (leave Email link disabled unless desired) → click **Save**.
4. Under the **Settings** tab → **Authorized domains**:
   - Verify `localhost` and your Firebase domain are present.
   - Click **"Add domain"** and add `nikhilai.in` and `nikhil-mothkuri.github.io`.

---

### Step 3: Enable Cloud Firestore Database

1. In the left sidebar, navigate to **Build** → **Firestore Database**.
2. Click **"Create database"**.
3. Choose a location closest to your users (e.g., `asia-south1 (Mumbai)` or `us-central1`).
4. Choose **"Start in production mode"** and click **Create**.
5. Once created, click on the **Rules** tab at the top.
6. Replace the existing contents with the rules from [`firestore.rules`](./firestore.rules) and click **"Publish"**:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isAdmin() {
      return request.auth != null && request.auth.token.email.lower() == 'nikhilvce@gmail.com';
    }
    match /portfolio/{document=**} {
      allow read: if true;
      allow write: if isAdmin();
    }
    match /posts/{postId} {
      allow read: if true;
      allow write: if isAdmin();
    }
    match /comments/{commentId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if isAdmin() || (request.auth != null && request.auth.uid == resource.data.authorId);
    }
  }
}
```

---

### Step 4: Copy Your Web App Config into `js/firebase-config.js`

1. In Firebase Console, click the **Gear Icon ⚙** (Project settings) at the top left.
2. In the **General** tab, scroll down to **"Your apps"** and click the **Web icon `</>`**.
3. Register app with a nickname (e.g. `Nikhil Portfolio`).
4. Copy the `firebaseConfig` object and paste the values into [`js/firebase-config.js`](./js/firebase-config.js):

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "...",
  appId: "..."
};
```

---

### That's it!
Whenever you visit [**nikhilai.in**](https://nikhilai.in/) or [**nikhilai.in/blog.html**](https://nikhilai.in/blog.html):
- Click **"Admin Access"** in the footer or press `Ctrl + Alt + A` (`⌘ + Option + A`).
- Sign in with `nikhilvce@gmail.com` using 1-Click Google Sign-In or Email.
- The Admin Dynamic Island HUD will appear immediately, allowing you to edit text inline, save to Firestore, and publish blog articles!
- Readers can sign in with any email to comment under your blog posts.
