import { Link } from "react-router";

import { Button } from "@/shared/ui/Button";
import { DirectPanel } from "@/shared/ui/DirectPanel";

export function NotFoundPage() {
  return (
    <DirectPanel eyebrow="404" title="This file does not exist in PanOS.">
      <p>也许它还只是一个没被写下来的想法。</p>
      <Button asChild>
        <Link to="/">返回桌面</Link>
      </Button>
    </DirectPanel>
  );
}
