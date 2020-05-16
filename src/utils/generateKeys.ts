export function generateEntityKey(
  type: string,
  id: string | number | undefined,
): string {
  if (!id) {
    throw new Error("Cannot generate entity key with `undefined` id");
  }
  return `${type}_${id}`;
}

export function generateRelationshipKey(
  fromKey: string,
  toKey: string,
): string {
  return `${fromKey}_${toKey}`;
}
