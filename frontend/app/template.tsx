"use client";

import { ReactNode } from "react";

export default function Template({ children }: { children: ReactNode }) {
  return (
    <div className="spawn-fade w-full h-full flex flex-col flex-1" style={{ "--spawn-delay": "0ms" } as any}>
      {children}
    </div>
  );
}
