import { useRecoilState } from 'recoil'
import { messageState } from './store'
import { useEffect } from 'react'

export default function Message() {
  const [message, setMessage] = useRecoilState(messageState)

  useEffect(() => {
    const timer = setTimeout(() => {
      setMessage('')
    }, 3000)
    return () => clearTimeout(timer)
  })

  return (
    <div className={`fixed right-20 top-20 z-40 bg-red-600 bg-opacity-50 p-6 ${message === '' ? 'hidden' : ''}`}>
      {message}
    </div>
  )
}
