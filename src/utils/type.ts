export type Tuple<T, N extends number, R extends unknown[]=[]> = 
    N extends N ? number extends N ? T[]:
        R['length'] extends N ? R:Tuple<T, N, [T, ...R]> : never;