import fs from 'fs'
import path from 'path'
import Conf from './Conf'

const schemaCache = {}

export default class SchemaValidator {
  static async filter (obj, schema) {
    const validator = await SchemaValidator.init(schema)
    return validator.validate(obj, validator.schema)
  }

  static init (schema) {
    return new Promise((resolve, reject) => {
      if (schemaCache[schema] === undefined) {
        const filepath = path.join(
          Conf.get('schemasFolder', '/'),
          schema + '.json'
        )
        if (!fs.existsSync(filepath)) {
          reject(`${filepath} does not exists.`)
          return
        }
        fs.readFile(filepath, (err, data) => {
          try {
            schemaCache[schema] = JSON.parse(data.toString())
          } catch {
            reject(`${filepath} is not a valid JSON.`)
          }
          resolve(new SchemaValidator(schemaCache[schema]))
        })
      } else {
        resolve(new SchemaValidator(schemaCache[schema]))
      }
    })
  }

  constructor (schema) {
    this.schema = schema
  }

  validateNumber (obj, schema, field = '') {
    if (typeof obj !== 'number')
      throw new Error(`${field.length ? field : 'Value'} must be a number.`)

    if (
      schema.multipleOf !== undefined &&
      Number.isInteger(obj / schema.multipleOf) === false
    )
      throw new Error(
        `${field.length ? field : 'Value'} must be a multiple of ${
          schema.multipleOf
        }.`
      )

    if (schema.minimum !== undefined && obj < schema.minimum)
      throw new Error(
        `${field.length ? field : 'Value'} must be greater than ${
          schema.minimum
        }.`
      )

    if (schema.maximum !== undefined && obj > schema.maximum)
      throw new Error(
        `${field.length ? field : 'Value'} must be lesser than ${
          schema.maximum
        }.`
      )

    if (schema.exclusiveMinimum !== undefined && obj <= schema.exclusiveMinimum)
      throw new Error(
        `${field.length ? field : 'Value'} must be strictly greater than ${
          schema.exclusiveMinimum
        }.`
      )

    if (schema.exclusiveMaximum !== undefined && obj >= schema.exclusiveMaximum)
      throw new Error(
        `${field.length ? field : 'Value'} must be strictly lesser than ${
          schema.exclusiveMaximum
        }.`
      )
  }

  validateEnum (obj, schema, field = '') {
    if (schema.enum === undefined) return

    for (let item of obj) {
      if (schema.enum.includes(item) === false) {
        throw new Error(
          `${field.length ? field : 'Value'}: ${JSON.stringify(
            item
          )} is not a valid value.`
        )
      }
    }
  }

  async validate (obj, schema, field = '') {
    if (schema === true) return obj
    if (schema === false)
      throw new Error(
        `${field.length ? field : 'Value'} is not an allowed field.`
      )

    if (schema?.$ref !== undefined) {
      return SchemaValidator.filter(obj, schema.$ref)
    }

    if (schema.default !== undefined && obj === undefined)
      obj = JSON.parse(JSON.stringify(schema.default))

    switch (schema.type) {
      case 'null':
        if (obj !== null)
          throw new Error(`${field.length ? field : 'Value'} must be null.`)
        break
      case 'boolean':
        if (typeof obj !== 'boolean')
          throw new Error(
            `${field.length ? field : 'Value'} must be a boolean.`
          )
        this.validateEnum([obj], schema, field)
        break
      case 'object':
        let ret = {}

        for (let key in schema.properties) {
          if (schema.properties[key].default !== undefined) {
            ret[key] = JSON.parse(
              JSON.stringify(schema.properties[key].default)
            )
          }
        }

        for (let key in obj) {
          try {
            ret[key] = this.validate(
              obj[key],
              schema.properties[key] ?? schema.additionalProperties ?? true,
              `${field}${field.length ? '.' : ''}${key}`
            )
          } catch (err) {
            if ((schema.required ?? []).includes(key)) {
              throw err
            }
          }
        }

        for (let key in schema.required ?? []) {
          if (ret[key] === undefined)
            throw new Error(
              `${field}${field.length ? '.' : ''}${key} is required.`
            )
        }

        if (
          schema.maxProperties !== undefined &&
          Object.keys(ret).length > schema.maxProperties
        )
          throw new Error(
            `${field.length ? field : 'Value'} must not be longer than ${
              schema.maxProperties
            } properties.`
          )

        if (
          schema.minProperties !== undefined &&
          Object.keys(ret).length < schema.minProperties
        )
          throw new Error(
            `${field.length ? field : 'Value'} must not be shorter than ${
              schema.minProperties
            } properties.`
          )

        return ret
      case 'array':
        let arr = []

        for (let idx = 0; idx < (obj ?? []).length; idx++) {
          const item = (obj ?? [])[idx]
          try {
            arr.push(
              this.validate(
                item,
                schema.items ?? true,
                `${field}${field.length ? '.' : ''}${idx}`
              )
            )
          } catch {}
        }

        if (schema.maxItems !== undefined && arr.length > schema.maxItems)
          throw new Error(
            `${field.length ? field : 'Value'} must not be longer than ${
              schema.maxItems
            } items.`
          )

        if (schema.minItems !== undefined && arr.length < schema.minItems)
          throw new Error(
            `${field.length ? field : 'Value'} must not be shorter than ${
              schema.minItems
            } items.`
          )

        if (
          schema.uniqueItems &&
          arr.length !==
            arr.filter((value, index, self) => self.indexOf(value) === index)
              .length
        )
          throw new Error(
            `${field.length ? field : 'Value'} must only contains unique items.`
          )

        this.validateEnum(arr, schema, field)

        return arr
      case 'number':
        this.validateNumber(obj, schema, field)
        this.validateEnum([obj], schema, field)
        break
      case 'string':
        if (typeof obj !== 'string')
          throw new Error(`${field.length ? field : 'Value'} must be a string.`)

        if (schema.minLength !== undefined && obj.length < schema.minLength)
          throw new Error(
            `${field.length ? field : 'Value'} must be longer than ${
              schema.minLength
            } character${schema.minLength > 1 ? 's' : ''}.`
          )

        if (schema.maxLength !== undefined && obj.length > schema.maxLength)
          throw new Error(
            `${field.length ? field : 'Value'} must be smaller than ${
              schema.maxLength
            } character${schema.maxLength > 1 ? 's' : ''}.`
          )

        if (
          schema.pattern !== undefined &&
          new RegExp(schema.pattern).test(obj) === false
        )
          throw new Error(
            `${field.length ? field : 'Value'} does not match required pattern.`
          )
        this.validateEnum([obj], schema, field)
        break
      case 'integer':
        this.validateNumber(obj, schema, field)
        if (Number.isInteger(obj) === false)
          throw new Error(
            `${field.length ? field : 'Value'} must be an integer.`
          )
        this.validateEnum([obj], schema, field)
        break
    }

    return obj
  }
}
