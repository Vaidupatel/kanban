 
import { UniqueIdentifier } from "@dnd-kit/core";

export type Id = UniqueIdentifier;

export type Section = {
  id: Id;
  title: string;
};

export type Task = {
  id: Id;
  sectionId: Id;
  description: string;
  assignee: string;
  dueDate: string;
  project: string;
  priority: "low" | "medium" | "high";
};
