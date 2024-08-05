
/** @dev This function is for some reason not generated. This should be fixed! */
export function objectToJSON(obj: any): any {
    if (Array.isArray(obj)) {
        return obj.map(objectToJSON);
    } else if (obj !== null && typeof obj === 'object') {
        return Object.fromEntries(
            Object.entries(obj).map(([key, value]) => [key, objectToJSON(value)])
        );
    } else if (obj instanceof Date) {
        return obj.toISOString();
    } else {
        return obj;
    }
}