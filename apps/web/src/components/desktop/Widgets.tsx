import { PANOS_WIDGETS } from "../../lib/constants/panos-copy";

export function Widgets() {
  return (
    <aside className="widgets" aria-label="PanOS widgets">
      {PANOS_WIDGETS.map((widget) => (
        <section className="widget" key={widget.title}>
          <h2>{widget.title}</h2>
          {widget.lines.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </section>
      ))}
    </aside>
  );
}

