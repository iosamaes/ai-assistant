import fs from 'node:fs';
import path from 'node:path';

const experimentsSource = fs.readFileSync(
  path.resolve(__dirname, '../src/app/experiments.tsx'),
  'utf8',
);

describe('Experiments RTL layout policy', () => {
  test('mirrors wrapped experiment grids from the app locale', () => {
    for (const styleName of ['templateGrid', 'planStats', 'metadataGrid', 'comparisonGrid']) {
      expect(experimentsSource).toContain(
        `style={[styles.${styleName}, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}`,
      );
    }
  });
});
