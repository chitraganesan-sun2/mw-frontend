// `${first} ${last}` rendered "undefined undefined" (and phone numbers the same way) for
// any record missing a part. Joins only the parts that are present.
export function joinNames(...parts: Array<string | number | null | undefined>): string {
    return parts
        .filter((p) => p !== null && p !== undefined && String(p).trim() !== "")
        .map((p) => String(p).trim())
        .join(" ");
}
