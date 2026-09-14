import type { ReactElement } from "react";

export default function Home(): ReactElement {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center gap-3 px-4 py-16">
      <h1 className="text-center text-3xl font-semibold tracking-tight">Product Content Studio</h1>
      <p className="text-muted-foreground text-center text-sm">
        Каталог опублікованих товарів зʼявиться тут.
      </p>
    </main>
  );
}
