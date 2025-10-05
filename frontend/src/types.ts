// Tipado de una Tarea
export interface Task {
  _id?: string;
  title: string;
  description?: string;
  assignedTo?: string;
  dueDate?: string; 
  createdAt: string;
  updatedAt?: string;
  columnId?: string; 
}

// Tipado de una Columna
export interface Column {
  _id?: string;
  name: string;
  position: number;
  tasks?: Task[];
  createdAt: string;
}

// Tipado de un Tablero
export interface Board {
  _id?: string;
  name: string;
  columns?: Column[];
  createdAt: string;
}

/* En un futuro el tipado para el estado del socket
export interface SocketEvent<T = any> {
  type: string;
  payload: T;
}
*/