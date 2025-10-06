import axios from 'axios';
import { Column, Task } from '../types';

const api = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.NEXT_PUBLIC_API ||
    'http://localhost:3000',
});

/* ------------------------------- COLUMNAS ------------------------------- */

// GET Columnas
export const fetchColumns = async (): Promise<Column[]> => {
  const { data } = await api.get('/columns');
  return data;
};

// POST Columnas
export const createColumn = async (payload: { name: string; position?: number }) => {
  const { data } = await api.post('/columns', payload);
  return data as Column;
};

// PATCH Columnas (actualizar nombre, posición, etc.)
export const updateColumn = async (columnId: string, payload: Partial<Column>) => {
  const { data } = await api.put(`/columns/${columnId}`, payload);
  return data as Column;
};

// DELETE Columnas
export const deleteColumn = async (columnId: string) => {
  const { data } = await api.delete(`/columns/${columnId}`);
  return data;
};

/* -------------------------------- TASKS -------------------------------- */

// GET Tareas
export const fetchTasks = async (): Promise<Task[]> => {
  const { data } = await api.get('/tasks');
  return data;
};

// POST Tasks (crear nueva tarea)
export const createTask = async (payload: { title: string; description?: string; columnId: string }) => {
  const { data } = await api.post('/tasks', payload);
  return data as Task;
};

// PATCH Tasks (mover o actualizar una tarea)
export const updateTask = async (taskId: string, payload: Partial<Task>) => {
  const { data } = await api.put(`/tasks/${taskId}`, payload);
  return data as Task;
};

// DELETE Tasks
export const deleteTask = async (taskId: string) => {
  const { data } = await api.delete(`/tasks/${taskId}`);
  return data;
};

/* -------------------------- MOVE TASK (Drag & Drop) -------------------------- */
export const moveTask = async (taskId: string, payload: { columnId?: string; index?: number }) => {
  const { data } = await api.put(`/tasks/${taskId}`, payload);
  return data as Task;
};