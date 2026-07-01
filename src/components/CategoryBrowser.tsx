"use client";

import { useState } from "react";
import { CATEGORIES } from "@/lib/advertisers";

export default function CategoryBrowser() {
  const [openSlug, setOpenSlug] = useState<string | null>(CATEGORIES[0]?.slug ?? null);

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {CATEGORIES.map((cat) => {
        const open = openSlug === cat.slug;
        return (
          <div key={cat.slug} className="rounded-xl border border-white/10 bg-white/[0.03] overflow-hidden">
            <button
              onClick={() => setOpenSlug(open ? null : cat.slug)}
              className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left"
            >
              <span className="flex items-center gap-2 text-sm sm:text-base font-medium">
                <span>{cat.icon}</span>
                {cat.title}
                <span className="text-white/30 text-xs font-normal">{cat.advertisers.length}</span>
              </span>
              <span className={`text-white/40 transition-transform ${open ? "rotate-180" : ""}`}>⌄</span>
            </button>
            {open && (
              <div className="flex flex-wrap gap-1.5 px-4 pb-4">
                {cat.advertisers.map((a) => (
                  <span
                    key={a}
                    className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-white/70"
                  >
                    {a}
                  </span>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
