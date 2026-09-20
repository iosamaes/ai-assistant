import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const appRoot = resolve(__dirname, '..');
const appConfig = JSON.parse(
  readFileSync(resolve(appRoot, 'app.json'), 'utf8'),
) as {
  expo?: {
    icon?: string;
    orientation?: string;
    userInterfaceStyle?: string;
    ios?: {
      icon?: string;
      supportsTablet?: boolean;
    };
    android?: {
      adaptiveIcon?: {
        backgroundColor?: string;
        foregroundImage?: string;
        backgroundImage?: string;
        monochromeImage?: string;
      };
    };
    web?: {
      favicon?: string;
    };
    plugins?: unknown[];
  };
};

function gitBlobSha(relativePath: string): string {
  const content = readFileSync(resolve(appRoot, relativePath));
  return createHash('sha1')
    .update(`blob ${content.length}\0`)
    .update(content)
    .digest('hex');
}

function splashConfig() {
  const entry = appConfig.expo?.plugins?.find(
    (plugin) => Array.isArray(plugin) && plugin[0] === 'expo-splash-screen',
  );
  if (!Array.isArray(entry) || typeof entry[1] !== 'object' || entry[1] === null) return undefined;
  return entry[1] as {
    backgroundColor?: string;
    image?: string;
    imageWidth?: number;
    dark?: {
      backgroundColor?: string;
      image?: string;
    };
  };
}

const EXPO_STARTER_ASSET_SHAS = new Set([
  '67c777a454236bef606387cbcfade762c0d3190a', // icon.png
  '3a9e5016dca4804f37ba410ba49e70055e1ccad2', // android foreground
  '5ffefc5bb57a3d7b39ec6ff4e96979226522cc49', // android background
  '77484ebdbca253297baea4a7d416233aa47a45c0', // android monochrome
  '408bd746615785760b09e6f23fa8378d3e614331', // favicon
  '6b1642a0b70cd2c80d81f959ec130e5bad33489b', // Expo splash/logo
]);

const BRAND_ASSETS = [
  'assets/images/icon.png',
  'assets/images/android-icon-foreground.png',
  'assets/images/android-icon-monochrome.png',
  'assets/images/favicon.png',
  'assets/images/splash-icon.png',
  'assets/images/splash-icon-dark.png',
];

describe('native platform app configuration', () => {
  test('ships native iPad support for the responsive tablet product contract', () => {
    expect(appConfig.expo?.ios?.supportsTablet).toBe(true);
  });

  test('keeps responsive orientation and system appearance enabled', () => {
    expect(appConfig.expo?.orientation).toBe('default');
    expect(appConfig.expo?.userInterfaceStyle).toBe('automatic');
  });

  test('uses MIZAN-owned app icon surfaces instead of Expo starter overrides', () => {
    expect(appConfig.expo?.icon).toBe('./assets/images/icon.png');
    expect(appConfig.expo?.ios?.icon).toBeUndefined();
    expect(appConfig.expo?.android?.adaptiveIcon).toEqual({
      backgroundColor: '#245E4A',
      foregroundImage: './assets/images/android-icon-foreground.png',
      monochromeImage: './assets/images/android-icon-monochrome.png',
    });
    expect(appConfig.expo?.web?.favicon).toBe('./assets/images/favicon.png');
    expect(existsSync(resolve(appRoot, 'assets/expo.icon'))).toBe(false);
    expect(existsSync(resolve(appRoot, 'assets/images/android-icon-background.png'))).toBe(false);

    for (const asset of BRAND_ASSETS) {
      expect(EXPO_STARTER_ASSET_SHAS.has(gitBlobSha(asset))).toBe(false);
    }
  });

  test('keeps native splash branding aligned with the designed light and dark palettes', () => {
    expect(splashConfig()).toEqual({
      backgroundColor: '#F4F2EC',
      image: './assets/images/splash-icon.png',
      dark: {
        image: './assets/images/splash-icon-dark.png',
        backgroundColor: '#0C1210',
      },
      imageWidth: 96,
    });
  });
});
