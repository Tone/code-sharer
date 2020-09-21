export default abstract class Template {
  abstract init(dir: string): Promise<any>
}
