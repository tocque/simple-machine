import { FC, useEffect, useRef, useState } from "react";
import { executor, useExecutor } from "@/model/executor";
import styles from './index.module.less';
import { pad } from "@/utils/format";
import { Button, Input } from "@douyinfe/semi-ui";
import { IconArrowLeft, IconArrowRight, IconPause, IconPlay, IconRestart } from "@douyinfe/semi-icons";
import { useInterval } from "react-use";
import { INPUT_SIZE } from "../const";

export const Program: FC = () => {
    const { program, counter, history, it } = useExecutor();

    const canStepBack = it > 0;
    const canStepIn = counter < program.length;

    const [autoStepIn, setAutoStepIn] = useState<boolean>(false);
    const [speed, setSpeed] = useState(8);
    const [input, setInput] = useState('');
    const lastASI = useRef(Date.now());

    useEffect(() => {
        const inputArr = new Int32Array(input.length);
        for (let i = 0; i < input.length; i++) {
            inputArr[i] = input.charCodeAt(i);
        }
        executor.setInput(inputArr);
    }, [input]);

    useInterval(() => {
        if (autoStepIn && (Date.now() > (lastASI.current + 1000 / speed))) {
            executor.stepIn();
            lastASI.current = Date.now();
        }
    }, 20);

    useEffect(() => {
        if (autoStepIn && !canStepIn) {
            setAutoStepIn(false);
        }
    }, [canStepIn]);

    return (
        <div className={styles['program-panel']}>
            <div className={styles['controller']}>
                <pre className={styles['progress']}>{pad(it, 3)}/{pad(history.length, 3)}</pre>
                <Button
                    className={styles['button']}
                    disabled={autoStepIn || !canStepBack}
                    onClick={executor.stepBack}
                    icon={<IconArrowLeft />}
                />
                <Button
                    className={styles['button']}
                    disabled={autoStepIn || !canStepIn}
                    onClick={executor.stepIn}
                    icon={<IconArrowRight />}
                />
                <Button
                    disabled={autoStepIn || !canStepIn}
                    className={styles['button']}
                    onClick={() => setAutoStepIn(true)}
                    icon={<IconPlay />}
                />
                <Button
                    disabled={!autoStepIn}
                    className={styles['button']}
                    onClick={() => setAutoStepIn(false)}
                    icon={<IconPause />}
                />
                <Button
                    disabled={autoStepIn || history.length === 0}
                    className={styles['button']}
                    onClick={executor.clear}
                    icon={<IconRestart />}
                />
            </div>
            <div className={styles['input']}>
                <Input
                    size="default"
                    value={input}
                    onChange={(val) => setInput(val)}
                    maxLength={INPUT_SIZE}
                    prefix={<pre> INPUT: </pre>}
                    suffix={<pre>{input.length}/{INPUT_SIZE} </pre>}
                />
            </div>
            <div className={styles['program']}>
                {program.map((e, i) => {
                    const lineNo = pad(i, 3);
                    const data = `${e.instructionCode} ${e.params.join(' ')}`;
                    return (
                        <div key={i} className={styles['mask']} >
                            <pre className={styles['statement']}>{lineNo}: {data}</pre>
                            {counter === i && <div className={styles['mask-inner']}></div>}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
