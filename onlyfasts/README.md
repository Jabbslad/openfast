# OnlyFasts

**The fasting tracker that respects your privacy and your time.**

No accounts. No servers. No subscriptions. Just you and your fast.

OnlyFasts is a free, open-source intermittent fasting tracker that runs entirely in your browser as an installable PWA. Every byte of your data stays on your device.

## Why OnlyFasts?

### Your data is yours. Period.

Most fasting apps want your email, your health data, and a monthly subscription. OnlyFasts stores everything in your browser's local database. Nothing is ever sent anywhere. No analytics, no tracking, no cloud sync. Delete the app and it's gone.

### It works offline

Install it to your home screen and it works without an internet connection. Start a fast on the train, check your progress on a plane, log water in the middle of nowhere. The service worker caches everything locally.

### 7 fasting protocols built in

Pick your protocol before every fast with a visual grid:

| Protocol | Fasting | Eating | Level |
|----------|---------|--------|-------|
| 12:12 | 12h | 12h | Beginner |
| 14:10 | 14h | 10h | Beginner |
| 16:8 | 16h | 8h | Popular |
| 18:6 | 18h | 6h | Intermediate |
| 20:4 | 20h | 4h | Advanced |
| OMAD | 23h | 1h | Advanced |
| 5:2 | 2 days/week | 5 days/week | Weekly |

### Know what's happening inside your body

OnlyFasts tracks 5 metabolic fasting zones as your fast progresses:

- **Anabolic** (0-4h) — Digesting your last meal
- **Catabolic** (4-16h) — Burning stored glycogen
- **Fat Burning** (16-24h) — Fat becomes the primary fuel
- **Ketosis** (24-72h) — Ketone production ramps up
- **Deep Ketosis** (72h+) — Cellular repair and autophagy

The progress ring shows coloured segments for each zone with curved text labels. Tap any zone to explore detailed information about what's happening in your body, the benefits, and practical tips.

### Notifications keep you motivated

Get a push notification each time you enter a new fasting zone, with a motivational message and per-zone emoji. Works even when the app is in the background on supported devices.

### Hydration tracking with a visual twist

A translucent water tumbler fills up as you log water throughout the day. Hit your daily goal and a striped drinking straw drops into the glass with a bounce animation. The water sloshes when you add or remove servings.

### Designed to prevent mistakes

Ending a fast is the most consequential action in the app. OnlyFasts uses a **slide-to-end gesture** instead of a tap button — you have to deliberately drag a thumb across a track to complete your fast. No more accidental endings from a misplaced tap.

### Swipe between screens

No bottom tab bar fighting with iOS safe areas. Swipe left and right between Water, Timer, and Progress screens. Dot indicators at the top show where you are. Settings is a gear icon tap away.

### Streaks, badges, and history

Track your fasting and hydration streaks. Earn 9 badges for milestones like your first fast, a 7-day streak, or a 20-hour extended fast. Tap any completed fast in your history to see a rich summary of your journey through the metabolic zones and the benefits achieved.

### Animated everything

- Progress ring sweeps from zero to your current position each time you visit the Timer
- Zone timeline fills left to right through each stage
- Water tumbler rises with a sloshing wave animation
- Straw drops in with a bounce when you hit your water goal

## Install

### As a PWA (recommended)

Visit [onlyfasts.app](https://onlyfasts.app) on your phone or desktop browser and install it:

- **iOS**: Share button > Add to Home Screen
- **Android**: Three-dot menu > Install app
- **Desktop**: Click the install icon in the address bar

### From source

```bash
git clone https://github.com/Jabbslad/onlyfasts.git
cd onlyfasts
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Tech Stack

React 18 + TypeScript + Vite + Tailwind CSS + Dexie (IndexedDB) + vite-plugin-pwa

## Contributing

Contributions are welcome. Please open an issue to discuss your idea before submitting a pull request.

## License

MIT License — see [LICENSE](./LICENSE) for details.
