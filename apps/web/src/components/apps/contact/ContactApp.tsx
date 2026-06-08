import { zodResolver } from "@hookform/resolvers/zod";
import { Send } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { submitContact } from "../../../lib/api/client";
import { Button } from "../../ui/button";
import shell from "../shared/appShell.module.css";
import styles from "./ContactApp.module.css";

const contactSchema = z.object({
  name: z.string().min(1, "请输入姓名").max(80, "姓名最多 80 字"),
  email: z.string().email("请输入有效邮箱"),
  topic: z.string().max(120, "主题最多 120 字").optional(),
  message: z.string().min(10, "内容至少 10 字").max(2000, "内容最多 2000 字"),
});

type ContactFormValues = z.infer<typeof contactSchema>;

export function ContactApp() {
  const [status, setStatus] = useState<string | null>(null);
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
      setStatus("留言已进入 PanOS。");
      reset();
    } catch {
      setStatus("API 暂未启动，表单校验已通过。");
    }
  });

  return (
    <section className={styles.contact}>
      <p className={shell.eyebrow}>Contact</p>
      <h1 className={shell.heading}>研究交流、项目合作和内容共创</h1>
      <p>留言会通过 FastAPI 的 <code>/api/contact</code> 写入，不会从前端直连数据库。</p>
      <form className={styles.form} onSubmit={(event) => void onSubmit(event)}>
        <label>
          姓名
          <input {...register("name")} autoComplete="name" />
          {errors.name ? <span>{errors.name.message}</span> : null}
        </label>
        <label>
          邮箱
          <input {...register("email")} autoComplete="email" />
          {errors.email ? <span>{errors.email.message}</span> : null}
        </label>
        <label>
          主题
          <input {...register("topic")} />
          {errors.topic ? <span>{errors.topic.message}</span> : null}
        </label>
        <label className={styles.fullRow}>
          内容
          <textarea {...register("message")} rows={5} />
          {errors.message ? <span>{errors.message.message}</span> : null}
        </label>
        <Button type="submit" className={styles.fullRow} disabled={isSubmitting}>
          <Send size={16} />
          {isSubmitting ? "Sending" : "Send Message"}
        </Button>
        {status ? <p className={styles.status}>{status}</p> : null}
      </form>
    </section>
  );
}
