import { cn } from "@/lib/cn";
import { Container } from "./container";

type PageWrapperProps = React.HTMLAttributes<HTMLDivElement> & {
  maxWidth?: "4xl" | "5xl" | "6xl";
};

const widthClass = {
  "4xl": "max-w-4xl",
  "5xl": "max-w-5xl",
  "6xl": "max-w-6xl",
};

export function PageWrapper({ className, maxWidth = "6xl", ...props }: PageWrapperProps) {
  return (
    <Container
      className={cn("space-y-6", widthClass[maxWidth], className)}
      {...props}
    />
  );
}

