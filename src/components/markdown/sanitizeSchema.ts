import { defaultSchema } from 'rehype-sanitize';
import type { Options } from 'rehype-sanitize';

export const customSanitizeSchema: Options = {
  ...defaultSchema,
  clobberPrefix: '',
  tagNames: [
    ...(defaultSchema.tagNames || []),
    'kbd',
    'details',
    'summary',
    'input',
    'div',
    'span',
  ],
  attributes: {
    ...defaultSchema.attributes,
    input: ['type', 'checked', 'disabled', 'className', 'name', 'value', 'id'],
    div: ['className', 'dataComponent', 'dataTab', 'id'],
    span: ['className', 'id'],
    code: ['className'],
    pre: ['className'],
    details: ['open', 'className'],
    summary: ['className'],
    th: ['align', 'className', 'colSpan', 'rowSpan'],
    td: ['align', 'className', 'colSpan', 'rowSpan'],
    a: ['href', 'title', 'target', 'rel', 'className', 'download'],
  },
  protocols: {
    ...defaultSchema.protocols,
    href: ['http', 'https', 'mailto', 'tel'],
  },
};
