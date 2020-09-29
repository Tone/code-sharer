
import { Menu } from 'antd'
import {
  AppstoreOutlined
} from '@ant-design/icons'
import { Info } from '../interface'

import styles from './left_sider.module.css'

const { SubMenu } = Menu

interface LeftSiderProps {
  menus: Array<{ url: string, categories: Record<string, Info[]> }>
  defaultMenu: [number, string],
  onSelect: (ref: any) => void
}

function LeftSider({ menus, onSelect, defaultMenu }: LeftSiderProps) {
  const defaultSelectedKeys = [`${defaultMenu[0]}_${defaultMenu[1]}`]

  return <div className={styles.left_sider}>
    <h1 className={styles.name}>CSM</h1>
    <Menu theme="dark" mode="inline" defaultOpenKeys={[`${defaultMenu[0]}`]} defaultSelectedKeys={defaultSelectedKeys} onSelect={({ key }) => onSelect((key as string).split('_').map((key, index) => index === 0 ? +key : key))}>
      {menus.map(({ url, categories }, index) => (
        <SubMenu key={`${index}`} icon={<AppstoreOutlined />} title={url}>
          { Object.keys(categories).map(category => <Menu.Item key={`${index}_${category}`}>{category}</Menu.Item>)
          }
        </SubMenu>
      ))
      }
    </Menu>
  </div>
}

export default LeftSider
