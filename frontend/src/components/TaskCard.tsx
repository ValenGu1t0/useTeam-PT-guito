import { Task } from '../types';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";

export default function TaskCard({ task }: { task: Task }) {
    
    return (
        <Card className="bg-card shadow-sm border-2 border-primary/20 hover:border-primary transition-colors duration-200">
            <CardContent className="p-4 flex flex-col gap-2">
                <div className="flex justify-between items-start">
                <div className="font-medium text-lg text-foreground">{task.title}</div>
                <div className="flex space-x-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-primary">
                    <Pencil className="h-4 w-4" />
                    <span className="sr-only">Editar tarea</span>
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Eliminar tarea</span>
                    </Button>
                </div>
                </div>
                {task.description && (
                <div className="text-sm text-muted-foreground">{task.description}</div>
                )}
            </CardContent>
        </Card>
    );
}