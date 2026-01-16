import { TemplateData, URL_KEY } from '../types/Template'
import { validateQueriesAttribute } from './common'

export function validateTemplate(template: TemplateData): void {
  if (!template) {
    throw new Error('Template is missing')
  }

  if (template[URL_KEY]) {
    if (typeof template[URL_KEY] !== 'string') {
      throw new Error(`Template URL ('${URL_KEY}') must be provided as a string`)
    }

    try {
      new URL(template[URL_KEY])
    } catch (error) {
      throw new Error(`Template URL ('${URL_KEY}') is not a valid URL`)
    }
  }

  validateQueriesAttribute(template)
}
