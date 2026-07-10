"use client";

import { useState } from "react";
import { HabitFormModal } from "./HabitFormModal";

export function AddHabitButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="fixed inset-x-0 bottom-0 z-40 mx-auto w-full max-w-app px-4 pb-6">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="w-full rounded-control bg-primary py-3 text-sm font-medium text-white shadow-sm"
        >
          Agregar hábito
        </button>
      </div>
      <HabitFormModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
