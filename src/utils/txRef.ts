export function generateTxRef(prefix: string = "TX") {
  return `${prefix}-${Date.now()}`;
}
