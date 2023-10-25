import React, { useEffect, useState, FC, createRef } from 'react';
import { EditorState } from '@codemirror/state';
import { EditorView, keymap, lineNumbers } from '@codemirror/view';
import { defaultKeymap, indentWithTab } from '@codemirror/commands';
import { Banner, Button, Toast } from '@douyinfe/semi-ui';
import { IconWrench } from '@douyinfe/semi-icons';
import { compile } from '@/model/compiler';
import { executor } from '@/model/executor';
import styles from './index.module.less';
import { useLocalStorage } from 'react-use';

export const Editor: FC = () => {
    const editor = createRef<HTMLDivElement>();

    const [lastComplied, setLastComplied] = useLocalStorage("editor.lastComplied", "", { raw: true });

    const [state, setEditorState] = useState<EditorState>(() => {
    
        const onUpdate = EditorView.updateListener.of((v) => {
            setEditorState(v.state);
        });

        return EditorState.create({
            doc: lastComplied,
            extensions: [
                keymap.of([...defaultKeymap, indentWithTab]),
                lineNumbers(),
                onUpdate,
            ],
        });
    });

    useEffect(() => {
        if (editor.current) {
            const view = new EditorView({
                state,
                parent: editor.current
            });
    
            return () => {
                view.destroy()
            }
        }
    }, [editor.current]);

    const [compileError, setCompileError] = useState<string>();

    const doComplie = () => {
        const code = state.doc.toString();
        try {
            const program = compile(code);
            executor.loadProgram(program);
            setCompileError(void 0);
            setLastComplied(code);
        } catch (e) {
            setCompileError(String(e));
        }
    };

    return (
        <div className={styles['editor-panel']}>
            <div className={styles['toolbar']}>
                <span>代码编辑器</span>
                <Button
                    style={{ marginLeft: 'auto' }}
                    type="primary"
                    size="default"
                    icon={<IconWrench />}
                    onClick={doComplie}
                >编译</Button>
            </div>
            {compileError && (
                <Banner type="danger" description={compileError} />
            )}
            <div className={styles['editor']} ref={editor}></div>
        </div>
    );
}