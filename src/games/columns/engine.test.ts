import { describe, expect, it } from 'vitest'
import { dropTile, emptyColumns, nextTile } from './engine'
describe('columns engine', () => { it('resolves chain merges only after landing', () => { const board=emptyColumns(); board[0]=[8,4,2]; const result=dropTile(board,0,2)!; expect(result.columns[0]).toEqual([16]); expect(result.combo).toBe(3) }); it('keeps early random pieces fair and small',()=>expect(nextTile(2,()=>.99)).toBe(2)) })
