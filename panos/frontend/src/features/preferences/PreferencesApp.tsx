import { Monitor, Moon, SunMedium } from "lucide-react";

import type { ThemeMode } from "@/shared/stores/theme-store";
import { useThemeStore } from "@/shared/stores/theme-store";
import { AppHeader } from "@/shared/ui/AppHeader";
import { Hint } from "@/shared/ui/Hint";

import styles from "./PreferencesApp.module.css";

const themeOptions: Array<{ mode: ThemeMode; label: string; icon: typeof Monitor }> = [
  { mode: "system", label: "跟随系统", icon: Monitor },
  { mode: "light", label: "浅色", icon: SunMedium },
  { mode: "dark", label: "深色", icon: Moon },
];

export function PreferencesApp() {
  const currentMode = useThemeStore((state) => state.mode);
  const setMode = useThemeStore((state) => state.setMode);

  return (
    <section className={styles.preferences}>
      <AppHeader eyebrow="System Preferences" title="显示与桌面" />
      <div className={styles.themeOptions} role="radiogroup" aria-label="Theme mode">
        {themeOptions.map((option) => {
          const Icon = option.icon;
          return (
            <button
              key={option.mode}
              type="button"
              className={
                currentMode === option.mode
                  ? `${styles.themeOption} ${styles.themeOptionActive}`
                  : styles.themeOption
              }
              onClick={() => setMode(option.mode)}
              role="radio"
              aria-checked={currentMode === option.mode}
            >
              <Icon size={18} />
              <span>{option.label}</span>
            </button>
          );
        })}
      </div>
      <Hint>主题会保存在 localStorage。壁纸设置会在后台 Settings 接入后进入数据库。</Hint>
    </section>
  );
}
