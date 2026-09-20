jest.mock('expo-router', () => ({ router: { replace: jest.fn() } }));
jest.mock('@/components/app-icon', () => ({ AppIcon: () => null }));
jest.mock('@/state/app-state', () => ({ useAppState: jest.fn() }));
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}));
jest.mock('react-native', () => {
  const actual = jest.requireActual('react-native');
  return {
    ...actual,
    useColorScheme: jest.fn(() => 'light'),
    useWindowDimensions: jest.fn(),
  };
});

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

beforeEach(() => {
  jest.clearAllMocks();
  useWindowDimensionsMock.mockReturnValue({
    width: 1200,
    height: 800,
    scale: 1,
    fontScale: 1,
  });
});

describe('AppNavigation wide RTL edge', () => {
  test('uses the app-local Arabic direction for the rail divider', () => {
    useAppStateMock.mockReturnValue(appState(true, 'ar'));

    const view = render(<AppNavigation activeSegment="today" />);
    const tablist = view.getByRole('tablist');
    const style = StyleSheet.flatten(tablist.props.style);

    expect(tablist.props.accessibilityLabel).toBe('التنقل الرئيسي');
    expect(style.borderLeftWidth).toBe(1);
    expect(style.borderRightWidth).toBe(0);
    expect(view.getByRole('tab', { name: 'الرئيسية' }).props.accessibilityState)
      .toMatchObject({ selected: true });
  });

  test('keeps the divider on the right in English', () => {
    useAppStateMock.mockReturnValue(appState(false, 'en'));

    const view = render(<AppNavigation activeSegment="today" />);
    const tablist = view.getByRole('tablist');
    const style = StyleSheet.flatten(tablist.props.style);

    expect(tablist.props.accessibilityLabel).toBe('Primary navigation');
    expect(style.borderLeftWidth).toBe(0);
    expect(style.borderRightWidth).toBe(1);
  });
});
