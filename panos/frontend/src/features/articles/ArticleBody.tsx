import Markdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import rehypeSanitize from "rehype-sanitize";
import remarkGfm from "remark-gfm";

import styles from "./ArticleBody.module.css";

// 受限 markdown 渲染：GFM + 白名单消毒（防 XSS）+ 代码高亮。整块 lazy 加载。
export function ArticleBody({ content }: { content: string }) {
  return (
    <div className={styles.prose}>
      <Markdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSanitize, rehypeHighlight]}>
        {content}
      </Markdown>
    </div>
  );
}

export default ArticleBody;
