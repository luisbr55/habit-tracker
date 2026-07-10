"use client";

import { useState, useTransition } from "react";
import { addHabit, editHabit, archiveHabit } from "@/app/actions/habits";
import { DAY_ORDER, DAY_LABELS, type DayKey } from "@/lib/dateUtils";

type Props = {
  open: boolean;
  onClose: () => void;
  /** Si se pasa, el modal edita ese hábito en vez de crear uno nuevo. */
  editing?: { id: string; name: string; days: DayKey[] } | null;
};

export function HabitFormModal({ open, onClose, editing }: Props) {
  const [name, setName] = useState(editing?.name ?? "");
  const [days, setDays] = useState<DayKey[]>(editing?.days ?? []);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (!open) return null;

  function toggleDay(day: DayKey) {
    setDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  }

  function handleDelete() {
    if (!editing) return;
    startTransition(async () => {
      await archiveHabit(editing.id);
      setConfirmingDelete(false);
      onClose();
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = editing
        ? await editHabit({ id: editing.id, name, days })
        : await addHabit({ name, days });

      if (!result.ok) {
        setError(result.error);
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setName("");
        setDays([]);
        onClose();
      }, 500);
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 sm:items-center">
      <div className="w-full max-w-app rounded-t-card bg-surface p-6 sm:rounded-card">
        <h2 className="mb-4 text-lg font-semibold text-text">
          {editing ? "Editar hábito" : "Nuevo hábito"}
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="habit-name" className="text-sm text-text-muted">
              Nombre
            </label>
            <input
              id="habit-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded-control border border-border bg-surface px-3 py-2 text-base text-text outline-none focus:border-primary"
              placeholder="Ej: Tomar agua"
              autoFocus
            />
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-sm text-text-muted">Días</span>
            <div className="flex flex-wrap gap-2">
              {DAY_ORDER.map((day) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleDay(day)}
                  className={`h-9 w-9 rounded-full border text-sm transition-colors ${
                    days.includes(day)
                      ? "border-primary bg-primary text-white"
                      : "border-border bg-surface text-text-muted"
                  }`}
                  aria-pressed={days.includes(day)}
                >
                  {DAY_LABELS[day]}
                </button>
              ))}
            </div>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          {confirmingDelete ? (
            <div className="flex flex-col gap-2 rounded-control border border-destructive/30 bg-destructive/5 p-3">
              <p className="text-sm text-text">
                ¿Eliminar este hábito? No se puede deshacer.
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setConfirmingDelete(false)}
                  className="flex-1 rounded-control border border-border py-2 text-sm text-text-muted"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isPending}
                  className="flex-1 rounded-control bg-destructive py-2 text-sm text-white"
                >
                  Sí, eliminar
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-2 flex gap-2">
              {editing && (
                <button
                  type="button"
                  onClick={() => setConfirmingDelete(true)}
                  className="rounded-control border border-destructive px-3 py-2 text-sm text-destructive"
                >
                  Eliminar
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-control border border-border py-2 text-sm text-text-muted"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isPending}
                className={`flex-1 rounded-control py-2 text-sm text-white transition-colors ${
                  success ? "bg-accent" : "bg-primary"
                } ${isPending ? "opacity-70" : ""}`}
              >
                {success ? "Guardado ✓" : isPending ? "Guardando…" : "Guardar"}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
