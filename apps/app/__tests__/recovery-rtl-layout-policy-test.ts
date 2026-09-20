import fs from 'node:fs';
import path from 'node:path';

const recoverySource = fs.readFileSync(
  path.resolve(__dirname, '../src/app/recovery.tsx'),
  'utf8',
);

describe('Recovery RTL layout policy', () => {
  test('mirrors summary statistics and ordered step progress from the app locale', () => {
    expect(recoverySource).toContain(
      "{ borderTopColor: palette.border, flexDirection: isRtl ? 'row-reverse' : 'row' }",
    );
    expect(recoverySource).toContain(
      "style={[styles.progressTrack, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}",
    );
  });
});
