/** Original document positions keyed by semantic anchor. */
export type OrderMap = ReadonlyMap<string, number>;

/** Stable sort by document position, keeping schema order for unknown items. */
export function orderedBy<T>(items: readonly T[], key: (item: T) => string, order?: OrderMap): T[] {
  if (!order) return [...items];

  return items
    .map((item, index) => ({ item, index }))
    .sort((left, right) => {
      const leftOrder = order.get(key(left.item)) ?? Number.MAX_SAFE_INTEGER;
      const rightOrder = order.get(key(right.item)) ?? Number.MAX_SAFE_INTEGER;
      return leftOrder - rightOrder || left.index - right.index;
    })
    .map(({ item }) => item);
}
