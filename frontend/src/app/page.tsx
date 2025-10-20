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
import { Moon, Sun, Plus, UploadCloud } from "lucide-react";
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
import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

export default function Home() {
  
  const qc = useQueryClient();
  const { setTheme } = useTheme();
  const [email, setEmail] = useState("");
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false); 

  const { data: columns = [], isLoading: areColumnsLoading } = useQuery<ColumnType[]>({
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
      qc.invalidateQueries({ queryKey: ['columns'] });
      toast.success(`La tarea "${variables.taskTitle}" fue desplazada de "${variables.originalColumnName}" a "${variables.destinationColumnName}"`);
    },
    onError: (error, variables) => { 
      qc.invalidateQueries({ queryKey: ['columns'] }); 
      console.error("Error al mover la tarea:", error);
      toast.error(`Error al mover la tarea "${variables.taskTitle}". Por favor, inténtalo de nuevo.`);
    }
  });

  // Handler para el drag and drop
  const onDragEnd = async (result: DropResult) => {

    const { source, destination, draggableId } = result;

    if (!destination) return;

    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const currentColumns = qc.getQueryData<ColumnType[]>(['columns']);

    if (!currentColumns) return;

    const sourceColOriginal = currentColumns.find(col => col._id === source.droppableId);
    const destinationColOriginal = currentColumns.find(col => col._id === destination.droppableId);
    const movedTaskOriginal = sourceColOriginal?.tasks?.find(task => task._id === draggableId);

    qc.setQueryData<ColumnType[] | undefined>(['columns'], old => {

      if (!old) return old;
      
      const newCols = old.map(c => ({ ...c, tasks: [...(c.tasks || [])] }));
      
      const srcCol = newCols.find(c => c._id === source.droppableId);
      const destCol = newCols.find(c => c._id === destination.droppableId);
      
      if (!srcCol || !destCol) return old;
      
      const [moved] = srcCol.tasks!.splice(source.index, 1);
      
      if (!moved) return old; 

      moved.columnId = destination.droppableId; 
      
      destCol.tasks!.splice(destination.index, 0, moved);
      
      return newCols;
    });

    try {
      await moveTaskM.mutateAsync({ 
        taskId: draggableId, 
        columnId: destination.droppableId, 
        index: destination.index,
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

  // Handler del export CSV que triggerea el backend
  const handleExport = async () => {

    setIsExporting(true);

    const API_URL = process.env.NEXT_PUBLIC_API_URL;
    
    try {
      if (!API_URL) {
        throw new Error(
          "La variable de entorno NEXT_PUBLIC_API_URL no está definida."
        );
      }

      const response = await fetch(`${API_URL}api/export/backlog`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al exportar los datos.");
      }

      const data = await response.json();
      console.log("Exportación exitosa:", data);
      toast.success("Se ha realizado la petición para el backlog.");
      setEmail("");
      setIsPopoverOpen(false);

    } catch (error) {
      console.error("Error al exportar:", error);
      toast.error("Hubo un problema al intentar solicitar los datos.");
      
    } finally {
      setIsExporting(false);
    }
  };

  if (areColumnsLoading) return <div className="flex justify-center items-center h-screen">Cargando...</div>;

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

            {/* Tema + Export del CSV */}
            <div className="flex flex-row gap-4">

              {/* Botón de Exportar */}
              <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="icon">
                    <UploadCloud className="h-[1.2rem] w-[1.2rem]" />
                    <span className="sr-only">Exportar datos</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <h4 className="font-medium leading-none">Exportar Tareas</h4>
                      <p className="text-sm text-muted-foreground">
                        Ingresa tu email para recibir un backlog en formato CSV del panel actual
                      </p>
                    </div>
                    <div className="grid gap-2">
                      <div className="grid grid-cols-3 items-center gap-4">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          className="col-span-2 h-8"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </div>
                      <Button
                        onClick={handleExport}
                        disabled={isExporting || !email}
                        className="w-full mt-2"
                      >
                        {isExporting ? "Enviando..." : "Enviar"}
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>

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