export function generateEntityKey(type: string, id: string | number) {
  return `${type}_${id}`;
}

export function generateRelationshipKey(fromKey: string, toKey: string) {
  return `${fromKey}_${toKey}`;
}
