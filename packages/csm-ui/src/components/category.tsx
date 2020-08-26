import { useState, useMemo, useCallback, useRef } from 'react'
import styled from 'styled-components'
import tw from 'twin.macro'
import { Download } from 'react-feather';
import { useSetRecoilState } from 'recoil'
import { modalState } from './store'
import useFetch from './use_fetch'
import Pagination from './pagination'


const Tag = styled.li<{ selected?: boolean }>`
  ${tw`text-xs border px-4 py-1 inline-block cursor-pointer mx-1 mb-2 transition-colors duration-500 hover:border-green-500 hover:text-green-500 `};
  ${props => props.selected ? tw`bg-green-500 text-white hover:text-white` : ''};
`

function Category(props: { category: any, project?: string }) {
  const setModal = useSetRecoilState(modalState)
  const { category, project } = props
  const { val: { description, position, }, repo, name } = category

  const materials = useFetch(`/api/repo/${repo}?category=${name}`)

  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set())
  const [input, setInput] = useState('')

  const tags: string[] = useMemo(() => {
    if (materials === undefined) return []
    return Array.from(new Set(materials.reduce((ac: string[], cu) => {
      return ac.concat(cu.tags || [])
    }, [])))
  }, [materials])

  const [{ page, pageSize }, setPagination] = useState({ page: 1, pageSize: 6 })

  const filterMaterials = useMemo(() => {
    if (materials === undefined) return []
    return materials.filter(m => {
      return m.name.includes(input) && Array.from(selectedTags).every(t => m.tags.includes(t))
    })

  }, [materials, selectedTags, input])


  const currentMaterials = useMemo(() => {
    return filterMaterials.slice((page - 1) * pageSize, page * pageSize)
  }, [filterMaterials, page, pageSize])


  const tagClick = useCallback(
    (tag: string) => {
      const tagsCopy = new Set(selectedTags)
      if (tagsCopy.has(tag)) tagsCopy.delete(tag)
      else tagsCopy.add(tag)
      setSelectedTags(tagsCopy)
    },
    [selectedTags],
  )


  const paginationChange = (page: number, pageSize: number) => {
    setPagination({ page, pageSize })
  }



  const [downloadUrl, setDownloadUrl] = useState<null | string>(null)

  const downloadStatus = useFetch(downloadUrl)


  const download = (material, dir: string) => {
    setDownloadUrl(`/api/material?r=${repo}&c=${name}&n=${material.name}&d=${dir}`)
  }

  const dirRef = useRef()

  const showModal = (material: any) => {
    setModal(<div>
      <h5 className="text-base mb-4">Project Path:<br /> <span className="text-sm text-gray-500">{project}</span></h5>
      <label className="text-base" htmlFor="name">Download Location:</label> <br />
      <input ref={dirRef} className="outline-none appearance-none border p-1 pl-2 text-sm w-7/12 flex-none focus:border-green-500 mb-4" name="dir" type="text" defaultValue={position} />

      <div className="flex justify-end space-x-2 text-xs">
        <button className="px-4 py-1 text-sm border outline-none focus:outline-none cursor-pointer transition-colors duration-500 bg-green-500 hover:border-green-500 text-white " onClick={() => download(material, dirRef.current.value)}>
          OK
        </button>
        <button className="px-4 py-1 text-sm border outline-none focus:outline-none cursor-pointer transition-colors duration-500 hover:border-green-500 hover:text-green-500 " onClick={() => setModal(null)}>
          Cancel
        </button>
      </div>
      <div className="p-4 bg-black bg-opacity-50 text-2xl">
        {downloadStatus === undefined ? 'Download...' : 'Complete'}
      </div>
    </div>)
  }

  return <div className="flex flex-col max-h-full">
    <div className="bg-white p-4">
      <h4 className="text-2xl"> {name}</h4>
      <p className="text-base m-1">{description}</p>
    </div>
    <div className="m-4 p-2 flex items-start bg-white space-x-4">
      <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Search Name" className="outline-none appearance-none border p-1 pl-2 text-sm w-1/4 flex-none focus:border-green-500" />
      <ul className="flex flex-wrap">
        {tags.map((tag: string) => <Tag key={tag} selected={selectedTags.has(tag)} onClick={() => tagClick(tag)}>{tag}</Tag>)}
      </ul>
    </div>
    <div className="m-4 flex-1 flex flex-wrap -mx-1 px-4 items-stretch overflow-y-scroll">
      {currentMaterials.map(m => (
        <div key={m.name} className="md:w-1/3 sm:w-full p-1">
          <div className="text-xs border p-2 bg-white my-2 transition-shadow duration-500 hover:shadow h-full">
            <div className="group h-32 bg-gray-400 relative hover:bg-black hover:bg-opacity-25 flex justify-center items-center transition duration-500">
              <Download className="cursor-pointer opacity-0 group-hover:block group-hover:opacity-100 transition-all duration-500" onClick={() => showModal(m)} />
            </div>
            <h5 className="text-lg">{m.name} <small>{m.author}</small></h5>
            <p className="text-sm my-1">{m.description}</p>
            <ul>
              {m.tags.map((t: string) => <Tag key={t}>{t}</Tag>)}
            </ul>
          </div>
        </div>
      ))
      }
    </div>
    <Pagination total={filterMaterials.length} pageSize={pageSize} onChange={paginationChange} />
  </div>
}


export default Category
