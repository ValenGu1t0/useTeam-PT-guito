"use client";

import { Column as ColumnType } from '../types';
import TaskCard from './TaskCard';
import { Draggable } from '@hello-pangea/dnd';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
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

export default function Column({ column, onCreateTask }: { column: ColumnType; onCreateTask: (title: string, description?: string) => void }) {

    const [newTitle, setNewTitle] = useState(''); 
    const [newDescription, setNewDescription] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const handleAddTask = () => {
        if (newTitle.trim()) {
            onCreateTask(newTitle, newDescription.trim() || undefined);
            setNewTitle('');
            setNewDescription('');
            setIsDialogOpen(false); 
        }
    };

    return (
        <Card className="flex flex-col h-full bg-card text-card-foreground">
            
            <CardHeader>
                <CardTitle>{column.name}</CardTitle>
                <CardDescription>Total de tareas: {column.tasks?.length || 0}</CardDescription>
            </CardHeader>

            <Separator />

            <CardContent className="flex-grow p-4 space-y-4 overflow-y-auto custom-scrollbar">
                {column.tasks?.map((task, index) => (
                    <Draggable draggableId={task._id!} index={index} key={task._id}>
                        {(provided) => (
                            <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                            >
                                <TaskCard task={task} />
                            </div>
                        )}
                    </Draggable>
                ))}
                {column.tasks?.length === 0 && (
                    <p className="text-center text-sm text-muted-foreground">Arrastra tareas aquí o crea una nueva.</p>
                )}
            </CardContent>

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
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="title" className="text-right">
                                    Título
                                </Label>
                                <Input
                                    id="title"
                                    value={newTitle}
                                    onChange={(e) => setNewTitle(e.target.value)}
                                    className="col-span-3"
                                    placeholder="Título de la tarea"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="description" className="text-right">
                                    Descripción
                                </Label>
                                <Textarea
                                    id="description"
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