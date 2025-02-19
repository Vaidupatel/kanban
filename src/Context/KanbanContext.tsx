import React, { createContext, useContext, useMemo, useState } from "react";
import { Id, Section, Task } from "../types";

interface KanbanContextType {
  sections: Section[];
  tasks: Task[];
  setSections: React.Dispatch<React.SetStateAction<Section[]>>;
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  activeTask: Task | null;
  setActiveTask: React.Dispatch<React.SetStateAction<Task | null>>;
  setActiveSection: React.Dispatch<React.SetStateAction<Section | null>>;
  activeSection: Section | null;
  expandedSections: Set<Id>;
  sectionsIds: Array<Id>;
  TasksIds: Array<Id>;
  setExpandedSections: React.Dispatch<React.SetStateAction<Set<Id>>>;
  createSection: () => void;
  updateSection: (id: Id, title: string) => void;
  deleteSection: (id: Id) => void;
  createTask: (sectionId: Id) => void;
  updateTask: (id: Id, updates: Partial<Task>) => void;
  deleteTask: (id: Id) => void;
}

const KanbanContext = createContext<KanbanContextType | undefined>(undefined);

export const KanbanProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [sections, setSections] = useState<Section[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [activeSection, setActiveSection] = useState<Section | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<Id>>(new Set());

  const sectionsIds = useMemo(() => {
    return sections.map((sec) => sec.id);
  }, [sections]);
  const TasksIds = useMemo(() => {
    return tasks.map((task) => task.id);
  }, [tasks]);
  const createSection = () => {
    const sectionToAdd: Section = {
      // id: generateId(),
      id: Math.floor(Math.random() * 10001),
      title: `Section ${sections.length + 1}`,
    };
    setSections([...sections, sectionToAdd]);
    setExpandedSections(new Set([...expandedSections, sectionToAdd.id]));
  };

  const updateSection = (id: Id, title: string) => {
    setSections(
      sections.map((section) =>
        section.id === id ? { ...section, title } : section
      )
    );
  };

  const deleteSection = (id: Id) => {
    const sectionTasks = tasks.filter((task) => task.sectionId === id);
    if (sectionTasks.length > 0) {
      alert("Can't delete section with tasks");
      return;
    }
    setSections(sections.filter((section) => section.id !== id));
  };

  const createTask = (sectionId: Id) => {
    const newTask: Task = {
      id: Math.random().toString(36).substr(2, 9),
      sectionId,
      description: `Task ${tasks.length + 1}`,
      assignee: "",
      dueDate: "",
      project: "",
      priority: "medium",
    };
    setTasks([...tasks, newTask]);
  };

  const updateTask = (id: Id, updates: Partial<Task>) => {
    setTasks(
      tasks.map((task) => (task.id === id ? { ...task, ...updates } : task))
    );
  };

  const deleteTask = (id: Id) => {
    setTasks(tasks.filter((task) => task.id !== id));
  };

  return (
    <KanbanContext.Provider
      value={{
        sections,
        tasks,
        setSections,
        setTasks,
        createSection,
        updateSection,
        deleteSection,
        createTask,
        updateTask,
        deleteTask,
        expandedSections,
        setExpandedSections,
        activeTask,
        setActiveTask,
        activeSection,
        setActiveSection,
        sectionsIds,
        TasksIds,
      }}
    >
      {children}
    </KanbanContext.Provider>
  );
};

export const useKanban = () => {
  const context = useContext(KanbanContext);
  if (context === undefined) {
    throw new Error("useKanban must be used within a KanbanProvider");
  }
  return context;
};
