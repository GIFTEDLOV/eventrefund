"use client";

import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";

type ClassName = { className?: string };

export function Reveal({ children, className = "" }: { children: ReactNode } & ClassName) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return <div ref={ref} className={`er-reveal ${visible ? "is-visible" : ""} ${className}`}>{children}</div>;
}

export function SerifHeading({ text, as = "h2", className = "" }: { text: string; as?: "h1" | "h2" | "h3"; className?: string }) {
  const Tag = as;
  const parts = text.split(/(\*[^*]+\*)/g);
  return (
    <Tag className={className}>
      {parts.map((part, index) => part.startsWith("*") && part.endsWith("*")
        ? <em key={index}>{part.slice(1, -1)}</em>
        : <span key={index}>{part}</span>)}
    </Tag>
  );
}

export function Muted({ children, className = "" }: { children: ReactNode } & ClassName) {
  return <span className={`er-muted ${className}`}>{children}</span>;
}

export function Hairline({ className = "" }: ClassName) {
  return <div className={`er-hairline ${className}`} aria-hidden="true" />;
}

type PillButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className"> & {
  children: ReactNode;
  href?: string;
  variant?: "solid" | "outline" | "quiet";
  className?: string;
};

export function PillButton({ children, href, variant = "solid", className = "", ...props }: PillButtonProps) {
  const classes = `er-pill er-pill-${variant} ${className}`;
  if (href) return <Link href={href} className={classes}>{children}</Link>;
  return <button className={classes} {...props}>{children}</button>;
}

export function Panel({ children, className = "", ...props }: HTMLAttributes<HTMLElement> & ClassName) {
  return <section className={`er-panel ${className}`} {...props}>{children}</section>;
}

export function PanelTitle({ eyebrow, children, className = "" }: { eyebrow?: string; children: ReactNode } & ClassName) {
  return <div className={`er-panel-title ${className}`}>{eyebrow && <p className="er-eyebrow">{eyebrow}</p>}<h3>{children}</h3></div>;
}

export function StatCard({ label, value, detail, className = "" }: { label: string; value: ReactNode; detail?: ReactNode } & ClassName) {
  return <div className={`er-stat-card ${className}`}><p className="er-stat-label">{label}</p><p className="er-stat-value">{value}</p>{detail && <p className="er-stat-detail">{detail}</p>}</div>;
}

export function DataTable({ children, className = "" }: { children: ReactNode } & ClassName) {
  return <div className={`er-table-wrap ${className}`}><table className="er-table">{children}</table></div>;
}

const stageLabels: Record<string, string> = {
  precondition: "Preparing",
  broadcast: "Submitted",
  submitted: "Submitted",
  reviewing: "Validators reviewing",
  finality: "Waiting for finality",
  finalized: "Finalized",
};

export function WriteProgress({ stage, error }: { stage?: string; error?: string }) {
  if (!stage && !error) return null;
  return <div className="er-write-progress" aria-live="polite">
    {stage && <span className="er-progress-dot" aria-hidden="true" />}
    {stage && <span>{stageLabels[stage] || stage}</span>}
    {error && <span className="er-error-copy">{error}</span>}
  </div>;
}

export function TechnicalDetails({ children }: { children: ReactNode }) {
  return <details className="er-technical"><summary>Technical details</summary><div className="er-technical-body">{children}</div></details>;
}

export function StatusPill({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "positive" | "warning" | "negative" }) {
  return <span className={`er-status er-status-${tone}`}><span className="er-status-mark" aria-hidden="true" />{children}</span>;
}

export function EmptyState({ title, children }: { title: string; children: ReactNode }) {
  return <div className="er-empty"><p className="er-empty-title">{title}</p><p>{children}</p></div>;
}
