export function flattenObject(obj: any, parentKey: string = ''): { [key: string]: any } {
    const flattened: { [key: string]: any } = {};

    for (const key in obj) {
        const value = obj[key];
        const newKey = parentKey ? `${parentKey}_${key}` : key;

        if (typeof value === 'object' && value !== null) {
            const nested = flattenObject(value, newKey);
            Object.assign(flattened, nested);
        } else {
            flattened[newKey] = value;
        }
    }

    return flattened;
}