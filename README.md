# 🐛 Mata al Bicho — versión educativa

Juego web educativo para feria agropecuaria, pensado para tablet y teléfonos.

## Insectos del juego

### Plagas

- Mosca blanca
- Trips
- Arañuela roja
- Pulgón

### Beneficiosos

- Mariquita
- Abeja
- Escarabajo beneficioso
- Crisopa

> La categoría de un insecto puede depender de la especie y del cultivo. El juego usa estas categorías con finalidad educativa.

## Funciones

- Partidas de 30 segundos.
- Puntos y sistema de combo.
- Pestaña **Aprende** con información de cada insecto.
- Pestaña **Ranking**.
- Información educativa también al terminar la partida.
- Ranking local guardado en el navegador del dispositivo.
- Diseño táctil para tablet y celular.

Las fotografías de los insectos proceden de Wikimedia Commons y se guardan en
`assets/insects/`: Crisopa (“(MHNT) Chrysoperla carnea - dorsal view.jpg”),
Mosca blanca (“Silverleaf whitefly.jpg”), Trips (“Thrips tabaci.jpg”),
Arañuela roja (“Tetranychus urticae with silk threads.jpg”) y Pulgón
(“Galanthus nivalis mit Aphididae--20210301-RM-153708.jpg”), con licencias
CC BY-SA.

## Ejecutar

No requiere Node.js.

1. Extrae la carpeta.
2. Abre `index.html` con Chrome.
3. Escribe el nombre.
4. Pulsa **COMENZAR**.

También puedes usar VS Code + Live Server.

## Ranking

La versión actual guarda las puntuaciones en `localStorage`, por lo que el ranking es del navegador/dispositivo.

Para que todos los estudiantes vean un ranking común al escanear un QR desde diferentes teléfonos, la siguiente fase puede conectar el juego a **Firebase Firestore**.
