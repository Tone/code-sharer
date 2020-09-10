import { useState, useEffect } from 'react'
import styled from 'styled-components'
import tw from 'twin.macro'
import { RefreshCcw, DownloadCloud } from 'react-feather'

import { mutate } from 'swr'
import useFetch, { fetcher } from '../components/use_fetch'
import Category from '../components/category'
import { GetServerSideProps } from 'next'

import { Repository } from '@tone./csm-core'

import store from '../service'
import { currentExecDir } from '../service/config'

type RepositoryConfig = ReturnType<Repository['getConfig']>

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

const Btn = styled.button`
  ${tw`px-2 py-1 border outline-none ml-2 focus:outline-none cursor-pointer transition-colors duration-500 hover:border-green-500 hover:text-green-500`};
`

function HomePage(props: { storages: string[], project?: string }) {
  const { storages } = props
  const [curStorage, setCurStorage] = useState(storages[0])

  const [curRepo, setCurRepo] = useState<RepositoryConfig | null>(null)
  const repositories: RepositoryConfig[] | undefined = useFetch(`/api/repos?s=${curStorage}`)

  useEffect(() => {
    if (repositories !== undefined && repositories.length !== 0) {
      setCurRepo(repositories[0])
    }
  }, [repositories])

  const [curCategory, setCurCategory] = useState<{
    val: any,
    name: string,
    repo: string
  } | null>(null)

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

  const refresh = async () => {
    await fetcher(`/api/storage?s=${curStorage}`)
    mutate(`/api/repos?s=${curStorage}`)
  }

  const update = async () => {
    await fetcher('/api/storage')
    location.reload()
  }

  return <div className="container mx-auto flex flex-row items-stretch h-screen bg-white p-x-8 text-gray-800 text-xl">
    <aside className="w-64 border-r border-gray-200 p-4 pr-0" style={{ boxShadow: '2px 0 8px 0 rgba(29,35,41,.05)' }}>
      <div className="flex flex-row text-black-8 flex-wrap pr-4">
        <label className="w-full mb-2 -ml-2 flex justify-between items-center">
          Storage:
          <div>
            <Btn onClick={refresh}>
              <RefreshCcw size={14} />
            </Btn>
            <Btn onClick={update}>
              <DownloadCloud size={14} />
            </Btn>
          </div>
        </label>
        <select className="w-full flex-1 outline-none border-gray-400 pl-2 border" value={curStorage} onChange={e => setCurStorage(e.target.value)}>
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
        <select className="w-full flex-1 outline-none border-gray-400 pl-2 border" value={curRepo !== null ? curRepo.repository : ''} onChange={e => {
          const repo = (repositories ?? []).find((r: RepositoryConfig) => r.repository === e.target.value)
          setCurRepo(repo ?? null)
        }}>
          {(repositories ?? []).map((r: any) => (
            <option value={r.repository} key={r.repository}>
              {r.repository}
            </option>
          ))
          }
        </select>
        {curRepo === null ? null
          : <div className="w-full my-2">
            <RepoCard>
              <h5>Env:</h5>
              <ul>
                {(curRepo.env ?? []).map((e: any) => <Label key={e.exec}>{e.exec}:{e.version}</Label>)}
              </ul>
            </RepoCard>
            <RepoCard>
              <h5>Package:</h5>
              <ul>
                {(curRepo.package ?? []).map((p: any) => <Label key={p.name}>{p.name}:{p.version}</Label>)}
              </ul>
            </RepoCard>
          </div>
        }
      </div>
      {curRepo === null ? null
        : <div className="text-base">
          <h5>Category:</h5>
          <ul>
            {Object.keys(curRepo.category).map(c => <ListItem selected={curCategory?.name === c} onClick={() => handleCategory(c)} key={c}>{c}</ListItem>)}
          </ul>
        </div>
      }
    </aside>
    <main className="bg-gray-100 flex-1">
      {curCategory === null ? null
        : <Category category={curCategory} project={props.project} />
      }
    </main>
  </div>
}

export default HomePage

export const getServerSideProps: GetServerSideProps = async (context) => {
  await store.init()
  return {
    props: {
      project: currentExecDir,
      storages: Array.from(store.store)
    }
  }
}
