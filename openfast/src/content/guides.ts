export interface Guide {
  id: string;
  category: string;
  title: string;
  body: string;
}

export const GUIDES: Guide[] = [
  // Getting Started
  {
    id: "what-is-if",
    category: "Getting Started",
    title: "What Is Intermittent Fasting?",
    body: "Intermittent fasting is an eating pattern that cycles between periods of fasting and eating. It does not specify which foods to eat, but rather when you should eat them. Common methods involve daily fasting windows or fasting a couple of days per week. Research suggests it can support weight management, metabolic health, and cellular repair processes.",
  },
  {
    id: "fasting-zones",
    category: "Getting Started",
    title: "Understanding Fasting Zones",
    body: "As your fast progresses, your body moves through five distinct metabolic zones: Anabolic, Catabolic, Fat Burning, Ketosis, and Deep Ketosis. Each zone represents a different metabolic state with unique benefits. Tap any zone on the timer screen's timeline bar to explore what happens in each stage, what it means for your body, and tips for getting the most out of your fast.",
  },
  {
    id: "choosing-first-protocol",
    category: "Getting Started",
    title: "Choosing Your First Protocol",
    body: "Beginners typically do best starting with the 12:12 or 14:10 protocol, which fits naturally around sleep hours. As your body adapts over one to two weeks, you can gradually extend your fasting window. The goal is consistency over intensity — a sustainable protocol you can maintain long-term beats an aggressive one you abandon after a few days.",
  },

  // Protocols Explained
  {
    id: "16-8-protocol",
    category: "Protocols Explained",
    title: "The 16:8 Protocol",
    body: "The 16:8 protocol is the most popular form of intermittent fasting, involving a 16-hour fast followed by an 8-hour eating window. Many people skip breakfast and eat between noon and 8 PM, making it easy to fit into daily life. This protocol has been associated with improvements in blood sugar regulation and reduced calorie intake. It is considered a great starting point for those moving beyond beginner protocols.",
  },
  {
    id: "18-6-protocol",
    category: "Protocols Explained",
    title: "The 18:6 Protocol",
    body: "The 18:6 protocol extends the fasting window to 18 hours with a 6-hour eating window. It is an intermediate approach suited to those who have already adapted to 16:8 fasting. The shorter eating window can naturally reduce total calorie intake and may enhance fat-burning benefits. Allow several weeks on a shorter fast before attempting this protocol.",
  },
  {
    id: "omad",
    category: "Protocols Explained",
    title: "OMAD",
    body: "OMAD, or One Meal A Day, compresses all daily nutrition into a single meal eaten within roughly one hour. This is an advanced protocol that provides a prolonged fasting period of around 23 hours. It requires careful attention to nutrition density to ensure adequate vitamins, minerals, and macronutrients in one sitting. OMAD is not recommended for beginners or those with certain health conditions without medical guidance.",
  },

  // Hydration
  {
    id: "hydration-matters",
    category: "Hydration",
    title: "Why Hydration Matters During Fasting",
    body: "Staying well hydrated is especially important during fasting periods because you lose the water content normally found in food. Proper hydration supports energy levels, cognitive function, and helps manage hunger sensations that can be mistaken for thirst. Aim to drink water consistently throughout the day rather than in large quantities at once. Plain water, black coffee, and unsweetened tea are all acceptable during a fast.",
  },
  {
    id: "signs-of-dehydration",
    category: "Hydration",
    title: "Signs of Dehydration",
    body: "Common signs of dehydration include dark-colored urine, persistent headaches, fatigue, and difficulty concentrating. During fasting, these symptoms can be amplified because food provides roughly 20% of daily fluid intake. If you experience dizziness or muscle cramps, increase your water intake immediately. Pale yellow urine is the best indicator that you are adequately hydrated.",
  },

  // Body & Individual Factors
  {
    id: "weight-gender-fasting",
    category: "Body & Individual Factors",
    title: "Does Weight or Gender Affect Fasting Stages?",
    body: "Yes — body weight, composition, and gender can all shift when you enter each fasting zone by a few hours. Larger individuals and those with more muscle mass store more glycogen, which can delay the transition into fat burning. Leaner people often produce ketones sooner because their glycogen depletes faster. Women typically carry less glycogen than men and may enter fat-burning phases slightly earlier, but hormonal fluctuations — especially estrogen and progesterone across the menstrual cycle — can slow or speed ketone production. Extended fasts beyond 24 hours may also affect reproductive hormones more in women. The zone timings shown in this app are population averages; your personal transitions depend on fitness level, diet, metabolic health, and body composition. For precise tracking, blood ketone or glucose monitoring is the gold standard.",
  },

  // Common Questions
  {
    id: "coffee-break-fast",
    category: "Common Questions",
    title: "Does Coffee Break My Fast?",
    body: "Plain black coffee contains negligible calories and does not meaningfully break a metabolic fast. It may actually enhance some fasting benefits by supporting fat oxidation and suppressing appetite. However, adding milk, cream, sugar, or flavored syrups introduces calories that can interrupt the fasted state. Stick to plain black coffee or espresso during your fasting window.",
  },
  {
    id: "exercise-while-fasting",
    category: "Common Questions",
    title: "Can I Exercise While Fasting?",
    body: "Light to moderate exercise such as walking, yoga, and cycling can be performed safely during a fast for most healthy individuals. Some people find fasted workouts feel energizing because of elevated adrenaline and fat-burning activity. High-intensity or strength training is best timed near your eating window so you can refuel with protein and carbohydrates afterward. Always listen to your body and break your fast early if you feel unwell.",
  },
  {
    id: "fasting-safe-for-everyone",
    category: "Common Questions",
    title: "Is Fasting Safe for Everyone?",
    body: "Intermittent fasting is not appropriate for everyone, including pregnant or breastfeeding women, children and teenagers, and individuals with a history of eating disorders. People with diabetes, heart conditions, or other chronic illnesses should consult a healthcare provider before starting any fasting regimen. Side effects like headaches and irritability are common in the first week as the body adjusts. Most healthy adults can fast safely, but personalized medical advice is always recommended.",
  },
];

export function getGuidesByCategory(): Map<string, Guide[]> {
  const map = new Map<string, Guide[]>();
  for (const guide of GUIDES) {
    const existing = map.get(guide.category) ?? [];
    existing.push(guide);
    map.set(guide.category, existing);
  }
  return map;
}
