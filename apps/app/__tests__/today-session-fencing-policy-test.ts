import fs from 'node:fs';
import path from 'node:path';

const todaySource = fs.readFileSync(
  path.resolve(__dirname, '../src/app/today.tsx'),
  'utf8',
);

describe('Today account-switch fencing policy', () => {
  test('binds rendered recommendations, One Move decisions, and explicit outcome feedback to the active account', () => {
    expect(todaySource).toContain('const activeUserRef = useRef(userId);');
    expect(todaySource).toContain('activeUserRef.current = userId;');
    expect(todaySource).toContain('const [recommendationUserId, setRecommendationUserId]');
    expect(todaySource).toContain('recommendationUserId === userId ? recommendation : null');
    expect(todaySource).toContain('setRecommendationUserId(userId);');
    expect(todaySource).toContain('const actingUserId = userId;');
    expect(todaySource.match(/activeUserRef\.current !== actingUserId/g)?.length ?? 0).toBeGreaterThanOrEqual(4);
    expect(todaySource).toContain('userId: actingUserId');
    expect(todaySource).toContain('const feedbackForUser = activeFeedbackTarget;');
    expect(todaySource).toContain('recordExplicitActionOutcome(actingUserId, feedbackForUser.actionId');
  });

  test('updates the active-account fence during render rather than waiting for a passive effect', () => {
    expect(todaySource).toContain(
      'const activeUserRef = useRef(userId);\n  activeUserRef.current = userId;',
    );
    expect(todaySource).not.toContain(
      "useEffect(() => {\n    activeUserRef.current = userId;\n  }, [userId]);",
    );
  });
});
