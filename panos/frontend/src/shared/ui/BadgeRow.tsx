import { Badge, type BadgeTone } from "./Badge";
import styles from "./BadgeRow.module.css";

// 一行徽章：分类标签 / 身份标签等。
export function BadgeRow({ items, tone }: { items: readonly string[]; tone?: BadgeTone }) {
  return (
    <div className={styles.row}>
      {items.map((item) => (
        <Badge key={item} tone={tone}>
          {item}
        </Badge>
      ))}
    </div>
  );
}
