"use client";

import { motion } from "framer-motion";
import { useEffect } from "react";

import { useSearchParams, usePathname, useRouter } from "next/navigation";

import { Users2 as CharactersIcon, Image as BackgroundsIcon, Mic as VoicesIcon, Film as ScenesIcon, Music as MusicIcon, Star as EpisodeIcon } from "lucide-react";

import clsx from "clsx";

import { useWorkspace } from '@/store/workspace'

const TABS = [
  { key: "characters", label: "Characters", icon: CharactersIcon },
  { key: "backgrounds", label: "Backgrounds", icon: BackgroundsIcon },
  { key: "voices", label: "Voices", icon: VoicesIcon },
  { key: "scenes", label: "Scenes", icon: ScenesIcon },
  { key: "music", label: "Music", icon: MusicIcon },
  { key: "episode", label: "Episode", icon: EpisodeIcon },
];

export default function SectionRibbon() {
  const pathname = usePathname();
  const search = useSearchParams();
  const router = useRouter();
  const { activeSection, setSection } = useWorkspace();
  
  // Get active section from URL or store, default to characters
  const activeFromURL = search.get("section");
  const active = activeFromURL ?? activeSection ?? "characters";

  const onSelect = (key: string) => {
    // Map 'music' to 'episode' in store, but keep 'music' in URL for display
    const sectionKey = key === 'music' ? 'episode' : key;
    
    // Update the store
    setSection(sectionKey as any);
    
    // Update URL - keep 'music' in URL if music tab was clicked
    const params = new URLSearchParams(search.toString());
    params.set("section", key); // Keep original key for display
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  // For display, use URL param if available (supports 'music'), otherwise use store value
  // This allows Music tab to show as active even though store has 'episode'
  const displayedActive = activeFromURL ?? active;

  // Sync URL to store when URL param changes (only on mount and when URL changes)
  useEffect(() => {
    if (activeFromURL) {
      const sectionKey = activeFromURL === 'music' ? 'episode' : activeFromURL;
      if (sectionKey !== activeSection) {
        setSection(sectionKey as any);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeFromURL]); // Only depend on URL param to avoid loops

  return (
    <div className="relative mt-6">
      {/* animated gradient aura behind the ribbon */}
      <div className="pointer-events-none absolute -inset-x-6 -inset-y-4 opacity-40">
        <div className="tf-gradient animate-gradientShift rounded-3xl blur-3xl h-full w-full" />
      </div>

      <nav
        aria-label="Workspace sections"
        className={clsx(
          "tf-glass relative mx-auto rounded-2xl px-4 py-2",
          "md:px-6 md:py-3",
          "shadow-[0_0_40px_rgba(0,255,200,0.06)]"
        )}
      >
        {/* desktop: equal columns; mobile: scroll row */}
        <div className="hidden md:grid grid-cols-6 gap-4">
          {TABS.map(({ key, label, icon: Icon }) => {
            const isActive = key === displayedActive;
            return (
              <button
                key={key}
                onClick={() => onSelect(key)}
                aria-current={isActive ? "page" : undefined}
                className={clsx(
                  "group relative flex items-center justify-center gap-2 rounded-xl px-4 py-3",
                  "text-sm font-semibold tracking-wide",
                  "transition-all duration-200",
                  isActive ? "text-white" : "text-tf-muted hover:text-white"
                )}
              >
                <Icon className={clsx("h-5 w-5 transition-transform", isActive ? "scale-110" : "group-hover:scale-105")} />
                <span>{label}</span>
                {isActive && (
                  <motion.span
                    layoutId="tf-underline"
                    className="absolute -bottom-1 left-4 right-4 h-[3px] rounded-full"
                    style={{
                      backgroundImage: "linear-gradient(to right, #00ffc8, #00d2ff, #ff004c)",
                    }}
                  />
                )}
              </button>
            );
          })}
        </div>

        <div className="md:hidden flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide">
          {TABS.map(({ key, label, icon: Icon }) => {
            const isActive = key === displayedActive;
            return (
              <button
                key={key}
                onClick={() => onSelect(key)}
                aria-current={isActive ? "page" : undefined}
                className={clsx(
                  "snap-start shrink-0 group relative flex items-center gap-2 rounded-xl px-4 py-2",
                  "text-sm font-semibold",
                  "tf-glass",
                  "transition-all duration-200",
                  isActive ? "text-white" : "text-tf-muted"
                )}
              >
                <Icon className="h-5 w-5" />
                <span>{label}</span>
                {isActive && (
                  <motion.span
                    layoutId="tf-underline-m"
                    className="absolute -bottom-1 left-3 right-3 h-[2px] rounded-full"
                    style={{ backgroundImage: "linear-gradient(to right, #00ffc8, #00d2ff, #ff004c)" }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

