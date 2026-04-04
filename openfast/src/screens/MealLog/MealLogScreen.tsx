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
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{dateLabel}</h1>
        <button
          onClick={handleLogMeal}
          className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
        >
          + Log Meal
        </button>
      </div>

      {/* Date Navigation */}
      <div className="flex items-center justify-center gap-4 mb-6">
        <button
          onClick={goYesterday}
          className="text-gray-300 hover:text-white transition-colors px-2 py-1"
          aria-label="Yesterday"
        >
          ← Yesterday
        </button>
        <button
          onClick={goToday}
          className="text-green-400 hover:text-green-300 font-semibold transition-colors px-2 py-1"
          aria-label="Go to Today"
        >
          ·
        </button>
        <button
          onClick={goTomorrow}
          className="text-gray-300 hover:text-white transition-colors px-2 py-1"
          aria-label="Tomorrow"
        >
          Tomorrow →
        </button>
      </div>

      {/* Meal List */}
      <div className="space-y-3">
        {meals.length === 0 ? (
          <p className="text-gray-400 text-center py-8">No meals logged for this day.</p>
        ) : (
          meals.map((meal) => (
            <div
              key={meal.id}
              className="bg-gray-700 rounded-lg p-4 flex items-center justify-between"
            >
              <div>
                <p className="font-medium">{meal.description}</p>
                <p className="text-sm text-gray-400">{formatTime(meal.timestamp)}</p>
              </div>
              <button
                onClick={() => handleDelete(meal.id!)}
                aria-label="delete"
                className="text-gray-400 hover:text-red-400 transition-colors text-lg ml-4"
              >
                ✕
              </button>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-sm mx-4 shadow-xl">
            <h2 className="text-xl font-bold mb-4">Log Meal</h2>
            <input
              type="text"
              placeholder="What did you eat?"
              value={newMealText}
              onChange={(e) => setNewMealText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
              className="w-full bg-gray-700 text-white rounded-lg px-4 py-3 mb-4 focus:outline-none focus:ring-2 focus:ring-green-500 placeholder-gray-400"
              autoFocus
            />
            <div className="flex gap-3 justify-end">
              <button
                onClick={handleCancel}
                className="px-4 py-2 rounded-lg text-gray-300 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
