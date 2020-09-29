import { useState, useRef } from 'react'
import { Card, Col, Row, Skeleton, Typography, Space, Modal, Descriptions, Button, Input } from 'antd'
import { DownloadOutlined, EllipsisOutlined, CopyOutlined } from '@ant-design/icons'
import SyntaxHighlighter from 'react-syntax-highlighter'

import { MaterialInfo } from '../interface'
import styles from './content.module.css'
import * as Api from '../api'

const { Meta } = Card
const { Paragraph, Title, Text } = Typography

function MainContent({ materials, project }: { materials: MaterialInfo, project: string }) {
  const [downloadMaterial, setDownload] = useState<null | MaterialInfo[0]>(null)
  const [confirmLoading, setConfirmLoading] = useState(false)
  const inputRef = useRef<null | Input>(null)

  async function download() {
    const { value } = inputRef.current?.state ?? {}

    if (downloadMaterial === null || value === undefined) return
    setConfirmLoading(true)
    try {
      const { name, category } = downloadMaterial
      await Api.download(name, category, value)
    } finally {
      setConfirmLoading(false)
    }
  }

  const [copyMaterial, setCopy] = useState<null | MaterialInfo[0]>(null)

  return (
    <div>
      <Row gutter={[8, 8]}>
        {materials.map(material => (
          <Col xs={24} md={8} lg={6} key={material.category + material.name}>
            <Card
              cover={<>
                <Skeleton.Image className={styles.img} />
                <Space className={styles.tags}>
                  {material.keywords.map(keyword => <Text key={keyword} type="secondary">{keyword}</Text>)}
                </Space>
              </>
              }
              actions={[
                <DownloadOutlined key="download" onClick={() => setDownload(material)} />,
                <CopyOutlined key="copy" onClick={() => setCopy(material)} />,
                <EllipsisOutlined key="ellipsis" />
              ]}
            >
              <Meta
                title={
                  <Title ellipsis level={5}>
                    {material.name}
                  </Title>
                }
                description={
                  <Paragraph ellipsis={{ rows: 2 }}>
                    {material.description}
                  </Paragraph>
                }
              />
            </Card>
          </Col>
        ))
        }
      </Row>
      <Modal
        title="Download Material"
        visible={downloadMaterial !== null}
        footer={null}
        onCancel={() => setDownload(null)}>
        {downloadMaterial === null ? null : (
          <Descriptions title={downloadMaterial.name} column={2} bordered size="small" layout="vertical" extra={
            <Row justify="space-between">
              <Col span={16}>
                <Input ref={inputRef} addonBefore={project} defaultValue="" placeholder="Please input download dir" />
              </Col>
              <Col>
                <Button loading={confirmLoading} type="primary" onClick={async () => await download()}>Download</Button>
              </Col>
            </Row>
          }>
            <Descriptions.Item label="description" span={2}>{downloadMaterial.description}</Descriptions.Item>
            <Descriptions.Item label="category">{downloadMaterial.category}</Descriptions.Item>
            <Descriptions.Item label="keywords">
              <Space>
                {downloadMaterial.keywords.map(keyword => <Text key={keyword}>{keyword}</Text>)}
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="files">{downloadMaterial.files}</Descriptions.Item>
            <Descriptions.Item label="dependencies">
              <Space>
                {Object.keys(downloadMaterial.dependencies).map(dep => <Text key={dep}>{`${dep}@${downloadMaterial.dependencies[dep]}`}</Text>)}
              </Space>
            </Descriptions.Item>
          </Descriptions>)
        }
      </Modal>
      {/* copy modal */}
      <Modal
        title="Copy Material Code"
        visible={copyMaterial !== null}
        footer={null}
        onCancel={() => setCopy(null)}>
        {copyMaterial === null ? null : (
          <Descriptions size="small" column={1} title={copyMaterial.name} layout="vertical" extra={
            <Text copyable={{ text: copyMaterial.code, icon: [<Button type="primary">Copy</Button>], tooltips: false }}>
            </Text>
          }>
            <Descriptions.Item span={1}>
              {copyMaterial.code === '' ? null
                : <SyntaxHighlighter language="javascript">
                  {copyMaterial.code}
                </SyntaxHighlighter>
              }
            </Descriptions.Item>
          </Descriptions>)
        }
      </Modal>
    </div>
  )
}

export default MainContent
