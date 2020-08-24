import { useRecoilState } from 'recoil'
import { modalState } from './store'

function Modal() {
  const [modalChildren, setModalChildren] = useRecoilState(modalState)

  return (
    <div className={`fixed inset-0 z-10 ${modalChildren !== null ? 'block' : 'hidden'} flex justify-center `} >
      <div className="inset-0 z-20  bg-black bg-opacity-25 absolute" onClick={() => setModalChildren(null)} />
      <div className="bg-white p-6 mt-24 absolute z-20" >
        {modalChildren}
      </div>
    </div>
  )
}

export default Modal
