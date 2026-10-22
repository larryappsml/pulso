# Pulso

App de hábitos de suelo pélvico y respiración. Diseño blanco y verde salvia, adaptado a móvil.

- Dos sesiones diarias de fuerza y respiración opcional, o un objetivo de tres sesiones.
- Círculo animado, temporizador, pausas, voz opcional y pausa automática al ocultar la app.
- Cuatro etapas con avance manual, rachas reales, calendario y exportación/importación.
- Historial local en el navegador, sin sincronización ni analítica.

## Publicación y privacidad

Repositorio público por petición del propietario. App publicada mediante GitHub Pages desde main, carpeta raíz, con HTTPS: https://larryappsml.github.io/pulso/

Sin autenticación. El historial se guarda únicamente en el navegador de cada visitante; no se sincroniza ni se publica en GitHub.

## Prueba local

Abrir index.html en un navegador moderno o servir esta carpeta con un servidor estático. En iPhone, abrir el enlace publicado en Safari → Compartir → Añadir a pantalla de inicio.

## Ejercicio

Rutinas orientativas, sin promesas médicas. Respirar normalmente durante las contracciones, relajar por completo, detenerse ante molestias. Referencias NHS enlazadas en la guía.

## Control de Ritmo y Puntos de Control

- Cronómetro de tiempo activo, botón de alerta y enfriamiento de 45 segundos con el mismo círculo de respiración. El cronómetro excluye enfriamientos; al terminar estos se reanuda manualmente. Pausa al ocultar la app.
- Cada pausa suma un intervalo. Completar abre una valoración de 1 a 10; guardar confirma la actividad. Salir sin guardar no concede XP.
- Kegel: 50 XP; respiración: 30 XP; control: 100 XP por sesión guardada. Nivel = floor(sqrt(XP / 100)) + 1. Rangos: inicial (1–4), intermedio (5–9), avanzado (10+).
- Cualquier combinación de dos actividades completa la racha diaria. Si ayer hubo al menos dos, todas las actividades de hoy obtienen ×1,2 XP (sin acumular). Ejemplo: Kegel + respiración = 80 XP; al día siguiente control = 120 XP.
- El historial anterior se migra sin duplicar sesiones y el formato de exportación incluye valoraciones, duración activa e intervalos. La intensidad de Kegel se mantiene independiente del nivel de progreso.
- Pruebas: `node tests/progress.test.cjs` valida fórmulas, rachas, migración, fechas y transiciones del cronómetro. Interfaz revisada en navegador: iniciar → alerta → valoración → guardar → historial.
