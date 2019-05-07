export function generateEntityKey(type: string, id: string | number) {
  return `${type}_${id}`;
}

export function generateRelationshipKey(parentKey: string, childKey: string, type: string) {
  return `${parentKey}_${type.toLowerCase()}_${childKey}`;
}
