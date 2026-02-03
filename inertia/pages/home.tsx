import { Head, Link } from '@inertiajs/react'
import { Button, Typography } from 'antd'

const { Title, Paragraph } = Typography

export default function Home() {
  return (
    <>
      <Head title="Magic Inventory - Accueil" />

      <div className="fixed xl:absolute left-8 right-8 top-0 bottom-0 xl:inset-0 max-w-screen-xl mx-auto before:content-[''] before:[background:repeating-linear-gradient(0deg,var(--sand-5)_0_4px,transparent_0_8px)] before:absolute before:top-0 before:left-0 before:h-full before:w-px after:content-[''] after:[background:repeating-linear-gradient(0deg,var(--sand-5)_0_4px,transparent_0_8px)] after:absolute after:top-0 after:right-0 after:h-full after:w-px"></div>

      <div className="pt-4 h-full flex flex-col">
        {/* Header */}
        <div className="grow pb-4 bg-gradient-to-b from-sand-1 to-sand-2 flex justify-center items-center">
          <div className="text-center space-y-6">
            <Title level={1}>Bienvenue sur Magic Inventory</Title>
            <Paragraph className="text-lg">
              Votre assistant de gestion d'inventaire pour artistes de magie
            </Paragraph>
            <div className="flex gap-4 justify-center mt-8">
              <Link href="/login">
                <Button type="primary" size="large">
                  Se connecter
                </Button>
              </Link>
              <Link href="/register">
                <Button size="large">
                  S'inscrire
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}