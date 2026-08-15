import { ButtonHTMLAttributes } from "react";

export function PageHeader({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: React.ReactNode }) {
  return <div className="flex flex-col gap-5 border-b border-[#e7eaed] px-5 py-7 md:flex-row md:items-end md:justify-between md:px-8"><div><div className="mb-2 font-mono text-[10px] font-bold uppercase tracking-[.18em] text-[#5b7695]">{eyebrow}</div><h1 className="font-display text-[30px] font-semibold leading-tight md:text-[36px]">{title}</h1><p className="mt-2 max-w-2xl text-[13px] leading-6 text-[#6a727b]">{description}</p></div>{action}</div>;
}

export function Button({
  children,
  secondary = false,
  className = "",
  type = "button",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { secondary?: boolean }) {
  const base = "rounded-[10px] px-4 py-2.5 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50";
  const tone = secondary
    ? "border border-[#dfe3e7] bg-white hover:bg-[#f4f6f8]"
    : "bg-[#111418] text-white hover:bg-[#293039]";

  return <button type={type} className={`${base} ${tone} ${className}`} {...props}>{children}</button>;
}
