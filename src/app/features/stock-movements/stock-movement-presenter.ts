import {
  StockMovementReference,
  StockMovementType,
} from './models/stock-movement.model';

export function stockMovementTypeLabel(type: StockMovementType): string {
  return type
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export function stockMovementTypeVariant(
  type: StockMovementType,
): 'neutral' | 'success' | 'warning' | 'danger' | 'info' {
  switch (type) {
    case 'receipt':
    case 'return-in':
      return 'success';
    case 'transfer-in':
    case 'transfer-out':
      return 'info';
    case 'adjustment-in':
    case 'adjustment-out':
    case 'stock-count':
      return 'warning';
    case 'sale':
    case 'return-out':
      return 'neutral';
    default:
      return 'neutral';
  }
}

export function quantityChangeLabel(quantityChange: number): string {
  if (quantityChange > 0) {
    return `+${quantityChange}`;
  }

  if (quantityChange < 0) {
    return `−${Math.abs(quantityChange)}`;
  }

  return '0';
}

export function safeReferencePath(
  reference: StockMovementReference | undefined,
): string | null {
  const path = reference?.referencePath;

  if (!path || !path.startsWith('/') || path.startsWith('//')) {
    return null;
  }

  return path;
}
