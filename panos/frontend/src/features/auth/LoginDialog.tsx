import * as Dialog from "@radix-ui/react-dialog";
import { LockKeyhole, X } from "lucide-react";

import { IconButton } from "@/shared/ui/Button";

import { LoginForm } from "./LoginForm";
import styles from "./LoginDialog.module.css";

// 桌面登录弹窗（从菜单栏「登录」打开）。
export function LoginDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className={styles.overlay} />
        <Dialog.Content className={styles.content} aria-describedby={undefined}>
          <div className={styles.head}>
            <div className={styles.icon} aria-hidden="true">
              <LockKeyhole size={20} />
            </div>
            <Dialog.Title className={styles.title}>登录 PanOS</Dialog.Title>
            <Dialog.Close asChild>
              <IconButton label="关闭">
                <X size={16} />
              </IconButton>
            </Dialog.Close>
          </div>
          <p className={styles.desc}>用账号密码登录，撰写和管理你的内容。</p>
          <LoginForm onSuccess={() => onOpenChange(false)} />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
