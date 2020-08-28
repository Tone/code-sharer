import { atom } from 'recoil'

export const messageState = atom({
  key: 'message',
  default: ''
})

export const modalState = atom<any>({
  key: 'modal',
  default: null
})
