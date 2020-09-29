import path from 'path'

export const currentExecDir = process.env.PROJECT ?? process.cwd()

export const project = path.basename(currentExecDir)
