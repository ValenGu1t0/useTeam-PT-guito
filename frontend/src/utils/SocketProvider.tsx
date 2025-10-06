import { ReactNode, useEffect } from 'react';
import { io } from 'socket.io-client';
import { useQueryClient } from '@tanstack/react-query';
import { Column, Task } from '../types';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3000';

export default function SocketProvider({ children }: { children: ReactNode }) {

    const qc = useQueryClient();

    useEffect(() => {

        const socket = io(WS_URL, { autoConnect: true });

        socket.on('connect', () => console.log('socket connected', socket.id));

        socket.on('taskCreated', (task: Task) => {
        qc.setQueryData<Column[] | undefined>(['columns'], (old) => {
            if (!old) return old;
            return old.map(col =>
            col._id === task.columnId ? { ...col, tasks: [...(col.tasks||[]), task] } : col
            );
        });
        });

        socket.on('taskUpdated', (task: Task) => {
        qc.setQueryData<Column[] | undefined>(['columns'], (old) => {
            if (!old) return old;
            // eliminar task de donde este e insertarla en su columnId
            const newCols = old.map(c => ({ ...c, tasks: [...(c.tasks||[])] }));
            // eliminar de esa col
            newCols.forEach(c => {
            const idx = c.tasks!.findIndex(t => t._id === task._id);
            if (idx >= 0) c.tasks!.splice(idx, 1);
            });
            // insertar en la nueva col (al final)
            const target = newCols.find(c => c._id === task.columnId);
            if (target) target.tasks = [...(target.tasks||[]), task];
            return newCols;
        });
        });

        socket.on('columnCreated', () => {
            qc.invalidateQueries({ queryKey: ['columns'] });
        });

        // limpiamos el socket
        return () => {
            socket.disconnect();
        };
    }, [qc]);

    return <>{children}</>;
}