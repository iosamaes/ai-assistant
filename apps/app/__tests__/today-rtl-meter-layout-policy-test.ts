import fs from 'node:fs';
import path from 'node:path';

const todaySource = fs.readFileSync(
  path.resolve(__dirname, '../src/app/today.tsx'),
  'utf8',
);

describe('Today RTL quantitative-meter layout policy', () => {
  test('mirrors known-value state and balance meter fills from the app-local RTL state', () => {
    expect(todaySource).toContain("alignSelf: isRtl ? 'flex-end' : 'flex-start'");
    expect(todaySource).toContain('isRtl: boolean }');
    expect(todaySource).toContain(
      '<SignalMeter value={value} trackColor={palette.border} fillColor={palette.accent} isRtl={isRtl} />',
    );
    expect(todaySource).toContain('isRtl={isRtl}');
  });
});
