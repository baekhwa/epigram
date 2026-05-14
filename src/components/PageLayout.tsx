import type { ReactNode } from "react";
import { twMerge } from "tailwind-merge";

type PageLayoutProps = {
  children: ReactNode;
  className?: string;
};

export default function PageLayout({ children, className }: PageLayoutProps) {
  return (
    <main
      className={twMerge("w-160  flex flex-col m-auto gap-4 mb-28", className)}
    >
      {children}
    </main>
  );
}
