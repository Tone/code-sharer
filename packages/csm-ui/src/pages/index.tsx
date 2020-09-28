import { GetStaticProps, InferGetStaticPropsType } from 'next'
import { Layout, Pagination } from 'antd'
import { useState } from 'react'

import styles from './index.module.css'
// import Store from '../service'
import LeftSider from '../components/left_sider'
import MainContent from '../components/content'
import { repos } from '../mock'

import { MaterialInfo } from '../interface'

const { Header, Sider, Content } = Layout

interface IndexPageProps {
  repos: Array<{
    url: string,
    material: MaterialInfo
  }>
}

function IndexPage({ repos }: IndexPageProps) {
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

  function onMenuSelect(item: any) {
    console.log(item)
  }

  return (
    <Layout className={styles.layout} >
      <Sider>
        <LeftSider menus={menus} onSelect={onMenuSelect}></LeftSider>
      </Sider>
      <Layout className={styles.layout}>
        <Header className={styles.head}>head</Header>
        <Content className={styles.content}>
          <MainContent materials={materials}></MainContent>
          <Pagination className={styles.pagination} size="small" total={50} showSizeChanger showQuickJumper />
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
      repos: repos
    }
  }
}
