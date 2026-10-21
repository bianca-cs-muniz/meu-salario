"use client";

import { useApp } from "@/contexts/app";

export function Toasts() {
  const { toasts } = useApp();
  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-[calc(5.5rem+env(safe-area-inset-bottom))] z-[60] flex flex-col items-center gap-2 px-4 md:bottom-6"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto max-w-md rounded-full px-5 py-3 text-sm font-medium shadow-lg ${
            t.tipo === "erro" ? "bg-alerta text-white" : "bg-cofre text-cofre-tinta"
          }`}
        >
          {t.texto}
        </div>
      ))}
    </div>
  );
}
