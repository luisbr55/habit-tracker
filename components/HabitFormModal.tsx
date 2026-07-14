"use client";

import { useEffect, useState, useTransition } from "react";
import { addHabit, editHabit, archiveHabit } from "@/app/actions/habits";
import { addCategory, listCategories } from "@/app/actions/categories";
import { DAY_ORDER, DAY_LABELS, type DayKey } from "@/lib/dateUtils";
import { CATEGORY_COLORS } from "@/lib/categoryColors";
import type { Category } from "@/db/schema";

type CategoryColor = (typeof CATEGORY_COLORS)[number]["hex"];
type Props = {
  open: boolean;
  onClose: () => void;
  /** Si se pasa, el modal edita ese hábito en vez de crear uno nuevo. */
  editing?: {
    id: string;
    name: string;
    days: DayKey[];
    icon: string;
    categoryId: string;
  } | null;
};

const COMMON_EMOJIS = [
  "⭐",
  "💧",
  "🏃",
  "📚",
  "🧘",
  "🥗",
  "😴",
  "🚭",
  "💪",
  "🎨",
  "✍️",
  "🧹",
  "🌱",
  "🎯",
  "💰",
  "☀️",
];

export function HabitFormModal({ open, onClose, editing }: Props) {
  const [name, setName] = useState(editing?.name ?? "");
  const [days, setDays] = useState<DayKey[]>(editing?.days ?? []);
  const [icon, setIcon] = useState(editing?.icon ?? "⭐");
  const [categoryId, setCategoryId] = useState(editing?.categoryId ?? "");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [categories, setCategories] = useState<Category[]>([]);
  const [creatingCategory, setCreatingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryColor, setNewCategoryColor] = useState<CategoryColor>(
    CATEGORY_COLORS[0].hex,
  );

  useEffect(() => {
    if (open) {
      listCategories().then(setCategories);
    }
  }, [open]);

  if (!open) return null;

  function toggleDay(day: DayKey) {
    setDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
    );
  }

  function handleCreateCategory() {
    const name = newCategoryName.trim();
    if (!name) return;
    startTransition(async () => {
      const result = await addCategory({ name, color: newCategoryColor });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      const refreshed = await listCategories();
      setCategories(refreshed);
      setCategoryId(result.id!);
      setCreatingCategory(false);
      setNewCategoryName("");
      setError(null);
    });
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

    if (!categoryId) {
      setError("Elegí o creá una categoría.");
      return;
    }

    startTransition(async () => {
      const payload = { name, days, icon, categoryId };
      const result = editing
        ? await editHabit({ id: editing.id, ...payload })
        : await addHabit(payload);

      if (!result.ok) {
        setError(result.error);
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setName("");
        setDays([]);
        setIcon("⭐");
        setCategoryId("");
        onClose();
      }, 500);
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 sm:items-center">
      <div className="max-h-[90vh] w-full max-w-app overflow-y-auto rounded-t-card bg-surface p-6 sm:rounded-card">
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
            <span className="text-sm text-text-muted">Ícono</span>
            <div className="flex flex-wrap gap-2">
              {COMMON_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setIcon(emoji)}
                  aria-pressed={icon === emoji}
                  className={`flex h-9 w-9 items-center justify-center rounded-full border text-base transition-colors ${
                    icon === emoji
                      ? "border-primary bg-primary/10"
                      : "border-border"
                  }`}
                >
                  {emoji}
                </button>
              ))}
              {/* Input libre: además de los sugeridos, se puede tipear/pegar cualquier emoji */}
              <input
                type="text"
                value={icon}
                onChange={(e) => setIcon(e.target.value.slice(0, 4))}
                maxLength={4}
                className="flex h-9 w-14 items-center justify-center rounded-control border border-border bg-surface text-center text-base outline-none focus:border-primary"
                aria-label="Ícono personalizado (emoji libre)"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-sm text-text-muted">Categoría</span>

            {!creatingCategory ? (
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategoryId(cat.id)}
                    aria-pressed={categoryId === cat.id}
                    className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors ${
                      categoryId === cat.id
                        ? "border-primary"
                        : "border-border text-text-muted"
                    }`}
                  >
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: cat.color }}
                    />
                    {cat.name}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setCreatingCategory(true)}
                  className="rounded-full border border-dashed border-border px-3 py-1.5 text-sm text-text-muted"
                >
                  + Nueva categoría
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2 rounded-control border border-border p-3">
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Nombre de la categoría"
                  className="rounded-control border border-border bg-surface px-3 py-2 text-sm text-text outline-none focus:border-primary"
                  autoFocus
                />
                <div className="flex flex-wrap gap-2">
                  {CATEGORY_COLORS.map((c) => (
                    <button
                      key={c.hex}
                      type="button"
                      onClick={() => setNewCategoryColor(c.hex)}
                      aria-label={c.name}
                      aria-pressed={newCategoryColor === c.hex}
                      className={`h-7 w-7 rounded-full border-2 ${
                        newCategoryColor === c.hex
                          ? "border-primary"
                          : "border-transparent"
                      }`}
                      style={{ backgroundColor: c.hex }}
                    />
                  ))}
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setCreatingCategory(false);
                      setNewCategoryName("");
                    }}
                    className="flex-1 rounded-control border border-border py-1.5 text-sm text-text-muted"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleCreateCategory}
                    disabled={isPending || !newCategoryName.trim()}
                    className="flex-1 rounded-control bg-primary py-1.5 text-sm text-white disabled:opacity-50"
                  >
                    Crear
                  </button>
                </div>
              </div>
            )}
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
