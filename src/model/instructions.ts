import { Tuple } from "@/utils/type";
import { MemoryHandler } from "./memory";

export enum ParamType {
    Constant,
    Address,
    Pointer,
}

export interface Instruction<T extends number> {
    name: string;
    description: string;
    params: Tuple<[string, ParamType], T>;
    operate: (params: Tuple<number, T>, memory: MemoryHandler) => number | void;
}

export type InstructionType = Instruction<0> | Instruction<1> | Instruction<2> | Instruction<3>

const defineInstruction = <T extends number>(instruction: Instruction<T>) => instruction;

const set = defineInstruction<2>({
    name: 'set',
    description: "将 {a} 设置为 {b} 的值",
    params: [
        ["a", ParamType.Address],
        ["b", ParamType.Address],
    ],
    operate: ([a, b], { read, write }) => {
        const vb = read(b);
        write(a, vb);
    },
});

const setc = defineInstruction<2>({
    name: 'setc',
    description: "将 {a} 设置为 {b} 的值",
    params: [
        ["a", ParamType.Address],
        ["b", ParamType.Constant],
    ],
    operate: ([a, b], { write }) => {
        write(a, b);
    },
});

const createBaseArithmetic = (name: string, optName: string, opt: (a: number, b: number) => number) => {

    const cal = defineInstruction<3>({
        name,
        description: `将 {a} 与 {b} ${optName}，结果写入 {c}`,
        params: [
            ["a", ParamType.Address],
            ["b", ParamType.Address],
            ["c", ParamType.Address],
        ],
        operate: ([a, b, c], { read, write }) => {
            const va = read(a);
            const vb = read(b);
            write(c, opt(va, vb));
        },
    });

    const calc = defineInstruction<3>({
        name: `${name}c`,
        description: `将 {a} 与 {b} ${optName}，结果写入 {c}`,
        params: [
            ["a", ParamType.Address],
            ["b", ParamType.Constant],
            ["c", ParamType.Address],
        ],
        operate: ([a, b, c], { read, write }) => {
            const va = read(a);
            write(c, opt(va, b));
        },
    });

    const calrc = defineInstruction<3>({
        name: `${name}rc`,
        description: `将 {a} 与 {b} ${optName}，结果写入 {c}`,
        params: [
            ["a", ParamType.Constant],
            ["b", ParamType.Address],
            ["c", ParamType.Address],
        ],
        operate: ([a, b, c], { read, write }) => {
            const vb = read(b);
            write(c, opt(a, vb));
        },
    });

    return [cal, calc, calrc];
}

const int = (a: number) => ~~a;

const [add, addc] = createBaseArithmetic("add", "相加", (a, b) => int(a + b));
const [mul, mulc] = createBaseArithmetic("mul", "相乘", (a, b) => int(a * b));
const [sub, subc, subrc] = createBaseArithmetic("sub", "相减", (a, b) => int(a - b));
const [div, divc, divrc] = createBaseArithmetic("div", "相除", (a, b) => int(a / b));
const [mod, modc, modrc] = createBaseArithmetic("mod", "取模", (a, b) => int(a % b));

const [and, andc] = createBaseArithmetic("and", "按位与", (a, b) => a & b);
const [or, orc] = createBaseArithmetic("or", "按位或", (a, b) => a | b);
const [xor, xorc] = createBaseArithmetic("xor", "按位异或", (a, b) => a ^ b);

const rev = defineInstruction<1>({
    name: "rev",
    description: "将 {a} 取反",
    params: [
        ["a", ParamType.Address],
    ],
    operate: ([a], { read, write }) => {
        const va = read(a);
        write(a, ~va);
    },
});

const createBaseComparator = (name: string, cmpName: string, cmp: (a: number, b: number) => boolean) => {

    const cal = defineInstruction<3>({
        name,
        description: `判断 {a} 是否${cmpName} {b}，结果写入 {c}`,
        params: [
            ["a", ParamType.Address],
            ["b", ParamType.Address],
            ["c", ParamType.Address],
        ],
        operate: ([a, b, c], { read, write }) => {
            const va = read(a);
            const vb = read(b);
            write(c, cmp(va, vb) ? 1 : 0);
        },
    });

    const calc = defineInstruction<3>({
        name: `${name}c`,
        description: `判断 {a} 是否${cmpName} {b}，结果写入 {c}`,
        params: [
            ["a", ParamType.Address],
            ["b", ParamType.Constant],
            ["c", ParamType.Address],
        ],
        operate: ([a, b, c], { read, write }) => {
            const va = read(a);
            write(c, cmp(va, b) ? 1 : 0);
        },
    });

    const calrc = defineInstruction<3>({
        name: `${name}rc`,
        description: `判断 {a} 是否${cmpName} {b}，结果写入 {c}`,
        params: [
            ["a", ParamType.Constant],
            ["b", ParamType.Address],
            ["c", ParamType.Address],
        ],
        operate: ([a, b, c], { read, write }) => {
            const vb = read(b);
            write(c, cmp(a, vb) ? 1 : 0);
        },
    });

    return [cal, calc, calrc];
}

const [gt, gtc, gtrc] = createBaseComparator("gt", "大于", (a, b) => a > b);
const [lt, ltc, ltrc] = createBaseComparator("lt", "小于", (a, b) => a < b);
const [ge, gec, gerc] = createBaseComparator("ge", "大于等于", (a, b) => a >= b);
const [le, lec, lerc] = createBaseComparator("le", "小于等于", (a, b) => a <= b);
const [eq, eqc] = createBaseComparator("eq", "等于", (a, b) => a === b);
const [neq, neqc] = createBaseComparator("neq", "不等于", (a, b) => a !== b);

const read = defineInstruction<2>({
    name: "read",
    description: "将 {a} 读取到 {b}",
    params: [
        ["a", ParamType.Pointer],
        ["b", ParamType.Address],
    ],
    operate: ([a, b], { read, write }) => {
        const pa = read(a);
        const va = read(pa);
        write(b, va);
    },
});

const write = defineInstruction<2>({
    name: "write",
    description: "将 {b} 写入到 {a}",
    params: [
        ["a", ParamType.Pointer],
        ["b", ParamType.Address],
    ],
    operate: ([a, b], { read, write }) => {
        const pa = read(a);
        const vb = read(b);
        write(pa, vb);
    },
});

const writec = defineInstruction<2>({
    name: "writec",
    description: "将 {b} 写入到 {a}",
    params: [
        ["a", ParamType.Pointer],
        ["b", ParamType.Constant],
    ],
    operate: ([a, b], { read, write }) => {
        const pa = read(a);
        write(pa, b);
    },
});

const jmp = defineInstruction<1>({
    name: "jmp",
    description: "跳转到 {a}",
    params: [
        ["a", ParamType.Address],
    ],
    operate: ([a], { read }) => {
        const va = read(a);
        return va;
    },
});

const jmpc = defineInstruction<1>({
    name: "jmpc",
    description: "跳转到 {a}",
    params: [
        ["a", ParamType.Constant],
    ],
    operate: ([a]) => {
        return a;
    },
});

const jcnz = defineInstruction<2>({
    name: "jcnz",
    description: "如果 {b} 不为 0 则跳转到 {a}",
    params: [
        ["a", ParamType.Constant],
        ["b", ParamType.Address],
    ],
    operate: ([a, b], { read }) => {
        const vb = read(b);
        if (vb !== 0) return a;
    },
});

const Assignment = [
    set, setc,
];

const Arithmetic = [
    add, addc,
    mul, mulc,
    sub, subc, subrc,
    div, divc, divrc,
    mod, modc, modrc,
];

const BitArithmetic = [
    and, andc,
    or, orc,
    xor, xorc,
    rev,
];

const Comparator = [
    gt, gtc, gtrc,
    lt, ltc, ltrc,
    ge, gec, gerc,
    le, lec, lerc,
    eq, eqc,
    neq, neqc,
];

const Address = [
    read,
    write, writec,
];

const Jump = [
    jmp, jmpc, jcnz,
];

export const INSTRUCTION_SET = [
    ...Assignment,
    ...Arithmetic,
    ...BitArithmetic,
    ...Comparator,
    ...Address,
    ...Jump,
];

export const INSTRUCTION_SET_GROUPS = {
    Assignment,
    Arithmetic,
    BitArithmetic,
    Comparator,
    Address,
    Jump,
}
