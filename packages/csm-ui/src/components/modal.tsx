import { useRecoilState } from 'recoil'
import { modalState } from './store'
import { X } from 'react-feather'

function Modal() {
  const [modalChildren, setModalChildren] = useRecoilState(modalState)

  return (
    <div className={`fixed inset-0 z-10 ${modalChildren !== null ? 'block' : 'hidden'} flex justify-center `} >
      <div className="inset-0 z-20  bg-black bg-opacity-25 absolute" onClick={() => setModalChildren(null)} />
      <div className="bg-white p-6 mt-24 absolute z-20" >
        <X onClick={() => setModalChildren(null)} className="absolute top-10 right-10 text-gray-700 cursor-pointer" />
        {modalChildren}
      </div>
    </div>
  )
}

export default Modal
