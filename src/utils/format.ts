/**
 * Converts a number to its ordinal form (1st, 2nd, 3rd, etc.)
 */
export function toOrdinal(num: number): string {
  if (isNaN(num)) return String(num);
  
  const j = num % 10;
  const k = num % 100;
  
  if (j === 1 && k !== 11) {
    return num + 'st';
  }
  if (j === 2 && k !== 12) {
    return num + 'nd';
  }
  if (j === 3 && k !== 13) {
    return num + 'rd';
  }
  return num + 'th';
}
