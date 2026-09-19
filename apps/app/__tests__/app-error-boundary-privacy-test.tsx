import type { ErrorInfo, PropsWithChildren } from 'react';

import { AppErrorBoundary } from '@/components/app-error-boundary';

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
});
