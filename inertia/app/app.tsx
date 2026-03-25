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
  progress: { color: '#ffba38' },

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
            // Fidelity Light — MD3 tonal palette
            colorPrimary: '#583b00',
            colorTextBase: '#1b1c1c',
            colorBgBase: '#fcf9f8',
            colorBorder: '#877369',
            colorBorderSecondary: '#dac2b6',
            colorError: '#ba1a1a',
            colorWarning: '#cca830',
            colorSuccess: '#52c41a',
            colorInfo: '#583b00',

            colorBgContainer: '#ffffff',
            colorBgLayout: '#fcf9f8',
            colorFillAlter: '#f6f3f2',

            fontFamily: '"Manrope", -apple-system, BlinkMacSystemFont, sans-serif',
            fontSize: 14,
            fontSizeHeading1: 48,
            fontSizeHeading2: 36,
            fontSizeHeading3: 24,
            lineHeight: 1.5,

            padding: 16,
            margin: 16,
            paddingLG: 24,
            marginLG: 24,

            borderRadius: 6,
            borderRadiusLG: 8,
            borderRadiusSM: 4,

            motionUnit: 0.1,
          },
          components: {
            Table: {
              headerBg: '#f6f3f2',
              headerColor: '#54433a',
              rowHoverBg: '#f6f3f2',
              borderColor: '#dac2b6',
            },
            Modal: {
              titleFontSize: 20,
            },
            Drawer: {
              colorBgElevated: '#ffffff',
            },
          },
        }}
      >
        <App {...props} />
      </ConfigProvider>
    );
  },
});
