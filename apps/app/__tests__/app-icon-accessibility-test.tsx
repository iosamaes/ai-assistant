jest.mock('expo-symbols', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    SymbolView: (props: Record<string, unknown>) => React.createElement(View, { ...props, testID: 'symbol' }),
  };
});

import { render } from '@testing-library/react-native';

import { AppIcon } from '@/components/app-icon';

describe('AppIcon accessibility', () => {
  test('keeps decorative glyphs out of the accessibility tree', () => {
    const view = render(<AppIcon name="home" color="#123456" />);
    const symbol = view.getByTestId('symbol');

    expect(symbol.props.accessible).toBe(false);
    expect(symbol.props.accessibilityElementsHidden).toBe(true);
    expect(symbol.props.importantForAccessibility).toBe('no-hide-descendants');
  });
});
