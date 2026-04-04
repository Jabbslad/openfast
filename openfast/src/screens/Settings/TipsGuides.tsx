import { useState } from "react";
import { getGuidesByCategory } from "../../content/guides";
import type { Guide } from "../../content/guides";

export function TipsGuides() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const guidesByCategory = getGuidesByCategory();

  function toggleGuide(id: string) {
    setExpandedId((prev) => (prev === id ? null : id));
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-indigo-950 p-4">
      <h1 className="text-white text-2xl font-bold mb-6">Tips &amp; Guides</h1>

      <div className="flex flex-col gap-6">
        {Array.from(guidesByCategory.entries()).map(([category, guides]) => (
          <section key={category}>
            <h2 className="text-indigo-300 text-sm font-semibold uppercase tracking-widest mb-2 px-1">
              {category}
            </h2>
            <div className="bg-[#1a1a2e] rounded-2xl overflow-hidden divide-y divide-[#2a2a4a]">
              {guides.map((guide: Guide) => {
                const isExpanded = expandedId === guide.id;
                return (
                  <div key={guide.id}>
                    <button
                      type="button"
                      onClick={() => toggleGuide(guide.id)}
                      className="w-full flex items-center justify-between px-4 py-3 text-left text-white text-sm font-medium hover:bg-[#2a2a4a] transition-colors"
                      aria-expanded={isExpanded}
                    >
                      <span>{guide.title}</span>
                      <span className="text-indigo-400 ml-2 shrink-0">{isExpanded ? "▲" : "▼"}</span>
                    </button>
                    {isExpanded && (
                      <div className="px-4 pb-4 text-gray-300 text-sm leading-relaxed">
                        {guide.body}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
