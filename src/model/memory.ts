import { useSyncExternalStore } from "react";

type Read = (address: number) => number;
type Write = (address: number, value: number) => void;

export interface MemoryHandler {
    read: Read;
    write: Write;
}

export type Commit = [number, number, number][];

export interface MemoryAccessStatistic {
    read: Set<number>;
    write: Set<number>;
    outOfBound: Set<number>;
}

const createMemoryAccessStatistic = (): MemoryAccessStatistic => ({
    read: new Set<number>(),
    write: new Set<number>(),
    outOfBound: new Set<number>(),
});

export const createMemory = (size: number) => {
    const memory = new Int32Array(size);

    const mutate = (action: (memory: MemoryHandler) => void) => {
        const stat = createMemoryAccessStatistic();
        const commit: Commit = [];
        action({
            read: (address) => {
                if (address < 0 || address >= memory.length) {
                    stat.outOfBound.add(address);
                    return 0;
                }
                stat.read.add(address);
                return memory[address];
            },
            write: (address, value) => {
                if (address < 0 || address >= memory.length) {
                    stat.outOfBound.add(address);
                    return 0;
                }
                stat.write.add(address);
                commit.push([address, value, memory[address]]);
                memory[address] = value;
            },
        });
        return {
            commit,
            stat
        };
    }

    const undo = (commit: Commit) => {
        commit.forEach(([address, , oldValue]) => {
            memory[address] = oldValue;
        });
    };

    const redo = (commit: Commit) => {
        commit.forEach(([address, newValue]) => {
            memory[address] = newValue;
        });
    };

    const reset = () => {
        memory.fill(0);
    }

    return {
        data: memory,
        mutate,
        undo,
        redo,
        reset,
    }
}
