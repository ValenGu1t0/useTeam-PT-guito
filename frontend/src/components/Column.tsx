"use client";

import { Column as ColumnType } from '../types';
import TaskCard from './TaskCard';
import { Draggable } from '@hello-pangea/dnd';
import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PlusCircle, Trash2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function Column({ 
    column, 
    onCreateTask, 
    onUpdateColumn, 
    onDeleteTask, 
    onUpdateTask,
    onDeleteColumn 
}: { 
    column: ColumnType; 
    onCreateTask: (columnId: string, title: string, description?: string) => void; 
    onUpdateColumn: (columnId: string, name: string) => void;
    onDeleteTask: (taskId: string) => void;
    onUpdateTask: (taskId: string, title: string, description?: string) => void;
    onDeleteColumn: (columnId: string) => void;
}) {

    const [newTitle, setNewTitle] = useState(''); 
    const [newDescription, setNewDescription] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isEditingColumnName, setIsEditingColumnName] = useState(false);
    const [columnName, setColumnName] = useState(column.name);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    // Sincronizar el nombre de la columna si cambia externamente
    useEffect(() => {
        setColumnName(column.name);
    }, [column.name]);

    const handleAddTask = () => {
        if (newTitle.trim()) {
            onCreateTask(column._id!, newTitle, newDescription.trim() || undefined);
            setNewTitle('');
            setNewDescription('');
            setIsDialogOpen(false); 
        }
    };

    const handleColumnNameClick = () => {
        setIsEditingColumnName(true);
    };

    const handleColumnNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setColumnName(e.target.value);
    };

    const handleColumnNameBlur = async () => {
        setIsEditingColumnName(false);
        if (columnName.trim() && columnName !== column.name) {
            await onUpdateColumn(column._id!, columnName);
        } else {
            setColumnName(column.name); 
        }
    };

    const handleColumnNameKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            await handleColumnNameBlur();
        }
    };

    const handleDeleteColumn = async () => {
        if (column._id) {
            await onDeleteColumn(column._id);
            setIsDeleteDialogOpen(false);
        }
    };

    // Enfocamos el input cuando se entra en modo edicion
    useEffect(() => {
        if (isEditingColumnName && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isEditingColumnName]);

    return (
        <Card className="flex flex-col h-full bg-card text-card-foreground">
            
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                
                {/* Titulo de la col + numero de tareas */}
                <div className="flex-grow flex flex-col gap-2">
                    {isEditingColumnName ? (
                        <Input
                            ref={inputRef}
                            value={columnName}
                            onChange={handleColumnNameChange}
                            onBlur={handleColumnNameBlur}
                            onKeyDown={handleColumnNameKeyDown}
                            className="text-lg font-semibold -ml-2 py-1 px-2 h-auto"
                            aria-label="Editar nombre de columna"
                        />
                    ) : (
                        <CardTitle 
                            className="hover:text-primary transition-colors duration-200 cursor-text" 
                            onClick={handleColumnNameClick}
                            title="Haz click para editar el nombre de la columna"
                        >
                            {column.name}
                        </CardTitle>
                    )}
                    <CardDescription>Total de tareas: {column.tasks?.length || 0}</CardDescription>
                </div>
                
                {/* Eliminar col */}
                <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                    <DialogTrigger asChild>
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-muted-foreground hover:text-destructive" 
                            title="Eliminar columna"
                        >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Eliminar columna</span>
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Confirmar eliminación de columna</DialogTitle>
                            <DialogDescription>
                                ¿Estás seguro de que quieres eliminar la columna <strong>{column.name}</strong>?
                                Todas las tareas dentro de esta columna también serán eliminadas. Esta acción no se puede deshacer.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                                Cancelar
                            </Button>
                            <Button variant="destructive" onClick={handleDeleteColumn}>
                                Eliminar Columna
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </CardHeader>

            <Separator />

            {/* Renderizado de las cards en cada col */}
            <CardContent className="flex-grow p-4 space-y-4 overflow-y-auto custom-scrollbar">
                {column.tasks?.map((task, index) => (
                    <Draggable draggableId={task._id!} index={index} key={task._id}>
                        {(provided) => (
                            <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                            >
                                <TaskCard 
                                    task={task} 
                                    onDelete={onDeleteTask} 
                                    onUpdate={onUpdateTask}
                                />
                            </div>
                        )}
                    </Draggable>
                ))}
                {column.tasks?.length === 0 && (
                    <p className="text-center text-sm text-muted-foreground">Arrastra tareas aquí o crea una nueva.</p>
                )}
            </CardContent>

            {/* Agregar tarea */}
            <div className="p-4 border-t bg-background rounded-b-lg">
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button variant="outline" className="w-full">
                            <PlusCircle className="h-4 w-4 mr-2" />
                            Agregar Tarea
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Crear nueva tarea</DialogTitle>
                            <DialogDescription>
                                Ingresa el título y una descripción para la nueva tarea.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                                <Label htmlFor="new-task-title" className="text-right">
                                    Título
                                </Label>
                                <Input
                                    id="new-task-title"
                                    value={newTitle}
                                    onChange={(e) => setNewTitle(e.target.value)}
                                    className="col-span-3"
                                    placeholder="Título de la tarea"
                                />
                            </div>
                            <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                                <Label htmlFor="new-task-description" className="text-right">
                                    Descripción
                                </Label>
                                <Textarea
                                    id="new-task-description"
                                    value={newDescription}
                                    onChange={(e) => setNewDescription(e.target.value)}
                                    className="col-span-3"
                                    placeholder="Descripción de la tarea (opcional)"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button onClick={handleAddTask} disabled={!newTitle.trim()}>
                                Guardar tarea
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </Card>
    );
}