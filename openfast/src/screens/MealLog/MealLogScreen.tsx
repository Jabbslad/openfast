import { useState, useEffect, useCallback } from "react";
import { db } from "../../db/database";
import { getStartOfDay, getEndOfDay, formatTime, isSameDay } from "../../utils/time";
import type { MealLog } from "../../types";

function getDateLabel(date: Date): string {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  if (isSameDay(date, today)) return "Today";
  if (isSameDay(date, yesterday)) return "Yesterday";
  if (isSameDay(date, tomorrow)) return "Tomorrow";
  return date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

export function MealLogScreen() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [meals, setMeals] = useState<MealLog[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [newMealText, setNewMealText] = useState("");

  const loadMeals = useCallback(async (date: Date) => {
    const start = getStartOfDay(date);
    const end = getEndOfDay(date);
    const results = await db.mealLogs
      .where("timestamp")
      .between(start, end, true, true)
      .toArray();
    setMeals(results);
  }, []);

  useEffect(() => {
    loadMeals(selectedDate);
  }, [selectedDate, loadMeals]);

  const handleLogMeal = () => {
    setNewMealText("");
    setShowModal(true);
  };

  const handleSave = async () => {
    const trimmed = newMealText.trim();
    if (!trimmed) return;
    await db.mealLogs.add({ timestamp: new Date(), description: trimmed });
    setShowModal(false);
    setNewMealText("");
    loadMeals(selectedDate);
  };

  const handleCancel = () => {
    setShowModal(false);
    setNewMealText("");
  };

  const handleDelete = async (id: number) => {
    await db.mealLogs.delete(id);
    loadMeals(selectedDate);
  };

  const goYesterday = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(d);
  };

  const goToday = () => {
    setSelectedDate(new Date());
  };

  const goTomorrow = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    setSelectedDate(d);
  };

  const dateLabel = getDateLabel(selectedDate);

  return (
    <div className="flex-1 bg-gradient-to-br from-[#0f0f1a] to-[#1a1a2e] px-4 py-6 overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-lg font-semibold">{dateLabel}</h1>
        <button onClick={handleLogMeal}
          className="bg-indigo-500 text-white px-5 py-2 rounded-full text-sm font-semibold min-h-[44px]">
          + Log Meal
        </button>
      </div>

      <div className="flex flex-col gap-2">
        {meals.length === 0 && (
          <div className="text-gray-500 text-sm text-center py-8">No meals logged</div>
        )}
        {meals.map((meal) => (
          <div key={meal.id} className="bg-white/5 rounded-xl p-4 flex justify-between items-center">
            <div>
              <span className="font-medium">{meal.description}</span>
              <span className="text-gray-500 text-sm ml-3">{formatTime(meal.timestamp)}</span>
            </div>
            <button onClick={() => handleDelete(meal.id!)} aria-label="delete"
              className="text-red-400 text-sm min-w-[44px] min-h-[44px] flex items-center justify-center">✕</button>
          </div>
        ))}
      </div>

      <div className="flex justify-center gap-6 mt-6 text-sm">
        <button onClick={goYesterday} className="text-gray-500 min-h-[44px]">← Yesterday</button>
        <button onClick={goToday} className="text-indigo-400 min-h-[44px]">Today</button>
        <button onClick={goTomorrow} className="text-gray-500 min-h-[44px]">Tomorrow →</button>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4">
          <div className="bg-[#1a1a2e] rounded-xl p-6 w-full max-w-sm mb-4">
            <h3 className="text-lg font-semibold mb-4">Log a Meal</h3>
            <input type="text" value={newMealText} onChange={(e) => setNewMealText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
              placeholder="What did you eat?"
              className="w-full bg-[#0f0f1a] border border-[#2a2a4a] rounded-lg px-4 py-3 text-white placeholder-gray-600 mb-4" autoFocus />
            <div className="flex gap-3">
              <button onClick={handleCancel} className="flex-1 py-2.5 rounded-xl bg-[#2a2a4a] text-sm font-medium min-h-[44px]">Cancel</button>
              <button onClick={handleSave} className="flex-1 py-2.5 rounded-xl bg-indigo-500 text-sm font-medium min-h-[44px]">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
