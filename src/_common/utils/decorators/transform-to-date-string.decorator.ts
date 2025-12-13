import { Transform } from 'class-transformer';

export function TransformToDateString() {
  return Transform(({ value, key, obj }) => {
    const originalValue = obj[key];
    if (originalValue instanceof Date) {
      return originalValue.toISOString();
    }
    return value;
  });
}
