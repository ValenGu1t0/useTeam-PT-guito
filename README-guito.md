
### Documentasaoo


## Preparando el proyecto:

Bien, lo primero fork del rpeo y cloné en local:

git clone https://github.com/ValenGu1t0/useTeam-PT-guito.git

Luego, instalé frameworks y dependencias: 

- Backend:

nest new . 
npm install @nestjs/mongoose mongoose
npm install @nestjs/websockets @nestjs/platform-socket.io
npm install class-validator class-transformer

- Frontend:

npx create-next-app@latest .
npm install socket.io-client @dnd-kit/core


- N8N:

Solo cree los dos archivos


- Ademas, setie el .env de ejemplo
- Uso mongo compass (bdd:kanban-board), y realice la conexion en 27017

------------------------------------------------------------------------------------------------------------------

## Diseñando las entidades:

Estuve averiguando como funciona exactamente un tablero KANBAN y encontre que tiene 3 niveles de información:

- Board (tablero) → puede tener varias columnas.
- Column (columna) → agrupa tareas por estado (“To Do”, “In Progress”, “Done”).
- Task (tarea) → es el ítem principal editable y movible.

El tipado que se me ocurrió para esta coleccion sería:

// Task
{
  title: String,          // Título breve
  description: String,    // Detalle o notas
  assignedTo: String,     // Usuario (por ahora puede ser string plano)
  dueDate: Date,          // Fecha límite
  createdAt: Date,        // Auto-generado
  updatedAt: Date         // Auto-generado
}

// Column
{
  name: String,           // Ej: "To Do", "In Progress", "Done"
  tasks: [Task],          // Array de tareas
  order: Number           // Para mantener el orden visual
}

// Board
{
  name: String,
  columns: [Column],
  createdAt: Date
}

