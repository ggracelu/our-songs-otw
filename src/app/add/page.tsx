"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { SongForm } from "@/components/SongForm";

function AddPageContent() {
  const searchParams = useSearchParams();
  const isEditing = !!searchParams.get("edit");

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <div className="mb-6 animate-fade-in">
        <h1 className="text-2xl font-bold tracking-tight">
          {isEditing ? "Edit Song" : "Add a Song"}
        </h1>
        <p className="mt-1 text-sm text-muted">
          {isEditing
            ? "Update this week's song."
            : "Pick the one song that defined your week."}
        </p>
      </div>
      <div className="animate-fade-in">
        <SongForm />
      </div>
    </div>
  );
}

export default function AddPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-[60vh] items-center justify-center">
          <div className="text-muted">Loading...</div>
        </div>
      }
    >
      <AddPageContent />
    </Suspense>
  );
}
