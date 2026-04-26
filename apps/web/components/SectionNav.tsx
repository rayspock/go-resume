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

/** Filter an untrusted string[] to only valid SectionIds. */
export function filterSectionIds(ids: string[]): SectionId[] {
  return ids.filter((id): id is SectionId => SECTION_ID_SET.has(id));
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
const FIXED_SECTIONS: SectionId[] = ["templates", "profile"];

interface Props {
  active: SectionId;
  sections: SectionId[];
  onChange: (id: SectionId) => void;
  onReorder: (sections: SectionId[]) => void;
}

function SortableItem({
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
            ? "bg-blue-50 text-blue-600"
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

  const handleDragEnd = (event: DragEndEvent) => {
    const { active: dragged, over } = event;
    if (!over || dragged.id === over.id) return;

    const draggedId = String(dragged.id);
    const overId = String(over.id);
    if (!SECTION_ID_SET.has(draggedId) || !SECTION_ID_SET.has(overId)) return;

    const oldIndex = sections.indexOf(draggedId as SectionId);
    const newIndex = sections.indexOf(overId as SectionId);

    // Don't allow dropping into fixed positions
    if (FIXED_SECTIONS.includes(sections[newIndex])) return;

    const next = [...sections];
    next.splice(oldIndex, 1);
    next.splice(newIndex, 0, draggedId as SectionId);
    onReorder(next);
  };

  // Render static buttons during SSR / before mount to avoid hydration mismatch
  // (dnd-kit injects aria/data attributes that differ between server and client)
  if (!mounted) {
    return (
      <nav className="flex w-[72px] shrink-0 flex-col items-center gap-1 border-r bg-card py-3">
        {sections.map((id) => {
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
                    ? "bg-blue-50 text-blue-600"
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
        })}
      </nav>
    );
  }

  return (
    <nav className="flex w-[72px] shrink-0 flex-col items-center gap-1 border-r bg-card py-3">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={sections}
          strategy={verticalListSortingStrategy}
        >
          {sections.map((id) => (
            <SortableItem
              key={id}
              id={id}
              active={active === id}
              onChange={onChange}
            />
          ))}
        </SortableContext>
      </DndContext>
    </nav>
  );
}
