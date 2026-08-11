# Portfolio Profesional en Angular

Aplicación web para crear y personalizar un portfolio profesional directamente desde el navegador. Incluye un editor de contenido, vista previa en tiempo real, almacenamiento local, diseño adaptable y exportación a PDF mediante la función de impresión del navegador.

![Angular](https://img.shields.io/badge/Angular-21-DD0031?style=for-the-badge&logo=angular&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![SCSS](https://img.shields.io/badge/SCSS-CSS3-CC6699?style=for-the-badge&logo=sass&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

## Descripción

Este proyecto permite construir un portfolio profesional sin necesidad de modificar el código cada vez que se actualiza la información. Los datos se introducen desde un formulario web y se reflejan inmediatamente en una vista previa diseñada para presentar el perfil de forma clara y moderna.

La información se guarda automáticamente en `localStorage`, por lo que permanece disponible en el mismo navegador después de cerrar o actualizar la página.

## Características

- Editor profesional desde el navegador.
- Vista previa en tiempo real.
- Datos personales y resumen profesional.
- Fotografía de perfil con validación de formato y tamaño.
- Experiencia laboral dinámica.
- Formación académica y certificaciones.
- Habilidades con nivel porcentual.
- Idiomas y nivel de competencia.
- Proyectos con tecnologías, demostración y repositorio.
- Enlaces a LinkedIn, GitHub y sitio web personal.
- Guardado automático en `localStorage`.
- Modo claro y modo oscuro.
- Diseño responsive para ordenador, tableta y móvil.
- Exportación a PDF mediante la impresión del navegador.
- Validación básica de los campos principales.
- Compatibilidad con Angular standalone.
- Estilos específicos para impresión en formato A4.

## Tecnologías utilizadas

- Angular
- TypeScript
- Angular Reactive Forms
- SCSS
- HTML5
- RxJS
- Local Storage API

## Vista general

La aplicación está dividida en dos áreas principales:

1. **Editor:** formulario desde el que se puede añadir, modificar o eliminar información.
2. **Vista previa:** representación visual del portfolio que se actualiza mientras se editan los datos.

> Puedes añadir capturas del proyecto en `public/screenshots` y mostrarlas en esta sección.

```md
![Vista previa del portfolio](public/screenshots/portfolio-preview.png)
```

## Requisitos previos

Antes de instalar el proyecto, comprueba que tienes disponibles Node.js, npm y Angular CLI.

```bash
node -v
npm -v
ng version
```

Si Angular CLI no está instalado:

```bash
npm install -g @angular/cli
```

## Instalación

Clona el repositorio:

```bash
git clone git@github.com:DaVinci25/portfolio-profesional-angular.git
```

Entra en la carpeta del proyecto:

```bash
cd portfolio-profesional-angular
```

Instala las dependencias:

```bash
npm install
```

## Servidor de desarrollo

Inicia el servidor local:

```bash
npm start
```

También puedes utilizar Angular CLI directamente:

```bash
ng serve
```

Abre la aplicación en:

```text
http://localhost:4200
```

### Ejecución en GitHub Codespaces

En Codespaces es recomendable exponer el servidor en todas las interfaces:

```bash
ng serve --host 0.0.0.0 --port 4200
```

Después, abre el puerto `4200` desde la pestaña **Ports**.

Si el proyecto utiliza una compilación estática con `http-server`:

```bash
npm run build
npm run preview
```

## Compilación para producción

Genera una compilación optimizada:

```bash
npm run build
```

Los archivos resultantes se crearán dentro de:

```text
dist/portfolio-profesional
```

Si la configuración genera una carpeta específica para el navegador, la aplicación estática estará en:

```text
dist/portfolio-profesional/browser
```

## Scripts disponibles

```bash
npm start
```

Inicia el servidor de desarrollo de Angular.

```bash
npm run build
```

Genera la compilación de producción.

```bash
npm run watch
```

Compila el proyecto en modo desarrollo y observa los cambios.

```bash
npm test
```

Ejecuta las pruebas configuradas en el proyecto.

```bash
npm run preview
```

Sirve la compilación estática desde el puerto `4200`, si el script está definido en `package.json`.

## Estructura principal

```text
portfolio-profesional-angular/
├── public/
├── src/
│   ├── app/
│   │   ├── app.html
│   │   ├── app.scss
│   │   ├── app.ts
│   │   ├── app.config.ts
│   │   └── app.routes.ts
│   ├── index.html
│   ├── main.ts
│   └── styles.scss
├── angular.json
├── package.json
├── package-lock.json
├── tsconfig.json
└── README.md
```

## Personalización

Los archivos principales del portfolio se encuentran en:

```text
src/app/app.ts
src/app/app.html
src/app/app.scss
src/styles.scss
```

- `app.ts` contiene la lógica del formulario, almacenamiento, fotografía y modo oscuro.
- `app.html` contiene el editor y la vista previa del portfolio.
- `app.scss` contiene el diseño del componente y los estilos de impresión.
- `styles.scss` contiene los estilos globales.

### Cambiar los colores

Las variables principales están al principio de `src/app/app.scss`:

```scss
:host {
  --accent: #5b5bd6;
  --accent-dark: #4141a5;
  --background: #eef1f7;
  --surface: #ffffff;
  --text: #182033;
}
```

Modificando estas variables puedes adaptar rápidamente la identidad visual.

## Persistencia de datos

Los datos se guardan en el navegador con `localStorage`. Esto implica que:

- No se necesita una base de datos.
- Los datos permanecen disponibles en el mismo navegador.
- La información no se sincroniza automáticamente entre dispositivos.
- Limpiar los datos del navegador puede eliminar el portfolio guardado.

Para una versión con usuarios y sincronización, se puede integrar una API y una base de datos.

## Exportación a PDF

1. Completa los campos del portfolio.
2. Pulsa **Descargar PDF** o **Imprimir**.
3. Selecciona **Guardar como PDF** en el diálogo del navegador.
4. Activa la impresión de gráficos de fondo para conservar todos los colores.
5. Utiliza tamaño de papel A4 y márgenes predeterminados o mínimos.

## Calidad y comprobaciones

Antes de crear un commit, es recomendable ejecutar:

```bash
npm run build
```

Después revisa los cambios:

```bash
git status
git diff
```

## Control de versiones

Ejemplo de flujo para guardar cambios:

```bash
git add .
git commit -m "feat: mejorar portfolio profesional"
git push
```

Se recomienda utilizar mensajes de commit descriptivos:

```text
feat: añadir una nueva funcionalidad
fix: corregir un error
style: modificar estilos visuales
refactor: reorganizar código sin cambiar su comportamiento
docs: actualizar la documentación
test: añadir o actualizar pruebas
chore: realizar tareas de mantenimiento
```

## Mejoras futuras

- Autenticación de usuarios.
- Persistencia en una base de datos.
- Sincronización entre dispositivos.
- Plantillas visuales intercambiables.
- Selector de tipografías y colores.
- Traducción a varios idiomas.
- Descarga directa a PDF.
- Importación de información desde LinkedIn.
- Panel para gestionar varias versiones del portfolio.
- Publicación automática en GitHub Pages o Azure Static Web Apps.
- Pruebas unitarias y pruebas end-to-end.
- Mejoras de accesibilidad y análisis Lighthouse.

## Despliegue

La aplicación puede desplegarse en servicios compatibles con sitios estáticos, por ejemplo:

- GitHub Pages
- Azure Static Web Apps
- Netlify
- Vercel
- Firebase Hosting

Antes de desplegar, genera la versión de producción:

```bash
npm run build
```

## Contribución

Las contribuciones son bienvenidas.

1. Crea un fork del repositorio.
2. Crea una rama para tu mejora:

```bash
git checkout -b feature/nueva-funcionalidad
```

3. Realiza los cambios y crea un commit:

```bash
git commit -m "feat: añadir nueva funcionalidad"
```

4. Sube la rama:

```bash
git push origin feature/nueva-funcionalidad
```

5. Abre un Pull Request.

## Autor

**Said El Morabiti Bakkali**

- GitHub: [@DaVinci25](https://github.com/DaVinci25)
- Proyecto: [portfolio-profesional-angular](https://github.com/DaVinci25/portfolio-profesional-angular)

## Licencia

Este proyecto puede distribuirse bajo la licencia MIT. Añade un archivo `LICENSE` en la raíz del repositorio si quieres publicar formalmente el proyecto con esta licencia.

---

Si este proyecto te resulta útil, puedes marcar el repositorio con una estrella en GitHub.
