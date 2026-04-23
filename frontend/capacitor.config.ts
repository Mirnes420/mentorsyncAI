import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.yourname.mentorsync',
  appName: 'MentorSync',
  webDir: 'out', // Capacitor still needs this, even if empty
  server: {
    url: 'https://your-vercel-link.vercel.app', // YOUR LIVE LINK
    cleartext: true
  }
};

export default config;