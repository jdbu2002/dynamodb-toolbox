import { Parser } from '~/schema/actions/parse/index.js'
import type {
  ExtensionParser,
  ExtensionParserOptions,
  SchemaUnextendedValue,
  SetSchema
} from '~/schema/index.js'

import { $ADD, $DELETE, isAddition, isDeletion } from '../../symbols/index.js'
import type { UpdateItemInputExtension } from '../../types.js'

export const parseSetExtension = (
  schema: SetSchema,
  input: unknown,
  { transform = true, valuePath }: ExtensionParserOptions = {}
): ReturnType<ExtensionParser<UpdateItemInputExtension>> => {
  if (isAddition(input) && input[$ADD] !== undefined) {
    return {
      isExtension: true,
      *extensionParser() {
        const parser = new Parser(schema).start(input[$ADD], {
          fill: false,
          transform,
          valuePath: [...(valuePath ?? []), '$ADD']
        })

        const parsedValue = { [$ADD]: parser.next().value }
        if (transform) {
          yield parsedValue
        } else {
          return parsedValue
        }

        const transformedValue = { [$ADD]: parser.next().value }
        return transformedValue
      }
    }
  }

  if (isDeletion(input) && input[$DELETE] !== undefined) {
    return {
      isExtension: true,
      *extensionParser() {
        const parser = new Parser(schema).start(input[$DELETE], {
          fill: false,
          transform,
          valuePath: [...(valuePath ?? []), '$DELETE']
        })

        const parsedValue = { [$DELETE]: parser.next().value }
        if (transform) {
          yield parsedValue
        } else {
          return parsedValue
        }

        const transformedValue = { [$DELETE]: parser.next().value }
        return transformedValue
      }
    }
  }

  return {
    isExtension: false,
    unextendedInput: input as SchemaUnextendedValue<UpdateItemInputExtension> | undefined
  }
}
