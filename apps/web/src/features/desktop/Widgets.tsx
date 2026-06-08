import { PANOS_WIDGETS } from "./config/widgets";
import styles from "./Widgets.module.css";

export function Widgets() {
  return (
    <aside className={styles.widgets} aria-label="PanOS widgets">
      {PANOS_WIDGETS.map((widget) => (
        <section className={styles.widget} key={widget.title}>
          <h2>{widget.title}</h2>
          {widget.lines.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </section>
      ))}
    </aside>
  );
}
