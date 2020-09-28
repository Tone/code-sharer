
import { Menu } from 'antd'
import {
  AppstoreOutlined
} from '@ant-design/icons'
import { MaterialInfo } from '../interface'

import styles from './left_sider.module.css'

const { SubMenu } = Menu

interface LeftSiderProps {
  menus: Array<{ url: string, categories: Record<string, MaterialInfo> }>
  onSelect: (item: any) => void
}

function LeftSider({ menus, onSelect }: LeftSiderProps) {
  const defaultSelectedKeys = [`${menus[0].url}_${Object.keys(menus[0].categories)[0]}`]

  return <div className={styles.left_sider}>
    <h1 className={styles.name}>CSM</h1>
    <Menu theme="dark" mode="inline" defaultOpenKeys={[menus[0].url]} defaultSelectedKeys={defaultSelectedKeys} onSelect={(e) => onSelect(e)}>
      {menus.map(({ url, categories }) => (
        <SubMenu key={url} icon={<AppstoreOutlined />} title={url}>
          { Object.keys(categories).map(category => <Menu.Item key={`${url}_${category}`}>{category}</Menu.Item>)
          }
        </SubMenu>
      ))
      }
    </Menu>
  </div>
}

export default LeftSider
