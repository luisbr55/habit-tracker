# Design System

## Vibe
Minimalista y calmo. Mucho espacio en blanco, sobrio, sin ruido visual. La app debe
sentirse tranquila de usar todos los días — nada de gamificación agresiva ni colores
saturados. El foco visual está en el progreso, no en la decoración.

## Paleta de colores

**Light (default y único modo para v1)**

| Token       | Hex       | Uso                                  |
|-------------|-----------|---------------------------------------|
| background  | #FAFAF9   | Fondo general de la app                |
| surface     | #FFFFFF   | Cards, inputs, elementos elevados      |
| border      | #E7E5E4   | Bordes sutiles, separadores            |
| text        | #1C1917   | Texto principal                        |
| text-muted  | #78716C   | Texto secundario, labels, metadata     |
| primary     | #292524   | Acciones principales, botón primario   |
| accent      | #16A34A   | Hábito completado, racha activa        |
| warning     | #D97706   | Racha en riesgo (falta poco para hoy)  |
| destructive | #DC2626   | Eliminar hábito, racha rota            |

Nota: se define solo modo claro para v1. Dark mode queda fuera de alcance por ahora,
pero los tokens ya están nombrados para poder agregarlo después sin refactor.

## Tipografía
- Familia: system font stack (`-apple-system, "Segoe UI", Inter, sans-serif`) — no
  requiere carga de fuentes externas, mantiene todo liviano y nativo.
- Escala: 
  - `text-xs` 12px (metadata, días de la semana)
  - `text-sm` 14px (texto secundario)
  - `text-base` 16px (texto principal, nombres de hábitos)
  - `text-lg` 20px (números de racha, totales)
  - `text-xl` 28px (título de página)
- Pesos: 400 regular para texto de cuerpo, 600 semibold para números/énfasis, nunca bold 700 (mantiene la calma visual).

## Layout
- Ancho máximo de contenido: 448px (`max-w-md`), centrado en pantallas grandes. La app
  siempre se ve como una columna de ancho mobile, incluso en desktop/tablet — no hay
  layout "expandido" para pantallas grandes. Ver detalle en `technical-spec.md`.

## Espaciado y forma
- Escala de espaciado en base 4px: 4, 8, 12, 16, 24, 32, 48.
- Border radius: 12px en cards, 8px en botones/inputs, 999px (full) en checkboxes/pills de racha.
- Densidad: cómoda, no compacta — cada hábito necesita "aire" alrededor para que marcar
  como completado se sienta como una pausa, no una tarea más.

## Componentes

- **Botones primarios**: fondo `primary`, texto blanco, radius 8px, sin sombras duras.
  Estado pending con spinner sutil, success con check verde momentáneo.
- **Checkbox de hábito**: círculo grande (mínimo 32px, táctil), borde `border` en estado
  vacío, relleno `accent` con check al completar. Transición suave (150-200ms), sin
  confetti ni animaciones exageradas.
- **Cards de hábito**: fondo `surface`, borde `border` 1px, radius 12px, padding 16px.
- **Racha**: número grande junto a un ícono de llama o similar, en `text` normal (no
  colorido) salvo cuando la racha está activa hoy, ahí usa `accent`.
- **Barra de progreso semanal**: barra fina (6-8px), radius full, fondo `border`, relleno
  `accent`. Sin gradientes.

## Tono de voz (copy UI)
Directo y alentador sin ser efusivo. Ejemplos: "Hábito completado", "3 días seguidos",
"Sin racha activa" (nunca "¡Fallaste!" o similar en tono negativo). Los estados vacíos
invitan con calma: "Todavía no tenés hábitos. Agregá el primero."

## Referencias
No se pasaron referencias visuales concretas (Dribbble/Pinterest/apps). Esta dirección
se infirió del pedido "minimalista y calmo". Se puede refinar más adelante pasando
referencias puntuales.
