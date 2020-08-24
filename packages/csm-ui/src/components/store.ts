import { atom } from 'recoil'
import { ReactElement } from 'react'


export const messageState = atom({
  key: 'message',
  default: ''
})

export const modalState = atom<ReactElement>({
  key: 'modal',
  default: null
})
