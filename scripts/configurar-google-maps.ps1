## PROMPT: REFACTORIZACIÓN OFFLINE-FIRST (MODELO LIGERO Y PROFESIONAL)

**Rol:** Senior Systems Architect.
**Objetivo:** Refactorizar el módulo Offline-First para simplificar la arquitectura, eliminando el procesamiento local de video y delegando la creación de highlights a AWS MediaConvert.

---

## 1. AUDITORÍA DE DEPENDENCIAS (PASO OBLIGATORIO)
Antes de realizar cualquier cambio, analiza `package.json` y la carpeta `node_modules`. 
- **Regla:** Si una librería ya existe, **NO** intentes reinstalarla.
- **Acción:** Solo instala si falta alguna de las siguientes para el nuevo flujo:
  - `react-native-vision-camera` (Captura de video y escáner QR).
  - `react-native-sqlite-storage` (Persistencia de catálogo y logs).
  - `axios` (Subidas vía Presigned URLs).
  - `react-native-netinfo` (Gestión de estado de red).
- **Acción Crítica:** **ELIMINAR** cualquier rastro de `ffmpeg-kit-react-native` y cualquier SDK pesado de AWS (`@aws-sdk/*`) que no sea estrictamente necesario. Esto es para evitar conflictos de compilación en EAS/APK.

---

## 2. RE-ARQUITECTURA DEL FLUJO OFFLINE

### A. Gestión de Datos y Catálogo (SQLite)
- [ ] **Data Sync Manager:** Implementar servicio que sincronice el catálogo de equipos/jugadores en SQLite cuando hay conexión.
- [ ] **Selector Agnóstico:** Modificar selectores para que siempre consuman SQLite. La API solo sirve para actualizar el caché en background.
- [ ] **Juego de Emergencia:** Implementar `createOfflineGame()` que genere un `game_uuid` único y permita la selección de equipos del catálogo local.

### B. Protocolo de Captura y Vinculación
- [ ] **Master (Grabador):**
    - Captura video continuo en Full HD (almacenamiento local).
    - Genera QR de sesión (contiene `game_uuid`).
    - Al reconectar: `SyncManager` sube metadatos -> Obtiene `game_id` oficial de AWS -> Renombra carpeta local -> Sube video a S3 vía Presigned URL.
- [ ] **Scorer (Anotador):**
    - Escanea QR para heredar `game_uuid`.
    - Registra eventos con `timestamp` NTP exacto.
    - Al reconectar: Sincroniza eventos contra `game_uuid`.

### C. Handshake con AWS (Sustitución de Identidad)
- [ ] **Endpoint `POST /games/sync-create`:** La app envía metadata. El backend registra, activa MediaConvert, y devuelve el `game_id` real.
- [ ] **Procesamiento en Nube:** El backend dispara MediaConvert usando el video completo y el JSON de anotaciones `timestamped`.

---

## 3. REGLAS DE SEGURIDAD PARA EL CÓDIGO EXISTENTE
- **Flujo en Vivo:** El streaming RTMP (producción actual) es **INTOCABLE**. Se debe usar un *Strategy Pattern*: `if (online) { useLiveStreamingService() } else { useLocalCaptureService() }`.
- **Limpieza:** Eliminar cualquier lógica previa de edición de video (cortes/clips) local. El dispositivo es solo un motor de captura y registro.
- **Identidad:** Implementar la migración local: Renombrar carpeta `storage/videos/{game_uuid}` -> `storage/videos/{game_id}` tras recibir confirmación del servidor.

---

## 4. INSTRUCCIONES DE EJECUCIÓN
1. **Auditoría:** Reporta qué dependencias ya tienes y cuáles faltan (si es que faltan).
2. **Clean-up:** Elimina dependencias de FFmpeg y configura el `SyncManager`.
3. **Desarrollo:** Implementa `LocalCaptureService` y el flujo de `Presigned URLs` con `axios`.
4. **Validación:** Confirma que el flujo de streaming RTMP permanece sin cambios en el código.

**Comienza analizando el `package.json` actual.**
