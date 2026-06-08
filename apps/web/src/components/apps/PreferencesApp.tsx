import { Monitor, Moon, SunMedium } from "lucide-react";

import type { ThemeMode } from "../../stores/theme-store";
import { useThemeStore } from "../../stores/theme-store";
import shell from "./shared/appShell.module.css";
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
      <p className={shell.eyebrow}>System Preferences</p>
      <h1 className={shell.heading}>显示与桌面</h1>
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
      <p className={shell.note}>主题会保存在 localStorage。壁纸设置会在后台 Settings 接入后进入数据库。</p>
    </section>
  );
}

