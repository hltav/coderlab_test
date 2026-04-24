import React from "react";

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: "ghost" | "primary" | "danger";
}

export function IconButton({
  children,
  variant = "ghost",
  className = "",
  ...props
}: IconButtonProps) {
  const base = "p-2 rounded-lg transition-all";
  const variants = {
    ghost: "text-slate-400 hover:text-indigo-600 hover:bg-indigo-50",
    primary: "bg-indigo-600 text-white hover:bg-indigo-700",
    danger: "text-slate-400 hover:text-red-600 hover:bg-red-50",
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${className} cursor-pointer`}
      {...props}
    >
      {children}
    </button>
  );
}
