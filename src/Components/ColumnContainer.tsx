import { SortableContext, useSortable } from "@dnd-kit/sortable";
import TrashIcon from "../Icons/TrashIcon";
import { Column, Id, Task } from "../types";
import { CSS } from "@dnd-kit/utilities";
import { useMemo, useRef, useState } from "react";
import PlusIcon from "../Icons/PlusIcon";
import TaskCard from "./TaskCard";

interface Props {
  column: Column;
  deleteColumn: (id: Id) => void;
  updateColumn: (id: Id, title: string) => void;
  createTask: (id: Id) => void;
  deleteTask: (id: Id) => void;
  updateTask: (id: Id, content: string) => void;
  tasks: Task[];
}
const ColumnContainer = (props: Props) => {
  const {
    column,
    deleteColumn,
    updateColumn,
    createTask,
    tasks,
    deleteTask,
    updateTask,
  } = props;
  const [editMode, setEditMode] = useState(false);
  const TasksIds = useMemo(() => {
    return tasks.map((task) => task.id);
  }, [tasks]);

  const nodeRef = useRef<HTMLDivElement | null>(null); // Store actual DOM element
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: column.id,
    data: {
      type: "Column",
      column,
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
        className="bg-[#161C22] opacity-40 border-2  w-[350px] h-[500px] rounded-md flex flex-col"
      >
        {/* hello */}
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-[#161C22] w-[350px] h-[500px] rounded-md flex flex-col"
    >
      {/* Column title */}
      <div className=" bg-[#0D1117] text-md h-[60px] cursor-grab rounded-md rounded-b-none p-3 font-bold border-[#161C22] border-4 flex items-center justify-between">
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
          {!editMode && column.title}
          {editMode && (
            <input
              autoFocus
              value={column.title}
              onChange={(e) => updateColumn(column.id, e.target.value)}
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
          onClick={() => deleteColumn(column.id)}
        >
          <TrashIcon />
        </button>
      </div>
      {/* Column task container */}
      <div className="flex flex-grow flex-col gap-4 p2 overflow-x-hidden overflow-y-auto">
        <SortableContext items={TasksIds}>
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              deleteTask={deleteTask}
              updateTask={updateTask}
            />
          ))}
        </SortableContext>
      </div>
      {/* Footer */}
      <button
        onClick={() => {
          createTask(column.id);
        }}
        className="flex gap-2 items-center border-[#161C22] border-2 rounded-md p-4 border-x-[#161C22] hover:bg-[#0D1117] hover:text-rose-500 active:bg-black"
      >
        <PlusIcon />
        Add task
      </button>
    </div>
  );
};

export default ColumnContainer;
