# Rutinas por día
El recorrido utiliza las 54 rutinas transcritas de las capturas aportadas por el usuario: 10 niveles con 4, 4, 5, 5, 6, 6, 6, 6, 6 y 6 días.

Cada rutina contiene cinco bloques: largas, rápidas, rápidas, rápidas, largas. Los segundos y repeticiones están en routines.js. Las rápidas son 1 segundo de contracción y 1 segundo de relajación. No hay descansos adicionales entre bloques ni al final, por petición expresa del usuario. La última relajación de cada repetición sí está incluida. Las duraciones se calculan sumando fases, sin intentar igualar los totales mostrados en las capturas.

Dos sesiones completas del mismo día de rutina completan ese día. Una tercera sesión de Kegel es opcional. No sustituir Kegel por respiración/control. El siguiente día se habilita en la siguiente fecha local; la rutina de hoy permanece fijada para la tercera sesión. Repetir una rutina anterior no altera el cursor ni añade XP. Se mantienen el historial anterior y el registro de hábitos. La migración conserva el número de nivel y comienza su día 1; no inventa sesiones de estas nuevas rutinas.

Este calendario es una configuración solicitada por el usuario, no un protocolo clínico validado. Las fuentes enlazadas en Guía informan sobre la técnica y la necesidad de adaptar el esfuerzo y la relajación, sin avalar este calendario específico. Se conserva pausa/continuación, la posibilidad de repetir niveles anteriores y las indicaciones para detenerse si hay dolor o tensión.

Pruebas: routines.test.cjs verifica las 54 transcripciones y duraciones; timings.test.cjs recorre todas las sesiones con el temporizador real; practice.test.cjs comprueba la integración de sesiones, XP y avance; routine-progress.test.cjs verifica importación/exportación y la tercera sesión.
