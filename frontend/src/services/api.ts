import axios from 'axios';
import { Column, Task } from '../types';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API || 'http://localhost:3000'
});

// GET Columnas
export const fetchColumns = async (): Promise<Column[]> => {

    const { data } = await api.get('/columns');
    return data;
};

// POST Columnas
export const createColumn = async (payload: { name: string; position?: number }) => {

    const { data } = await api.post('/columns', payload);
    return data;
};

// POST Tasks
export const createTask = async (payload: { title: string; description?: string; columnId: string }) => {

    const { data } = await api.post('/tasks', payload);
    /* console.log(payload) */
    return data as Task;
};

// mover/actualizar tarea (envía columnId y index en columna destino)
export const moveTask = async (taskId: string, payload: { columnId?: string; index?: number }) => {

    const { data } = await api.patch(`/tasks/${taskId}`, payload);
    return data as Task;
};