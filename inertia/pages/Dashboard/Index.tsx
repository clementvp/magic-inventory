import { Typography } from 'antd'
import Layout from '~/components/Layout'

const { Title, Paragraph } = Typography

export default function Index() {
  return (
    <Layout>
      <Title level={2}>Tableau de bord</Title>
      <Paragraph>Bienvenue dans magic-inventory !</Paragraph>
    </Layout>
  )
}
