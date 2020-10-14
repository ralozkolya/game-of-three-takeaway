export interface IMove {
  start: number;
  difference?: number;
  result: number;
}

export function getNextMove(start: number): IMove {
  const difference = start % 3 ? (1 === start % 3 ? -1 : 1) : 0;

  return {
    start: start,
    difference,
    result: (start + difference) / 3
  };
}
