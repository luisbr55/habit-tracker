# Spec Funcional — Habit Tracker

## Problema
Llevar el registro de hábitos diarios a mano (papel, notas, memoria) hace que sea fácil
perder de vista si se está siendo consistente. La app resuelve esto dejando cargar
hábitos, marcarlos como completados día a día, y ver de un vistazo la racha actual y
qué tan constante se está siendo en la semana — sin fricción de cuentas ni login.

## Alcance

**Incluido en v1**
- Crear, editar y eliminar hábitos, cada uno con días de la semana específicos.
- Marcar/desmarcar un hábito como completado para el día de hoy.
- Ver racha actual por hábito.
- Ver métricas semanales: % de cumplimiento por hábito y % de cumplimiento general.
- Persistencia local (el usuario sigue viendo sus datos al recargar o cerrar el navegador).

**Fuera de alcance en v1**
- Login / multiusuario / sincronización entre dispositivos.
- Notificaciones o recordatorios.
- Editar el estado de días pasados (solo se marca "hoy"; ver nota en Edge cases).
- Modo oscuro.
- Exportar datos, compartir progreso, funciones sociales.
- Racha con margen/perdón (días libres) — la racha se rompe estrictamente si falta un
  día programado.

## Flujos

### 1. Alta de un hábito
1. Usuario toca "Agregar hábito".
2. Completa: nombre del hábito (texto libre) y días de la semana en que aplica
   (selección múltiple de L a D, mínimo 1 día).
3. Guarda. El hábito aparece inmediatamente en la lista de "Hoy" (si hoy es uno de sus
   días) y en la lista general de hábitos.

**Validaciones**
- Nombre no puede estar vacío.
- Debe seleccionar al menos un día de la semana.
- No se permiten dos hábitos con el mismo nombre exacto (evita duplicados accidentales).

### 2. Marcar hábito como completado (flujo principal / happy path)
1. Usuario entra a la pantalla principal ("Hoy").
2. Ve la lista de hábitos programados para hoy, cada uno con un checkbox circular.
3. Toca el checkbox → el hábito queda marcado como completado, el checkbox se rellena,
   la racha se actualiza al instante (+1) de forma optimista.
4. Puede destocar (desmarcar) si se equivocó → la racha se recalcula (-1) al instante.

**Edge cases**
- Si hoy no hay ningún hábito programado (ningún hábito tiene hoy como día activo):
  mostrar estado vacío: "No tenés hábitos programados para hoy."
- Si el usuario no tiene ningún hábito creado todavía: estado vacío inicial invitando a
  crear el primero.
- Un hábito creado hoy pero cuyo primer día programado es futuro (ej: creado un lunes
  pero solo aplica los viernes) no aparece en "Hoy" hasta que corresponda.

### 3. Ver racha actual
- Cada hábito muestra su racha actual (número de días consecutivos programados
  cumplidos, contando hacia atrás desde el día programado más reciente).
- Racha en 0 si el hábito nunca se completó o si se rompió (ver regla de cálculo en
  Technical Spec).
- Visualmente se distingue una racha activa (se cumplió el último día programado) de
  una racha rota/inactiva.

### 4. Ver métricas semanales
1. Usuario navega a la sección/tab "Semana" (o ve el resumen en la misma pantalla,
   según definición técnica de layout).
2. Ve, para la semana actual (lunes a domingo):
   - % de cumplimiento por hábito: días completados / días programados de ese hábito
     en la semana.
   - % de cumplimiento general: total de días completados / total de días programados
     entre todos los hábitos, en la semana.
3. Los porcentajes se recalculan en tiempo real a medida que se marcan hábitos.

**Edge cases**
- Hábito creado a mitad de semana: el % solo considera los días programados desde que
  el hábito existe, no la semana completa.
- Semana sin ningún día programado todavía transcurrido: mostrar "—" o "Sin datos
  todavía" en vez de 0% (para no desalentar innecesariamente).

### 5. Editar / eliminar hábito
- Editar: se puede cambiar nombre y días programados. Cambiar los días no borra el
  historial ya registrado, pero afecta el cálculo de racha/porcentaje hacia adelante.
- Eliminar: pide confirmación simple (no hay deshacer en v1). Al eliminar, desaparece de
  todas las vistas; su historial no se usa en ningún cálculo futuro.

## Notas de UX
- Mobile-first: la pantalla principal ("Hoy") es la que se usa a diario, tiene que ser
  usable con el pulgar, checkbox grande y tocable. Es el caso de uso principal, aunque
  se accede vía navegador (no es una app nativa/PWA en v1).
- Layout con ancho máximo: en desktop y tablet, el contenido se muestra centrado en una
  columna de ancho fijo (ancho de mobile), no se estira a todo el viewport. Esto
  mantiene una sola experiencia visual consistente sin tener que diseñar layouts
  distintos por breakpoint. Ver detalle de implementación en `technical-spec.md`.
- Sin login: todo vive en la base de datos sin distinción de usuario. Se puede mostrar
  un aviso discreto (una sola vez, dismisseable) explicando que esto es de uso
  personal.
- Estado vacío inicial (0 hábitos) debe invitar claramente a crear el primero, con copy
  cálido según el tono definido en el design system.
