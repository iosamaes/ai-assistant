import fs from 'node:fs';
import path from 'node:path';

const source = fs.readFileSync(
  path.resolve(__dirname, '../src/app/life-seasons.tsx'),
  'utf8',
);

describe('Life Seasons account-switch fencing policy', () => {
  test('synchronizes active-user identity during render before passive reset effects', () => {
    const refDeclaration = source.indexOf('const activeUserRef = useRef(userId);');
    const renderSync = source.indexOf('activeUserRef.current = userId;');
    const resetEffect = source.indexOf('useEffect(() => {', renderSync);

    expect(refDeclaration).toBeGreaterThanOrEqual(0);
    expect(renderSync).toBeGreaterThan(refDeclaration);
    expect(resetEffect).toBeGreaterThan(renderSync);
  });

  test('requires load and save completions to match both request generation and active account', () => {
    expect(source).toContain('loadRequestRef.current === requestId && activeUserRef.current === requestedUserId');
    expect(source).toContain('saveRequestRef.current === requestId && activeUserRef.current === requestedUserId');
    expect(source).toContain('if (!requestIsCurrent()) return;');
  });

  test('does not expose or save a previous account draft during the render-to-effect switch window', () => {
    expect(source).toContain('const [selectedSeasonUserId, setSelectedSeasonUserId] = useState<string | null>(userId);');
    expect(source).toContain("const visibleTargets = stateUserId === userId ? targets : {};");
    expect(source).toContain("const visibleSelectedSeason = selectedSeasonUserId === userId ? selectedSeason : (lifeSeason ?? 'balanced');");
    expect(source).toContain('const draftReadyForActiveUser = Boolean(userId) && stateUserId === userId && selectedSeasonUserId === userId;');
    expect(source).toContain('const controlsDisabled = !draftReadyForActiveUser || loadStatus === \'loading\' || saveStatus === \'saving\';');
    expect(source).toContain('stateUserId !== requestedUserId ||');
    expect(source).toContain('selectedSeasonUserId !== requestedUserId');
    expect(source).toContain('const seasonToSave = visibleSelectedSeason;');
    expect(source).toContain('Object.entries(visibleTargets)');
    expect(source).toContain('selected={visibleSelectedSeason === season}');
  });
});
