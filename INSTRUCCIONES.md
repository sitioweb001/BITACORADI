# Control de Becarios 2026 — Guía de configuración

Esta app tiene 3 partes:

1. **`index.html`** — la aplicación que ven los becarios/técnicos (login + bitácora).
2. **`Codigo.gs`** — el backend que va dentro de Google Apps Script y lee/escribe en tu Google Sheet.
3. Las imágenes **`firmatecnico.png`** (o `.jpg`) y **`sello.png`** (o `.jpg`) que debes colocar en la misma carpeta que `index.html`.

No necesitas programar nada más: solo copiar y pegar.

---

## Paso 1 — Crear la hoja de Google Sheets

1. Ve a [sheets.google.com](https://sheets.google.com) y crea una hoja nueva. Llámala, por ejemplo, **"Control de Becarios 2026"**.
2. Crea **3 pestañas** (hojas) con estos nombres EXACTOS y estas columnas en la fila 1:

**Pestaña `Usuarios`**
| Usuario | Password | NombreCompleto |
|---|---|---|
| jperez | Abc123 | Juan Pérez |
| mgomez | Xyz789 | María Gómez |

> Aquí defines manualmente cada cuenta y su contraseña. Cada becario debe conocer solo su propia fila.

**Pestaña `Perfiles`** (déjala solo con encabezados, se llena sola)
| Usuario | NombreVoluntario | Telefono | Universidad | Regional | Carrera | Actualizado |
|---|---|---|---|---|---|---|

**Pestaña `Bitacora`** (déjala solo con encabezados, se llena sola)
| Usuario | Fila | Fecha | Actividad | Actualizado |
|---|---|---|---|---|

---

## Paso 2 — Publicar el backend (Apps Script)

1. En tu Google Sheet: menú **Extensiones → Apps Script**.
2. Borra el contenido de `Código.gs` que aparece por defecto y pega **todo** el contenido del archivo `Codigo.gs` que te entregué.
3. Guarda (ícono de disquete).
4. Haz clic en **Implementar → Nueva implementación**.
5. En "Selecciona el tipo", elige **Aplicación web**.
6. Configura:
   - **Ejecutar como:** Yo (tu cuenta)
   - **Quién tiene acceso:** Cualquier usuario
7. Haz clic en **Implementar**, autoriza los permisos que pida Google (es tu propio script, es seguro).
8. Copia la **URL de la aplicación web** que te da (termina en `/exec`).

> Cada vez que edites `Codigo.gs`, debes crear **Nueva implementación** de nuevo o usar "Administrar implementaciones → Editar → Nueva versión" para que los cambios se apliquen.

---

## Paso 3 — Conectar el HTML con tu backend

1. Abre `index.html` en un editor de texto.
2. Busca esta línea cerca del final del archivo:
   ```js
   const APPS_SCRIPT_URL = "PEGA_AQUI_TU_URL_DE_APPS_SCRIPT";
   ```
3. Reemplázala con la URL que copiaste en el paso anterior, por ejemplo:
   ```js
   const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycb.../exec";
   ```
4. Guarda el archivo.

---

## Paso 4 — Agregar las imágenes de firma y sello

Coloca en la **misma carpeta** donde está `index.html`:

- `firmatecnico.png` o `firmatecnico.jpg` → imagen del nombre y firma del técnico encargado.
- `sello.png` o `sello.jpg` → imagen del sello institucional.

La app las detecta automáticamente y las muestra en cada actividad de la bitácora. Si no las encuentra, cada usuario puede subir una imagen manualmente desde la pantalla (pero esa opción solo se guarda en su propio navegador, no se comparte con los demás — por eso lo ideal es colocar los archivos en la carpeta).

---

## Paso 5 — Publicar / compartir la app

Puedes usar cualquiera de estas opciones:

- **GitHub Pages**: sube `index.html` + las 2 imágenes a un repositorio y activa Pages.
- **Google Sites / Drive**: aloja el HTML en cualquier hosting estático (Netlify, Vercel, Firebase Hosting, etc.).
- **Uso local**: también puedes simplemente abrir `index.html` con doble clic desde la carpeta (funciona, pero cada usuario necesitaría la misma carpeta con las imágenes).

Recomendado: **Netlify Drop** (netlify.com/drop) — arrastras la carpeta con los 3 archivos y te da un link público en segundos, sin necesidad de cuenta.

---

## Cómo funciona una vez configurado

- **Login:** el usuario escribe su usuario y contraseña (definidos en la pestaña `Usuarios`). El backend valida y responde `success: true/false`, la contraseña nunca se expone en el navegador de otros usuarios (solo se compara del lado del servidor).
- **Bitácora:** cada usuario ve y edita sus propios datos: perfil (nombre, teléfono, universidad, regional, carrera) y hasta 5 actividades con fecha.
- **Guardar datos:** escribe/actualiza las pestañas `Perfiles` y `Bitacora` en tu Google Sheet, identificando cada registro por el nombre de usuario.
- **Al volver a entrar:** la app carga automáticamente lo último guardado para ese usuario.
- **Descargar PDF / Word / JSON:** generan el archivo directamente en el navegador con los datos actuales del formulario (no requieren el backend).

---

## Notas y sugerencias adicionales

- **Seguridad:** esta autenticación es simple (pensada para un equipo interno pequeño). Si necesitas algo más robusto (roles de administrador, recuperación de contraseña, bloqueo de intentos fallidos), se puede añadir sobre esta misma base.
- **Panel de administrador:** si quieres que un coordinador vea *todas* las bitácoras de *todos* los becarios en una sola pantalla (no solo la propia), puedo agregar una vista adicional para ese rol.
- **Validación de 5 actividades completas:** el formulario original menciona firma del "técnico a cargo" al completar las 5 actividades — puedo añadir un estado de "Completado" que se bloquee hasta llenar las 5 filas.
- **Historial de cambios:** actualmente "Guardar datos" sobreescribe el registro. Si prefieres conservar un historial de cada edición en vez de sobreescribir, se puede ajustar el `Codigo.gs` para que añada filas nuevas en lugar de actualizar.
- **Copia de las imágenes:** si cambias de técnico encargado o de sello, basta con reemplazar `firmatecnico.png`/`sello.png` en la carpeta; se actualiza para todos automáticamente.
