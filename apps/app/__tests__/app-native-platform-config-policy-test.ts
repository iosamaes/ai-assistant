import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const appConfig = JSON.parse(
  readFileSync(resolve(__dirname, '../app.json'), 'utf8'),
) as {
  expo?: {
    orientation?: string;
    userInterfaceStyle?: string;
    ios?: {
      supportsTablet?: boolean;
    };
  };
};

describe('native platform app configuration', () => {
  test('ships native iPad support for the responsive tablet product contract', () => {
    expect(appConfig.expo?.ios?.supportsTablet).toBe(true);
  });

  test('keeps responsive orientation and system appearance enabled', () => {
    expect(appConfig.expo?.orientation).toBe('default');
    expect(appConfig.expo?.userInterfaceStyle).toBe('automatic');
  });
});
