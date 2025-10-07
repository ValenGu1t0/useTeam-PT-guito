
# Kanban Board – Prueba Técnica Full Stack - Privitera, Valentino

Proyecto Full Stack desarrollado con **Next.js + Tailwind + TypeScript** en el frontend,  
y **NestJS + MongoDB + Socket.IO** en el backend.

Incluye un flujo de automatización con **n8n**, que permite exportar las tareas (`backlog`) del tablero como un archivo CSV y enviarlo automáticamente por correo electrónico a una cuenta de email de preferencia.

---

## Tecnologías principales

### Frontend
- [Next.js](https://nextjs.org/)
- [TailwindCSS](https://tailwindcss.com/)
- [TypeScript](https://www.typescriptlang.org/)
- [Axios](https://axios-http.com/)
- [Socket.IO Client](https://socket.io/)
- [@tanstack/react-query](https://tanstack.com/query)
- [@hello-pangea/dnd](https://github.com/hello-pangea/dnd)
- [shadcn/ui](https://ui.shadcn.com/)

### Backend
- [NestJS](https://nestjs.com/)
- [Mongoose](https://mongoosejs.com/)
- [Socket.IO](https://socket.io/)
- [Axios](https://axios-http.com/)

### Automatización
- [n8n](https://n8n.io/) – Para automatizar la exportación y envío del backlog por correo electrónico.

---

## Requisitos previos

- Tener conexión a internet 
- Tener ganas de contratar a un crack
- Y buen sentido del humor

AHORA SI! Fuera de joda.. se deben tene instalados los siguientes programas en la máquina local:

- **Node.js v18 o superior**
- **npm** (se instala junto con Node)
- **MongoDB** instalado y CORRIENDO (Abrirlo antes de ejecutar nada) (por ejemplo en `mongodb://localhost:27017`)
- **n8n** instalado globalmente: `npm install -g n8n`

Cabe destacar que no es necesario importar datos: la base de datos kanban-board se genera automáticamente al crear columnas y tareas desde el frontend.

---

### Descargar el proyecto

Para traer este proyecto a tu máquina, tan solo ejecuta este comando en la terminal de tu escritorio, por ejemplo.

```
git clone https://github.com/ValenGu1t0/useTeam-PT-guito.git
cd useTeam-PT-guito
ls -> mostrará el contenido de carpetas y archivos del mismo
```

Ahora, deberás crear un `.env` en cada carpeta (`/frontend` y `/backend`), el contenido de cada uno esta especificado en el `.env.example` de este repositorio. Copia el contenido del archivo tanto en el frontend como en el backend y completa o complementa los valores necesarios.

En mi caso, al usar next.js y nest.js, mongo y n8n, el contenido es exactamemte este (te recomiendo copiar y pegar directamente).

- Backend (`/backend/.env`)

```
MONGODB_URI=mongodb://localhost:27017/kanban-board
PORT=3000
N8N_WEBHOOK_URL=http://localhost:5678/webhook/kanban-export
```

- Frontend (`/frontend/.env`)

```
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_WS_URL=http://localhost:3000
```

**Si usas otra variable de entorno distinta (por ejemplo REACT_APP_), reemplázala por NEXT_PUBLIC_ para exponerla correctamente en Next.js**. 

---

### Instalar dependencias

Ejecuta este comando dentro de cada carpeta (desde la terminal abierta en la raíz del proyecto):

```
cd backend
npm install

cd frontend
npm install
```

Cuando termine la instalación en cada carpeta, podremos comenzar a ejecutar todo. **RECOMIENDO fuertemente levantar el backend primero y luego el front**. Cada comando es para cada app correspondiente.

```
Para backend -> npm run start:dev
Para frontend -> npm run dev
```

Para verificar que salió todo bien, entrá desde el navegador a 

- http://localhost:3001 -> Verás el tablero KanBan

- http://localhost:3000 -> Verás un mensaje "Estamos funcionando!"

---

### Flujo de n8n (Exportar Backlog)

El proyecto incluye un flujo de automatización (`/n8n/workflow.json`) que:

- Recibe el trigger desde el backend al hacer click en el botón de la esquina superior derecha del frontend.
- Consulta las columnas y sus tareas en el backend y obtiene el JSON de estas.
- Convierte el JSON a CSV.
- Envía el CSV por correo electrónico usando SMTP hacia el correo que ingresemos desde el front.
- Notifica al backend si el envío fue exitoso o fallido, que a su vez notifica al front.


#### Configuración

Inicia n8n desde la terminal ejecutando `n8n`

Luego, abre el panel en el navegador (http://localhost:5678) y registrate o ingresa con tu cuenta si ya tenes una.

Importa el archivo `/n8n/workflow.json` que esta en la carpeta `/n8n` de este proyecto.

**IMPORTANTE** -> Tenes que configurar el nodo "**Envio del Backlog**" (Nodo con ICONO DE UN SOBRE DE EMAIL)

- Proveedor: Gmail (u otro)
- Usuario: tu correo electronico, será el que envíe el mail.
- Contraseña: tu contraseña de aplicación (no la personal)
- Guarda y activa el workflow.

**El destinatario se completa automáticamente desde el frontend, no hace falta modificarlo.**

Si hiciste todo correcto (y yo también explicando esto..) debería estar todo funcionando para que pruebes la aplicación. Crea algunas columnas, cambiales el nombre, asignales tareas, desplazalas entre columnas, organiza tu dia. 

Luego, cuando termines, si queres tener toda esta información en tu poder, tan solo exportala con el botón de arriba a la derecha, ingresa tu mail personal y listo, en unos segundo estará llegando el reporte en formato CSV.

Para mas información podes leer el `setup-instructions.md` de la carpeta `/n8n`.

---

### Notas finales

- Este proyecto está diseñado para correr en entorno local.

- Asegúrate de tener MongoDB activo antes de iniciar el backend. Corre primero el back y luego el front.

- Corre n8n y registrate antes de ejectuar el export de tus datos del KanBan.

- Las credenciales de correo deben configurarse por cada usuario.

- No compartas contraseñas reales en el repositorio ni variables de entorno.

---

Saludos y gracias por su tiempo!