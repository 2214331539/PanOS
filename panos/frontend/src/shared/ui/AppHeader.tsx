import { Fragment, type ReactNode } from "react";

import styles from "./AppHeader.module.css";

// App 内容区统一标题：eyebrow（小标签）+ heading。
// 无 action 时返回 Fragment（eyebrow/h1 仍是父容器的直接子项，保持原有 grid/flex 间距）；
// 有 action 时渲染两栏标题栏（标题在左、操作在右）。
export function AppHeader({
  eyebrow,
  title,
  action,
}: {
  eyebrow?: string;
  title: ReactNode;
  action?: ReactNode;
}) {
  const eyebrowNode = eyebrow ? <p className={styles.eyebrow}>{eyebrow}</p> : null;
  const headingNode = <h1 className={styles.heading}>{title}</h1>;

  if (!action) {
    return (
      <Fragment>
        {eyebrowNode}
        {headingNode}
      </Fragment>
    );
  }

  return (
    <div className={styles.toolbar}>
      <div>
        {eyebrowNode}
        {headingNode}
      </div>
      {action}
    </div>
  );
}
