import { INSTRUCTION_SET, INSTRUCTION_SET_GROUPS, Instruction, InstructionType, ParamType } from "@/model/instructions";
import { Tag } from "@douyinfe/semi-ui";
import { FC, ReactNode, useMemo, useState } from "react";
import { match } from "ts-pattern";
import styles from "./index.module.less";

export const Helper: FC = () => {

    const [selected, setSelected] = useState<InstructionType>();

    const description = useMemo(() => {
        if (!selected) return [];
        const tokens: ReactNode[] = [];
        tokens.push(`@name: ${selected.name}`, <br/>);
        tokens.push(selected.description, <br/>);
        selected.params.forEach((param) => {
            const typeStr = match(param[1])
                .with(ParamType.Constant, () => <code className={styles['token-constant']}>常量</code>)
                .with(ParamType.Address, () => <code className={styles['token-address']}>内存地址</code>)
                .with(ParamType.Pointer, () => <code className={styles['token-pointer']}>内存地址指向的内存地址</code>)
                .otherwise(() => '');
            tokens.push(`@param: ${param[0]} `, typeStr, <br/>);
        });
        return tokens;
    }, [selected]);

    const instructionTags = (instructions: InstructionType[]) => {
        return instructions.map((e) => (
            <Tag
                key={e.name}
                color="white"
                style={{ marginRight: 5 }}
                onClick={() => setSelected(e)}
            >{e.name}</Tag>
        ));
    }

    return (
        <div className={styles['helper']}>
            <div>语言帮助</div>
            <div>每行只能写一个指令 + 它的操作数</div>
            <div># 开头的行被认为是注释</div>
            <div>指令手册</div>
            <div style={{ marginTop: 5 }}>
                <div>
                    <span>赋值:</span>{instructionTags(INSTRUCTION_SET_GROUPS.Assignment)}
                </div>
                <div>
                    <span>运算:</span>{instructionTags(INSTRUCTION_SET_GROUPS.Arithmetic)}
                </div>
                <div>
                    <span>位运算:</span>{instructionTags(INSTRUCTION_SET_GROUPS.BitArithmetic)}
                </div>
                <div>
                    <span>比较:</span>{instructionTags(INSTRUCTION_SET_GROUPS.Comparator)}
                </div>
                <div>
                    <span>地址访问:</span>{instructionTags(INSTRUCTION_SET_GROUPS.Address)}
                </div>
                <div>
                    <span>跳转:</span>{instructionTags(INSTRUCTION_SET_GROUPS.Jump)}
                </div>
            </div>
            <div>
                {selected && (
                    <pre className={styles['description']}>{description}</pre>
                )}
            </div>
        </div>
    )
}
