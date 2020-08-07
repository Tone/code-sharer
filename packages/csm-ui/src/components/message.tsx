import { useRecoilState } from 'recoil'
import { messageState } from './store'
import { useEffect } from 'react'

export default function Message() {
  const [message, setMessage] = useRecoilState(messageState)

  useEffect(() => {
    const timer = setTimeout(() => {
      setMessage('')
    }, 1500)
    return () => clearTimeout(timer)
  })

  return (
    <div className="fixed right-20 top-20">
      {message}
    </div>
  )
}
