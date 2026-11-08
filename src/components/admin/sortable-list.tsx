"use client";

import { DndContext, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy, rectSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { createContext, useContext, useId } from "react";
import { cn } from "@/lib/utils/cn";

type HandleProps = React.HTMLAttributes<HTMLButtonElement> & { disabled?: boolean };
const HandleCtx = createContext<HandleProps>({});

/** Drag handle (also keyboard: focus it, press Space, use arrow keys, Space to drop). */
export function DragHandle({ label = "Drag to reorder" }: { label?: string }) {
  const props = useContext(HandleCtx);
  if (props.disabled) return <span className="w-8 shrink-0" aria-hidden="true" />;
  return (
    <button type="button" {...props} aria-label={label} className="grid size-8 shrink-0 cursor-grab touch-none place-items-center rounded-lg text-muted hover:bg-surface-2 hover:text-text active:cursor-grabbing">
      <GripVertical className="size-4" aria-hidden="true" />
    </button>
  );
}

function Item({ id, children, disabled }: { id: string; children: React.ReactNode; disabled?: boolean }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id, disabled });
  return (
    <li ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }} className={cn("relative", isDragging && "z-10 opacity-80")}>
      <HandleCtx.Provider value={{ ...attributes, ...listeners, disabled }}>{children}</HandleCtx.Provider>
    </li>
  );
}

/**
 * Generic sortable list. `onReorder` receives the new item order; callers do the
 * optimistic update and roll back on error.
 */
export function SortableList<T extends { id: string }>({
  items,
  onReorder,
  render,
  disabled,
  grid,
  className,
  label = "Reorderable list",
}: {
  items: T[];
  onReorder: (next: T[]) => void;
  render: (item: T, index: number) => React.ReactNode;
  disabled?: boolean;
  grid?: boolean;
  className?: string;
  label?: string;
}) {
  const dndId = useId();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));
  const onEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const from = items.findIndex((i) => i.id === active.id);
    const to = items.findIndex((i) => i.id === over.id);
    if (from < 0 || to < 0) return;
    onReorder(arrayMove(items, from, to));
  };
  return (
    <DndContext
      id={dndId}
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={onEnd}
      accessibility={{
        screenReaderInstructions: { draggable: "To reorder, press Space or Enter to pick up. Use the arrow keys to move, Space or Enter to drop, Escape to cancel." },
      }}
    >
      <SortableContext items={items.map((i) => i.id)} strategy={grid ? rectSortingStrategy : verticalListSortingStrategy} disabled={disabled}>
        <ul className={cn(grid ? "grid grid-cols-2 gap-3 sm:grid-cols-4" : "grid gap-2", className)} aria-label={label}>
          {items.map((it, i) => (
            <Item key={it.id} id={it.id} disabled={disabled}>
              {render(it, i)}
            </Item>
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  );
}

/** Standard row used in list editors. */
export function ListRow({ children, actions, className }: { children: React.ReactNode; actions?: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex items-center gap-2 rounded-xl border border-border bg-surface px-2 py-2 sm:px-3", className)}>
      <DragHandle />
      <div className="min-w-0 flex-1">{children}</div>
      {actions ? <div className="flex shrink-0 items-center gap-1">{actions}</div> : null}
    </div>
  );
}
