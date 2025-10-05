
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

------------------------------------------------------------------------------------------------------------------

## Diseño NestJS + WebSocket

Acá me voy a encargar de:

- Módulo TasksModule → CRUD de tareas. 

- Módulo ColumnsModule → manejo de columnas.

- Gateway → canal WebSocket para sincronizar cambios entre clientes (cuando una tarea se crea, mueve o edita).

Creé e instalé los archivos iniciales con nest CLI. Luego, cree dentro de /src las subcarpetas:

- modules/ → cada módulo tendrá su controlador, servicio y módulo propio (task.module.ts, columns y boards).

- schemas/ → los modelos Mongoose (task.schema.ts, column.schema.ts, board.schema.ts).

- gateways/ → acá pondremos el WebSocket Gateway, donde manejarás los eventos en tiempo real.

------------------------------------------------------------------------------------------------------------------

## Schemas

Lo primero que realicé una vez arme la base del backend fue definir los schemas. 

- task.schema.ts:

Usamos @Schema() para generar el modelo automáticamente.
El decorador @Prop() define cada campo.
timestamps: true crea los campos createdAt y updatedAt automáticamente.


El ícono rojo (módulo) indica un archivo principal o decorador @Module, mientras que el amarillo (service) es un servicio (@Injectable), ambos distintos roles en Nest.

En app.module.ts, lo que agregamos al final en imports son módulos de la aplicación, no variables de entorno. Ahí registramos los módulos (como TaskModule) y la conexión con Mongo.

Resumen rápido de cada cosa:

Schema: define la estructura de los datos en MongoDB.

Service: contiene la lógica (consultas a la base, creación, etc.).

Controller: expone rutas HTTP (GET, POST, etc.).

Module: agrupa schema, service y controller en una sola unidad reutilizable.



npm run start:dev


Despues del commit tasks de backend, el CRUD funciona perfecto:

GET    http://localhost:3000/tasks
POST   http://localhost:3000/tasks
PUT    http://localhost:3000/tasks/:id
DELETE http://localhost:3000/tasks/:id


Configuramos el entorno NestJS

Instalaste dependencias, configuraste el backend y verificaste que compile correctamente.

Agregamos soporte para variables de entorno con @nestjs/config y .env.

Conectamos MongoDB con Mongoose

Definiste MONGODB_URI en tu .env y lo cargamos correctamente con ConfigModule.

Nest ahora se conecta a tu base de datos Mongo sin errores.

Módulo de Tasks

Ya existe un módulo TaskModule que expone endpoints REST (GET, POST, PUT, DELETE).

Lo verificaste con Postman:

✅ GET devuelve 200 (lectura exitosa).

⚠️ PUT devuelve 500 (posiblemente por validación o id inexistente, que revisaremos).

Esto confirma que el módulo y el controlador funcionan correctamente y la conexión a Mongo está activa.