"use client";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="card mx-auto max-w-lg p-8 text-center">
      <h1 className="text-2xl font-bold">Es ist ein Fehler aufgetreten</h1>
      <p className="mt-2 text-ink-2">Bitte versuchen Sie es erneut. Besteht das Problem weiter, kontaktieren Sie uns.</p>
      <button type="button" onClick={reset} className="btn-primary mt-4">Erneut versuchen</button>
    </div>
  );
}
