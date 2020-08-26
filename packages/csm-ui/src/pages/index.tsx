import { useState, useEffect, useMemo } from 'react'
import styled from 'styled-components'
import tw from 'twin.macro'


import useFetch from '../components/use_fetch'
import Category from '../components/category'
import { GetStaticProps } from 'next'

import store from '../service'

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

function HomePage(props: { storages: string[], project?: string }) {
  const { storages } = props
  const [curStorage, setCurStorage] = useState(storages[0])

  const [curRepo, setCurRepo] = useState(null)
  const repositories = useFetch(`/api/repos?s=${curStorage}`)

  useEffect(() => {
    if (repositories?.length) {
      setCurRepo(repositories[0])
    }
  }, [repositories])

  const [curCategory, setCurCategory] = useState()

  function handleCategory(name: string) {
    if (curRepo !== null) {
      setCurCategory({ val: curRepo.category[name], name, repo: curRepo.repository })
    }
  }

  useEffect(() => {
    if (curRepo !== null) {
      handleCategory(Object.keys(curRepo.category)[0])
    }
  }, [curRepo])





  return <div className="container mx-auto flex flex-row items-stretch h-screen bg-white p-x-8 text-gray-800 text-xl">
    <aside className="w-64 border-r border-gray-200 p-4 pr-0" style={{ boxShadow: '2px 0 8px 0 rgba(29,35,41,.05)' }}>
      <div className="flex flex-row text-black-8 flex-wrap pr-4">
        <label className="w-full mb-2 -ml-2">
          Storage:
        </label>
        <select className="flex-1 outline-none border-gray-400 pl-2 border" value={curStorage} onChange={e => setCurStorage(e.target.value)}>
          {(storages ?? []).map(s => (
            <option value={s} key={s}>
              {s}
            </option>
          ))
          }
        </select>
        <label className="w-full mb-2 -ml-2">
          Repository:
        </label>
        <select className="flex-1 outline-none border-gray-400 pl-2 border" value={curRepo ? curRepo.repository : ''} onChange={e => {
          const repo = repositories.find(r => r.repository === e.target.value)
          setCurRepo(repo)
        }}>
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
                {curRepo.env.map(e => <Label key={e.exec}>{e.exec}:{e.version}</Label>)}
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
            {Object.keys(curRepo.category).map(c => <ListItem selected={curCategory?.name === c} onClick={() => handleCategory(c)} key={c}>{c}</ListItem>)}
          </ul>
        </div>
      }
    </aside>
    <main className="bg-gray-100 flex-1">
      {!curCategory ? null :
        <Category category={curCategory} project={props.project} />
      }
    </main>
  </div>
}

export default HomePage

export const getStaticProps: GetStaticProps = async (context) => {
  await store.init()
  return {
    props: {
      project: process.cwd(),
      storages: Array.from(store.store)
    }
  }
}
