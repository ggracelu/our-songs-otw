"use client";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="flex h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <div className="text-5xl opacity-30">&#9835;</div>
      <p className="text-muted text-lg">Something went wrong</p>
      <p className="text-muted text-sm max-w-md">{error.message}</p>
      <button
        onClick={reset}
        className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent/80"
      >
        Try again
      </button>
    </div>
  );
}
