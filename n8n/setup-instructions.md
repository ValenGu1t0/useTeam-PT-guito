
# Configuración del flujo N8N - Exportación de Backlog

Este flujo automatiza la exportación del backlog desde el backend (NestJS) y envía un correo con el archivo CSV adjunto.  
Luego notifica al frontend si la operación fue exitosa o si hubo un error.

---

## 🚀 Requisitos previos

- Node.js v18+
- NPM 
- N8N instalado globalmente:
- npm install -g n8n


### Pasos para ejecutar el flujo

- Instalar N8N:

`npm install n8n`

- Iniciar N8N:

`n8n`

N8N quedará corriendo en http://localhost:5678

### Importar el flujo

- Ir a Workflows → Import from file
- Seleccionar n8n/workflow.json (el que esta en esta carpeta)

### Configurar credenciales

- En el nodo Send Email (SMTP), configurar las credenciales del correo (ejemplo: Gmail, Outlook, etc.).

Asegurarse de usar una contraseña de aplicación (si no sabes como crear una, preguntale a la IA (estamos en 2025..))


### Activar el workflow

**Click en el botón Activate (esquina superior derecha).**

Esto cambiará el endpoint del webhook de
http://localhost:5678/webhook-test/export-backlog
a
http://localhost:5678/webhook/export-backlog.


### Ejecutar la prueba

Desde el frontend levantado, realizar el export ingresando el mail que queres que te llegue el backlog. La app te va a avisar que se realizó la petición y si ese dia no hay tormentas ni nada raro, en menos de un minuto debería realizarse todo, avisandote en el mismo front que ya se envió el reporte a tu casilla de email.


### Estructura de nodos

Webhook Trigger – Trigger Inicial - Recibe la petición desde NestJS.
HTTP Request (GET Data del Back) – Consulta las columnas del backend.
Conversión a CSV – Convierte los datos a CSV.
Send Email (SMTP) - Envío del Backlog – Envía el correo con el backlog adjunto. (ACÁ debes configurar tu email y contraseña de aplicación). 
IF Node – Verifica si el envío fue exitoso o falló. Esta diseñado para evaluar si la petición fue rejected o no
HTTP Request (Confirmación Mail) – Notifica al backend si el correo fue enviado.
HTTP Request (Email Error) – Notifica al backend si hubo error.


✅ Resultado esperado

Email recibido con archivo CSV adjunto.
Backend y frontend notificados del resultado.
Flujo finaliza sin errores.