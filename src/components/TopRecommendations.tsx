import { TOP_RECOMMENDATIONS, EXCLUDED_ADVERTISERS, findCategoryForAdvertiser } from "@/lib/advertisers";

export default function TopRecommendations() {
  return (
    <div>
      <div className="mb-4 text-xs sm:text-sm text-white/40">
        OTA 직접 경쟁사({EXCLUDED_ADVERTISERS.join(", ")})는 광고주 후보에서 제외했습니다.
      </div>
      <ol className="grid gap-2 sm:grid-cols-2">
        {TOP_RECOMMENDATIONS.map((name, i) => {
          const category = findCategoryForAdvertiser(name);
          return (
            <li
              key={name}
              className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3"
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-cyan-400 text-xs font-bold text-black">
                {i + 1}
              </span>
              <span className="font-medium text-sm sm:text-base">{name}</span>
              {category && (
                <span className="ml-auto text-xs text-white/40">
                  {category.icon} {category.title}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
