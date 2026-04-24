import type { CategoryTree } from "../types";

export function getAllCategoryIdsFromTree(
  tree: CategoryTree,
  parentName: string,
): number[] {
  return tree[parentName]?.map((c) => c.id) ?? [];
}
