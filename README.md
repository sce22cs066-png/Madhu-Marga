
# 🐝 Madhu-Marga – AI Guided Beekeeping Assistant

## 📌 Problem Statement
Honey bees play a crucial role in crop pollination and provide farmers with an additional source of income through honey production. However, beginner beekeepers often struggle to maintain healthy bee colonies due to lack of knowledge about hive health, pests, seasonal management, and honey flow tracking.

Madhu-Marga is an AI-assisted Android application designed to help farmers monitor hive conditions, maintain inspection logs, track honey harvests, and receive smart intervention suggestions for better hive management.

---

# 🌾 Vision
Madhu-Marga acts as a “Digital Beekeeper’s Diary” where farmers can:

- Register and monitor multiple bee hives
- Log hive inspections regularly
- Track honey production and seasonal honey flow
- Receive AI-based intervention alerts
- Improve pollination and agricultural productivity

The application aims to support sustainable farming and increase high-quality honey production in India.

---

# ✨ Features

## 🏠 Hive Register
- Add multiple hive entries
- Assign Hive ID and location
- View hive-wise performance history

## 📋 Inspection Log
- Daily/weekly hive inspection checklist
- Log observations such as:
  - Queen presence
  - Honey flow
  - Activity level
  - Pest/mite detection
  - Temperature conditions

## 🤖 AI-Based Intervention Alerts
- Decision Matrix logic analyzes inspection data
- Generates alerts such as:
  - “Low Activity Detected”
  - “Possible Queen Loss”
  - “Pest Inspection Recommended”
  - “Good Time for Honey Harvest”

## 🍯 Harvest Tracker
- Record honey harvested from each hive
- Year-over-year honey production comparison
- Hive performance analytics

## 🌸 Flora Calendar
- Displays nearby flowering seasons
- Helps farmers understand nectar availability
- Assists in migration/planning of hives

## 📊 Honey Flow Progress
- Visual progress bar for honey flow season
- Seasonal productivity monitoring

## 🎨 Farmer-Friendly UI
- Clean Android UI
- Honey/Yellow themed design
- Simple navigation for rural users

---

# 🧠 Tech Stack

## Frontend
- Kotlin / Java
- XML Layouts
- Material Design Components

## Backend & Storage
- Room Database
- LiveData
- ViewModel (MVVM Architecture)

## AI / Logic
- Decision Matrix-based recommendation engine
- Simulated GenAI advisory system

## Charts & Visualization
- MPAndroidChart (optional)
- Progress Bars
- RecyclerView dashboards

---

# 📱 Screens Included

1. Splash Screen
2. Dashboard Screen
3. Hive Registration Screen
4. Inspection Log Screen
5. AI Alert Screen
6. Harvest Analytics Screen
7. Flora Calendar Screen

---

# ⚙️ Installation Steps

## Prerequisites
- Android Studio Hedgehog or above
- Android SDK 24+
- Kotlin Support Enabled

## Clone the Repository

```bash
git clone
https://github.com/sce22cs066-png/Madhu-Marga.git

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`
