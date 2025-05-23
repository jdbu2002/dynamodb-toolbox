import { z } from 'zod'

import type { ItemSchema } from '~/schema/index.js'
import type { OmitKeys } from '~/types/omitKeys.js'
import type { Overwrite } from '~/types/overwrite.js'

import type { SchemaZodFormatter } from './schema.js'
import { schemaZodFormatter } from './schema.js'
import type { ZodFormatterOptions } from './types.js'
import type { WithAttributeNameDecoding } from './utils.js'
import { withAttributeNameDecoding } from './utils.js'

export type ItemZodFormatter<
  SCHEMA extends ItemSchema,
  OPTIONS extends ZodFormatterOptions = {}
> = ItemSchema extends SCHEMA
  ? z.ZodTypeAny
  : WithAttributeNameDecoding<
      SCHEMA,
      OPTIONS,
      z.ZodObject<
        {
          [KEY in OPTIONS extends { format: false }
            ? keyof SCHEMA['attributes']
            : OmitKeys<SCHEMA['attributes'], { props: { hidden: true } }>]: SchemaZodFormatter<
            SCHEMA['attributes'][KEY],
            Overwrite<OPTIONS, { defined: false }>
          >
        },
        'strip'
      >
    >

export const itemZodFormatter = <
  SCHEMA extends ItemSchema,
  OPTIONS extends ZodFormatterOptions = {}
>(
  schema: SCHEMA,
  options: OPTIONS = {} as OPTIONS
): ItemZodFormatter<SCHEMA, OPTIONS> => {
  const { format = true } = options

  const displayedAttrEntries = format
    ? Object.entries(schema.attributes).filter(([, { props }]) => !props.hidden)
    : Object.entries(schema.attributes)

  return withAttributeNameDecoding(
    schema,
    options,
    z.object(
      Object.fromEntries(
        displayedAttrEntries.map(([attributeName, attribute]) => [
          attributeName,
          schemaZodFormatter(attribute, { ...options, defined: false })
        ])
      )
    )
  ) as ItemZodFormatter<SCHEMA, OPTIONS>
}
