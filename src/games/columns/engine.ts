export type Columns = number[][]
export const COLUMN_COUNT = 5, COLUMN_HEIGHT = 8
export const emptyColumns = (): Columns => Array.from({ length: COLUMN_COUNT }, () => [])
export interface DropResult { columns: Columns; gained: number; combo: number }
type Cell = [number, number]
function valueAt(columns: Columns, column: number, row: number) { return columns[column]?.[row] ?? 0 }
function component(columns: Columns, start: Cell, seen: Set<string>): Cell[] {
  const value=valueAt(columns,...start); if(!value)return[]; const found:Cell[]=[],queue=[start]
  while(queue.length){const cell=queue.pop()!,key=`${cell[0]}:${cell[1]}`;if(seen.has(key)||valueAt(columns,...cell)!==value)continue;seen.add(key);found.push(cell);([[cell[0]-1,cell[1]],[cell[0]+1,cell[1]],[cell[0],cell[1]-1],[cell[0],cell[1]+1]] as Cell[]).forEach(next=>queue.push(next))} return found
}
function resolve(columns: Columns): {columns:Columns;gained:number;combo:number}{let next=columns.map(stack=>[...stack]),gained=0,combo=0
  while(true){const seen=new Set<string>();let group:Cell[]=[];for(let col=0;col<COLUMN_COUNT&&!group.length;col++)for(let row=0;row<next[col].length&&!group.length;row++){const found=component(next,[col,row],seen);if(found.length>=2)group=found}if(!group.length)break
    const value=valueAt(next,...group[0]),target=group.reduce((best,cell)=>cell[1]<best[1]?cell:best,group[0]);const removed=new Set(group.map(([c,r])=>`${c}:${r}`));next=next.map((stack,col)=>stack.filter((_,row)=>!removed.has(`${col}:${row}`)));const targetColumn=target[0];next[targetColumn].push(value*2**(group.length-1));gained+=value*2**(group.length-1);combo++
  }return{columns:next,gained,combo}}
export function dropTile(columns: Columns, column: number, value: number): DropResult | null {
  if (column < 0 || column >= COLUMN_COUNT || columns[column].length >= COLUMN_HEIGHT) return null
  const next = columns.map(stack => [...stack]); const stack = next[column]; stack.push(value)
  return resolve(next)
}
export function nextTile(maximum: number, random = Math.random): number {
  const ceiling = Math.max(2, Math.min(64, maximum / 8 || 2)); const options = [2, 2, 2, 4, 4, 8].filter(value => value <= ceiling)
  return options[Math.floor(random() * options.length)]
}
export const columnsFull = (columns: Columns) => columns.every(stack => stack.length >= COLUMN_HEIGHT)
export const largestTile = (columns: Columns) => Math.max(0, ...columns.flat())
export function removeTop(columns:Columns,column:number):Columns|null{if(!columns[column]?.length)return null;const next=columns.map(stack=>[...stack]);next[column].pop();return next}
export function swapTops(columns:Columns,first:number,second:number):Columns|null{if(first===second||!columns[first]?.length||!columns[second]?.length)return null;const next=columns.map(stack=>[...stack]),a=next[first].pop()!,b=next[second].pop()!;next[first].push(b);next[second].push(a);return resolve(next).columns}
