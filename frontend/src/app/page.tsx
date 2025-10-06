"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchColumns, createColumn, createTask, moveTask } from '../services/api';
import { Column as ColumnType } from '../types';
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
import Image from 'next/image';

export default function Home() {
  
  const qc = useQueryClient();
  const { setTheme } = useTheme();

  const { data: columns = [], isLoading } = useQuery<ColumnType[]>({
    queryKey: ['columns'],
    queryFn: fetchColumns,
  });

  const createColumnM = useMutation({
    mutationFn: (payload: { name: string; position?: number }) => createColumn(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['columns'] }),
  });

  const createTaskM = useMutation({
    mutationFn: (payload: { title: string; description?: string; columnId: string }) => createTask(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['columns'] }),
  });

  const onDragEnd = async (result: DropResult) => {

    const { source, destination, draggableId } = result;

    if (!destination) return;

    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    qc.setQueryData<ColumnType[] | undefined>(['columns'], old => {
      if (!old) return old;
      const newCols = old.map(c => ({ ...c, tasks: [...(c.tasks || [])] }));
      const srcCol = newCols.find(c => c._id === source.droppableId);
      const destCol = newCols.find(c => c._id === destination.droppableId);
      if (!srcCol || !destCol) return old;
      const [moved] = srcCol.tasks!.splice(source.index, 1);
      destCol.tasks!.splice(destination.index, 0, moved);
      return newCols;
    });

    try {
      await moveTask(draggableId, { columnId: destination.droppableId, index: destination.index });

    } catch (err) {
      console.error(err);
      qc.invalidateQueries({ queryKey: ['columns'] });
    }
  };

  const handleCreateColumn = () => {
    createColumnM.mutate({ name: `Columna ${columns.length + 1}`, position: columns.length });
  };

  if (isLoading) return <div className="flex justify-center items-center h-screen">Cargando...</div>;

  return (

    <div className="min-h-screen bg-background/80 text-foreground">

      {/* Navbar */}
      <nav className="sticky top-0 z-50 w-full px-7 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        
        <div className="container flex p-4 items-center justify-between">

          <div className="flex items-center gap-4">
            <Image src="/logo.png" alt="logo" width={40} height={40} />
            <span className="font-bold text-lg hidden sm:flex">MyKanBan</span>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
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
      <main className="flex flex-col justify-center p-6">

        <h1 className="text-3xl font-bold mb-6">Tablero de Valentino</h1>

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
                      onCreateTask={(title, desc) => createTaskM.mutate({ title, description: desc, columnId: col._id! })}
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
  );
}