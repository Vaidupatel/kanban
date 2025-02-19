import { arrayMove, SortableContext } from "@dnd-kit/sortable";
import {
  defaultDropAnimation,
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  DropAnimation,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { createPortal } from "react-dom";
import PlusIcon from "../Icons/PlusIcon";
import { useKanban } from "../Context/KanbanContext";
import { BoardTaskCard } from "./TaskCard";
import { BoardSectionContainer } from "./SectionContainer";

const KanbanBoard = (props: { isBoardView: boolean }) => {
  const { isBoardView } = props;
  const KanbanContext = useKanban();
  const {
    sections,
    setSections,
    tasks,
    setTasks,
    createSection,
    activeTask,
    setActiveTask,
    activeSection,
    setActiveSection,
    sectionsIds,
  } = KanbanContext;

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3,
      },
    })
  );

  const dropAnimation: DropAnimation = {
    ...defaultDropAnimation,
    duration: 200,
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
      const overSectionIndex = sections.findIndex(
        (sec) => sec.id === overSectionId
      );
      return arrayMove(sections, activeSectionIndex, overSectionIndex);
    });
  };

  return (
    <div className="">
      <div className="w-fit flex mx-auto my-1 gap-1">
        <button
          onClick={createSection}
          className="flex mt-4 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-md"
        >
          <PlusIcon />
          Add Section
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
              <SortableContext items={sectionsIds}>
                {sections.map((section) => (
                  <BoardSectionContainer
                    key={section.id}
                    section={section}
                    tasks={tasks.filter(
                      (task) => task.sectionId === section.id
                    )}
                  />
                ))}
              </SortableContext>
            </div>
          </div>
          {createPortal(
            <DragOverlay dropAnimation={dropAnimation}>
              {activeSection && isBoardView && (
                <BoardSectionContainer
                  section={activeSection}
                  tasks={tasks.filter(
                    (task) => task.sectionId === activeSection.id
                  )}
                />
              )}
              {activeTask && isBoardView && (
                <BoardTaskCard task={activeTask} isDragOverlay={true} />
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
