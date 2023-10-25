import { Tuple } from "@/utils/type";
import { INSTRUCTION_SET } from "./instructions";

interface Statement {
    instructionCode: number;
    params: Tuple<number, number>;
}
export type Program = Statement[];

const INSTRUCTION_DICT = Object.fromEntries(
    INSTRUCTION_SET.map((e, i) => [e.name, [e, i] as const])
);

export const compile = (sourceCode: string): Statement[] => {
    const program: Statement[] = [];
    sourceCode.split("\n")
        .map((e) => e.trim())
        .forEach((e, i) => {
            if (e === '' || e.startsWith("#")) {
                return;
            }
            const lineId = i + 1;
            const [name, ...rest] = e.split(/\s+/);
            if (!(name in INSTRUCTION_DICT)) {
                throw Error(`Line ${lineId}: 未知的指令 ${name}`);
            }
            if (!rest.some((e) => /^-?\d+$/.test(e))) {
                throw Error(`Line ${lineId}: 操作数错误`);
            }
            const params = rest.map((e) => Number(e));
            const [instruction, code] = INSTRUCTION_DICT[name];
            if (instruction.params.length !== params.length) {
                throw Error(`Line ${lineId}: 操作数数量错误`);
            }
            program.push({
                instructionCode: code,
                params,
            });
        });
    
    if (program.length === 0) {
        throw Error(`空程序`);
    }

    return program;
}
