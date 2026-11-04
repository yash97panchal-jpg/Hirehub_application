import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.hirehub.app',
  appName: 'HireHub',
  webDir: 'Job Portal Web App/dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
