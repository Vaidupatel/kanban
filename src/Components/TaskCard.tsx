import { useState } from "react";
import TrashIcon from "../Icons/TrashIcon";
import { Task } from "../types";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useKanban } from "../Context/KanbanContext";
type Props = {
  task: Task;
};
export const BoardTaskCard = ({ task }: Props) => {
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
  };
  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className={`bg-[#0D1117] p-2.5 h-[100px] min-h-[100px] items-center flex text-left rounded-xl hover:ring-2 hover:ring-inset hover:ring-rose-500 cursor-grab relative task`}
      />
    );
  }

  const toggleEditMode = () => {
    setEditMode((prev) => !prev);
    setMouseIsOver(false);
  };

  if (editMode) {
    return (
      <div
        ref={setNodeRef}
        {...attributes}
        {...listeners}
        style={style}
        className="bg-[#0D1117] p-2.5 h-[100px] min-h-[100px] items-center flex text-left rounded-xl hover:ring-2 hover:ring-inset hover:ring-rose-500 cursor-grab relative"
      >
        <textarea
          className="h-[90%] w-full resize-none border-none rounded bg-transparent text-white focus:outline-none"
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
      </div>
    );
  }

  return (
    <div
      className={`bg-[#0D1117] p-2.5 h-[100px] min-h-[100px] items-center flex text-left rounded-xl hover:ring-2 hover:ring-inset hover:ring-rose-500 cursor-grab relative task`}
      onMouseEnter={() => setMouseIsOver(true)}
      onMouseLeave={() => setMouseIsOver(false)}
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={style}
      onClick={toggleEditMode}
    >
      <p className="my-auto h-[90%] w-[80%] overflow-y-auto overflow-x-hidden whitespace-pre-wrap ">
        {task.description}
      </p>
      {mouseIsOver && (
        <button
          className="stroke-white absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded opacity-60 hover:opacity-100"
          onClick={() => deleteTask(task.id)}
        >
          <TrashIcon />
        </button>
      )}
    </div>
  );
};

export const ListTaskCard = ({
  task,
  isDragOverlay = false,
}: {
  task: Task;
  isDragOverlay?: boolean;
}) => {
  const [mouseIsOver, setMouseIsOver] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editValue, setEditValue] = useState(task.description);

  const KanbanContext = useKanban();
  const { updateTask, deleteTask } = KanbanContext;
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
    height: "48px",
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
      {/* Task Description */}
      <span className="flex-1 min-w-[150px]" onClick={toggleEditMode}>
        {!editMode && task.description}
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

      {/* Assignee */}
      <span className="flex-1 min-w-[100px] text-center">
        {task.assignee || <span className="opacity-50">-</span>}
      </span>

      {/* Due Date */}
      <span className="flex-1 min-w-[80px] text-red-500 text-center">
        {task.dueDate || <span className="opacity-50">-</span>}
      </span>

      {/* Priority */}
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

      {/* Project */}
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
