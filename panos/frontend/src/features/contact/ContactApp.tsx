import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, CircleAlert, Send } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { submitContact } from "@/shared/lib/api/client";
import { AppHeader } from "@/shared/ui/AppHeader";
import { Button } from "@/shared/ui/Button";

import styles from "./ContactApp.module.css";

const contactSchema = z.object({
  name: z.string().min(1, "请输入姓名").max(80, "姓名最多 80 字"),
  email: z.string().email("请输入有效邮箱"),
  topic: z.string().max(120, "主题最多 120 字").optional(),
  message: z.string().min(10, "内容至少 10 字").max(2000, "内容最多 2000 字"),
});

type ContactFormValues = z.infer<typeof contactSchema>;

type SubmitStatus = { tone: "ok" | "error"; text: string };

export function ContactApp() {
  const [status, setStatus] = useState<SubmitStatus | null>(null);
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      topic: "",
      message: "",
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await submitContact(values);
      setStatus({ tone: "ok", text: "留言已进入 PanOS，我会尽快回复你。" });
      reset();
    } catch {
      setStatus({ tone: "error", text: "发送失败了，请稍后重试或直接给我发邮件。" });
    }
  });

  return (
    <section className={styles.contact}>
      <AppHeader eyebrow="Contact" title="研究交流、项目合作和内容共创" />
      <p>留言会通过 FastAPI 的 <code>/api/contact</code> 写入，不会从前端直连数据库。</p>
      <form className={styles.form} onSubmit={(event) => void onSubmit(event)}>
        <label>
          姓名
          <input
            {...register("name")}
            autoComplete="name"
            placeholder="怎么称呼你"
            aria-invalid={errors.name ? true : undefined}
          />
          {errors.name ? <span>{errors.name.message}</span> : null}
        </label>
        <label>
          邮箱
          <input
            {...register("email")}
            autoComplete="email"
            placeholder="you@example.com"
            aria-invalid={errors.email ? true : undefined}
          />
          {errors.email ? <span>{errors.email.message}</span> : null}
        </label>
        <label className={styles.fullRow}>
          主题
          <input
            {...register("topic")}
            placeholder="想聊点什么（可选）"
            aria-invalid={errors.topic ? true : undefined}
          />
          {errors.topic ? <span>{errors.topic.message}</span> : null}
        </label>
        <label className={styles.fullRow}>
          内容
          <textarea
            {...register("message")}
            rows={5}
            placeholder="写下你的想法、问题或合作意向…"
            aria-invalid={errors.message ? true : undefined}
          />
          {errors.message ? <span>{errors.message.message}</span> : null}
        </label>
        <Button type="submit" className={styles.fullRow} disabled={isSubmitting}>
          <Send size={16} />
          {isSubmitting ? "Sending" : "Send Message"}
        </Button>
        {status ? (
          <p
            className={status.tone === "ok" ? styles.statusOk : styles.statusError}
            role="status"
          >
            {status.tone === "ok" ? <CheckCircle2 size={15} /> : <CircleAlert size={15} />}
            {status.text}
          </p>
        ) : null}
      </form>
    </section>
  );
}
