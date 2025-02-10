export type FileType = "f" | "d";

export type Entry<T extends FileType = FileType> = {
  name: string;
  path: string;
  type: T;
  size: number;
  modified?: Date;
  created?: Date;
};

export type File = Entry<"f">;
export type Folder = Entry<"d">;
