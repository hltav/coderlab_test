export interface ZCategory {
  id: number;
  name: string;
  parentId: number | null;
  children?: ZCategory[];
  parent?: ZCategory | null;
}
