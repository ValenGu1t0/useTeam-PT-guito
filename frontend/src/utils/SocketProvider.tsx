import { ReactNode, useEffect } from 'react';
import { io } from 'socket.io-client';
import { useQueryClient } from '@tanstack/react-query';
import { Column, Task } from '../types';
import { toast } from 'sonner';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3000';

export default function SocketProvider({ children }: { children: ReactNode }) {

    const qc = useQueryClient();

    useEffect(() => {
        const socket = io(WS_URL, { autoConnect: true });
        /* console.log('🔌 Socket connected:', socket.id); */

        // Evita duplicados cuando se crea una tarea - bug de doble card en otro navegador
        socket.on('taskCreated', (task: Task) => {
        
            qc.setQueryData<Column[] | undefined>(['columns'], (old) => {

                if (!old) return old;

                return old.map((col) =>
                col._id === task.columnId
                    ? {
                        ...col,
                        tasks: col.tasks?.some((t) => t._id === task._id)
                        ? col.tasks // si ya existe -> no duplicar
                        : [...(col.tasks || []), task],
                    }
                    : col
                );
            });
            toast.success('Nueva tarea creada');
        });

        socket.on('taskUpdated', (task: Task) => {

            qc.setQueryData<Column[] | undefined>(['columns'], (old) => {

                if (!old) return old;

                // Eliminamos la task vieja y la reinsertamos en su nueva col
                const newCols = old.map((col) => ({
                    ...col,
                    tasks: (col.tasks || []).filter((t) => t._id !== task._id),
                }));

                const targetCol = newCols.find((col) => col._id === task.columnId);

                if (targetCol) {
                    targetCol.tasks = [...(targetCol.tasks || []), task];
                }
                return newCols;
            });
            toast.info('Tarea actualizada');
        });

        socket.on('taskDeleted', (taskId: string) => {

            qc.setQueryData<Column[] | undefined>(['columns'], (old) => {

                if (!old) return old;

                return old.map((col) => ({
                    ...col,
                    tasks: (col.tasks || []).filter((t) => t._id !== taskId),
                }));
            });
            toast.error('Tarea eliminada');
        });


        socket.on('columnCreated', (col: Column) => {
            qc.invalidateQueries({ queryKey: ['columns'] });
            toast.success(`Columna "${col.name}" creada`);
        });

        socket.on('columnUpdated', (col: Column) => {
            qc.invalidateQueries({ queryKey: ['columns'] });
            toast.info(`Columna "${col.name}" modificada`);
        });

        socket.on('columnDeleted', (columnId: string) => {
            qc.setQueryData<Column[] | undefined>(['columns'], (old) =>
                old?.filter((c) => c._id !== columnId)
            );
            toast.error('Columna eliminada');
        });

        // Limpieza de listeners cuando apagamos
        return () => {
            socket.disconnect();
            socket.removeAllListeners();
        };
    }, [qc]);

    return <>{children}</>;
}