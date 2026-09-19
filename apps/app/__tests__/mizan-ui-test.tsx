jest.mock('@/state/app-state', () => ({ useAppState: jest.fn() }));

import { fireEvent, render } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';

import { ChoiceChip, MizanText, MizanTextInput, PrimaryButton } from '@/components/mizan-ui';
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

  test('numeric text input keeps Latin digit direction and normalizes Arabic digits', async () => {
    const onChangeText = jest.fn();
    const view = await render(
      <MizanTextInput
        accessibilityLabel="رقم"
        keyboardType="decimal-pad"
        onChangeText={onChangeText}
        value=""
      />,
    );
    const input = view.getByLabelText('رقم');
    const style = StyleSheet.flatten(input.props.style);

    expect(style.textAlign).toBe('right');
    expect(style.writingDirection).toBe('ltr');
    await fireEvent.changeText(input, '١٢٫٥');
    expect(onChangeText).toHaveBeenCalledWith('12.5');
  });

  test('LTR identity fields stay left-aligned even when the app locale is RTL', async () => {
    const emailView = await render(
      <MizanTextInput accessibilityLabel="البريد" keyboardType="email-address" value="user@example.com" />,
    );
    const emailStyle = StyleSheet.flatten(emailView.getByLabelText('البريد').props.style);
    expect(emailStyle.textAlign).toBe('left');
    expect(emailStyle.writingDirection).toBe('ltr');

    const passwordView = await render(
      <MizanTextInput accessibilityLabel="كلمة المرور" secureTextEntry value="password123" />,
    );
    const passwordStyle = StyleSheet.flatten(passwordView.getByLabelText('كلمة المرور').props.style);
    expect(passwordStyle.textAlign).toBe('left');
    expect(passwordStyle.writingDirection).toBe('ltr');
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

    expect(chip.props.accessibilityState).toMatchObject({ selected: true });
  });
});
