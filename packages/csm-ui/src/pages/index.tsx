import { useState, useEffect, useMemo } from 'react'
import styled from 'styled-components'
import tw from 'twin.macro'

import useFetch from '../components/use_fetch'
import Category from '../components/category'

const RepoCard = styled('div')`
  ${tw`text-base mb-2`};
  &:last-child{
    ${tw`mb-0`};
  }
`

const Label = styled('li')`
  ${tw`text-xs bg-green-100 text-green-500 border border-green-500 px-2 py-1 inline-block m-1`};
`
const ListItem = styled.li<{ selected: boolean }>`
  ${tw`p-2 cursor-pointer transition-colors duration-500 hover:bg-green-100 hover:text-green-500`};
  ${props => props.selected ? tw`bg-green-100 text-green-500 border-r-2 border-green-500` : ''};
`

function HomePage() {
  const repositories = useFetch('/api/repos')

  const defaultRepoKey = useMemo(() => {
    return repositories ? repositories[0]?.repository ?? '' : ''
  }, [repositories])

  const [curRepoKey, setCurRepo] = useState(defaultRepoKey)

  useEffect(() => {
    setCurRepo(defaultRepoKey)
  }, [defaultRepoKey])


  const curRepo = useMemo(() => {
    return repositories ? repositories.find(r => r.repository === curRepoKey) ?? null : null
  }, [curRepoKey])

  const [curCategory, setCurCategory] = useState()

  useEffect(() => {
    if (curRepo !== null) setCurCategory(curRepo.category[0])
  }, [curRepo])


  return <div className="container mx-auto flex flex-row items-stretch h-screen bg-white p-x-8 text-gray-800 text-xl">
    <aside className="w-64 border-r border-gray-200 p-4 pr-0" style={{ boxShadow: '2px 0 8px 0 rgba(29,35,41,.05)' }}>
      <div className="flex flex-row text-black-8 flex-wrap pr-4">
        <label className="w-full mb-2 -ml-2">
          Repository:
        </label>
        <select className="flex-1 outline-none border-gray-400 pl-2 border" value={curRepoKey} onChange={e => setCurRepo(e.target.value)}>
          {(repositories ?? []).map(r => (
            <option value={r.repository} key={r.repository}>
              {r.repository}
            </option>
          ))
          }
        </select>
        {!curRepo ? null :
          <div className="w-full my-2">
            <RepoCard>
              <h5>Env:</h5>
              <ul>
                {curRepo.env.map(e => <Label key={e.name}>{e.name}:{e.version}</Label>)}
              </ul>
            </RepoCard>
            <RepoCard>
              <h5>Package:</h5>
              <ul>
                {curRepo.package.map(p => <Label key={p.name}>{p.name}:{p.version}</Label>)}
              </ul>
            </RepoCard>
          </div>
        }
      </div>
      {!curRepo ? null :
        <div className="text-base">
          <h5>Category:</h5>
          <ul>
            {curRepo.category.map(c => <ListItem selected={curCategory === c} onClick={() => setCurCategory(c)} key={c.name}>{c.name}</ListItem>)}
          </ul>
        </div>
      }
    </aside>
    <main className="bg-gray-100 flex-1">
      <Category category={'ss'} repo="s" />
    </main>
  </div>
}

export default HomePage
