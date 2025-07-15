export const ALLOWED_PROPERTY_TYPES = [
    'All Types',
    'Condominiums',
    'House',
    'Multiplex',
  ] as const;
  
  export type PropertyType = (typeof ALLOWED_PROPERTY_TYPES)[number];
  