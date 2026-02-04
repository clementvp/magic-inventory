import { ReactNode, useState } from 'react'
import { Layout as AntLayout, Menu, Breadcrumb, Input } from 'antd'
import {
  AppstoreOutlined,
  CalendarOutlined,
  StarOutlined,
  FileTextOutlined,
} from '@ant-design/icons'
import { Link, usePage } from '@inertiajs/react'
import type { MenuProps } from 'antd'
import FlashMessages from './FlashMessages'

const { Sider, Header, Content, Footer } = AntLayout
const { Search } = Input

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const [collapsed, setCollapsed] = useState(false)
  const { url } = usePage()

  // Déterminer la clé active du menu basée sur l'URL
  const getSelectedKey = (): string => {
    if (url.startsWith('/materials')) return 'materials'
    if (url.startsWith('/routines')) return 'routines'
    if (url.startsWith('/shows')) return 'shows'
    if (url.startsWith('/notes')) return 'notes'
    return 'dashboard'
  }

  // Générer les breadcrumbs basés sur l'URL
  const generateBreadcrumbs = () => {
    const segments = url.split('/').filter(Boolean)
    const items: { title: ReactNode }[] = [
      {
        title: <Link href="/dashboard">Accueil</Link>,
      },
    ]

    const labelMap: Record<string, string> = {
      materials: 'Inventaire',
      routines: 'Routines',
      shows: 'Spectacles',
      notes: 'Notes',
      dashboard: 'Accueil',
    }

    segments.forEach((segment, index) => {
      const label = labelMap[segment] || segment
      const path = '/' + segments.slice(0, index + 1).join('/')

      // Dernier segment non cliquable
      if (index === segments.length - 1) {
        items.push({ title: label })
      } else {
        items.push({ title: <Link href={path}>{label}</Link> })
      }
    })

    return items
  }

  const menuItems: MenuProps['items'] = [
    {
      key: 'materials',
      icon: <AppstoreOutlined />,
      label: <Link href="/materials">Inventaire</Link>,
    },
    {
      key: 'routines',
      icon: <CalendarOutlined />,
      label: <Link href="/routines">Routines</Link>,
    },
    {
      key: 'shows',
      icon: <StarOutlined />,
      label: <Link href="/shows">Spectacles</Link>,
    },
    {
      key: 'notes',
      icon: <FileTextOutlined />,
      label: <Link href="/notes">Notes</Link>,
    },
  ]

  return (
    <AntLayout style={{ minHeight: '100vh' }}>
      <FlashMessages />

      <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed}>
        <div
          style={{
            height: 32,
            margin: 16,
            color: 'white',
            textAlign: 'center',
            fontWeight: 'bold',
          }}
        >
          {collapsed ? 'MI' : 'magic-inventory'}
        </div>

        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[getSelectedKey()]}
          items={menuItems}
        />
      </Sider>

      <AntLayout>
        <Header
          style={{
            padding: '0 16px',
            background: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Breadcrumb items={generateBreadcrumbs()} />

          <Search
            placeholder="Rechercher... (Cmd+K ou Ctrl+K)"
            style={{ width: 300 }}
            onSearch={(value) => {
              // Structure uniquement - logique de recherche à implémenter en Epic 3
              console.log('Search:', value)
            }}
          />
        </Header>

        <Content style={{ margin: 16 }}>
          <div style={{ padding: 16, background: '#fff', minHeight: 360 }}>
            {children}
          </div>
        </Content>

        <Footer style={{ textAlign: 'center' }}>
          magic-inventory ©{new Date().getFullYear()}
        </Footer>
      </AntLayout>
    </AntLayout>
  )
}
