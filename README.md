# 🩸 BloodSync — Smart Blood Bank & Donation Management System

BloodSync is a modern, responsive, and intelligence-driven **Online Blood Bank Management System** designed to bridge the critical gap between blood donors, healthcare providers, and patients in urgent need. Built with a robust Node.js/Express backend and an interactive, highly visual frontend, BloodSync offers tools for donor screening, compatibility matching, and emergency coordinator logistics.

---

## 🚀 Key Features

### 1. 🧪 Dynamic Transfusion Simulator
* **Interactive Matching:** Select different donor and recipient blood groups to visually simulate blood compatibility in real time.
* **Immune Response Insights:** Understand universal donors (`O-`) and universal recipients (`AB+`) through real-time feedback and dynamic SVG fluid transfer animations.

### 2. 📋 Scientific Eligibility Quiz & Passport
* **Nadler's Volume Estimator:** Calculate a donor's exact blood volume in liters based on height, weight, and biological gender.
* **Pre-Screening Wizard:** A gamified 6-step questionnaire evaluating international regulatory standards (age, weight, travel, recent tattoos/piercings, medical history).
* **Digital Donor Passport:** Generates a downloadable, verified digital passport for qualified donors to expedite check-ins at centers.

### 3. 🚨 Smart Emergency Demand Coordinator
* **Disaster Simulation Sandbox:** Simulate massive trauma events (e.g., highway pileups, category-3 hurricanes, seasonal outbreaks) to project sudden blood demand spikes.
* **Automatic Deficit Analytics:** Analyzes current local inventories across clinics and highlights critical shortages.
* **Intelligent Dispatch System:** Recommends exact logistics reallocations with real-time distance and ETA routing for medical transport.

### 4. 🔗 Unified Donation & Request Infrastructure
* **Donation Appointments:** Schedule slots for donating whole blood, platelets, or plasma at nearby community centers.
* **Urgent Patient Requests:** Patients can create urgent requests specifying required blood group, location, hospital, units needed, and urgency level.
* **Interactive Live Feed:** Real-time updates on active requests, fulfilled matches, and current system needs.

---

## 🛠️ Technology Stack

* **Backend Engine:** Node.js, Express.js
* **Security & Sessions:** JSON Web Tokens (JWT), Cookie-Parser
* **Frontend View:** Vanilla HTML5, CSS3 (Glassmorphism & Flexbox), Modern JS
* **UI enhancements:** FontAwesome Icons, Google Fonts (Poppins & Inter)

---

## ⚙️ Running Locally

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed (v16.0.0 or higher recommended).

### 1. Clone & Navigate
```bash
git clone https://github.com/Sakthi2430/BloodSync.git
cd BloodSync
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Run the Server
Start the development server:
```bash
npm run dev
```
The application will start running on [http://localhost:3000](http://localhost:3000).

---

## 📂 Project Structure

```text
├── compatibility-engine.js  # Transfusion simulator frontend controller
├── gamified-eligibility.js  # Pre-screening wizard & Nadler's calculator
├── smart-emergency-planner.js# Emergency coordinator sandbox
├── server.js                 # Express server backend & JWT auth routes
├── package.json             # Project dependencies & scripts
├── style.css                # Glassmorphic styles & responsiveness rules
├── data/                    # JSON local storage (users, donations, requests)
├── src/                     # Project assets (images, static icons)
└── *.html                   # Application pages (index, login, dashboard, etc.)
```

---

## 🔒 Security & Data Privacy

BloodSync implements a secure session system using JWTs stored in HTTP-only cookies to ensure that donor profiles and private health details remain confidential. The system mocks data locally using a structured JSON database in the `data/` directory, allowing simple setup without database overhead.
