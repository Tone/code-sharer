import { atom } from 'recoil'

export const messageState = atom({
  key: 'message',
  default: ''
})
