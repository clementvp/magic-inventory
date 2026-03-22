import { ReactNode, useState } from 'react'
import { Layout as AntLayout, Menu, Breadcrumb, Input } from 'antd'
import {
  AppstoreOutlined,
  CalendarOutlined,
  StarOutlined,
  FileTextOutlined,
  UserOutlined,
  TagsOutlined,
  UnorderedListOutlined,
  InboxOutlined,
} from '@ant-design/icons'
import { Link, usePage } from '@inertiajs/react'
import type { MenuProps } from 'antd'
import FlashMessages from './FlashMessages'

const { Sider, Header, Content, Footer } = AntLayout
const { Search } = Input

interface LayoutProps {
  children: ReactNode
  title?: string
  breadcrumbLabels?: Record<string, string>
}

export default function Layout({ children, title, breadcrumbLabels }: LayoutProps) {
  const [collapsed, setCollapsed] = useState(false)
  const { url } = usePage()

  // Déterminer la clé active du menu basée sur l'URL
  const getSelectedKey = (): string => {
    if (url.startsWith('/storage-locations')) return 'storage-locations'
    if (url.startsWith('/types')) return 'types'
    if (url.startsWith('/categories')) return 'categories'
    if (url.startsWith('/materials')) return 'materials'
    if (url.startsWith('/routines')) return 'routines'
    if (url.startsWith('/shows')) return 'shows'
    if (url.startsWith('/notes')) return 'notes'
    if (url.startsWith('/profile')) return 'profile'
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
      categories: 'Catégories',
      types: 'Types',
      'storage-locations': 'Lieux de Stockage',
      materials: 'Inventaire',
      routines: 'Routines',
      shows: 'Spectacles',
      notes: 'Notes',
      dashboard: 'Accueil',
      profile: 'Profil',
    }

    segments.forEach((segment, index) => {
      const isLast = index === segments.length - 1
      const label = isLast && title ? title : (breadcrumbLabels?.[segment] || labelMap[segment] || segment)
      const path = '/' + segments.slice(0, index + 1).join('/')

      // Dernier segment non cliquable
      if (isLast) {
        items.push({ title: label })
      } else {
        items.push({ title: <Link href={path}>{label}</Link> })
      }
    })

    return items
  }

  const menuItems: MenuProps['items'] = [
    {
      key: 'categories',
      icon: <TagsOutlined />,
      label: <Link href="/categories">Catégories</Link>,
    },
    {
      key: 'types',
      icon: <UnorderedListOutlined />,
      label: <Link href="/types">Types</Link>,
    },
    {
      key: 'storage-locations',
      icon: <InboxOutlined />,
      label: <Link href="/storage-locations">Lieux de Stockage</Link>,
    },
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
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: <Link href="/profile">Profil</Link>,
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
            onSearch={() => {
              // Structure uniquement - logique de recherche à implémenter en Epic 3
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
