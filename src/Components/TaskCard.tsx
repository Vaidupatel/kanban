import { useState } from "react";
import TrashIcon from "../Icons/TrashIcon";
import { Task } from "../types";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useKanban } from "../Context/KanbanContext";
type Props = {
  task: Task;
  isDragOverlay?: boolean;
};
export const BoardTaskCard = ({ task, isDragOverlay = false }: Props) => {
  const KanbanContext = useKanban();
  const { updateTask, deleteTask } = KanbanContext;
  const [mouseIsOver, setMouseIsOver] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editValue, setEditValue] = useState(task.description);

  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: "Task",

      task,
    },
    disabled: editMode,
  });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
    opacity: isDragging ? 0.1 : 1,
  };
  const toggleEditMode = () => {
    setEditMode((prev) => !prev);
    setMouseIsOver(false);
  };

  const taskContent = (
    <div
      className={`bg-gray-800 border border-gray-700 rounded-md min-h-[100px] h-fit w-full mx-1 flex items-center  justify-around text-left`}
      onMouseEnter={() => setMouseIsOver(true)}
      onMouseLeave={() => setMouseIsOver(false)}
      ref={setNodeRef}
      style={style}
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab hover:bg-gray-800 rounded-md p-2 "
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
      <div className="grid grid-rows-[auto_1fr_1fr]  grid-col-2 items-center p-2 bg-gray-900 rounded-md w-full overflow-y-auto whitespace-pre-wrap ">
        <span
          className="row-start-1 row-span-1 min-w-[150px] w-fit  cursor-text"
          onClick={toggleEditMode}
        >
          {!editMode && task.description.length > 50
            ? task.description.substring(0, 50) + "..."
            : task.description}
          {editMode && (
            <textarea
              className="border-none rounded bg-transparent text-white focus:outline-none resize-none"
              rows={3}
              cols={25}
              autoFocus
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              placeholder="Enter Task Description Here"
              onBlur={() => {
                updateTask(task.id, { description: editValue });
                toggleEditMode();
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  updateTask(task.id, { description: editValue });
                  toggleEditMode();
                }
              }}
            />
          )}
        </span>
        <span className="row-start-1 row-span-1 flex flex-row-reverse">
          {mouseIsOver && (
            <button
              className="stroke-white rounded opacity-60 hover:opacity-100"
              onClick={() => deleteTask(task.id)}
            >
              <TrashIcon />
            </button>
          )}
        </span>
        <span className="row-strat-2 h-max-[3rem] col-start-1 col-span-1  min-w-[100px] text-center">
          {task.assignee || <span className="opacity-50">-</span>}
        </span>
        <span className="row-strat-2 h-max-[3rem] col-start-2 col-span-1 min-w-[80px] text-red-500 text-center">
          {task.dueDate || <span className="opacity-50">-</span>}
        </span>
        <span
          className={`row-strat-3  col-start-1 col-span-1 flex items-center justify-center px-2 py-1 rounded-md text-sm w-fit ${
            task.priority === "high"
              ? "bg-red-500"
              : task.priority === "medium"
              ? "bg-yellow-500"
              : "bg-green-500"
          }`}
        >
          {task.priority || <span className="opacity-50">-</span>}
        </span>
        <span className="row-strat-3 row-span-1 col-start-2 col-span-1 min-w-[100px] text-center">
          {task.project || <span className="opacity-50">-</span>}
        </span>
      </div>
    </div>
  );

  if (isDragOverlay) {
    return (
      <div ref={setNodeRef} style={style} className="flex w-full">
        <div className="flex-1">{taskContent}</div>
      </div>
    );
  }

  return <div className="flex w-full">{taskContent}</div>;
};

export const ListTaskCard = ({ task, isDragOverlay = false }: Props) => {
  const KanbanContext = useKanban();
  const { updateTask, deleteTask } = KanbanContext;
  const [mouseIsOver, setMouseIsOver] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editValue, setEditValue] = useState(task.description);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: { type: "Task", task },
    disabled: editMode,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.1 : 1,
    height: "fit-content",
  };

  const toggleEditMode = () => {
    setEditMode((prev) => !prev);
    setMouseIsOver(false);
  };

  const taskContent = (
    <div
      className="flex items-center gap-4 bg-gray-900 text-white p-2 rounded-md w-full"
      onMouseEnter={() => setMouseIsOver(true)}
      onMouseLeave={() => setMouseIsOver(false)}
    >
      <span className="flex-1 min-w-[150px]" onClick={toggleEditMode}>
        {!editMode && task.description.length > 50
          ? task.description.substring(0, 50) + "..."
          : task.description}
        {editMode && (
          <input
            autoFocus
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            placeholder="Enter Task Description Here"
            onBlur={() => {
              updateTask(task.id, { description: editValue });
              toggleEditMode();
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                updateTask(task.id, { description: editValue });
                toggleEditMode();
              }
            }}
          />
        )}
      </span>

      <span className="flex-1 min-w-[100px] text-center">
        {task.assignee || <span className="opacity-50">-</span>}
      </span>

      <span className="flex-1 min-w-[80px] text-red-500 text-center">
        {task.dueDate || <span className="opacity-50">-</span>}
      </span>

      <span
        className={`flex items-center justify-center px-2 py-1 rounded-md text-sm min-w-[80px] ${
          task.priority === "high"
            ? "bg-red-500"
            : task.priority === "medium"
            ? "bg-yellow-500"
            : "bg-green-500"
        }`}
      >
        {task.priority || <span className="opacity-50">-</span>}
      </span>

      <span className="flex-1 min-w-[100px] text-center">
        {task.project || <span className="opacity-50">-</span>}
      </span>
      <span className="flex-1 min-w-[100px] text-center">
        {mouseIsOver && (
          <button
            className="stroke-white rounded opacity-60 hover:opacity-100"
            onClick={() => deleteTask(task.id)}
          >
            <TrashIcon />
          </button>
        )}
      </span>
    </div>
  );

  if (isDragOverlay) {
    return (
      <div className="flex items-center px-4 py-2 bg-gray-800 border border-gray-700 rounded-md mb-2 shadow-lg">
        <div className="flex-1">{taskContent}</div>
      </div>
    );
  }
  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="flex items-center px-4 py-2 bg-gray-800 border border-gray-700 rounded-md mb-2 cursor-grab"
    >
      <div className="flex-1">{taskContent}</div>
    </div>
  );
};
