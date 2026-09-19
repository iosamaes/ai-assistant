import { render } from '@testing-library/react-native';
import type { ErrorInfo, PropsWithChildren, ReactElement } from 'react';

import { AppErrorBoundary } from '@/components/app-error-boundary';
import { useAppState } from '@/state/app-state';

jest.mock('@/state/app-state', () => ({
  useAppState: jest.fn(),
}));

const useAppStateMock = jest.mocked(useAppState);

describe('AppErrorBoundary privacy logging', () => {
  test('does not serialize arbitrary Error fields into the development diagnostic', () => {
    const log = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    const error = new Error('private backend response');
    error.name = 'user@example.com';
    const info = { componentStack: '\n    at SafeComponent' } as ErrorInfo;
    const boundary = new AppErrorBoundary({ children: null } as PropsWithChildren);

    boundary.componentDidCatch(error, info);

    expect(log).toHaveBeenCalledWith('MIZAN render error', {
      componentStack: info.componentStack,
    });
    expect(JSON.stringify(log.mock.calls)).not.toContain(error.name);
    expect(JSON.stringify(log.mock.calls)).not.toContain(error.message);
    log.mockRestore();
  });

  test('renders the fallback in the active app locale instead of the device RTL locale', () => {
    useAppStateMock.mockReturnValue({
      isRtl: true,
      locale: 'ar',
    } as unknown as ReturnType<typeof useAppState>);
    const boundary = new AppErrorBoundary({ children: null } as PropsWithChildren);
    boundary.state = { hasError: true };

    const view = render(boundary.render() as ReactElement);

    expect(view.getByText('تعذر عرض هذه الشاشة')).toBeTruthy();
    expect(view.getByText('إعادة المحاولة')).toBeTruthy();
  });
});
