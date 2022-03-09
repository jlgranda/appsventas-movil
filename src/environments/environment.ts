// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: true,
  //AMBIENTE jlgranda.
  api: "http://localhost:8080/appsventas-auth-0.0.1/",
  credential_app: "dXNyX2FwcGF0cGE6cHJ1ZWI0c19BVFBBXzIwMjA",
  auth:"api/auth/login",
  settings: {
    env: {
      name: "DEV",
    },
    app: {
      name: "FAZil",
      inactivity_time: 1800,
      files: {
          accept: ".p12"
      }
    },
    appInsights: {
      instrumentationKey: "<dev-guid-here>",
    },
    logging: {
      console: true,
      appInsights: false,
    },
    apiServer: "http://localhost:8080/appsventas-api",
    validationRegExp: {
      urlPattern: "^(?:http(s)?:\\/\\/)?[\\w.-]+(?:\\.[\\w\\.-]+)+[\\w\\-\\._~:/?#[\\]@!\\$&'\\(\\)\\*\\+,;=.]+$",
      tileURLPattern: "^(?:http(s)?:\\/\\/)?[\\w.-]+(?:\\.[\\w\\.-]+)+[\\w\\-\\._~:/?#[\\]%{}@!\\$&'\\(\\)\\*\\+,;=.]+$",
      urlInteroperabilidadPattern: "^((?:http(s)?:\\/)?[?\\/])+[\\w]+[\\w\\-\\._~:/?#[\\]{}@!\\$&'\\(\\)\\*\\+,;=.]+$",
      usernamePattern: "^[a-z0-9_-]s{8,15}$",
      emailPattern: "^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$",
      codigoPattern: "^[a-zA-Z0-9-_]{8,35}$",
      prefixPattern: "^[a-zA-Z0-9_]{2,7}$",
      siglasPattern: "^[a-zA-Z0-9-_]{2,16}$",
      cedulaPattern: "^[0-9]{10}$",
      safeTextPattern: "^[a-zA-Z0-9ÁÉÍÓÚÑáéíóúñ/\\[.?¿\\]/\\s/\\s,/\\s;/\\s:]{4,128}$",
      safeMultilineTextPattern: "^[a-zA-Z0-9ÁÉÍÓÚáéíóúñ/\\[/\\]/\\¿/\\?/\\s/\\-/\\_/./\\s/\\,/\\s;/\\s:]{4,512}$",
      aliasPattern: "^[a-zA-Z0-9ÁÉÍÓÚÑáéíóúñ/\\[.?¿\\]/\\s/\\s,/\\s;/\\s:]{2,128}$",
      fieldNamePattern: "^[a-zA-Z0-9/./_’'?]{2,57}$",
      textAreaPattern: "^[a-zA-Z0-9/./_’'?]{8,57}$",
      jsonPattern: "^(\\{[^{}]+\\})$",
      textPattern: "^[a-zA-Z0-9ÁÉÍÓÚÑáéíóúñ/\\[.?¿_/-/\\]/\\s/\\s,/\\s;/\\s:]{2,57}$",
      expressionStringPattern: "^((?!script)[/\\s/\\S])*$",
      filePathPattern: "^[a-zA-Z0-9ÁÉÍÓÚÑáéíóúñ/\\[./\\-_\\]]{7,128}$",
      sqlPattern: "^((?!CREATE|DROP|UPDATE|INSERT|ALTER|DELETE|ATTACH|DETACH|create|drop|update|insert|alter|delete|attach|detach)[/\\s/\\S])*$",
    },
    validationMsgs: {
      urlPattern: "URL inválido",
      tileURLPattern: "Indique un URL válido",
      usernamePattern: "",
      emailPattern: "Correo electrónico no es válido",
      codigoPattern: "Es requerido o no es válido. Use sólo letras y números, guión bajo y medio. Mínimo 8 y Máximo 35 caracteres.",
      prefixPattern: "No se permiten caracteres especiales. Use sólo letras y números y guión bajo. Mínimo 2 y Máximo 7 caracteres.",
      siglasPattern: "Es requerido o no es válido. Use sólo letras y números, guión bajo y medio. Mínimo 2 y Máximo 16 caracteres.",
      cedulaPattern: "Número de cédula no válido. Máximo 10 dígitos",
      safeTextPattern: "Es requerido o no es válido. No se permiten carácteres especiales. Mínimo 7 y Máximo 128 caracteres",
      safeMultilineTextPattern: "Es requerido o no es válido. No se permiten carácteres especiales. Mínimo 8 y Máximo 512 caracteres",
      aliasPattern: "Es requerido o no es válido. No se permiten carácteres especiales. Mínimo 2 y Máximo 128 caracteres",
      fieldNamePattern: "Es requerido o no es válido. No se permiten carácteres especiales. Mínimo 2 y Máximo 57 caracteres",
      jsonPattern: "Se espera un formato JSON",
      expressionStringPattern: "No es un texto de expressión válido",
      selectRequired: "Debe seleccionar un item de la lista desplegable",
      filePathPattern: "No es una ruta de archivo válida",
      textPattern: "Es requerido o no es válido. No se permiten carácteres especiales. Mínimo 2 y Máximo 128 caracteres",
      numberValid: "Es requerido o no es válido.",
      sqlPattern: "Se espera una consulta SQL de selección",
    },
  },
};
