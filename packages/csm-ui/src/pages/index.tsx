import { GetServerSideProps } from 'next'
import { Layout, Pagination, Input, Button, Space, Row, Col, Empty } from 'antd'
import { useState, useEffect, useMemo, useRef } from 'react'
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons'

import styles from './index.module.css'
import Store from '../service'
import LeftSider from '../components/left_sider'
import MainContent from '../components/content'
import { project } from '../service/config'
import * as Api from '../api'
import { Info } from '../interface'

const { Header, Sider, Content } = Layout
const { Search } = Input
interface IndexPageProps {
  repos: Array<{
    url: string,
    material: Info[]
  }>,
  project: string
}

function slice(page: number, size: number, data: any[]) {
  return data.slice((page - 1) * size, page * size)
}

function IndexPage({ repos, project }: IndexPageProps) {
  const [localRepos, setLocalRepos] = useState(repos)

  async function reflash() {
    const data = await Api.refresh()
    setLocalRepos(data)
  }

  const menus = useMemo(() => {
    return localRepos.map(({ url, material }) => {
      const categories = material.reduce((group: Record<string, Info[]>, materialItem) => {
        if (group[materialItem.category] !== undefined) {
          group[materialItem.category].push(materialItem)
        } else {
          group[materialItem.category] = [materialItem]
        }

        return group
      }, {})
      return {
        url,
        categories
      }
    })
  }, [localRepos])

  const defaultMenu: [number, string] = [0, Object.keys(menus[0].categories)[0]]
  const [current, setCurrent] = useState(defaultMenu)

  useEffect(() => {
    setCurrent([0, Object.keys(menus[0].categories)[0]])
  }, [menus])

  const materials = useMemo(() => {
    const [index, key] = current
    return menus[index].categories[key]
  }, [current, menus])

  const [search, setSearch] = useState('')

  useEffect(() => {
    setSearch('')
  }, [current])

  const paginationOption = {
    defaultCurrent: 1,
    defaultPageSize: 12,
    pageSizeOptions: ['12', '24', '48', '96']
  }

  const [pagination, setPagination] = useState({ page: paginationOption.defaultCurrent, size: paginationOption.defaultPageSize })

  const filterMaterials: Info[] = useMemo(() => {
    setPagination({ page: 1, size: pagination.size })
    return materials.filter(({ name, keywords }) => name.includes(search) || keywords.some((t) => t.includes(search)))
  }, [materials, search])

  const viewMaterials: Info[] = useMemo(() => {
    const { page, size } = pagination
    return slice(page, size, filterMaterials)
  }, [filterMaterials, pagination])

  const inputRef = useRef<Input>(null)

  function onMenuSelect(current: [number, string]) {
    inputRef.current?.setValue('')
    setCurrent(current)
  }

  return (
    <Layout className={styles.layout} >
      <Sider>
        <LeftSider menus={menus} defaultMenu={defaultMenu} onSelect={onMenuSelect}></LeftSider>
      </Sider>
      <Layout className={styles.layout}>
        <Header className={styles.head}>
          <Row justify="end" gutter={16}>
            <Col>
              <Search ref={inputRef} placeholder="Please Search Keywords" allowClear prefix={<SearchOutlined />} onSearch={(input) => setSearch(input)} />
            </Col>
            <Col>
              <Space>
                <Button icon={<ReloadOutlined />} onClick={async () => await reflash()} >Refresh</Button>
              </Space>
            </Col>
          </Row>
        </Header>
        <Content className={styles.content}>
          {viewMaterials.length <= 0 ? <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
            : <>
              <MainContent project={project} materials={viewMaterials} />
              <Pagination className={styles.pagination} {...paginationOption} size="small" current={pagination.page} pageSize={pagination.size} total={filterMaterials.length} showSizeChanger showQuickJumper onChange={(page, size = pagination.size) => setPagination({ page, size })} />
            </>
          }
        </Content>
      </Layout>
    </Layout>
  )
}

export default IndexPage

export const getServerSideProps: GetServerSideProps = async (context) => {
  const store = await Store.init()
  return {
    props: {
      repos: store.repos,
      project
    }
  }
}
