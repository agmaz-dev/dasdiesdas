import Link from "next/link";

/** Schriftzug: „das“ weiß, „dies“ komplett orange (inkl. i-Punkt), „das“ weiß, Funkel-Stern */
export function Wordmark({ size = 24, className = "" }: { size?: number; className?: string }) {
  return (
    <span className={`relative inline-block font-extrabold tracking-tight text-ink ${className}`} style={{ fontSize: size, lineHeight: 1 }}>
      das<span className="text-brand-600">dies</span>das
      <svg aria-hidden="true" viewBox="0 0 24 24" className="absolute text-brand-600" style={{ width: size * 0.42, height: size * 0.42, top: -size * 0.28, right: -size * 0.32 }}>
        <path fill="currentColor" d="M12 0c.6 6.1 5.9 11.4 12 12-6.1.6-11.4 5.9-12 12-.6-6.1-5.9-11.4-12-12C6.1 11.4 11.4 6.1 12 0z" />
      </svg>
    </span>
  );
}

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link href="/" className={`inline-flex items-center ${className}`} aria-label="dasdiesdas – Startseite">
      <Wordmark size={24} />
    </Link>
  );
}
