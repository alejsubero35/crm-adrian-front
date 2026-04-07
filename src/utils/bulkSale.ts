/**
 * =============================================================================
 * BULK SALE HELPERS - Venta a Granel
 * =============================================================================
 * 
 * Utilidades para manejar productos vendidos por peso (Kg/g) o volumen (L/ml).
 * 
 * FILOSOFÍA UX:
 * - El usuario NO debe pensar en decimales técnicos
 * - Puede ingresar "250 g", "0.5 Kg", "750 ml", "1.5 L"
 * - El sistema interpreta, convierte y redondea automáticamente
 * - Nunca mostrar errores técnicos, solo ajustes amigables
 * 
 * DECISIONES TÉCNICAS:
 * - Unidad base interna: Kg para peso, L para volumen
 * - Step fijo interno: 0.01 (no visible al usuario)
 * - Redondeo seguro para evitar errores de punto flotante
 */

// =============================================================================
// TIPOS
// =============================================================================

export type BulkUnitType = 'weight' | 'volume';
export type BaseUnit = 'kg' | 'l';
export type DisplayUnit = 'kg' | 'g' | 'l' | 'ml';

export interface ParsedQuantity {
  value: number;        // Valor numérico parseado
  unit: DisplayUnit;    // Unidad detectada
  baseValue: number;    // Valor convertido a unidad base (kg o l)
  isValid: boolean;     // Si el parsing fue exitoso
  original: string;     // Input original del usuario
}

export interface AdjustedQuantity {
  value: number;              // Valor final ajustado en unidad base
  wasAdjusted: boolean;       // Si hubo ajuste automático
  message: string | null;     // Mensaje amigable si hubo ajuste
  displayValue: string;       // Valor formateado para mostrar
}

// =============================================================================
// CONSTANTES
// =============================================================================

// Step interno fijo - NO visible al usuario
// Permite máxima flexibilidad (cualquier cantidad hasta 2 decimales)
export const INTERNAL_STEP = 0.01;

// Factor de conversión
const GRAMS_PER_KG = 1000;
const ML_PER_L = 1000;

// =============================================================================
// HELPERS DE CONVERSIÓN
// =============================================================================

/**
 * Convierte gramos a kilogramos
 * @example gramsToKg(250) => 0.25
 */
export function gramsToKg(grams: number): number {
  return safeRound(grams / GRAMS_PER_KG, 4);
}

/**
 * Convierte kilogramos a gramos
 * @example kgToGrams(0.25) => 250
 */
export function kgToGrams(kg: number): number {
  return safeRound(kg * GRAMS_PER_KG, 2);
}

/**
 * Convierte mililitros a litros
 * @example mlToLiters(750) => 0.75
 */
export function mlToLiters(ml: number): number {
  return safeRound(ml / ML_PER_L, 4);
}

/**
 * Convierte litros a mililitros
 * @example litersToMl(0.75) => 750
 */
export function litersToMl(liters: number): number {
  return safeRound(liters * ML_PER_L, 2);
}

/**
 * Convierte cualquier unidad a la unidad base (kg o l)
 */
export function toBaseUnit(value: number, fromUnit: DisplayUnit): number {
  switch (fromUnit) {
    case 'g':
      return gramsToKg(value);
    case 'ml':
      return mlToLiters(value);
    case 'kg':
    case 'l':
    default:
      return value;
  }
}

/**
 * Convierte desde unidad base a la unidad de display especificada
 */
export function fromBaseUnit(baseValue: number, toUnit: DisplayUnit): number {
  switch (toUnit) {
    case 'g':
      return kgToGrams(baseValue);
    case 'ml':
      return litersToMl(baseValue);
    case 'kg':
    case 'l':
    default:
      return baseValue;
  }
}

// =============================================================================
// REDONDEO SEGURO
// =============================================================================

/**
 * Redondeo seguro que evita errores de punto flotante
 * Usa el método de multiplicar, redondear y dividir
 * 
 * @param value - Valor a redondear
 * @param decimals - Número de decimales (default: 2)
 * @example safeRound(1.005, 2) => 1.01 (no 1.00 como haría Math.round)
 */
export function safeRound(value: number, decimals: number = 2): number {
  if (!Number.isFinite(value)) return 0;
  
  // Usamos Number.EPSILON para manejar errores de punto flotante
  const factor = Math.pow(10, decimals);
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

/**
 * Redondea al step más cercano
 * Útil cuando se necesita forzar múltiplos específicos
 * 
 * @param value - Valor a redondear
 * @param step - Paso/incremento base
 * @example roundToStep(0.23, 0.05) => 0.25
 */
export function roundToStep(value: number, step: number = INTERNAL_STEP): number {
  if (!Number.isFinite(value) || step <= 0) return 0;
  
  const rounded = Math.round(value / step) * step;
  // Determinar decimales del step para redondear correctamente
  const stepDecimals = (step.toString().split('.')[1] || '').length;
  return safeRound(rounded, Math.max(stepDecimals, 2));
}

/**
 * Clamp: limita un valor entre mínimo y máximo
 */
export function clamp(value: number, min: number, max: number = Infinity): number {
  return Math.max(min, Math.min(max, value));
}

// =============================================================================
// PARSING DE INPUT DEL USUARIO
// =============================================================================

/**
 * Parsea el input del usuario y detecta la unidad
 * Acepta formatos como: "250", "250g", "250 g", "0.5 kg", "1,5 Kg", etc.
 * 
 * FILOSOFÍA: Ser lo más permisivo posible con el input del usuario
 * 
 * @param input - String ingresado por el usuario
 * @param defaultUnit - Unidad base por defecto si no se detecta (kg o l)
 */
export function parseUserInput(
  input: string,
  defaultUnit: BaseUnit = 'kg'
): ParsedQuantity {
  const original = input;
  
  // Normalizar: trim, lowercase, reemplazar comas por puntos
  let normalized = input.trim().toLowerCase().replace(',', '.');
  
  // Resultado por defecto (inválido)
  const invalid: ParsedQuantity = {
    value: 0,
    unit: defaultUnit,
    baseValue: 0,
    isValid: false,
    original
  };
  
  if (!normalized) return invalid;
  
  // Detectar unidad al final del string
  let detectedUnit: DisplayUnit | null = null;
  
  // Patrones de unidades (orden importa: más específicos primero)
  const unitPatterns: Array<{ pattern: RegExp; unit: DisplayUnit }> = [
    { pattern: /\s*kg\s*$/i, unit: 'kg' },
    { pattern: /\s*kilogramos?\s*$/i, unit: 'kg' },
    { pattern: /\s*kilos?\s*$/i, unit: 'kg' },
    { pattern: /\s*g\s*$/i, unit: 'g' },
    { pattern: /\s*gramos?\s*$/i, unit: 'g' },
    { pattern: /\s*gr\s*$/i, unit: 'g' },
    { pattern: /\s*l\s*$/i, unit: 'l' },
    { pattern: /\s*litros?\s*$/i, unit: 'l' },
    { pattern: /\s*lt\s*$/i, unit: 'l' },
    { pattern: /\s*ml\s*$/i, unit: 'ml' },
    { pattern: /\s*mililitros?\s*$/i, unit: 'ml' },
  ];
  
  for (const { pattern, unit } of unitPatterns) {
    if (pattern.test(normalized)) {
      detectedUnit = unit;
      normalized = normalized.replace(pattern, '').trim();
      break;
    }
  }
  
  // Si no se detectó unidad, usar la unidad base por defecto
  const unit: DisplayUnit = detectedUnit || defaultUnit;
  
  // Parsear el número
  // Remover espacios internos que puedan quedar
  normalized = normalized.replace(/\s+/g, '');
  
  // Validar formato numérico (solo dígitos y un punto decimal)
  if (!/^\d*\.?\d+$/.test(normalized) && !/^\d+\.?\d*$/.test(normalized)) {
    return invalid;
  }
  
  const value = parseFloat(normalized);
  
  if (!Number.isFinite(value) || value < 0) {
    return invalid;
  }
  
  // Convertir a unidad base
  const baseValue = toBaseUnit(value, unit);
  
  return {
    value: safeRound(value, 4),
    unit,
    baseValue: safeRound(baseValue, 4),
    isValid: true,
    original
  };
}

// =============================================================================
// AJUSTE AUTOMÁTICO DE CANTIDAD
// =============================================================================

/**
 * Ajusta la cantidad según las restricciones del producto
 * - Aplica mínimo de venta
 * - Redondea de forma segura
 * - NO muestra errores técnicos, solo mensajes amigables
 * 
 * @param inputValue - Valor en unidad base (kg o l)
 * @param minQty - Cantidad mínima de venta en unidad base
 * @param baseUnit - Unidad base del producto
 * @param maxQty - Cantidad máxima (stock disponible)
 */
export function adjustQuantity(
  inputValue: number,
  minQty: number,
  baseUnit: BaseUnit,
  maxQty: number = Infinity
): AdjustedQuantity {
  // Redondear al step interno
  let adjusted = roundToStep(inputValue, INTERNAL_STEP);
  let wasAdjusted = false;
  let message: string | null = null;
  
  // Evitar valores negativos o cero
  if (adjusted <= 0) {
    adjusted = minQty;
    wasAdjusted = true;
    message = `Cantidad mínima: ${formatQuantity(minQty, baseUnit)}. Se ajustó automáticamente.`;
  }
  // Aplicar mínimo
  else if (adjusted < minQty) {
    adjusted = minQty;
    wasAdjusted = true;
    message = `Cantidad mínima: ${formatQuantity(minQty, baseUnit)}. Se ajustó automáticamente.`;
  }
  // Aplicar máximo (stock)
  else if (adjusted > maxQty && Number.isFinite(maxQty)) {
    adjusted = maxQty;
    wasAdjusted = true;
    message = `Stock disponible: ${formatQuantity(maxQty, baseUnit)}. Se ajustó automáticamente.`;
  }
  
  // Verificar que el ajuste sea diferente al input original
  if (!wasAdjusted && Math.abs(adjusted - inputValue) > 0.0001) {
    wasAdjusted = true;
  }
  
  return {
    value: safeRound(adjusted, 4),
    wasAdjusted,
    message,
    displayValue: formatQuantity(adjusted, baseUnit)
  };
}

// =============================================================================
// FORMATEO PARA DISPLAY
// =============================================================================

/**
 * Formatea una cantidad para mostrar al usuario
 * Automáticamente elige g/ml vs kg/l según el valor
 * 
 * @param value - Valor en unidad base (kg o l)
 * @param baseUnit - Unidad base del producto
 * @param forceUnit - Forzar una unidad específica de display
 */
export function formatQuantity(
  value: number,
  baseUnit: BaseUnit,
  forceUnit?: DisplayUnit
): string {
  if (!Number.isFinite(value)) return '0';
  
  const isWeight = baseUnit === 'kg';
  const smallUnit = isWeight ? 'g' : 'ml';
  const largeUnit = isWeight ? 'kg' : 'L';
  
  // Si se fuerza una unidad específica
  if (forceUnit) {
    const displayValue = fromBaseUnit(value, forceUnit);
    const suffix = forceUnit === 'kg' ? 'kg' : forceUnit === 'g' ? 'g' : forceUnit === 'l' ? 'L' : 'ml';
    return `${formatNumber(displayValue)} ${suffix}`;
  }
  
  // Lógica automática: usar unidad pequeña si < 1
  if (value < 1) {
    const smallValue = isWeight ? kgToGrams(value) : litersToMl(value);
    // Si el valor pequeño es un número "limpio", mostrarlo sin decimales
    if (Number.isInteger(smallValue) || Math.abs(smallValue - Math.round(smallValue)) < 0.01) {
      return `${Math.round(smallValue)} ${smallUnit}`;
    }
    return `${formatNumber(smallValue)} ${smallUnit}`;
  }
  
  // Valor >= 1: usar kg o L
  return `${formatNumber(value)} ${largeUnit}`;
}

/**
 * Formatea un número para display
 * Elimina ceros innecesarios al final
 */
function formatNumber(value: number): string {
  const rounded = safeRound(value, 2);
  // Si es entero, mostrarlo sin decimales
  if (Number.isInteger(rounded)) {
    return rounded.toString();
  }
  // Si tiene un decimal, mostrarlo con 1 decimal
  const str = rounded.toFixed(2);
  // Eliminar ceros finales innecesarios
  return str.replace(/\.?0+$/, '');
}

/**
 * Obtiene la etiqueta de precio según la unidad base
 * @example getPriceLabel('kg') => '/Kg'
 */
export function getPriceLabel(baseUnit: BaseUnit): string {
  return baseUnit === 'kg' ? '/Kg' : '/L';
}

/**
 * Obtiene ejemplos de cantidades para mostrar al usuario
 * según el tipo de unidad
 */
export function getQuantityExamples(baseUnit: BaseUnit): string[] {
  if (baseUnit === 'kg') {
    return ['100 g', '250 g', '0.5 Kg', '1 Kg', '1.5 Kg'];
  }
  return ['100 ml', '250 ml', '0.5 L', '1 L', '1.5 L'];
}

/**
 * Obtiene chips rápidos para selección de cantidades
 * Retorna valores en unidad base
 */
export function getQuickChips(baseUnit: BaseUnit): number[] {
  // Valores comunes para selección rápida (en unidad base)
  if (baseUnit === 'kg') {
    // 100g a 2kg en pasos prácticos
    return [0.1, 0.25, 0.5, 0.75, 1, 1.5, 2];
  }
  // Para volumen
  return [0.1, 0.25, 0.5, 0.75, 1, 1.5, 2];
}

// =============================================================================
// VALIDACIONES
// =============================================================================

/**
 * Verifica si un valor es válido para venta
 * NO retorna mensajes de error técnicos
 */
export function isValidBulkQuantity(
  value: number,
  minQty: number = 0.01,
  maxQty: number = Infinity
): boolean {
  if (!Number.isFinite(value)) return false;
  if (value <= 0) return false;
  if (value < minQty) return false;
  if (value > maxQty) return false;
  return true;
}

/**
 * Obtiene el mensaje de ayuda para la cantidad mínima
 * Siempre en lenguaje amigable
 */
export function getMinQtyHelpText(minQty: number, baseUnit: BaseUnit): string {
  return `Es la menor cantidad que puedes vender. Ej: ${formatQuantity(minQty, baseUnit)}`;
}
