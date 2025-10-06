"use client";

import { Task } from '../types';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { useState, useEffect } from 'react';
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function TaskCard({ task, onDelete, onUpdate }: { 
    task: Task; 
    onDelete: (taskId: string) => void;
    onUpdate: (taskId: string, title: string, description?: string) => void;
}) {
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [editTitle, setEditTitle] = useState(task.title);
    const [editDescription, setEditDescription] = useState(task.description || '');

    // Sincronizar el estado interno con las props de la tarea si cambian externamente
    useEffect(() => {
        setEditTitle(task.title);
        setEditDescription(task.description || '');
    }, [task.title, task.description]);

    const handleEditTask = async () => {
        if (editTitle.trim() && task._id) {
            await onUpdate(task._id, editTitle, editDescription.trim() || undefined);
            setIsEditDialogOpen(false);
        }
    };

    const handleDeleteTask = async () => {
        if (task._id) {
            await onDelete(task._id);
            setIsDeleteDialogOpen(false);
        }
    };

    return (
        <Card className="bg-card shadow-sm border-2 border-primary/20 hover:border-primary transition-colors duration-200">
            <CardContent className="p-4 flex flex-col gap-2">
                <div className="flex justify-between items-start">
                    <div className="font-medium text-lg text-foreground">{task.title}</div>
                    <div className="flex space-x-1">

                        {/* Botón de Editar + Modal */}
                        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                            <DialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-primary" title="Editar tarea">
                                    <Pencil className="h-4 w-4" />
                                    <span className="sr-only">Editar tarea</span>
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                    <DialogTitle>Editar tarea</DialogTitle>
                                    <DialogDescription>
                                        Modifica el título o la descripción de la tarea.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                                        <Label htmlFor="edit-title" className="text-right">
                                            Título
                                        </Label>
                                        <Input
                                            id="edit-title"
                                            value={editTitle}
                                            onChange={(e) => setEditTitle(e.target.value)}
                                            className="col-span-3 "
                                            placeholder="Título de la tarea"
                                        />
                                    </div>
                                    <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                                        <Label htmlFor="edit-description" className="text-right">
                                            Descripción
                                        </Label>
                                        <Textarea
                                            id="edit-description"
                                            value={editDescription}
                                            onChange={(e) => setEditDescription(e.target.value)}
                                            className="col-span-3"
                                            placeholder="Descripción de la tarea (opcional)"
                                        />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button onClick={handleEditTask} disabled={!editTitle.trim()}>
                                        Guardar cambios
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>

                        {/* Botón de Eliminar + Modal */}
                        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                            <DialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" title="Eliminar tarea">
                                    <Trash2 className="h-4 w-4" />
                                    <span className="sr-only">Eliminar tarea</span>
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                    <DialogTitle className="text-lg">Confirmar eliminación</DialogTitle>
                                    <DialogDescription className="text-md">
                                        ¿Estás seguro de que quieres eliminar la tarea <strong>{task.title}</strong>? Esta acción no se puede deshacer.
                                    </DialogDescription>
                                </DialogHeader>
                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                                        Cancelar
                                    </Button>
                                    <Button variant="destructive" onClick={handleDeleteTask}>
                                        Eliminar
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>
                {task.description && (
                    <div className="text-sm text-muted-foreground">{task.description}</div>
                )}
            </CardContent>
        </Card>
    );
}