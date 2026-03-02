# Registro de Cambios

Todos los cambios notables de este proyecto se documentarán en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/),
y este proyecto sigue [Versionado Semántico](https://semver.org/lang/es/).

🇬🇧 **[Read in English](CHANGELOG.md)**

## [1.1.1] - 2026-03-02

### Corregido

- **Tamaño de Tokens entre Vistas**: Los tokens ahora escalan proporcionalmente al contenedor del canvas en lugar de usar un tamaño fijo de 96px, asegurando una apariencia consistente entre los modos Editor, Jugador y Pantalla Completa.
- **Desplazamiento en Posicionamiento de Tokens**: El offset al soltar tokens ahora se calcula dinámicamente, evitando que aparezcan desplazados arriba-izquierda en Jugador/Pantalla Completa vs. Editor.
- **Scroll en Modo Jugador**: Habilitado el desplazamiento en modo Jugador (sin pantalla completa) para poder ver el mapa cuando excede el tamaño de la ventana.
- **Overlay del Nombre de Escena**: Corregido el nombre de la escena apareciendo en medio de la pantalla en modo Jugador; ahora permanece anclado en la parte inferior de la ventana.

## [1.1.0] - 2026-03-02

### Añadido

- **Assets por Defecto**: Mapas y tokens de ejemplo cargados automáticamente en el primer arranque.
- **Seed Incremental**: Los nuevos assets añadidos al manifiesto se cargan en el siguiente arranque; los assets eliminados se recrean automáticamente.
- **Slider e Input de Tamaño de Cuadrícula**: Tamaño de cuadrícula ajustable por escena (24–128px) con slider y campo numérico editable.
- **Renombrar Escenas**: Renombrar escenas directamente desde la Línea de Tiempo con un icono de lápiz al pasar el ratón.
- **Eliminar Escenas**: Eliminar escenas desde la Línea de Tiempo con un icono de papelera al pasar el ratón.
- **Indicador de Versión**: Versión de la app mostrada en la esquina inferior derecha de la pantalla Home.

### Cambiado

- **Tokens Más Grandes**: Tamaño por defecto de tokens aumentado de 64px a 96px para mayor visibilidad.
- **Posicionamiento Porcentual**: Las posiciones de los tokens ahora se almacenan como porcentajes, garantizando consistencia entre los modos Editor, Jugador y Pantalla Completa.
- **Canvas con Aspecto Fijo**: El canvas ahora usa una proporción 16:9 para una colocación uniforme de tokens entre vistas.
- **Gestión de Z-index de Tokens**: Al hacer clic o arrastrar un token se trae al frente, facilitando la selección de tokens superpuestos.

### Corregido

- **Filtro Oscuro del Fondo**: Eliminados filtros de `opacity-60` y `blur` del mapa de fondo en el Editor.
- **Transparencia de Tokens**: Eliminado fondo negro forzado en tokens; los tokens PNG/WebP con transparencia ahora se muestran correctamente.
- **Nitidez de Tokens**: Cambiado el renderizado de tokens de `object-cover` a `object-contain` para evitar recortes.
- **Input de Teclado de Cuadrícula**: El campo numérico ya no salta al valor máximo mientras se escribe; el clamping solo se aplica al perder el foco.

## [1.0.0] - 2026-03-02

### Añadido

- **Gestión de Historias**: Crear, renombrar, eliminar, importar y exportar historias como ZIP (con los assets).
- **Editor de Escenas**: Canvas visual con drag-and-drop para mapas, tokens y audio.
- **Modo Jugador**: Modo presentación a pantalla completa con navegación entre escenas y audio ambiente.
- **Bóveda de Assets**: Subir y organizar mapas, tokens y pistas de audio.
- **Cuadrícula Configurable**: Overlay de cuadrícula con color y tamaño personalizable por escena.
- **Audio por Escena**: Asociar música ambiental a cada escena con reproducción en bucle.
- **Persistencia Local**: Todos los datos se guardan en IndexedDB mediante Dexie — sin servidor.
- **Importar / Exportar**: Compartir historias entre sesiones como archivos `.zip` con todos los recursos.
- **Efectos y Auras**: Animaciones inmersivas y feedback visual en tokens.
- **Modo Cinematográfico**: Ocultamiento automático de UI inactiva en el reproductor.
- **Carga Diferida (Lazy Load)**: Optimización de rendimiento y bundle diferiendo la bóveda.
- **Eliminación Rápida**: Los tokens pueden ser eliminados en tiempo real durante la partida.
- **Dados Integrados**: Panel flotante interactivo para realizar tiradas (d4 a d20).
- **Rastreador de Iniciativa**: Sistema integrado de seguimiento de turnos para combates.
