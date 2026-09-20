import fs from 'node:fs';
import path from 'node:path';

const whatIfSource = fs.readFileSync(
  path.resolve(__dirname, '../src/app/what-if.tsx'),
  'utf8',
);

describe('What If RTL range layout policy', () => {
  test('mirrors the bounded 0–100 range band, current marker, and scale endpoints from app RTL state', () => {
    expect(whatIfSource).toContain("right: isRtl ? percent(bandStart) : undefined");
    expect(whatIfSource).toContain("right: isRtl ? percent(current) : undefined");
    expect(whatIfSource).toContain("marginRight: isRtl ? -1.5 : 0");
    expect(whatIfSource).toContain(
      "style={[styles.scaleRow, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}",
    );
    expect(whatIfSource).toContain('isRtl={isRtl}');
  });
});
