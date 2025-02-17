import { UniqueIdentifier } from "@dnd-kit/core";

export type Id = UniqueIdentifier;
export type Column = {
  id: Id;
  title: string;
};

export type Task = {
  id: Id;
  columnId: Id;
  content: string;
};
