# Reporte de Ventas (/sales) – Cálculo de KPIs y columnas

Este documento describe de forma precisa **de dónde sale cada número** del reporte de Ventas en el frontend (`src/pages/Sales.tsx`) y **qué campos** provienen del backend (`sistema_tpv/app/Http/Resources/InvoiceListResource.php`).

## 1) Fuente de datos (API)

### Endpoint
- El frontend consume:
  - `GET /invoices` (lista)
  - `GET /invoices/search?term=...&startDate=YYYY-MM-DD&endDate=YYYY-MM-DD&status=...&hasCashSession=...&createdBy=...`

Código:
- `venta-simplyfy/src/services/invoices.ts`
  - `fetchAllInvoices()`
  - `searchInvoices(params)`

### Campos relevantes devueltos por el backend
Backend:
- `sistema_tpv/app/Http/Resources/InvoiceListResource.php`

Campos usados por el reporte:
- `subTotal` ← `$this->sub_total`
- `transport` ← `$this->transport`
- `discount` ← `$this->discount`
- `invoiceTotal` ← `$this->invoiceTotal()`
- `totalCost` ← calculado como suma de (cantidad * purchase_price) por cada producto de la factura (solo si está cargada la relación `invoiceProducts`).
- `netProfit` ← `invoiceTotal - totalCost`
- `totalPaid` ← `$this->invoiceTotalPaid()` (suma de pagos)
- `due` ← `$this->totalDue()`
- `status` ← `(int) $this->status`
- `invoiceDate` ← `$this->invoice_date`
- `seller` ← `user` relacionado (id, name) si la relación `user` fue cargada.

**Nota**: El controlador `InvoiceController@index` hace `with('client', 'invoiceTax', 'invoiceProducts', 'invoicePayments.paymentMethod')`. Eso permite:
- calcular `totalCost`
- exponer métodos de pago

## 2) Columnas de la tabla (qué significan y de dónde salen)

En `src/pages/Sales.tsx`, por fila (factura) se normalizan así:

### Referencia
- **UI**: `reference`
- **Origen**: `inv.reference` (backend: `reference`).

### Fecha
- **UI**: `invoiceDate`/`date`
- **Origen**: `inv.invoiceDate` (backend: `invoiceDate`).

### Cliente
- **UI**: nombre del cliente
- **Origen**:
  - backend retorna `client` como string (`$this->client->name`)
  - el frontend lo lee como `inv.client` (string) o usa `inv.customerName`/`inv.customer` como fallback.

### Total parcial
- **UI**: `subTotal`
- **Origen** (orden de prioridad en frontend):
  - `inv.subTotal` (backend: `subTotal`)
  - `inv.subtotal` (legacy)
  - `inv.total` / `inv.netTotal` (fallbacks)

**Definición funcional**:
- Es el total de productos **antes** de impuestos/transporte y **antes** de descuento.

### Transporte
- **UI**: `transport`
- **Origen**:
  - backend expone `transport` (`$this->transport`)
  - frontend usa `inv.transportCost ?? inv.transport ?? 0`

**Importante**:
- Este campo **NO depende** de “delivery implementado” como módulo. Es simplemente un monto adicional que se guarda en la factura.
- En backend, cuando se crea una factura (`InvoiceController@store`), se guarda:
  - `transport` = `$request->transportCost`

O sea, “Transporte” es el **cargo** adicional (si el usuario lo ingresó) y puede representar delivery, envío, motorizado, etc., aunque no exista un módulo formal de delivery.

### Descuento
- **UI**: `discount`
- **Origen**: `inv.discount` (backend: `discount`).

### Total neto
- **UI**: `netTotal`
- **Origen principal**:
  - `inv.invoiceTotal` (backend: `invoiceTotal`, calculado por modelo)

En frontend, si no viene `invoiceTotal`, se calcula fallback:
- `netTotal = subTotal + transport - discount` (sin impuestos si no existe dato)

**Definición funcional**:
- Es el total final que “vale” la factura (productos + transporte + impuestos - descuentos - devoluciones).

Backend (modelo `Invoice::invoiceTotal()`):
- `invoiceTotal = sub_total + transport + taxAmount() - discount - costOfProductReturn`

### Costo (Bs)
- **UI**: `totalCost`
- **Origen**: `inv.totalCost` (backend lo calcula).

**Qué representa**:
- Es el costo interno (lo que costó comprar esa mercancía), no lo que se cobró.

Backend (resource):
- `totalCost = sum(invoiceProducts.quantity * invoiceProducts.purchase_price)`

### Ganancia (Bs)
- **UI**: `netProfit`
- **Origen**:
  - `inv.netProfit` (backend: `netProfit`)
  - fallback: `netTotal - totalCost`

**Qué representa**:
- Ganancia teórica de la factura: lo cobrado neto menos el costo de la mercancía.

### Estado
- **UI**: se muestra como “Pagado” o “Pendiente” con una píldora.
- **Origen**:
  - el frontend usa:
    - monto adeudado calculado `totalDue = netTotal - totalPaid`
    - si `totalDue <= 0` se fuerza visualmente a **Pagado**.
  - en caso contrario, usa `inv.status` mapeado.

## 3) KPIs (recuadros superiores) – cómo se calculan

Estos KPIs se calculan en `src/pages/Sales.tsx` dentro de un `useMemo()` llamado `summary`, usando **la lista ya filtrada** (`filteredInvoices`, que viene del backend según filtros).

### 3.1 Ingresos Totales (Ventas)
- **Fórmula (frontend)**:
  - `income = sum(invoiceTotal)`
- **Campos usados**:
  - `inv.invoiceTotal` (prioridad)
  - fallback: `inv.netTotal` / `inv.total` / `inv.subTotal`

Interpretación:
- Total facturado (venta bruta final) en el rango.

### 3.2 Créditos por Cobrar
- **Fórmula (frontend)**:
  - toma facturas consideradas “crédito” y suma el **adeudado**:
  - `creditDue = sum(max(0, netTotal - totalPaid))`

Cómo decide si es “crédito”:
- `isCreditInvoice(inv)` retorna true si:
  - `paymentMethod` o `paymentMethods` contiene “credito/crédito/fiao”, o
  - existe `dueDate`.

Campos usados:
- `inv.paymentMethod`, `inv.paymentMethods`, `inv.dueDate`
- `inv.totalPaid` (backend) y `inv.invoiceTotal`

### 3.3 Costo de Mercancía (Invertí)
- **Fórmula (frontend)**:
  - `cost = sum(totalCost)`
- **Campos usados**:
  - `inv.totalCost` (backend)

### 3.4 Ganancia Devengada
- **Fórmula (frontend)**:
  - `profit = sum(netProfit)`
- **Campos usados**:
  - `inv.netProfit` (backend)
  - fallback: `invoiceTotal - totalCost`

Interpretación:
- Ganancia teórica (no necesariamente cobrada) de todas las ventas.

### 3.5 Ganancia Cobrada
- **Fórmula (frontend)**:
  - por cada factura calcula qué parte está pagada:
  - `ratio = clamp(totalPaid / netTotal, 0..1)`
  - `profitCollected += netProfit * ratio`

Campos usados:
- `inv.totalPaid`, `inv.invoiceTotal`, `inv.totalCost`, `inv.netProfit`

Interpretación:
- Si una venta está pagada al 50%, se considera cobrada el 50% de su ganancia.

### 3.6 Ganancia Pendiente (Créditos)
- **Fórmula (frontend)**:
  - solo facturas “crédito”:
  - `profitPendingCredits += netProfit - (netProfit * ratio)`

Interpretación:
- Parte de la ganancia que todavía no se ha cobrado por ventas a crédito.

### 3.7 Dejé de ganar (Descuentos)
- **Fórmula (frontend)**:
  - `discount = sum(inv.discount)`

Interpretación:
- Total acumulado descontado en el rango.

## 4) Respuesta a tus preguntas clave

### “¿El reporte ya es dinámico?”
Sí.
- Las estadísticas y la tabla se calculan en el frontend **en base al arreglo de facturas** que viene de la API.
- Cambiar filtros (rango, estado, caja, vendedor, búsqueda) dispara `GET /invoices/search` con esos parámetros.

### “¿Transporte tiene que ver con delivery?”
- No necesariamente.
- Es un **monto** guardado en la factura (`invoices.transport`) que el usuario puede usar como “delivery/envío/motorizado”, aunque el sistema no tenga un módulo de delivery.

### “¿Total parcial vs Total neto?”
- **Total parcial** (`subTotal`): suma de productos antes de impuestos/transporte/descuento.
- **Total neto** (`invoiceTotal`): total final:
  - `subTotal + transport + impuesto - descuento - devoluciones`

### “¿Diferencia entre Total parcial y Costo?”
- **Total parcial**: precio de venta (antes de ajustes).
- **Costo** (`totalCost`): costo interno de la mercancía (lo que te costó comprarla).

En general:
- `Ganancia` ≈ `Total neto - Costo`

---

## 5) Notas y mejoras posibles

- El reporte usa heurística para detectar “crédito” (método de pago o dueDate). Si quieres, podemos normalizar esto desde backend (ej: `is_credit: true/false`).
- Si quieres que “Transporte” sea 100% “Delivery”, se puede renombrar en UI o derivar de un campo más específico.



Checklist (paso a paso) de lo que te falta probar después de Apertura / Cierre de caja
Te dejo una guía práctica para que valides que todo el flujo de caja y sus reportes están correctos (sin asumir cambios nuevos en backend).

1) Apertura de caja (inicio de turno)
A1. Abrir caja
Entra con un usuario cajero/vendedor.
Haz Apertura e ingresa montos (según tu modal: efectivo/total inicial/notas).
A2. Validar estado
Confirma que el sistema muestre caja abierta (UI: badge/estado o botón de “Cerrar caja” disponible).
A3. Validar persistencia
Recarga la página y confirma que la caja siga marcada como abierta.
2) Ventas durante la sesión (conciliación)
B1. Generar una venta de contado
Una venta pagada completa (ej: efectivo).
B2. Generar una venta mixta (si tu POS lo permite)
Ej: parte efectivo + parte transferencia.
B3. Generar una venta crédito
Que quede con totalPaid = 0 o un abono parcial.
B4. Validar reflejo en /sales
Filtra por el rango de hoy.
Revisa que:
Facturas “Crédito” muestren Pagado y Por cobrar debajo del estado (lo último que ajustamos).
KPI “Créditos por Cobrar” sea la suma de “Por cobrar”.
3) Cierre de caja (fin de turno)
C1. Abrir modal de cierre
Debe dejarte cerrar solo si hay caja abierta.
C2. Capturar totales declarados
Ingresa montos tal como lo pide el modal (total POS / efectivo / notas).
C3. Confirmar cierre
Al cerrar:
Caja debe quedar como cerrada
Ya no debería permitir registrar ventas si tu flujo lo restringe (depende de tu app; si no restringe, al menos debe quedar registrada la sesión cerrada).
4) Reporte de cierre (lo más importante a validar)
Aquí es donde normalmente quedan cosas pendientes por probar:

D1. Que el reporte muestre el usuario
Debe indicar claramente quién abrió/cerró.
D2. Que muestre la duración
Hora apertura, hora cierre, y duración total.
D3. Totales esperados vs declarados
Que exista comparación (si tu implementación lo trae):
Esperado (calculado por ventas)
Declarado (lo que ingresó el usuario)
Diferencia
D4. Conciliación por método
Validar que el reporte liste totales por método (efectivo, transferencia, punto, etc.) si está implementado.
D5. Moneda / tasa
Si manejas multi-moneda o conversión, valida:
tasa usada (BCV u otra)
totales consistentes
5) Pruebas “de error” (para detectar bugs ocultos)
E1. Intentar cerrar sin apertura
Debe bloquear o mostrar mensaje claro.
E2. Abrir caja dos veces
Debe impedir una segunda apertura si ya hay una activa.
E3. Cerrar caja con ventas cero
Debe permitir y el reporte debe cuadrar en cero (o con inicial si aplica).
Para afinarlo al 100% (pregunta rápida)
Para decirte exactamente qué te falta, necesito 2 datos:

1) ¿Dónde ves el reporte de cierre en tu UI? (ruta o pantalla: ejemplo /cash-close-report o desde un botón)
2) Tu cierre es:
Modo simple (total declarado y efectivo)
o Modo denominación (conteo por billetes/monedas)
Con eso te hago un checklist específico según tu flujo real y te digo qué pantallas exactas revisar.