import { useMemo, useState } from "react";
import { arrayMove, SortableContext } from "@dnd-kit/sortable";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { createPortal } from "react-dom";
import PlusIcon from "../Icons/PlusIcon";
import { Column, Id, Task } from "../types";
import ColumnContainer from "./ColumnContainer";
import TaskCard from "./TaskCard";

const KanbanBoard = () => {
  const [columns, setColumns] = useState<Column[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);

  const [isBoardView, setIsBoardView] = useState<boolean>(false);
  const [activeColumn, setActiveColumn] = useState<Column | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const columnsId = useMemo(() => {
    return columns.map((col) => col.id);
  }, [columns]);
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3, // 3px
      },
    })
  );

  const createNewColumn = () => {
    const columnToAdd: Column = {
      id: generateId(),
      title: `Column ${columns.length + 1}`,
    };
    setColumns([...columns, columnToAdd]);
  };
  const deleteColumn = (id: Id) => {
    const columnTask = tasks.filter((task) => task.columnId === id);
    if (columnTask.length > 0) {
      alert("Can't delete column with task");
      return;
    }
    const filterColumn = columns.filter((col) => col.id !== id);

    setColumns(filterColumn);
  };
  const updateColumn = (id: Id, title: string) => {
    const newColumns = columns.map((col) => {
      if (col.id !== id) return col;
      return { ...col, title };
    });
    setColumns(newColumns);
  };
  const createTask = (id: Id) => {
    const newTask: Task = {
      id: generateId(),
      columnId: id,
      content: `Task ${tasks.length + 1}`,
    };
    setTasks([...tasks, newTask]);
  };
  const updateTask = (id: Id, content: string) => {
    const newTasks = tasks.map((task) => {
      if (task.id !== id) return task;
      return { ...task, content };
    });
    setTasks(newTasks);
  };
  const deleteTask = (id: Id) => {
    const filterTask = tasks.filter((task) => task.id !== id);
    setTasks(filterTask);
  };
  const generateId = () => {
    return Math.floor(Math.random() * 10001);
  };
  const onDragstart = (event: DragStartEvent) => {
    if (event.active.data.current?.type === "Column") {
      setActiveColumn(event.active.data.current.column);
      return;
    }
    if (event.active.data.current?.type === "Task") {
      setActiveTask(event.active.data.current.task);
      return;
    }
  };
  const onDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;
    const activeId = active.id;
    const overId = over.id;
    if (over) {
      console.log("Currently over droppable:", over.id);
      const div = document.getElementById(over.id.toString());
      console.log(div);
    }
    if (activeId === overId) return;

    const isActiveATask = active.data.current?.type === "Task";
    const isOverATask = over.data.current?.type === "Task";
    if (!isActiveATask) return;

    // dropping task over another task
    if (isActiveATask && isOverATask) {
      setTasks((tasks) => {
        const activeIndex = tasks.findIndex((t) => t.id === activeId);
        const overIndex = tasks.findIndex((t) => t.id === overId);
        // if (tasks[activeIndex].columnId !== tasks[overIndex].columnId) {
        tasks[activeIndex].columnId = tasks[overIndex].columnId;
        // }
        return arrayMove(tasks, activeIndex, overIndex);
      });
    }
    const isOverACoumn = over.data.current?.type === "Column";
    // dropping task over column
    if (isActiveATask && isOverACoumn) {
      setTasks((tasks) => {
        const activeIndex = tasks.findIndex((t) => t.id === activeId);

        tasks[activeIndex].columnId = overId;

        return arrayMove(tasks, activeIndex, activeIndex);
      });
    }
  };
  const onDragEnd = (event: DragEndEvent) => {
    setActiveColumn(null);
    setActiveTask(null);
    const { active, over } = event;
    if (!over) return;
    const activeColumnId = active.id;
    const overColumnId = over.id;
    if (activeColumnId === overColumnId) return;
    setColumns((columns) => {
      const activeColumnIndex = columns.findIndex(
        (col) => col.id === activeColumnId
      );
      const overColumnIndex = columns.findIndex(
        (col) => col.id === overColumnId
      );
      return arrayMove(columns, activeColumnIndex, overColumnIndex);
    });
  };

  return (
    <div className="">
      <div className="w-fit flex mx-auto my-1 gap-1">
        <button
          onClick={() => setIsBoardView((prev) => !prev)}
          type="button"
          className="h-[60px] w-[350px] min-w-[350px]  cursor-pointer bg-[#0D1117] border-2 border-[#161C22] p-4 ring-rose-500 hover:ring-2 flex gap-2"
        >
          Chnage to {isBoardView ? "List" : "Board"} view
        </button>
        <button
          onClick={createNewColumn}
          className="h-[60px] w-[350px] min-w-[350px] cursor-pointer bg-[#0D1117] border-2 border-[#161C22] p-4 ring-rose-500 hover:ring-2 flex gap-2"
        >
          <PlusIcon />
          Add Coulmn
        </button>
      </div>

      <div className="flex w-full px-[40px]">
        <DndContext
          onDragStart={onDragstart}
          onDragEnd={onDragEnd}
          onDragOver={onDragOver}
          sensors={sensors}
        >
          <div className={`m-auto flex overflow-x-auto w-screen `}>
            <div
              className={`flex ${isBoardView ? "flex-row" : "flex-col"} gap-4`}
            >
              <SortableContext items={columnsId}>
                {columns.map((column) => (
                  <ColumnContainer
                    key={column.id}
                    column={column}
                    deleteColumn={deleteColumn}
                    updateColumn={updateColumn}
                    createTask={createTask}
                    deleteTask={deleteTask}
                    updateTask={updateTask}
                    isBoardView={isBoardView}
                    tasks={tasks.filter((task) => task.columnId === column.id)}
                  />
                  // <dragOverlay />
                ))}
              </SortableContext>
            </div>
          </div>
          {createPortal(
            <DragOverlay>
              {activeColumn && (
                <ColumnContainer
                  updateColumn={updateColumn}
                  column={activeColumn}
                  deleteColumn={deleteColumn}
                  createTask={createTask}
                  deleteTask={deleteTask}
                  updateTask={updateTask}
                  isBoardView={isBoardView}
                  tasks={tasks.filter(
                    (task) => task.columnId === activeColumn.id
                  )}
                />
              )}
              {activeTask && (
                <TaskCard
                  task={activeTask}
                  deleteTask={deleteTask}
                  updateTask={updateTask}
                  isBoardView={isBoardView}
                />
              )}
            </DragOverlay>,
            document.body
          )}
        </DndContext>
      </div>
    </div>
  );
};

export default KanbanBoard;
