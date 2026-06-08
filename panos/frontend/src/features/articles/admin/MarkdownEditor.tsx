import "@mdxeditor/editor/style.css";

import {
  BlockTypeSelect,
  BoldItalicUnderlineToggles,
  codeBlockPlugin,
  codeMirrorPlugin,
  CreateLink,
  headingsPlugin,
  imagePlugin,
  InsertCodeBlock,
  InsertImage,
  InsertTable,
  InsertThematicBreak,
  linkDialogPlugin,
  linkPlugin,
  listsPlugin,
  ListsToggle,
  markdownShortcutPlugin,
  MDXEditor,
  quotePlugin,
  tablePlugin,
  thematicBreakPlugin,
  toolbarPlugin,
  UndoRedo,
} from "@mdxeditor/editor";

import { uploadFile } from "@/shared/lib/api/client";
import { resolveTheme, useThemeStore } from "@/shared/stores/theme-store";

// 拖入 / 粘贴图片 → 自动上传 → 返回 URL 由编辑器插入 ![]()。
async function imageUploadHandler(file: File): Promise<string> {
  return (await uploadFile("/admin/media/upload", file)).url;
}

// Typora 式所见即所得 markdown 编辑器，懒加载（不进首屏 / 公开包）。
export default function MarkdownEditor({
  markdown,
  onChange,
}: {
  markdown: string;
  onChange: (value: string) => void;
}) {
  const mode = useThemeStore((state) => state.mode);
  const dark = resolveTheme(mode) === "dark";

  return (
    <MDXEditor
      markdown={markdown}
      onChange={onChange}
      className={dark ? "dark-theme dark-editor" : undefined}
      plugins={[
        headingsPlugin(),
        listsPlugin(),
        quotePlugin(),
        thematicBreakPlugin(),
        linkPlugin(),
        linkDialogPlugin(),
        imagePlugin({ imageUploadHandler }),
        tablePlugin(),
        codeBlockPlugin({ defaultCodeBlockLanguage: "ts" }),
        codeMirrorPlugin({
          codeBlockLanguages: {
            ts: "TypeScript",
            js: "JavaScript",
            python: "Python",
            bash: "Bash",
            css: "CSS",
            "": "Plain text",
          },
        }),
        markdownShortcutPlugin(),
        toolbarPlugin({
          toolbarContents: () => (
            <>
              <UndoRedo />
              <BoldItalicUnderlineToggles />
              <BlockTypeSelect />
              <ListsToggle />
              <CreateLink />
              <InsertImage />
              <InsertTable />
              <InsertThematicBreak />
              <InsertCodeBlock />
            </>
          ),
        }),
      ]}
    />
  );
}
