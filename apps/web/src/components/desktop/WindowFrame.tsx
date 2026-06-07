import { motion } from "motion/react";
import type { ReactNode } from "react";

import type { PanosWindow } from "../../stores/window-store";
import { useWindowStore } from "../../stores/window-store";
import { Tooltip } from "../ui/tooltip";

export function WindowFrame({
  children,
  windowState,
}: {
  children: ReactNode;
  windowState: PanosWindow;
}) {
  const closeWindow = useWindowStore((state) => state.closeWindow);
  const minimizeWindow = useWindowStore((state) => state.minimizeWindow);
  const toggleMaximize = useWindowStore((state) => state.toggleMaximize);
  const focusWindow = useWindowStore((state) => state.focusWindow);

  return (
    <motion.article
      className={windowState.isMaximized ? "window-frame window-frame--maximized" : "window-frame"}
      style={{ zIndex: windowState.zIndex }}
      initial={{ opacity: 0, scale: 0.96, y: 16 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98, y: 10 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      onMouseDown={() => focusWindow(windowState.id)}
      aria-label={windowState.title}
    >
      <header className="window-frame__titlebar">
        <div className="window-frame__controls">
          <Tooltip label="Close">
            <button
              className="window-control window-control--close"
              type="button"
              aria-label={`Close ${windowState.title}`}
              onClick={() => closeWindow(windowState.id)}
            />
          </Tooltip>
          <Tooltip label="Minimize">
            <button
              className="window-control window-control--minimize"
              type="button"
              aria-label={`Minimize ${windowState.title}`}
              onClick={() => minimizeWindow(windowState.id)}
            />
          </Tooltip>
          <Tooltip label="Maximize">
            <button
              className="window-control window-control--maximize"
              type="button"
              aria-label={`Maximize ${windowState.title}`}
              onClick={() => toggleMaximize(windowState.id)}
            />
          </Tooltip>
        </div>
        <h2>{windowState.title}</h2>
      </header>
      <div className="window-frame__content">{children}</div>
    </motion.article>
  );
}

