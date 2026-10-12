"use client";

import { cn } from "@/lib/utils";
import {
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Briefcase,
  FolderOpen,
  GraduationCap,
  GripVertical,
  LayoutTemplate,
  ListChecks,
  Scissors,
  Trash2,
  Trophy,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";

const SECTION_IDS = [
  "templates",
  "profile",
  "skills",
  "work",
  "projects",
  "education",
  "awards",
] as const;

export type SectionId = (typeof SECTION_IDS)[number];

const SECTION_ID_SET = new Set<string>(SECTION_IDS);

export function isKnownSectionId(id: string): id is SectionId {
  return SECTION_ID_SET.has(id);
}

export function isPageBreakId(id: string): boolean {
  return (
    id === "pagebreak" ||
    id.startsWith("pagebreak-") ||
    id.startsWith("pagebreak_")
  );
}

/** Filter and normalize an untrusted string[] to valid SectionIds and page breaks, appending missing standard sections. */
export function filterSectionIds(ids: string[]): string[] {
  const result: string[] = [];
  const seenStandard = new Set<string>();
  let pbIndex = 1;

  for (const rawId of ids) {
    if (isKnownSectionId(rawId)) {
      if (!seenStandard.has(rawId)) {
        seenStandard.add(rawId);
        result.push(rawId);
      }
    } else if (isPageBreakId(rawId)) {
      // Ensure unique ID for SortableContext
      const uniqueId = result.includes(rawId)
        ? `pagebreak-${pbIndex++}`
        : rawId;
      result.push(uniqueId);
    }
  }

  for (const id of SECTION_IDS) {
    if (!seenStandard.has(id)) {
      result.push(id);
    }
  }

  return result;
}

export const SECTION_META: Record<
  SectionId,
  { label: string; Icon: React.ElementType }
> = {
  templates: { label: "Template", Icon: LayoutTemplate },
  profile: { label: "Profile", Icon: User },
  skills: { label: "Skills", Icon: ListChecks },
  work: { label: "Experience", Icon: Briefcase },
  projects: { label: "Projects", Icon: FolderOpen },
  education: { label: "Education", Icon: GraduationCap },
  awards: { label: "Awards", Icon: Trophy },
};

// Sections that cannot be reordered
const FIXED_SECTIONS: string[] = ["templates", "profile"];

interface Props {
  active: SectionId;
  sections: string[];
  onChange: (id: SectionId) => void;
  onReorder: (sections: string[]) => void;
}

function SortableSectionItem({
  id,
  active,
  onChange,
}: {
  id: SectionId;
  active: boolean;
  onChange: (id: SectionId) => void;
}) {
  const meta = SECTION_META[id];
  const isDraggable = !FIXED_SECTIONS.includes(id);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled: !isDraggable });

  if (!meta) return null;
  const { label, Icon } = meta;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : undefined,
    opacity: isDragging ? 0.5 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group relative flex w-full flex-col items-center"
    >
      <button
        type="button"
        onClick={() => onChange(id)}
        className={cn(
          "flex w-full flex-col items-center gap-1 rounded-lg px-1 py-3 text-center transition-colors",
          active
            ? "bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400"
            : "text-muted-foreground hover:bg-muted hover:text-foreground",
        )}
      >
        <Icon className="h-5 w-5" />
        <span className="text-[10px] font-medium leading-tight">{label}</span>
      </button>

      {/* Drag handle — visible on hover for movable sections */}
      {isDraggable && (
        <button
          type="button"
          className="absolute right-0 top-1/2 -translate-y-1/2 cursor-grab rounded p-0.5 text-muted-foreground opacity-0 transition-opacity hover:bg-muted hover:text-foreground group-hover:opacity-100 active:cursor-grabbing"
          aria-label={`Drag to reorder ${label}`}
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}

function SortablePageBreakItem({
  id,
  onRemove,
}: {
  id: string;
  onRemove: (id: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : undefined,
    opacity: isDragging ? 0.5 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group/pb relative flex w-full flex-col items-center my-1 px-1"
    >
      <div
        {...attributes}
        {...listeners}
        className="flex w-full cursor-grab active:cursor-grabbing flex-col items-center justify-center gap-0.5 rounded-md border border-dashed border-blue-300 bg-blue-50/70 py-1.5 px-0.5 text-blue-600 transition-colors hover:border-blue-500 hover:bg-blue-100/70 dark:border-blue-700/60 dark:bg-blue-950/40 dark:text-blue-400"
        title="Drag to reposition page break"
      >
        <div className="flex items-center gap-0.5">
          <GripVertical className="h-3 w-3 text-blue-400" />
          <Scissors className="h-3 w-3 text-blue-600 dark:text-blue-400" />
        </div>
        <span className="text-[9px] font-semibold tracking-tight uppercase">
          Break
        </span>
      </div>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onRemove(id);
        }}
        className="absolute -top-1 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-destructive-foreground opacity-0 shadow-sm transition-opacity group-hover/pb:opacity-100 hover:scale-110"
        title="Remove page break"
        aria-label="Remove page break"
      >
        <Trash2 className="h-2.5 w-2.5" />
      </button>
    </div>
  );
}

export default function SectionNav({
  active,
  sections,
  onChange,
  onReorder,
}: Props) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const normalizedSections = filterSectionIds(sections);

  const handleRemovePageBreak = (idToRemove: string) => {
    const next = normalizedSections.filter((s) => s !== idToRemove);
    onReorder(next);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active: dragged, over } = event;
    if (!over || dragged.id === over.id) return;

    const draggedId = String(dragged.id);
    const overId = String(over.id);

    const oldIndex = normalizedSections.indexOf(draggedId);
    const newIndex = normalizedSections.indexOf(overId);
    if (oldIndex === -1 || newIndex === -1) return;

    // Don't allow dropping into fixed positions (e.g. before templates or profile)
    if (FIXED_SECTIONS.includes(normalizedSections[newIndex])) return;

    const next = [...normalizedSections];
    next.splice(oldIndex, 1);
    next.splice(newIndex, 0, draggedId);
    onReorder(next);
  };

  // Render static buttons during SSR / before mount to avoid hydration mismatch
  if (!mounted) {
    return (
      <nav className="flex w-[72px] shrink-0 flex-col items-center border-r bg-card py-3">
        <div className="flex w-full flex-col items-center gap-1 overflow-y-auto overflow-x-hidden">
          {normalizedSections.map((id) => {
            if (isPageBreakId(id)) {
              return (
                <div
                  key={id}
                  className="my-1 flex w-full flex-col items-center px-1"
                >
                  <div className="flex w-full flex-col items-center justify-center gap-0.5 rounded-md border border-dashed border-blue-300 bg-blue-50/70 py-1.5 px-0.5 text-blue-600">
                    <Scissors className="h-3 w-3" />
                    <span className="text-[9px] font-semibold uppercase">
                      Break
                    </span>
                  </div>
                </div>
              );
            }
            if (isKnownSectionId(id)) {
              const meta = SECTION_META[id];
              if (!meta) return null;
              const { label, Icon } = meta;
              return (
                <div
                  key={id}
                  className="group relative flex w-full flex-col items-center"
                >
                  <button
                    type="button"
                    onClick={() => onChange(id)}
                    className={cn(
                      "flex w-full flex-col items-center gap-1 rounded-lg px-1 py-3 text-center transition-colors",
                      active === id
                        ? "bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="text-[10px] font-medium leading-tight">
                      {label}
                    </span>
                  </button>
                </div>
              );
            }
            return null;
          })}
        </div>
      </nav>
    );
  }

  return (
    <nav className="flex w-[72px] shrink-0 flex-col items-center border-r bg-card py-3">
      <div className="flex w-full flex-col items-center gap-1 overflow-y-auto overflow-x-hidden">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={normalizedSections}
            strategy={verticalListSortingStrategy}
          >
            {normalizedSections.map((id) => {
              if (isPageBreakId(id)) {
                return (
                  <SortablePageBreakItem
                    key={id}
                    id={id}
                    onRemove={handleRemovePageBreak}
                  />
                );
              }
              if (isKnownSectionId(id)) {
                return (
                  <SortableSectionItem
                    key={id}
                    id={id}
                    active={active === id}
                    onChange={onChange}
                  />
                );
              }
              return null;
            })}
          </SortableContext>
        </DndContext>
      </div>
    </nav>
  );
}
