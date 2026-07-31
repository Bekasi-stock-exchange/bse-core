import React from "react";

export interface InputGroupProps {
  label: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}

export default function InputGroup({
  label,
  error,
  children,
  className = "",
}: InputGroupProps) {
  return (
    <div className={`space-y-1 text-left w-full ${className}`}>
      <label className="text-sm font-medium text-zinc-300 ml-1">
        {label}
      </label>
      {children}
      {error && (
        <p className="text-xs text-red-400 mt-1 ml-1">{error}</p>
      )}
    </div>
  );
}
