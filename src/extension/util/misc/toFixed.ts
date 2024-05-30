export const toFixed = (number: number | string, fractionDigits: number) =>
  parseFloat(Number(number).toFixed(fractionDigits));