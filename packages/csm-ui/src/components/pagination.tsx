
import { useState, useMemo, useEffect } from 'react'
import styled from 'styled-components'
import tw from 'twin.macro'

interface PaginationProps {
  pageSize?: number,
  total: number,
  onChange?: (page: number, pageSize: number) => void
}

const Btn = styled.li<{ selected?: boolean }>`
  ${tw`text-xs border w-8 h-8 leading-8 text-center cursor-pointer transition-colors duration-500 hover:border-green-500 hover:text-green-500 `};
  ${props => props.selected ? tw`bg-green-500 text-white hover:text-white` : ''};
`

function Pagination(props: PaginationProps) {
  const { pageSize = 6, total, onChange } = props

  const [currentPage, setCurrent] = useState(1)

  useEffect(() => {
    setCurrent(1)
    if (onChange !== undefined) onChange(1, pageSize)
  }, [pageSize, total])

  const page = useMemo(() => {
    const all = []
    for (let i = 0; i < Math.ceil(total / pageSize); i++) {
      all.push(i + 1)
    }
    return all
  }, [total, pageSize])

  const clickHandle = (page: number) => {
    setCurrent(page)
    if (onChange !== undefined) onChange(page, pageSize)
  }

  const liEL = (page: number[]) => page.map((p: number) => (
    <Btn key={p} selected={currentPage === p} onClick={() => clickHandle(p)}>{p}</Btn>
  ))

  if (total === 0) return null

  let before: number[] = []
  let mid: number[] = []
  let after: number[] = []

  if (page.length > 10) {
    before = page.slice(0, 3)

    if (currentPage <= 3) {
      mid = page.slice(3, 8)
    } else if (currentPage + 2 > page.length - 3) {
      mid = page.slice(-8, -3)
    } else {
      const start = currentPage - 3 < 3 ? 3 : currentPage - 3
      let end = currentPage >= page.length - 3 ? -3 : currentPage + 2
      if (end - start < 5) {
        end = 8
      }
      mid = page.slice(start, end)
    }
    after = page.slice(-3)
  } else {
    before = page
  }

  return (
    <ul className="flex space-x-1 bg-white justify-end py-2 px-4 ml-4 mb-8">
      {liEL(before)}
      {!mid.length ? null
        : <>
          <Btn>•••</Btn>
          {liEL(mid)}
        </>
      }
      {!after.length ? null
        : <>
          <Btn>•••</Btn>
          {liEL(after)}
        </>
      }
    </ul>
  )
}

export default Pagination
