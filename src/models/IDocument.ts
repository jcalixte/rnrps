export default interface IDocument {
  _id: string
  _rev?: string
  _deleted?: boolean
  doctype: string
  [key: string]: any
}
