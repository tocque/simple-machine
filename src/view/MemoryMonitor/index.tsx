import { FC, useMemo, useState } from "react";
import { InputNumber, Switch } from "@douyinfe/semi-ui";
import { useLocalStorage } from 'react-use';
import { useExecutor } from "@/model/executor";
import { range, chunk } from "lodash-es";
import { match } from "ts-pattern";
import styles from "./index.module.less";
import { OUTPUT_RANGE } from "../const";

interface IMemoryBlockProps {
    id: number;
    value: number;
    write?: boolean;
    read?: boolean;
    showId?: boolean;
}

const MemoryBlock: FC<IMemoryBlockProps> = (props) => {
    const { id, value, write, read, showId } = props;

    const style = match(0)
        .when(() => write, () => styles['write'])
        .when(() => read, () => styles['read'])
        .otherwise(() => void 0)

    return (
        <div className={styles['memory-block']}>
            {showId && <div className={styles['id']}>{id}</div>}
            <div className={style}>{value}</div>
        </div>
    );
}

export const MemoryMonitor: FC = () => {

    const [width = 8, setWidth] = useLocalStorage("monitor.width", 8);
    const [showId = true, setShowId] = useLocalStorage("monitor.showId", true);

    const { memory, history, it } = useExecutor();
    const size = memory.data.length;
    const mutation = useMemo(() => {
        if (history.length === 0 || it === 0) {
            return void 0;
        }
        return history[it-1].stat;
    }, [history.length, it]);

    const lines = useMemo(() => chunk(range(size), width), [width, size]);

    return (
        <div className={styles['memory-monitor']} style={{ width: width * 62 }}>
            <div className={styles['toolbar']}>
                <span>内存监视器</span>
                <span style={{ marginLeft: 'auto' }}></span>
                <span>显示编号</span>
                <Switch checked={showId} onChange={(e) => setShowId(e)} />
                <span>宽度</span>
                <InputNumber
                    min={1}
                    value={width}
                    onChange={(e) => setWidth(Number(e))}
                />
            </div>
            <div className={styles['memory-table']}>
                {!showId && (
                    <div className={styles['memory-line']}>
                        {range(width).map(id => (<div className={styles['memory-block']}>[{id}]</div>))}
                    </div>
                )}
                {lines.map((line, i) => (
                    <div className={styles['memory-line']} key={i}>
                        {line.map((id) => (
                            <MemoryBlock key={id}
                                id={id}
                                value={memory.data[id]}
                                write={mutation?.write.has(id)}
                                read={mutation?.read.has(id)}
                                showId={showId}
                            />
                        ))}
                    </div>
                ))}
            </div>
            <div className={styles['memory-view']}>
                <pre>{range(OUTPUT_RANGE[0], OUTPUT_RANGE[1]).map((id) => String.fromCharCode(memory.data[id])).join('')}</pre>
            </div>
        </div>
    );
}
