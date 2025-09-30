import { AnyActionDefinition, ActionCategory, ActionListItem } from "./types";

export function filterByCategory(
  actions: AnyActionDefinition[],
  category?: ActionCategory
): AnyActionDefinition[] {
  return category ? actions.filter((a) => a.category === category) : actions;
}

export function paginate<T>(
  items: T[],
  page = 1,
  size = 8
): {
  items: T[];
  page: number;
  size: number;
  total: number;
  totalPages: number;
} {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / size));
  const start = (page - 1) * size;
  return {
    items: items.slice(start, start + size),
    page,
    size,
    total,
    totalPages,
  };
}

export function toListItem(action: AnyActionDefinition): ActionListItem {
  const { id, title, description, category, icon } = action;
  return { id, title, description, category, icon };
}


