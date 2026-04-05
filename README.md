<p align="center">
  <img src="public/icons/icon-192.png" width="80" alt="OnlyFasts icon" />
</p>

<h1 align="center">OnlyFasts</h1>

<p align="center">
  <strong>The fasting tracker that respects your privacy.</strong><br>
  No accounts. No servers. No subscriptions. Just you and your fast.
</p>

<p align="center">
  <a href="https://onlyfasts.app">onlyfasts.app</a>
</p>

---

## What is OnlyFasts?

OnlyFasts is a free, open-source intermittent fasting tracker that runs as an installable PWA. Every byte of your data stays on your device — nothing is ever sent anywhere.

Pick a protocol, start your fast, and watch your body progress through metabolic zones in real time.

## See It In Action

**[Try OnlyFasts live](https://onlyfasts.app)** — install it to your home screen for the full experience.

Three screens, swipe to navigate:

- **Timer** — Progress ring with coloured zone segments and curved labels, slide-to-end gesture, protocol picker
- **Water** — Animated glass tumbler that fills as you log hydration, with a straw that drops in at your goal
- **Progress** — Streaks, 9 achievement badges, weekly calendar, fasting history with body impact summaries

## Features

### :fire: 5 Metabolic Fasting Zones

Track what's happening inside your body as your fast progresses:

| Zone | Hours | What's Happening |
|------|-------|-----------------|
| Anabolic | 0-4h | Digesting your last meal |
| Catabolic | 4-16h | Burning stored glycogen |
| Fat Burning | 16-24h | Fat becomes primary fuel |
| Ketosis | 24-72h | Ketone production ramps up |
| Deep Ketosis | 72h+ | Cellular repair and autophagy |

The progress ring shows coloured segments for each zone with curved text labels. Tap any zone to explore detailed information about what's happening in your body, the benefits, and practical tips.

### :zap: 7 Fasting Protocols

Choose your protocol before every fast with a visual grid — from beginner-friendly 12:12 to advanced OMAD and weekly 5:2.

### :lock: 100% Private

- All data stored locally in IndexedDB
- Zero network requests after the initial load
- No accounts, no analytics, no tracking
- Works completely offline as a PWA
- Export your data as JSON anytime

### :droplet: Hydration Tracking

A translucent water tumbler fills up as you log water. The water sloshes when you add or remove servings. Hit your daily goal and a red-and-white striped straw drops into the glass.

### :shield: Slide-to-End Safety

No more accidental fast endings. OnlyFasts uses a slide-to-end gesture — you have to deliberately drag a thumb across a track to complete your fast.

### :bell: Zone Transition Notifications

Get a push notification with a motivational message each time you enter a new fasting zone. Works in the background on supported devices.

### :sparkles: Animated Everything

- Progress ring sweeps from zero to your current position each time you visit the Timer
- Zone timeline fills left to right through each stage
- Water tumbler rises with a sloshing wave animation
- Straw drops in with a bounce when you hit your water goal

### :chart_with_upwards_trend: Streaks, Badges & History

Track your fasting and hydration streaks. Earn 9 badges for milestones. Tap any completed fast in your history to see a rich summary of your metabolic journey.

### :iphone: Swipe Navigation

No bottom tab bar. Swipe between Water, Timer, and Progress screens. Dot indicators at the top show where you are. Settings is a gear icon tap away.

## Install

### As a PWA (recommended)

Visit **[onlyfasts.app](https://onlyfasts.app)** on your phone or desktop browser:

- **iOS** — Share > Add to Home Screen
- **Android** — Menu > Install app
- **Desktop** — Click the install icon in the address bar

### From source

```bash
git clone https://github.com/Jabbslad/onlyfasts.git
cd onlyfasts
npm install
npm run dev
```

Open [localhost:5173](http://localhost:5173) in your browser.

## Tech Stack

| | |
|---|---|
| **Framework** | React 18 + TypeScript |
| **Build** | Vite |
| **Styling** | Tailwind CSS |
| **Database** | Dexie.js (IndexedDB) |
| **PWA** | vite-plugin-pwa + Workbox |
| **Testing** | Vitest + React Testing Library |

## Contributing

Contributions are welcome. Please open an issue to discuss your idea before submitting a pull request.

## License

MIT License — see [LICENSE](./LICENSE) for details.
