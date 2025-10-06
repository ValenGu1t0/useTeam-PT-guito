"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  fetchColumns, 
  createColumn, 
  createTask, 
  moveTask, 
  updateColumn, 
  deleteTask,   
  updateTask,
  deleteColumn
} from '../services/api';
import { Column as ColumnType, Task as TaskType } from '../types';
import Column from '@/components/Column';
import { DragDropContext, Droppable, DropResult } from '@hello-pangea/dnd';
import { Button } from "@/components/ui/button";
import { Moon, Sun, Plus } from "lucide-react";
import { useTheme } from "next-themes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import SocketProvider from "@/utils/SocketProvider";
import Image from 'next/image';
import { toast } from 'sonner';

export default function Home() {
  
  const qc = useQueryClient();
  const { setTheme } = useTheme();

  const { data: columns = [], isLoading } = useQuery<ColumnType[]>({
    queryKey: ['columns'],
    queryFn: fetchColumns,
  });

  // Mutación para crear una columna
  const createColumnM = useMutation({
    mutationFn: (payload: { name: string; position?: number }) => createColumn(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['columns'] }),
  });

  // Mutación para actualizar una columna (ej. el nombre)
  const updateColumnM = useMutation({
    mutationFn: (payload: { columnId: string; name: string }) => updateColumn(payload.columnId, { name: payload.name }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['columns'] }),
  });

  // Mutación para eliminar una columna
  const deleteColumnM = useMutation({
    mutationFn: (columnId: string) => deleteColumn(columnId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['columns'] }),
  });

  // Mutación para crear una tarea
  const createTaskM = useMutation({
    mutationFn: (payload: { title: string; description?: string; columnId: string }) => createTask(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['columns'] }),
  });

  // Mutación para actualizar una tarea
  const updateTaskM = useMutation({
    mutationFn: (payload: { taskId: string; title: string; description?: string }) => 
      updateTask(payload.taskId, { title: payload.title, description: payload.description }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['columns'] }),
  });

  // Mutación para eliminar una tarea
  const deleteTaskM = useMutation({
    mutationFn: (taskId: string) => deleteTask(taskId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['columns'] }),
  });

  // Mutación para mover una tarea con notificación
  // Modifiqué el payload para incluir los nombres de las columnas en cada notificación
  const moveTaskM = useMutation({
    mutationFn: (payload: { 
      taskId: string; 
      columnId?: string; 
      index?: number; 
      originalColumnName: string;       // Nombre de la columna original
      destinationColumnName: string;    // Nombre de la columna de destino
      taskTitle: string;                // Nombre de la tarea desplazada
    }) => 
      moveTask(payload.taskId, { columnId: payload.columnId, index: payload.index }),
    onSuccess: (data, variables) => {
      // data es la tarea actualizada del backend (podría no ser necesaria aquí)
      // variables son los argumentos pasados a mutationFn
      qc.invalidateQueries({ queryKey: ['columns'] });
      
      // Acá esta la magia
      toast.success(`La tarea "${variables.taskTitle}" fue desplazada de "${variables.originalColumnName}" a "${variables.destinationColumnName}"`);
    },
    onError: (error, variables) => { 

      // Revertimos el drag en caso de error
      qc.invalidateQueries({ queryKey: ['columns'] }); 
      console.error("Error al mover la tarea:", error);

      // Mejor para depurar en caso de error también
      toast.error(`Error al mover la tarea "${variables.taskTitle}". Por favor, inténtalo de nuevo.`);
    }
  });


  const onDragEnd = async (result: DropResult) => {

    const { source, destination, draggableId } = result;

    if (!destination) return;

    // Si la tarea no se movió dentro de la misma columna o a otra columna
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    // Obtener el estado actual de las columnas desde la caché para asegurar que no mutamos `columns` directamente
    const currentColumns = qc.getQueryData<ColumnType[]>(['columns']);
    if (!currentColumns) return;

    // Encontrar la tarea y los nombres de las columnas ANTES de la actualización optimista
    const sourceColOriginal = currentColumns.find(col => col._id === source.droppableId);
    const destinationColOriginal = currentColumns.find(col => col._id === destination.droppableId);
    const movedTaskOriginal = sourceColOriginal?.tasks?.find(task => task._id === draggableId);


    // Actualización optimista
    qc.setQueryData<ColumnType[] | undefined>(['columns'], old => {

      if (!old) return old;
      
      // Creamos una copia profunda de las columnas para no mutar el estado directamente
      const newCols = old.map(c => ({ ...c, tasks: [...(c.tasks || [])] }));
      
      const srcCol = newCols.find(c => c._id === source.droppableId);
      const destCol = newCols.find(c => c._id === destination.droppableId);
      
      if (!srcCol || !destCol) return old;
      
      const [moved] = srcCol.tasks!.splice(source.index, 1);
      
      // Asegurarse de que 'moved' no sea undefined
      if (!moved) return old; 

      // Actualizar optimisticamente el columnId de la tarea movida
      moved.columnId = destination.droppableId; 
      
      destCol.tasks!.splice(destination.index, 0, moved);
      
      return newCols;
    });

    try {
      // Usar la mutación para moveTask
      await moveTaskM.mutateAsync({ 
        taskId: draggableId, 
        columnId: destination.droppableId, 
        index: destination.index,

        // Pasamos los nombres de las columnas y el título de la tarea obtenidos del estado original
        originalColumnName: sourceColOriginal?.name || 'Origen Desconocido', 
        destinationColumnName: destinationColOriginal?.name || 'Destino Desconocido',
        taskTitle: movedTaskOriginal?.title || 'Tarea Desconocida'
      });

    } catch (err) {
      console.error("Error en onDragEnd:", err);
    }
  };

  const handleCreateColumn = () => {
    createColumnM.mutate({ name: `Columna ${columns.length + 1}`, position: columns.length });
  };

  const handleUpdateColumnName = (columnId: string, name: string) => {
    updateColumnM.mutate({ columnId, name });
  };

  const handleDeleteColumn = (columnId: string) => {
    deleteColumnM.mutate(columnId);
  };

  const handleCreateTask = (columnId: string, title: string, description?: string) => {
    createTaskM.mutate({ title, description, columnId });
  };

  const handleUpdateTask = (taskId: string, title: string, description?: string) => {
    updateTaskM.mutate({ taskId, title, description });
  };

  const handleDeleteTask = (taskId: string) => {
    deleteTaskM.mutate(taskId);
  };

  if (isLoading) return <div className="flex justify-center items-center h-screen">Cargando...</div>;

  return (
    <SocketProvider>
      <div className="min-h-screen bg-background/80 text-foreground">

        {/* Navbar */}
        <nav className="sticky top-0 z-50 w-full px-7 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          
          <div className="container flex p-4 items-center justify-between">

            {/* Logo */}
            <div className="flex items-center gap-4">
              <Image src="/logo.png" alt="logo" width={40} height={40} />
              <span className="font-bold text-lg hidden sm:flex">MyKanBan</span>
            </div>

            {/* Toggle del Tema */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                  <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                  <span className="sr-only">Cambia el tema</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setTheme("light")}>
                  Claro
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")}>
                  Oscuro
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("system")}>
                  Sistema
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

          </div>
        </nav>

        {/* Cuerpo del KanBan */}
        <main className="flex flex-col justify-center p-6 gap-4">

          <h1 className="text-3xl font-bold mb-6 px-4">Tablero de Valentino</h1>

          {/* Acá implementamos la zona para drag & drop */}
          <DragDropContext onDragEnd={onDragEnd}>

            <div className="flex flex-row flex-wrap gap-6 justify-center items-start">

              {/* Columnas */}
              {columns.sort((a, b) => a.position - b.position).map(col => (
                <Droppable droppableId={col._id!} key={col._id}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className="flex-shrink-0 w-full sm:w-[calc(50%-1.5rem)] lg:w-[calc(33.333%-1.5rem)] xl:w-[calc(25%-1.5rem)]"
                    >
                      <Column
                        column={col}
                        onCreateTask={handleCreateTask} 
                        onUpdateColumn={handleUpdateColumnName} 
                        onDeleteTask={handleDeleteTask}     
                        onUpdateTask={handleUpdateTask} 
                        onDeleteColumn={handleDeleteColumn}  
                      />
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              ))}

              {/* Columna "fantasma" para crear nuevas columnas */}
              <div className="flex-shrink-0 w-full sm:w-[calc(50%-1.5rem)] lg:w-[calc(33.333%-1.5rem)] xl:w-[calc(25%-1.5rem)]">
                <div
                  onClick={handleCreateColumn}
                  className="bg-muted border-2 border-dashed border-gray-400 rounded-lg p-6 h-full flex flex-col justify-center items-center text-gray-500 hover:border-primary hover:text-primary cursor-pointer transition-colors duration-200 min-h-[150px]"
                >
                  <Plus className="h-8 w-8 mb-2" />
                  <span className="text-lg font-medium">Nueva Columna</span>
                </div>
              </div>

            </div>

          </DragDropContext>
          
        </main>
      </div>
    </SocketProvider>
  );
}