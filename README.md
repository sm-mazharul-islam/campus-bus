# CampusBus | Real-Time University Transit Telemetry Ecosystem

CampusBus is a premium, high-fidelity transit tracking and instant notification web application designed for university commuter systems. It features simulated live GPS telemetry stream, dynamic geographic map scaling, real-time alerts with synthesized chimes, role-based developer playgrounds, and beautiful responsive analytics.

The system runs entirely out of the box with **zero configuration** over a local SQLite database!

---

## 🌟 Premium Capabilities & Highlights

1. **Server-Side Session Dynamic Routing**
   - Implements a server-rendered dynamic entry point (`/`).
   - Awaits authentication sessions via cookies and immediately serves tailored Student, Driver, or Admin dashboards, while delivering a rich 10-section animated guest landing page for unauthenticated visitors.

2. **Universal Coordinate Scaling & Geo-Map**
   - Features a dynamic bounding box coordinate envelope calculator that scales geographical stop vectors on each render.
   - The map dynamically zooms and centers to fit any route in the world (e.g. Dhaka Metro or Barishal pathways) without clipping.
   - Displays dynamic telemetry stop states: `[PAST]` arrived checkmarks, `[ACTIVE]` glowing markers, `[NEXT]` ETA blue tags, and `[FUTURE]` destination dots.

3. **Dhaka Metro & Barishal Simulated Routes**
   - Pre-seeded with routes including **Dhaka Metro Route** (Gulistan Terminal $\rightarrow$ Shahbagh Intersection $\rightarrow$ Science Lab Crossing) and Barishal University loops.
   - Complete with customized landmarks, titles, and localized details.

4. **Zero-Configuration Instant Real-Time Notifications**
   - Utilizes the native browser **`BroadcastChannel` API** to simulate a highly responsive local WebSocket broker with zero latency.
   - When a Driver triggers an **SOS Emergency Alert** or an Admin broadcasts an alert, a message is instantly published to all open student tabs.
   - Pushed notifications trigger a **futuristic double-chime audio sound** (synthesized locally via the **Web Audio API**) and slide in a glowing animated **floating toast alert card** at the bottom right.

5. **Instant Coordinate Telemetry Sync**
   - Real-time driver simulation coordinate updates are instantly pushed across open student map tabs. Watch the yellow double-decker bus glide smoothly along route stops without any page refreshes or polling latency!

6. **Interactive Driving Simulator Engine**
   - Driver consoles feature simulated driving dashboards: speed dials, interactive steerable wheels, SOS triggers, and boarding checklist scans.

7. **Advanced AI Schedule Chat Assistant**
   - Special chatbot widget querying live SQLite database coordinates in real-time to answer schedule, arrival status, and bus status questions.

8. **Admin Control & Analytics Suite**
   - Fleet manager console equipped with Recharts analytical metrics, interactive map route builders (add stops by tapping the map!), and FCM alerts broadcasters.

---

## 🛠️ Technology Stack

- **Framework**: Next.js 14+ (App Router, Dynamic SSR, Server Actions)
- **UI Logic & Library**: React 19, TypeScript
- **Styling**: Tailwind CSS (Custom Navy `#003087` & Gold `#D4AF37` palettes)
- **Database ORM**: Prisma ORM with high-speed local SQLite
- **Real-Time Layer**: Native Browser `BroadcastChannel` (WebSockets simulation)
- **Audio Synthesis**: Native browser `Web Audio API` (Double-chime alerts)
- **Analytics Charts**: Recharts Data Visualization

---

## 🚀 Getting Started

Follow these simple steps to run the application locally on your machine:

### 1. Install Dependencies
Clone the repository and install the standard NPM packages:
```bash
npm install
```

### 2. Prepare the Database & Seed
Initialize the SQLite schema tables and seed the developer accounts, active buses, scheduled routes, and initial notification bullets:
```bash
node prisma/seed.js
```

### 3. Start the Development Server
Launch the local Next.js development server:
```bash
npm run dev
```

Open your browser at **[http://localhost:3000](http://localhost:3000)** to view the application!

---

## 🎓 Evaluator Quick-Access Accounts

We have pre-seeded test accounts for all roles with single-click auto-fill buttons on the guest landing page for effortless grading:

| Persona Role | Preset Email Address | Test Password | Assigned Route / Bus |
| :--- | :--- | :--- | :--- |
| **🎓 Student** | `student@campusbus.com` | `student123` | Barishal Route B / Bus 12 |
| **🚍 Dhaka Driver** | `driver3@campusbus.com` | `driver123` | Dhaka Metro / Bus 99 |
| **🚍 Barishal Driver** | `driver1@campusbus.com` | `driver123` | Barishal Route A / Bus 12 |
| **⚙️ Fleet Admin** | `admin@campusbus.com` | `admin123` | Control Panel Access |

---

## 🌎 Real-Time Telemetry Simulation Guide

Verify the instant real-time notification, double-chimes, and map tracking systems side-by-side:

1. **Open two browser windows side-by-side** (e.g., one regular window and one Incognito/Private window) at `http://localhost:3000`.
2. **In Window 1 (Student)**:
   - Click **Login Student Panel** (logs in as Sadia Islam).
   - In the sidebar, select **Bus 99 (Dhaka Test Route)**. The dynamic vector map auto-scales on Dhaka coordinates.
3. **In Window 2 (Driver)**:
   - Click the gold **Dhaka Driver Solaiman (Bus 99)** preset.
   - Click **Start Broadcast Simulation**.
   - Watch **Window 1 (Student)** – the yellow bus icon representing Bus 99 will start smoothly gliding stop-to-stop in real-time.
4. **Test SOS Alerts**:
   - In **Window 2 (Driver)**, click **🚨 SOS Emergency Alert**.
   - Instantly in **Window 1 (Student)**, a dynamic audio double-chime will chime, a glowing **🚨 Live Alert Pushed** toast slides in, and the notification center counter updates automatically!
