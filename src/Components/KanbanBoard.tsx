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
import { useKanban } from "../Context/KanbanContext";
import { Section, Task } from "../types";
import { BoardTaskCard } from "./TaskCard";
import { BoardSectionContainer } from "./SectionContainer";

const KanbanBoard = (props: { isBoardView: boolean }) => {
  const { isBoardView } = props;
  const KanbanContext = useKanban();
  const { sections, setSections, tasks, setTasks } = KanbanContext;

  const [activeSection, setActiveSection] = useState<Section | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sectionsId = useMemo(() => {
    return sections.map((sec) => sec.id);
  }, [sections]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3, // 3px
      },
    })
  );

  const createNewSection = () => {
    const sectionToAdd: Section = {
      id: generateId(),
      title: `Section ${sections.length + 1}`,
    };
    setSections([...sections, sectionToAdd]);
  };

  const generateId = () => {
    return Math.floor(Math.random() * 10001);
  };

  const onDragstart = (event: DragStartEvent) => {
    if (event.active.data.current?.type === "Section") {
      setActiveSection(event.active.data.current.section);
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

    if (activeId === overId) return;

    const isActiveATask = active.data.current?.type === "Task";
    const isOverATask = over.data.current?.type === "Task";
    if (!isActiveATask) return;

    // dropping task over another task
    if (isActiveATask && isOverATask) {
      setTasks((tasks) => {
        const activeIndex = tasks.findIndex((t) => t.id === activeId);

        const overIndex = tasks.findIndex((t) => t.id === overId);

        tasks[activeIndex].sectionId = tasks[overIndex].sectionId;
        return arrayMove(tasks, activeIndex, overIndex);
      });
    }
    const isOverASection = over.data.current?.type === "Section";
    // dropping task over section
    if (isActiveATask && isOverASection) {
      setTasks((tasks) => {
        const activeIndex = tasks.findIndex((t) => t.id === activeId);

        tasks[activeIndex].sectionId = overId;

        return arrayMove(tasks, activeIndex, activeIndex);
      });
    }
  };

  const onDragEnd = (event: DragEndEvent) => {
    setActiveSection(null);
    setActiveTask(null);
    const { active, over } = event;
    if (!over) return;
    const activeSectionId = active.id;
    const overSectionId = over.id;
    if (activeSectionId === overSectionId) return;

    setSections((sections) => {
      const activeSectionIndex = sections.findIndex(
        (sec) => sec.id === activeSectionId
      );
      const overColumnIndex = sections.findIndex(
        (sec) => sec.id === overSectionId
      );
      return arrayMove(sections, activeSectionIndex, overColumnIndex);
    });
  };

  return (
    <div className="">
      <div className="w-fit flex mx-auto my-1 gap-1">
        <button
          onClick={createNewSection}
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
            <div className={`flex  flex-row gap-4`}>
              <SortableContext items={sectionsId}>
                {sections.map((section) => (
                  <BoardSectionContainer
                    key={section.id}
                    section={section}
                    tasks={tasks.filter(
                      (task) => task.sectionId === section.id
                    )}
                  />
                  // <dragOverlay />
                ))}
              </SortableContext>
            </div>
          </div>
          {createPortal(
            <DragOverlay>
              {activeSection && isBoardView && (
                <BoardSectionContainer
                  section={activeSection}
                  tasks={tasks.filter(
                    (task) => task.sectionId === activeSection.id
                  )}
                />
              )}
              {activeTask && isBoardView && <BoardTaskCard task={activeTask} />}
            </DragOverlay>,
            document.body
          )}
        </DndContext>
      </div>
    </div>
  );
};

export default KanbanBoard;
