import { Tuple } from "@/utils/type";
import { Commit, MemoryAccessStatistic, createMemory } from "./memory";
import { INSTRUCTION_SET } from "./instructions";
import { useSyncExternalStore } from "react";
import { Program } from "./compiler";
import { INPUT_RANGE, MEMORY_SIZE } from "@/view/const";

type Listener = () => void;
interface HistoryItem {
    instructionCode: number,
    params: Tuple<number, number>,
    counter: [number, number],
    commit: Commit,
    stat: MemoryAccessStatistic,
}

const createExecutor = () => {
    const listeners = new Set<Listener>();
    
    const subscribe = (onChange: Listener) => {
        listeners.add(onChange);
        return () => {
            listeners.delete(onChange);
        };
    };

    const memory = createMemory(MEMORY_SIZE);
    let program: Program = [];
    let counter = 0;
    let history: HistoryItem[] = [];
    let it = 0;
    let input = new Int32Array();
    
    let snapshot = {
        memory,
        program,
        counter,
        history,
        it,
    };
    const emit = () => {
        snapshot = {
            memory,
            program,
            counter,
            history,
            it,
        };
        listeners.forEach((listener) => listener());
    }

    const stepBack = () => {
        if (it === 0) {
            return;
        }
        it--;
        const item = history[it];
        counter = item.counter[0];
        memory.undo(item.commit);
        emit();
    }

    const stepIn = () => {
        if (counter >= program.length) {
            return;
        }
        if (it === history.length) {
            const { instructionCode, params } = program[counter];
            const instruction = INSTRUCTION_SET[instructionCode];
            let nextCounter = counter + 1;
            const { commit, stat } = memory.mutate((mem) => {
                // @ts-ignore
                const updateCounter = instruction.operate(params, mem);
                if (updateCounter) {
                    nextCounter = updateCounter;
                }
            });
            history.push({
                instructionCode,
                params,
                counter: [counter, nextCounter],
                commit,
                stat,
            });
            counter = nextCounter;
            it++;
        } else {
            const item = history[it];
            counter = item.counter[1];
            memory.redo(item.commit);
            it++;
        }
        emit();
    }

    const setInput = (newInput: Int32Array) => {
        input = newInput;
        if (history.length === 0) {
            loadInput();
        }
    }

    const loadInput = () => {
        input.forEach((e, i) => memory.data[i + INPUT_RANGE[0]] = e);
    }

    const clearExec = () => {
        memory.reset();
        loadInput();
        history = [];
        it = 0;
        counter = 0;
    }

    const clear = () => {
        clearExec();
        emit();
    };

    const loadProgram = (newProgram: Program) => {
        clearExec();
        program = newProgram;
        emit();
    }

    // const resize = (size: number) => {
    //     memory = createMemory(size);
    //     clearExec();
    //     emit();
    // }

    const getSnapshot = () => snapshot;

    return {
        subscribe,
        getSnapshot,
        stepBack,
        stepIn,
        loadProgram,
        clear,
        // resize,
        setInput,
    }
};

export const executor = createExecutor();

export const useExecutor = () => {
    return useSyncExternalStore(executor.subscribe, executor.getSnapshot);
}
