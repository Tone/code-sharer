import { GetStaticProps } from 'next'
import { Layout, Pagination, Input, Button, Space, Row, Col } from 'antd'
import { useState, useEffect, useMemo } from 'react'
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons'

import styles from './index.module.css'
// import Store from '../service'
import LeftSider from '../components/left_sider'
import MainContent from '../components/content'
import { repos } from '../mock'
import { project } from '../service/config'

import { MaterialInfo } from '../interface'

const { Header, Sider, Content } = Layout
const { Search } = Input
interface IndexPageProps {
  repos: Array<{
    url: string,
    material: MaterialInfo
  }>,
  project: string
}

function slice(page: number, size: number, data: any[]) {
  return data.slice((page - 1) * size, page * size)
}

function IndexPage({ repos, project }: IndexPageProps) {
  const menus = repos.map(({ url, material }) => {
    const categories = material.reduce((group: Record<string, MaterialInfo>, materialItem: MaterialInfo[0]) => {
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

  const defaultMaterials = Object.values(menus[0].categories)[0]
  const [materials, setMaterials] = useState(defaultMaterials)

  const [search, setSearch] = useState('')

  const paginationOption = {
    defaultCurrent: 1,
    defaultPageSize: 12,
    pageSizeOptions: ['12', '24', '48', '96']
  }

  const [pagination, setPagination] = useState({ page: paginationOption.defaultCurrent, size: paginationOption.defaultPageSize })

  const viewMaterials: MaterialInfo = useMemo(() => {
    const { page, size } = pagination
    return slice(page, size, materials.filter(({ name, keywords }) => name.includes(search) || keywords.some((t) => t.includes(search))))
  }, [materials, search, pagination])

  function onMenuSelect(item: any) {
    console.log(item)
  }

  return (
    <Layout className={styles.layout} >
      <Sider>
        <LeftSider menus={menus} onSelect={onMenuSelect}></LeftSider>
      </Sider>
      <Layout className={styles.layout}>
        <Header className={styles.head}>
          <Row justify="end" gutter={16}>
            <Col>
              <Search placeholder="Please Search Keywords" allowClear prefix={<SearchOutlined />} onSearch={(input) => setSearch(input)} />
            </Col>
            <Col>
              <Space>
                <Button icon={<ReloadOutlined />}>Refresh</Button>
              </Space>
            </Col>
          </Row>
        </Header>
        <Content className={styles.content}>
          <MainContent project={project} materials={viewMaterials}></MainContent>
          <Pagination className={styles.pagination} {...paginationOption} size="small" total={materials.length} showSizeChanger showQuickJumper onChange={(page, size = paginationOption.defaultPageSize) => setPagination({ page, size })} />
        </Content>
      </Layout>
    </Layout>
  )
}

export default IndexPage

export const getStaticProps: GetStaticProps = async (context) => {
  // await Store.init()
  return {
    props: {
      repos: repos,
      project
    }
  }
}
