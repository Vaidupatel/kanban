import { useMemo, useRef, useState } from "react";
import { SortableContext, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Id, Section, Task } from "../types";
import TrashIcon from "../Icons/TrashIcon";
import PlusIcon from "../Icons/PlusIcon";
import { BoardTaskCard, ListTaskCard } from "./TaskCard";
import { useKanban } from "../Context/KanbanContext";

interface Props {
  section: Section;
  tasks: Task[];
}
export const BoardSectionContainer = (props: Props) => {
  const { section, tasks } = props;
  const KanbanContext = useKanban();
  const { deleteSection, updateSection, createTask } = KanbanContext;
  const [editMode, setEditMode] = useState(false);

  const TasksIds = useMemo(() => {
    return tasks.map((task) => task.id);
  }, [tasks]);

  const nodeRef = useRef<HTMLDivElement | null>(null);
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: section.id,
    data: {
      type: "Section",
      section,
    },
    disabled: editMode,
  });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  // console.log(style);
  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        // {...attributes}
        // {...listeners}
        // style={style}

        className={`bg-[#161C22] min-w-[350px] w-[350px] h-[500px]  rounded-md`}
      />
    );
  }
  return (
    <div
      ref={setNodeRef}
      style={style}
      id={section.id.toString()}
      {...attributes}
      {...listeners}
      data-id={section.id}
      className={`bg-[#161C22]  min-w-[350px] w-[350px] h-[500px] rounded-md flex flex-col`}
    >
      {/* section title */}
      <div
        className={` bg-[#0D1117] text-md h-[60px] cursor-grab rounded-md rounded-b-none p-3 font-bold border-[#161C22] border-4 flex items-center justify-between`}
      >
        <div
          className="flex gap-2"
          ref={nodeRef}
          onClick={(e) => {
            if (e.currentTarget === nodeRef.current) setEditMode(true);
          }}
        >
          <div className="flex justify-center items-center bg-[#161C22] px-2 py-1 text-sm rounded-full">
            0
          </div>
          {!editMode && section.title}
          {editMode && (
            <input
              autoFocus
              value={section.title}
              onChange={(e) => updateSection(section.id, e.target.value)}
              onBlur={() => {
                setEditMode(false);
              }}
              onKeyDown={(e) => {
                if (e.key !== "Enter") return;
                setEditMode(false);
              }}
            />
          )}
        </div>
        <button
          className=" stroke-gray-500 hover:stroke-white hover:bg-[#161C22] rounded px-1 py-2"
          onClick={() => deleteSection(section.id)}
        >
          <TrashIcon />
        </button>
      </div>
      {/* Section task container */}
      <div className="flex flex-grow flex-col gap-4 p2 overflow-x-hidden overflow-y-auto">
        <SortableContext items={TasksIds}>
          {tasks.map((task) => (
            <BoardTaskCard key={task.id} task={task} />
          ))}
        </SortableContext>
      </div>
      {/* Footer */}
      <button
        onClick={() => {
          createTask(section.id);
        }}
        className="flex gap-2 items-center border-[#161C22] border-2 rounded-md p-4 border-x-[#161C22] hover:bg-[#0D1117] hover:text-rose-500 active:bg-black"
      >
        <PlusIcon />
        Add task
      </button>
    </div>
  );
};

export const ListSectionContainer = ({
  section,
  expandedSections,
  setExpandedSections,
}: {
  section: Section;
  expandedSections: Set<Id>;
  setExpandedSections: (expanded: Set<Id>) => void;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: section.id,
    data: { type: "Section", section },
  });

  const KanbanContext = useKanban();
  const { tasks, updateSection, createTask, deleteSection } = KanbanContext;

  const [sectionEditMode, setSectionEditMode] = useState(false);
  const nodeRef = useRef<HTMLSpanElement | null>(null);

  const isExpanded = expandedSections.has(section.id);
  const sectionTasks = tasks.filter((task) => task.sectionId === section.id);

  const toggleExpanded = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget || e.target instanceof SVGElement) {
      const newExpanded = new Set(expandedSections);
      if (isExpanded) {
        newExpanded.delete(section.id);
      } else {
        newExpanded.add(section.id);
      }
      setExpandedSections(newExpanded);
    }
  };

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`mb-4 border ${isDragging ? "opacity-40" : ""}`}
      data-section-id={section.id}
    >
      <div className="flex items-center gap-2 p-2 bg-gray-900 rounded-t-md">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab p-1 hover:bg-gray-800 rounded"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 8h16M4 16h16"
            />
          </svg>
        </div>
        <svg
          onClick={(e) => {
            toggleExpanded(e);
          }}
          className={`w-4 h-4 transform transition-transform ${
            isExpanded ? "rotate-90" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
        <span
          ref={nodeRef}
          onClick={(e) => {
            if (e.currentTarget === nodeRef.current) setSectionEditMode(true);
          }}
          className="font-medium"
        >
          {!sectionEditMode && section.title}
        </span>
        {sectionEditMode && (
          <input
            className="font-medium"
            autoFocus
            value={section.title}
            onChange={(e) => updateSection(section.id, e.target.value)}
            onBlur={() => setSectionEditMode(false)}
            onKeyDown={(e) => {
              if (e.key !== "Enter") return;
              setSectionEditMode(false);
            }}
          />
        )}
        <span className="text-gray-500 text-sm">({sectionTasks.length})</span>
        <button
          className=" stroke-gray-500 hover:stroke-white hover:bg-[#161C22] rounded px-1 py-2"
          onClick={() => deleteSection(section.id)}
        >
          <TrashIcon />
        </button>
      </div>
      {isExpanded && (
        <div className="p-2 bg-gray-900/50 rounded-b-md transition-all duration-200">
          <SortableContext items={sectionTasks.map((t) => t.id)}>
            <div className="min-h-[40px]">
              {sectionTasks.map((task) => (
                <ListTaskCard key={task.id} task={task} />
              ))}
            </div>
          </SortableContext>
          <button
            onClick={() => createTask(section.id)}
            className="w-full p-2 text-left text-gray-400 hover:text-white hover:bg-gray-800 rounded-md"
          >
            + Add task
          </button>
        </div>
      )}
    </div>
  );
};
