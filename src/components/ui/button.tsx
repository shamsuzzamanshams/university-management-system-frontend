import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
const variants = cva("inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand disabled:opacity-50", { variants: { variant: { default: "bg-brand text-white hover:bg-blue-700", outline: "border border-slate-200 bg-white text-ink hover:bg-slate-50", ghost: "text-slate-600 hover:bg-slate-100" } }, defaultVariants: { variant: "default" } });
export function Button({ className, variant, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof variants>) { return <button className={cn(variants({ variant }), className)} {...props} />; }
