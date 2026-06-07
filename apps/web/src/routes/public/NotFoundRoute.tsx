import { Link } from "react-router";

import { Button } from "../../components/ui/button";

export function NotFoundRoute() {
  return (
    <main className="direct-route">
      <section className="direct-route__panel">
        <p className="direct-route__eyebrow">404</p>
        <h1>This file does not exist in PanOS.</h1>
        <p>也许它还只是一个没被写下来的想法。</p>
        <Button asChild>
          <Link to="/">返回桌面</Link>
        </Button>
      </section>
    </main>
  );
}

