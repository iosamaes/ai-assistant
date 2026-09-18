jest.mock('@/state/app-state', () => ({ useAppState: jest.fn() }));

import { fireEvent, render } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';

import { ChoiceChip, MizanText, PrimaryButton } from '@/components/mizan-ui';
import { useAppState } from '@/state/app-state';

const useAppStateMock = jest.mocked(useAppState);

beforeEach(() => {
  useAppStateMock.mockReturnValue({ isRtl: true } as ReturnType<typeof useAppState>);
});

describe('shared presentation primitives', () => {
  test('MizanText mirrors text alignment from the active reading direction', async () => {
    const view = await render(<MizanText>مرحبا</MizanText>);
    const text = view.getByText('مرحبا');
    const style = StyleSheet.flatten(text.props.style);

    expect(style.textAlign).toBe('right');
  });

  test('PrimaryButton exposes accessible disabled state and blocks presses', async () => {
    const onPress = jest.fn();
    const view = await render(<PrimaryButton label="حفظ" onPress={onPress} disabled />);
    const button = view.getByRole('button', { name: 'حفظ' });

    expect(button.props.accessibilityState).toEqual({ disabled: true });
    await fireEvent.press(button);
    expect(onPress).not.toHaveBeenCalled();
  });

  test('ChoiceChip exposes selection semantics to assistive technology', async () => {
    const view = await render(<ChoiceChip label="English" selected onPress={jest.fn()} />);
    const chip = view.getByRole('button', { name: 'English' });

    expect(chip.props.accessibilityState).toEqual({ selected: true });
  });
});
