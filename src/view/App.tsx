import { FC, useRef, useState } from 'react';
import { MemoryMonitor } from './MemoryMonitor';
import { Editor } from './Editor';
import styles from './index.module.less';
import { Program } from './Program';
import { Helper } from './Helper';

const App: FC = () => {

  return (
    <>
        <MemoryMonitor />
        <div className={styles['section-code']}>
            <div className={styles['subsection-helper']}>
                <Helper />
            </div>
            <div className={styles['subsection-editor']}>
                <Editor />
            </div>
            <div className={styles['subsection-program']}>
                <Program />
            </div>
        </div>
    </>
  )
}

export default App;
