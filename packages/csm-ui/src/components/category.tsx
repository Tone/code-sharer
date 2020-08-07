import { useState, useMemo, useCallback } from 'react'
import styled from 'styled-components'
import tw from 'twin.macro'


import useFetch from './use_fetch'
import Pagination from './pagination'

const Tag = styled.li<{ selected?: boolean }>`
  ${tw`text-xs border px-4 py-1 inline-block cursor-pointer mx-1 mb-2 transition-colors duration-500 hover:border-green-500 hover:text-green-500 `};
  ${props => props.selected ? tw`bg-green-500 text-white hover:text-white` : ''};
`

function Category(props: { category: string, repo: string }) {
  const { category, repo } = props
  const info = useFetch(`/api/repo/${repo}?category=${category}`)


  const { description, materials = [] } = info || {}

  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set())

  const tags: string[] = useMemo(() => {
    if (materials === undefined) return []
    return Array.from(new Set(materials.reduce((ac, cu) => {
      return ac.concat(cu.tags || [])
    }, [])))
  }, [materials])

  const tagClick = useCallback(
    (tag: string) => {
      const tagsCopy = new Set(selectedTags)
      if (tagsCopy.has(tag)) tagsCopy.delete(tag)
      else tagsCopy.add(tag)
      setSelectedTags(tagsCopy)
    },
    [selectedTags],
  )

  return <div className="flex flex-col max-h-full">
    <div className="bg-white p-4">
      <h4 className="text-2xl"> {category}</h4>
      <p className="text-base m-1">{description}</p>
    </div>
    <div className="m-4 p-2 flex items-start bg-white space-x-4">
      <input placeholder="Search Name" className="outline-none appearance-none border p-1 pl-2 text-sm w-1/4 flex-none" />
      <ul className="flex flex-wrap">
        {tags.map((tag: string) => <Tag key={tag} selected={selectedTags.has(tag)} onClick={() => tagClick(tag)}>{tag}</Tag>)}
      </ul>
    </div>
    <div className="m-4 flex-1 flex flex-wrap -mx-1 px-4 items-stretch overflow-y-scroll">
      {materials.map(m => (
        <div key={m.name} className="md:w-1/3 sm:w-full p-1">
          <div className="text-xs border p-2 bg-white cursor-pointer my-2 transition-shadow duration-500 hover:shadow h-full">
            <div className="h-32 bg-gray-400">
            </div>
            <h5 className="text-lg">{m.name}</h5>
            <p className="text-sm my-1">{m.description}</p>
            <ul>
              {m.tags.map((t: string) => <Tag key={t}>{t}</Tag>)}
            </ul>
          </div>
        </div>
      ))
      }
    </div>
    <Pagination total={materials.length} current={1} />
  </div>
}


export default Category
