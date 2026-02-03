/// <reference path="../../adonisrc.ts" />
/// <reference path="../../config/inertia.ts" />

import '../css/app.css';
import 'antd/dist/reset.css';
import { createRoot } from 'react-dom/client';
import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from '@adonisjs/inertia/helpers'
import { ConfigProvider } from 'antd';
import frFR from 'antd/es/locale/fr_FR';

const appName = import.meta.env.VITE_APP_NAME || 'AdonisJS'

createInertiaApp({
  progress: { color: '#5468FF' },

  title: (title) => `${title} - ${appName}`,

  resolve: (name) => {
    return resolvePageComponent(
      `../pages/${name}.tsx`,
      import.meta.glob('../pages/**/*.tsx'),
    )
  },

  setup({ el, App, props }) {
    createRoot(el).render(
      <ConfigProvider
        locale={frFR}
        theme={{
          token: {
            // Couleurs (cohérence Apple-inspired)
            colorPrimary: '#1890ff',      // Bleu primaire actions principales
            colorSuccess: '#52c41a',      // Vert succès
            colorWarning: '#faad14',      // Orange avertissement
            colorError: '#ff4d4f',        // Rouge danger
            colorInfo: '#1890ff',         // Bleu info

            // Typographie
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
            fontSize: 14,
            fontSizeHeading1: 24,
            fontSizeHeading2: 20,
            fontSizeHeading3: 16,
            lineHeight: 1.5,

            // Espaces blancs (Apple-inspired generous whitespace)
            padding: 16,
            margin: 16,
            paddingLG: 24,
            marginLG: 24,

            // Coins & bordures
            borderRadius: 4,
            borderRadiusLG: 8,

            // Animation subtile
            motionUnit: 0.1,
          },
        }}
      >
        <App {...props} />
      </ConfigProvider>
    );
  },
});