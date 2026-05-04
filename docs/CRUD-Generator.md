# Generador de CRUD — Venta Simplyfy

Documentación completa de las funcionalidades implementadas: componentes de validación reutilizables y el generador automático de módulos CRUD por línea de comandos.

---

## Índice

1. [Componentes de Validación Reutilizables](#1-componentes-de-validación-reutilizables)
2. [Generador CLI de CRUD](#2-generador-cli-de-crud)
3. [Archivos que modifica el generador](#3-archivos-que-modifica-el-generador)
4. [Estructura de archivos generados](#4-estructura-de-archivos-generados)
5. [Tipos de campos disponibles](#5-tipos-de-campos-disponibles)
6. [Errores resueltos](#6-errores-resueltos)
7. [Flujo completo de uso](#7-flujo-completo-de-uso)

---

## 1. Componentes de Validación Reutilizables

Ubicación: `src/components/ui/`

Todos los componentes usan **React Hook Form `Controller`** internamente, lo que permite:
- Validación en tiempo real con Zod
- Ícono verde ✅ cuando el campo es válido y fue tocado
- Ícono rojo ❌ + mensaje de error cuando falla la validación
- Label en rojo cuando hay error

### ValidatedInput

**Archivo:** `src/components/ui/ValidatedInput.tsx`

Componente genérico para campos de texto, número y email.

```tsx
import { ValidatedInput } from '@/components/ui/ValidatedInput';

<ValidatedInput
  label="Nombre"
  name="name"
  control={form.control}
  placeholder="Ej: Juan Pérez"
  required={true}
/>

// Para campos numéricos:
<ValidatedInput
  label="Precio"
  name="price"
  control={form.control}
  type="number"
  step="1"
  required={true}
/>

// Para email:
<ValidatedInput
  label="Correo"
  name="email"
  control={form.control}
  type="email"
  required={true}
/>
```

**Props:**

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `label` | `string` | — | Etiqueta visible del campo |
| `name` | `Path<T>` | — | Nombre del campo en el schema |
| `control` | `Control<T>` | — | Control de React Hook Form |
| `placeholder` | `string` | — | Texto de ayuda |
| `type` | `string` | `'text'` | Tipo de input HTML |
| `step` | `string` | — | Incremento para type="number" |
| `required` | `boolean` | `false` | Muestra asterisco `*` |

---

### ValidatedSelect

**Archivo:** `src/components/ui/ValidatedSelect.tsx`

Selector con opciones predefinidas.

```tsx
import { ValidatedSelect } from '@/components/ui/ValidatedSelect';

<ValidatedSelect
  label="Categoría"
  name="category"
  control={form.control}
  required={true}
  placeholder="Selecciona una categoría"
  options={[
    { value: 'electronica', label: 'Electrónica' },
    { value: 'ropa', label: 'Ropa' },
    { value: 'hogar', label: 'Hogar' },
  ]}
/>
```

**Props:**

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `label` | `string` | — | Etiqueta visible |
| `name` | `Path<T>` | — | Nombre del campo |
| `control` | `Control<T>` | — | Control de React Hook Form |
| `required` | `boolean` | `false` | Muestra asterisco `*` |
| `placeholder` | `string` | — | Opción placeholder |
| `options` | `{ value: string; label: string }[]` | — | Lista de opciones |

---

### ValidatedTextarea

**Archivo:** `src/components/ui/ValidatedTextarea.tsx`

Área de texto para contenido largo.

```tsx
import { ValidatedTextarea } from '@/components/ui/ValidatedTextarea';

<ValidatedTextarea
  label="Descripción"
  name="description"
  control={form.control}
  placeholder="Describe el producto..."
  rows={4}
/>
```

**Props:**

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `label` | `string` | — | Etiqueta visible |
| `name` | `Path<T>` | — | Nombre del campo |
| `control` | `Control<T>` | — | Control de React Hook Form |
| `placeholder` | `string` | — | Texto de ayuda |
| `rows` | `number` | `3` | Altura del textarea |

---

### ValidatedCheckbox

**Archivo:** `src/components/ui/ValidatedCheckbox.tsx`

Checkbox para valores booleanos.

```tsx
import { ValidatedCheckbox } from '@/components/ui/ValidatedCheckbox';

<ValidatedCheckbox
  label="Activo"
  name="isActive"
  control={form.control}
/>
```

**Props:**

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `label` | `string` | — | Etiqueta visible |
| `name` | `Path<T>` | — | Nombre del campo |
| `control` | `Control<T>` | — | Control de React Hook Form |

---

### Uso completo con React Hook Form + Zod

```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  name: z.string().min(2, 'Mínimo 2 caracteres'),
  category: z.string().min(1, 'Selecciona una categoría'),
  price: z.number().min(0),
  isActive: z.boolean().default(true),
});

type FormData = z.infer<typeof schema>;

export function MyForm() {
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', category: '', price: 0, isActive: true },
    mode: 'onSubmit',
  });

  const onSubmit = (data: FormData) => {
    console.log(data);
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <ValidatedInput label="Nombre" name="name" control={form.control} required />
      <ValidatedSelect
        label="Categoría"
        name="category"
        control={form.control}
        options={[{ value: 'a', label: 'Opción A' }]}
      />
      <ValidatedInput label="Precio" name="price" control={form.control} type="number" />
      <ValidatedCheckbox label="Activo" name="isActive" control={form.control} />
      <button type="submit">Guardar</button>
    </form>
  );
}
```

---

## 2. Generador CLI de CRUD

**Comando:**
```bash
npm run generate:crud
```

**Script:** `scripts/generate-crud.js`

El generador es interactivo. Al ejecutarlo, hace las siguientes preguntas:

### Flujo de preguntas

```
🚀 Generador de CRUD para Venta Simplyfy

Nombre de la entidad (ej: Clientes, Proveedores): Proveedores
Título de la sección (ej: Listado de Proveedores): Listado de Proveedores

Define los campos (presiona Enter para terminar):

Nombre del campo en BD (ej: identity_card): nombre
Etiqueta visible (ej: Nombre del Proveedor) [Enter = Nombre]: Nombre del Proveedor

Tipos disponibles:
  1. string    - Texto simple
  2. number    - Número
  3. email     - Email
  4. boolean   - Checkbox (true/false)
  5. select    - Selector con opciones
  6. textarea  - Área de texto larga

Selecciona el tipo (1-6): 1
¿Es requerido? (s/n): s

✓ Campo "nombre" (Nombre del Proveedor) agregado

Nombre del campo en BD (ej: identity_card): [Enter para terminar]

📝 Generando archivos...

✅ Schema generado: src/validations/proveedores.schema.ts
✅ CRUD generado: src/pages/ProveedoresCRUD.tsx
✅ Ruta agregada a routes.ts
✅ Item agregado al MasterSidebar

✨ CRUD generado exitosamente!
```

### Diferencia entre nombre de campo y etiqueta visible

| | Campo en BD | Etiqueta visible |
|---|---|---|
| **Qué es** | Nombre técnico usado en código y BD | Lo que ve el usuario |
| **Ejemplo** | `identity_card` | `Cédula de Identidad` |
| **Usado en** | Schema Zod, tipo TypeScript, `data.identity_card` | Columna de tabla, label del form |

Si se presiona Enter en la etiqueta, se usa el nombre del campo como valor por defecto.

---

## 3. Archivos que modifica el generador

### `src/config/routes.ts`
Agrega la importación lazy del componente y una entrada en `routeConfig`:
```ts
const ProveedoresCRUD = React.lazy(() => import('@/pages/ProveedoresCRUD'));

// Entrada agregada en routeConfig:
{
  id: 'proveedores',
  path: '/proveedores',
  label: 'Listado de Proveedores',
  icon: Package,
  component: ProveedoresCRUD,
  showInSidebar: true,
}
```

### `src/components/Layout/MasterSidebar.tsx`
Agrega un item al array `defaultSidebarItems` (sidebar del escritorio):
```ts
{
  id: 'proveedores',
  label: 'Listado de Proveedores',
  icon: Package,
  href: '/proveedores',
}
```

> **Nota:** El generador NO modifica `NavigationConfigContext.tsx` (navegación mobile/bottom nav) para no saturar el footer móvil.

---

## 4. Estructura de archivos generados

Para una entidad `Proveedores`, el generador crea:

```
src/
├── validations/
│   └── proveedores.schema.ts       ← Schema de validación Zod
└── pages/
    └── ProveedoresCRUD.tsx         ← Página CRUD completa
```

### `proveedores.schema.ts` (ejemplo)
```ts
import { z } from 'zod';

export const proveedoresSchema = z.object({
  nombre: z
    .string()
    .min(2, 'nombre debe tener al menos 2 caracteres')
    .max(100, 'nombre no puede exceder 100 caracteres'),
  email: z
    .string()
    .email('Email inválido'),
});

export type proveedoresFormData = z.infer<typeof proveedoresSchema>;
```

### `ProveedoresCRUD.tsx` — Funcionalidades incluidas
- Tabla con datos mock (3 registros de ejemplo)
- **Crear** registro → modal con formulario validado
- **Editar** registro → modal con formulario prellenado
- **Eliminar** registro → diálogo de confirmación
- **Toast** de éxito en cada operación
- Card con contador total de registros
- Columnas con soporte responsive (`hideBelow: 'md'` desde la 3ra columna)

---

## 5. Tipos de campos disponibles

| Opción | Tipo | Componente generado | Validación Zod |
|--------|------|---------------------|----------------|
| `1` string | `string` | `ValidatedInput` | min 2, max 100 chars |
| `2` number | `number` | `ValidatedInput type="number"` | min 0 |
| `3` email | `string` | `ValidatedInput type="email"` | formato email |
| `4` boolean | `boolean` | `ValidatedCheckbox` | `z.boolean().default(true)` |
| `5` select | `string` | `ValidatedSelect` | min 1 char (requerido) |
| `6` textarea | `string` | `ValidatedTextarea` | min 10, max 500 chars |

---

## 6. Errores resueltos

### `ENOENT: no such file or directory, open 'schema.template'`
**Causa:** El IDE renombra automáticamente archivos `.template` a `.template.ts`.  
**Solución:** Los templates se embebieron directamente como strings en `generate-crud.js`, eliminando la dependencia de archivos externos.

### `ReferenceError: require is not defined in ES module scope`
**Causa:** El proyecto usa ES Modules (`"type": "module"` en `package.json`).  
**Solución:** Convertidos todos los `require()` a `import`, y añadidos `__filename`/`__dirname` como:
```js
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
```

### `TypeError: col.cell is not a function`
**Causa:** El `DataTable` espera `id` y `cell`, pero el template generaba `key` y `render`.  
**Solución:** Corregida la generación de columnas para usar `id` y `cell`.

### `TypeError: Cannot read properties of null (reading 'name')`
**Causa:** `handleEdit` usaba el estado `editingEntity` (aún `null`) en lugar del parámetro de la función.  
**Solución:** `editForm.reset()` ahora usa directamente el parámetro recibido en `handleEdit(entity)`.

### `Unexpected token, expected ";" — phone: number?`
**Causa:** La sintaxis TypeScript para campos opcionales es `campo?: tipo`, no `campo: tipo?`.  
**Solución:** Corregida la generación de tipos: `field.name?: field.type`.

### Item nuevo aparecía en el footer mobile
**Causa:** El generador agregaba items al `NavigationConfigContext` que alimenta el `MobileBottomNav`.  
**Solución:** Eliminada esa modificación del generador. Ahora solo modifica `MasterSidebar.tsx` y `routes.ts`.

---

## 7. Flujo completo de uso

```
1. Ejecutar:
   npm run generate:crud

2. Ingresar nombre de entidad:
   > Clientes

3. Ingresar título de sección:
   > Listado de Clientes

4. Agregar campos uno a uno:
   Nombre en BD:    nombre
   Etiqueta:        Nombre del Cliente
   Tipo:            1 (string)
   Requerido:       s

   Nombre en BD:    telefono
   Etiqueta:        Teléfono
   Tipo:            1 (string)
   Requerido:       n

   [Enter para terminar]

5. El generador crea automáticamente:
   ✅ src/validations/clientes.schema.ts
   ✅ src/pages/ClientesCRUD.tsx
   ✅ Ruta /clientes en routes.ts
   ✅ Item "Listado de Clientes" en MasterSidebar

6. Navegar a /clientes en la app — todo funciona de inmediato.
```

---

## Tecnologías utilizadas

| Tecnología | Versión | Uso |
|---|---|---|
| React Hook Form | ^7.x | Gestión de estado de formularios |
| Zod | ^3.x | Validación de schemas |
| @hookform/resolvers | ^3.x | Integración RHF + Zod |
| Lucide React | — | Íconos de validación (✅ ❌) |
| Tailwind CSS | ^3.x | Estilos de validación |
| Node.js (ESM) | ^18.x | Script generador |
