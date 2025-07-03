import luaparse from 'luaparse'
import { isArray } from '.'

type ASTNode =
  | luaparse.TableConstructorExpression
  | luaparse.TableKey
  | luaparse.TableValue
  | luaparse.TableKeyString
  | luaparse.StringLiteral
  | luaparse.NumericLiteral
  | luaparse.BooleanLiteral
  | luaparse.NilLiteral
  | luaparse.Identifier
  | luaparse.AssignmentStatement
  | luaparse.Chunk
  | luaparse.Expression

const astToObject = (ast: ASTNode): any => {
  switch (ast.type) {
    case 'Chunk':
      return ast.body.reduce((acc: any, node: any) => {
        const obj = astToObject(node)
        return { ...acc, ...obj }
      }, {})
    case 'AssignmentStatement':
      return {
        [(ast.variables[0] as luaparse.Identifier).name]: astToObject(ast.init[0])
      }
    case 'TableConstructorExpression':
      let result: any = {}
      for (const field of ast.fields) {
        const key = 'key' in field ? astToObject(field.key) : undefined
        const value = astToObject(field.value)
        if (key !== undefined) {
          result[key] = value
        } else {
          if (!isArray(result)) {
            result = []
          }
          result.push(value)
        }
      }
      return result
    case 'TableKey':
      return {
        [astToObject(ast.key)]: astToObject(ast.value)
      }
    case 'TableValue':
      return astToObject(ast.value)
    case 'StringLiteral':
      let str = ast.raw
      str = str.replace(/"/g, '')
      str = str.replace(/\\n/g, '\n')
      str = str.replace(/\\t/g, '\t')
      str = str.replace(/\\r/g, '\r')
      return str
    case 'NumericLiteral':
      return Number(ast.raw)
    case 'BooleanLiteral':
      return Boolean(ast.raw)
    case 'NilLiteral':
      return null
    case 'Identifier':
      return ast.name
    default:
      return {}
  }
}

export const parseLua = (string: string) => {
  try {
    const ast = luaparse.parse(string)
    return astToObject(ast)
  } catch {
    return {}
  }
}
