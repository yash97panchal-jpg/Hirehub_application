import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.hirehub.jobportal',
  appName: 'HireHub',
  webDir: 'dist',
  backgroundColor: '#FFFFFF',
  server: {
    androidScheme: 'https'
  },
  ios: {
    contentInset: 'always'
  },
  android: {
    allowMixedContent: false
  }
};

export default config;
