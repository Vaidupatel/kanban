import { Id, Section, Task } from "../types";
import {
  DndContext,
  DragOverEvent,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  closestCenter,
  DragOverlay,
  DropAnimation,
  defaultDropAnimation,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useState } from "react";
import { useKanban } from "../Context/KanbanContext";
import { ListSectionContainer } from "./SectionContainer";
import { ListTaskCard } from "./TaskCard";

const ListViewBoard = (props: { isBoardView: boolean }) => {
  const { isBoardView } = props;
  const KanbanContext = useKanban();
  const { sections, setSections, setTasks } = KanbanContext;

  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [activeSection, setActiveSection] = useState<Section | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<Id>>(new Set());

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 3 },
    })
  );

  const dropAnimation: DropAnimation = {
    ...defaultDropAnimation,
    duration: 200,
  };

  const createSection = () => {
    const newSection: Section = {
      id: Math.random().toString(36).substr(2, 9),
      title: `Section ${sections.length + 1}`,
    };
    setSections([...sections, newSection]);
    setExpandedSections(new Set([...expandedSections, newSection.id]));
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const activeData = active.data.current;

    if (activeData?.type === "Task") {
      setActiveTask(activeData.task);
    } else if (activeData?.type === "Section") {
      setActiveSection(activeData.section);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeData = active.data.current;
    if (!activeData || activeData.type !== "Task") return;

    const activeTask = activeData.task;
    const overData = over.data.current;

    // If dropping over another task
    if (overData?.type === "Task") {
      const overTask = overData.task;
      setTasks((tasks) => {
        const activeIndex = tasks.findIndex((t) => t.id === activeTask.id);
        const overIndex = tasks.findIndex((t) => t.id === overTask.id);

        if (tasks[activeIndex].sectionId !== tasks[overIndex].sectionId) {
          tasks[activeIndex].sectionId = tasks[overIndex].sectionId;
        }

        return arrayMove(tasks, activeIndex, overIndex);
      });
      return;
    }

    // If dropping over a section or empty space within a section
    const droppableSection = over.id.toString();
    const targetSection = sections.find(
      (section) => section.id.toString() === droppableSection
    );

    if (targetSection) {
      setTasks((tasks) => {
        const activeIndex = tasks.findIndex((t) => t.id === activeTask.id);
        if (activeIndex === -1) return tasks;

        const updatedTasks = [...tasks];
        const [movedTask] = updatedTasks.splice(activeIndex, 1);
        movedTask.sectionId = targetSection.id;

        // Find the position to insert the task
        const sectionTasks = updatedTasks.filter(
          (t) => t.sectionId === targetSection.id
        );
        const insertIndex = sectionTasks.length
          ? updatedTasks.indexOf(sectionTasks[sectionTasks.length - 1]) + 1
          : updatedTasks.length;

        updatedTasks.splice(insertIndex, 0, movedTask);
        return updatedTasks;
      });
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      setActiveTask(null);
      setActiveSection(null);
      return;
    }

    const activeData = active.data.current;
    const overData = over.data.current;

    if (activeData?.type === "Section" && overData?.type === "Section") {
      const activeIndex = sections.findIndex((s) => s.id === active.id);
      const overIndex = sections.findIndex((s) => s.id === over.id);

      if (activeIndex !== overIndex) {
        setSections((sections) => arrayMove(sections, activeIndex, overIndex));
      }
    }

    setActiveTask(null);
    setActiveSection(null);
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={sections.map((s) => s.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-4">
            {sections.map((section) => (
              <ListSectionContainer
                key={section.id}
                section={section}
                expandedSections={expandedSections}
                setExpandedSections={setExpandedSections}
              />
            ))}
          </div>
        </SortableContext>

        <DragOverlay dropAnimation={dropAnimation}>
          {activeTask && !isBoardView && (
            <ListTaskCard task={activeTask} isDragOverlay={true} />
          )}
          {activeSection && !isBoardView && (
            <ListSectionContainer
              section={activeSection}
              expandedSections={expandedSections}
              setExpandedSections={setExpandedSections}
            />
          )}
        </DragOverlay>
      </DndContext>
      <button
        onClick={createSection}
        className="mt-4 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-md"
      >
        + Add section
      </button>
    </div>
  );
};

export default ListViewBoard;
