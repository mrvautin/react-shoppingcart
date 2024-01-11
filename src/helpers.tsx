/*
/////// DEEP CLONE ///////
*/
type Data =
    | number
    | string
    | boolean
    | null
    | undefined
    | Date
    | Data[]
    | { [key: string]: Data };

type FormatKey = (key: string) => string;

export function deepClone<I extends Data, O extends Data = I>(
    value: I,
    formatKey?: FormatKey,
    refs: Map<I, O> = new Map<I, O>(),
): O {
    const ref = refs.get(value);
    if (typeof ref !== 'undefined') {
        return ref;
    }
    if (Array.isArray(value)) {
        const clone: Data[] = [];
        refs.set(value, clone as O);
        for (let i = 0; i < value.length; i++) {
            clone[i] = deepClone(value[i], formatKey, refs);
        }
        return clone as O;
    }
    if (value instanceof Date) {
        return new Date(value.valueOf()) as O;
    }
    if (!(value instanceof Object)) {
        return value as unknown as O;
    }
    const clone: Record<string, Data> = {};
    refs.set(value, clone as O);
    const keys = Object.keys(value);
    for (let i = 0; i < keys.length; i++) {
        const key =
            typeof formatKey === 'function' ? formatKey(keys[i]) : keys[i];
        clone[key] = deepClone(value[keys[i]], formatKey, refs);
    }
    return clone as O;
}

export function formatKeys(format: FormatKey) {
    return <I extends Data, O extends Data = I>(value: I) =>
        deepClone<I, O>(value, format);
}

deepClone.formatKeys = formatKeys;

/*
/////// GENERATE HASH ///////
*/
type HashAlgorithm = 'djb2';

function djb2Hash(str: string): number {
    let hash = 5381;
    for (let i = 0; i < str.length; i++) {
        hash = (hash * 33) ^ str.charCodeAt(i);
    }
    return hash >>> 0; // Ensure the result is an unsigned 32-bit integer
}

export function hash(
    obj: Record<string, any>,
    algorithm: HashAlgorithm = 'djb2',
): string {
    const serializedObject = JSON.stringify(obj);
    const hashValue = algorithm === 'djb2' ? djb2Hash(serializedObject) : 0; // Replace with your preferred hashing algorithm

    // Convert the hash value to a string
    return hashValue.toString(16);
}

/*
/////// FORMAT CURRENCY ///////
*/
export function formatCurrency(
    amount: number,
    locale: string,
    currency: string,
) {
    const formatter = new Intl.NumberFormat(locale || 'en-US', {
        style: 'currency',
        currency: currency || 'USD',
    });
    return formatter.format(amount);
}
