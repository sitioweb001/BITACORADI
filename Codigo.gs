/**
 * BACKEND - Control de Becarios 2026
 * ------------------------------------------------------------
 * Este código va dentro de un Google Apps Script vinculado a tu
 * Google Sheet (Extensiones > Apps Script). Ver INSTRUCCIONES.md
 * para el paso a paso completo de configuración y publicación.
 * ------------------------------------------------------------
 */

const NOMBRE_HOJA_USUARIOS = "Usuarios";
const NOMBRE_HOJA_PERFILES = "Perfiles";
const NOMBRE_HOJA_BITACORA = "Bitacora";
const NUM_ACTIVIDADES = 5;

/* =================== ENRUTADOR =================== */

function doGet(e) {
  const accion = e.parameter.action;
  try {
    if (accion === "getUsuarios") return responder(obtenerUsuarios());
    if (accion === "getDatos") return responder(obtenerDatos(e.parameter.usuario));
    return responder({ error: "Acción GET no reconocida" });
  } catch (err) {
    return responder({ error: err.message });
  }
}

function doPost(e) {
  try {
    const cuerpo = JSON.parse(e.postData.contents);
    const accion = cuerpo.action;
    if (accion === "login") return responder(iniciarSesion(cuerpo.usuario, cuerpo.password));
    if (accion === "guardar") return responder(guardarDatos(cuerpo));
    return responder({ error: "Acción POST no reconocida" });
  } catch (err) {
    return responder({ error: err.message });
  }
}

function responder(objeto) {
  return ContentService
    .createTextOutput(JSON.stringify(objeto))
    .setMimeType(ContentService.MimeType.JSON);
}

/* =================== USUARIOS / LOGIN =================== */
// Hoja "Usuarios": columnas  Usuario | Password | NombreCompleto

function obtenerUsuarios() {
  const hoja = SpreadsheetApp.getActive().getSheetByName(NOMBRE_HOJA_USUARIOS);
  const filas = hoja.getDataRange().getValues();
  const usuarios = [];
  for (let i = 1; i < filas.length; i++) {
    if (!filas[i][0]) continue;
    usuarios.push({ usuario: String(filas[i][0]), nombreCompleto: String(filas[i][2] || "") });
  }
  return { usuarios };
}

function iniciarSesion(usuario, password) {
  const hoja = SpreadsheetApp.getActive().getSheetByName(NOMBRE_HOJA_USUARIOS);
  const filas = hoja.getDataRange().getValues();
  for (let i = 1; i < filas.length; i++) {
    if (String(filas[i][0]).trim() === String(usuario).trim()) {
      if (String(filas[i][1]) === String(password)) {
        return { success: true, nombreCompleto: String(filas[i][2] || usuario) };
      }
      return { success: false, mensaje: "Contraseña incorrecta." };
    }
  }
  return { success: false, mensaje: "El usuario no existe." };
}

/* =================== PERFILES =================== */
// Hoja "Perfiles": Usuario | NombreVoluntario | Telefono | Universidad | Regional | Carrera | Actualizado

function obtenerFilaPerfil(usuario) {
  const hoja = SpreadsheetApp.getActive().getSheetByName(NOMBRE_HOJA_PERFILES);
  const filas = hoja.getDataRange().getValues();
  for (let i = 1; i < filas.length; i++) {
    if (String(filas[i][0]).trim() === String(usuario).trim()) return i + 1; // fila real (1-indexado)
  }
  return null;
}

function guardarPerfil(usuario, perfil) {
  const hoja = SpreadsheetApp.getActive().getSheetByName(NOMBRE_HOJA_PERFILES);
  const filaExistente = obtenerFilaPerfil(usuario);
  const valores = [
    usuario,
    perfil.nombreVoluntario || "",
    perfil.telefono || "",
    perfil.universidad || "",
    perfil.regional || "",
    perfil.carrera || "",
    new Date()
  ];
  if (filaExistente) {
    hoja.getRange(filaExistente, 1, 1, valores.length).setValues([valores]);
  } else {
    hoja.appendRow(valores);
  }
}

/* =================== BITÁCORA (ACTIVIDADES) =================== */
// Hoja "Bitacora": Usuario | Fila | Fecha | Actividad | Actualizado

function guardarActividades(usuario, actividades) {
  const hoja = SpreadsheetApp.getActive().getSheetByName(NOMBRE_HOJA_BITACORA);
  const datos = hoja.getDataRange().getValues();

  // localizar filas existentes del usuario, indexadas por número de actividad (1..5)
  const mapaFilas = {};
  for (let i = 1; i < datos.length; i++) {
    if (String(datos[i][0]).trim() === String(usuario).trim()) {
      mapaFilas[Number(datos[i][1])] = i + 1;
    }
  }

  actividades.forEach(act => {
    const valores = [usuario, act.fila, act.fecha || "", act.actividad || "", new Date()];
    const filaReal = mapaFilas[act.fila];
    if (filaReal) {
      hoja.getRange(filaReal, 1, 1, valores.length).setValues([valores]);
    } else {
      hoja.appendRow(valores);
    }
  });
}

/* =================== LECTURA COMBINADA =================== */

function obtenerDatos(usuario) {
  if (!usuario) return { perfil: {}, actividades: [] };

  const hojaPerfiles = SpreadsheetApp.getActive().getSheetByName(NOMBRE_HOJA_PERFILES);
  const filasPerfil = hojaPerfiles.getDataRange().getValues();
  let perfil = {};
  for (let i = 1; i < filasPerfil.length; i++) {
    if (String(filasPerfil[i][0]).trim() === String(usuario).trim()) {
      perfil = {
        nombreVoluntario: filasPerfil[i][1],
        telefono: filasPerfil[i][2],
        universidad: filasPerfil[i][3],
        regional: filasPerfil[i][4],
        carrera: filasPerfil[i][5]
      };
      break;
    }
  }

  const hojaBitacora = SpreadsheetApp.getActive().getSheetByName(NOMBRE_HOJA_BITACORA);
  const filasBitacora = hojaBitacora.getDataRange().getValues();
  const actividades = new Array(NUM_ACTIVIDADES).fill(null).map((_, idx) => ({ fila: idx + 1, fecha: "", actividad: "" }));
  for (let i = 1; i < filasBitacora.length; i++) {
    if (String(filasBitacora[i][0]).trim() === String(usuario).trim()) {
      const numFila = Number(filasBitacora[i][1]);
      if (numFila >= 1 && numFila <= NUM_ACTIVIDADES) {
        actividades[numFila - 1] = {
          fila: numFila,
          fecha: formatearFecha(filasBitacora[i][2]),
          actividad: filasBitacora[i][3]
        };
      }
    }
  }

  return { perfil, actividades };
}

function formatearFecha(valor) {
  if (!valor) return "";
  if (Object.prototype.toString.call(valor) === "[object Date]") {
    return Utilities.formatDate(valor, Session.getScriptTimeZone(), "yyyy-MM-dd");
  }
  return String(valor);
}

/* =================== GUARDAR (perfil + actividades) =================== */

function guardarDatos(cuerpo) {
  const usuario = cuerpo.usuario;
  if (!usuario) return { success: false, mensaje: "Falta el usuario." };
  guardarPerfil(usuario, cuerpo.perfil || {});
  guardarActividades(usuario, cuerpo.actividades || []);
  return { success: true };
}
