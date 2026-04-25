# Browser Dashboard

A clean, modern browser start/new-tab page built with vanilla HTML, CSS, and JavaScript — no frameworks, no build step.

## Features

| Feature | Details |
|---|---|
| 🕐 Live clock | 12-hour clock with AM/PM, updates every second |
| 📅 Date display | Full weekday + month name in the top bar |
| 👋 Greeting | Context-aware greeting (morning / afternoon / evening / night) |
| 🔍 Search bar | Supports Google, Bing, DuckDuckGo, and YouTube; remembers your choice |
| 🔗 Quick links | Default bookmark grid; add/remove links, persisted in localStorage |
| ✅ To-do list | Add, check off, and delete tasks; persisted in localStorage |
| ⛅ Weather | Geo-located weather via OpenWeatherMap (add your free API key) |
| 🎇 Particles | Animated particle background with a gradient that slowly shifts |

## Usage

1. Open `index.html` directly in your browser, **or** set it as your new-tab / home page.
2. *(Optional)* For live weather, paste your free [OpenWeatherMap](https://openweathermap.org/api) API key into `script.js`:
   ```js
   const API_KEY = 'YOUR_KEY_HERE';
   ```

## File structure

```
Browser_Dashboard/
├── index.html   ← page structure
├── style.css    ← all styles (glass-morphism, responsive)
└── script.js    ← clock, search, quick-links, to-do, weather
```

## Screenshot

> Open `index.html` in your browser to see the dashboard live.
