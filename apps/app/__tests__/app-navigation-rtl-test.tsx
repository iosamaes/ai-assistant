jest.mock('expo-router', () => ({ router: { replace: jest.fn() } }));
jest.mock('@/components/app-icon', () => ({ AppIcon: () => null }));
jest.mock('@/state/app-state', () => ({ useAppState: jest.fn() }));
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}));
jest.mock('react-native/Libraries/Utilities/useWindowDimensions', () => ({
  __esModule: true,
  default: jest.fn(),
}));

import { render } from '@testing-library/react-native';
import { StyleSheet, useWindowDimensions } from 'react-native';

import { AppNavigation } from '@/components/app-navigation';
import { useAppState } from '@/state/app-state';

const useAppStateMock = jest.mocked(useAppState);
const useWindowDimensionsMock = jest.mocked(useWindowDimensions);

function appState(isRtl: boolean, locale: 'ar' | 'en') {
  return {
    isRtl,
    locale,
    t: (key: string) => key === 'appName' ? 'MIZAN' : key,
  } as unknown as ReturnType<typeof useAppState>;
}

function setViewport(width: number, height: number) {
  useWindowDimensionsMock.mockReturnValue({
    width,
    height,
    scale: 1,
    fontScale: 1,
  });
}

beforeEach(() => {
  jest.clearAllMocks();
  setViewport(834, 1194);
});

describe('AppNavigation adaptive RTL edge', () => {
  test('uses the app-local Arabic direction for the tablet rail divider', async () => {
    useAppStateMock.mockReturnValue(appState(true, 'ar'));

    const view = await render(<AppNavigation activeSegment="today" />);
    const tablist = view.root!;
    const style = StyleSheet.flatten(tablist.props.style);

    expect(tablist.props.accessibilityLabel).toBe('التنقل الرئيسي');
    expect(style.borderTopWidth).toBeUndefined();
    expect(style.borderLeftWidth).toBe(1);
    expect(style.borderRightWidth).toBe(0);
    expect(view.getByRole('tab', { name: 'الرئيسية' }).props.accessibilityState)
      .toMatchObject({ selected: true });
  });

  test('keeps the tablet rail divider on the right in English', async () => {
    useAppStateMock.mockReturnValue(appState(false, 'en'));

    const view = await render(<AppNavigation activeSegment="today" />);
    const tablist = view.root!;
    const style = StyleSheet.flatten(tablist.props.style);

    expect(tablist.props.accessibilityLabel).toBe('Primary navigation');
    expect(style.borderTopWidth).toBeUndefined();
    expect(style.borderLeftWidth).toBe(0);
    expect(style.borderRightWidth).toBe(1);
  });

  test('keeps the persistent bottom navigation on a common phone', async () => {
    setViewport(390, 844);
    useAppStateMock.mockReturnValue(appState(false, 'en'));

    const view = await render(<AppNavigation activeSegment="one-move" />);
    const tablist = view.root!;
    const style = StyleSheet.flatten(tablist.props.style);

    expect(style.borderTopWidth).toBe(1);
    expect(style.borderLeftWidth).toBe(0);
    expect(style.borderRightWidth).toBe(0);
    expect(view.getByRole('tab', { name: 'One Move' }).props.accessibilityState)
      .toMatchObject({ selected: true });
  });
});
