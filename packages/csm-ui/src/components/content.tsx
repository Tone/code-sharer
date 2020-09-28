import { Card, Col, Row, Skeleton, Tag } from 'antd'
import { EditOutlined, EllipsisOutlined, SettingOutlined } from '@ant-design/icons'
import { MaterialInfo } from '../interface'
import styles from './content.module.css'

const { Meta } = Card

function MainContent({ materials }: { materials: MaterialInfo }) {
  return (
    <div>
      <Row gutter={[8, 8]}>
        {materials.map((material, index) => (
          <Col xs={24} md={8} lg={6} key={material.category + material.name + `${index}`}>
            <Card
              cover={<>
                <Skeleton.Image className={styles.img} />
                <div className={styles.tags}>
                  {material.keywords.map(keyword => <span className={styles.tag}>{keyword}</span>)}
                </div>
              </>
              }
              actions={[
                <SettingOutlined key="setting" />,
                <EditOutlined key="edit" />,
                <EllipsisOutlined key="ellipsis" />
              ]}
            >
              <Meta
                title={material.name}
                description={material.description}
              />
            </Card>
          </Col>
        ))
        }
      </Row>
    </div>
  )
}

export default MainContent
