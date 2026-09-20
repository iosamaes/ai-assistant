import { SymbolView } from 'expo-symbols';

export type AppIconName =
  | 'home'
  | 'lifeMap'
  | 'oneMove'
  | 'insights'
  | 'more'
  | 'recovery'
  | 'connection'
  | 'work'
  | 'margin'
  | 'energy'
  | 'mentalLoad'
  | 'overload'
  | 'trendUp'
  | 'trendFlat'
  | 'trendDown'
  | 'evidence'
  | 'pattern'
  | 'hypothesis'
  | 'confidence'
  | 'values'
  | 'reflection'
  | 'experiment'
  | 'season'
  | 'integration'
  | 'privacy'
  | 'notification'
  | 'personalization';

const symbols = {
  home: { ios: 'house.fill', android: 'home', web: 'home' },
  lifeMap: { ios: 'map.fill', android: 'explore', web: 'explore' },
  oneMove: { ios: 'bolt.fill', android: 'bolt', web: 'bolt' },
  insights: { ios: 'chart.bar.fill', android: 'insights', web: 'insights' },
  more: { ios: 'ellipsis.circle.fill', android: 'more_horiz', web: 'more_horiz' },
  recovery: { ios: 'bed.double.fill', android: 'bed', web: 'bed' },
  connection: { ios: 'person.2.fill', android: 'groups', web: 'groups' },
  work: { ios: 'briefcase.fill', android: 'work', web: 'work' },
  margin: { ios: 'clock.fill', android: 'schedule', web: 'schedule' },
  energy: { ios: 'bolt.heart.fill', android: 'electric_bolt', web: 'electric_bolt' },
  mentalLoad: { ios: 'brain.head.profile', android: 'psychology', web: 'psychology' },
  overload: { ios: 'exclamationmark.triangle.fill', android: 'warning', web: 'warning' },
  trendUp: { ios: 'arrow.up.right', android: 'trending_up', web: 'trending_up' },
  trendFlat: { ios: 'minus', android: 'trending_flat', web: 'trending_flat' },
  trendDown: { ios: 'arrow.down.right', android: 'trending_down', web: 'trending_down' },
  evidence: { ios: 'checkmark.seal.fill', android: 'fact_check', web: 'fact_check' },
  pattern: { ios: 'chart.line.uptrend.xyaxis', android: 'timeline', web: 'timeline' },
  hypothesis: { ios: 'lightbulb.fill', android: 'lightbulb', web: 'lightbulb' },
  confidence: { ios: 'checkmark.shield.fill', android: 'verified', web: 'verified' },
  values: { ios: 'heart.fill', android: 'favorite', web: 'favorite' },
  reflection: { ios: 'sparkles', android: 'auto_awesome', web: 'auto_awesome' },
  experiment: { ios: 'flask.fill', android: 'science', web: 'science' },
  season: { ios: 'calendar', android: 'calendar_month', web: 'calendar_month' },
  integration: { ios: 'link', android: 'link', web: 'link' },
  privacy: { ios: 'lock.shield.fill', android: 'privacy_tip', web: 'privacy_tip' },
  notification: { ios: 'bell.fill', android: 'notifications', web: 'notifications' },
  personalization: { ios: 'slider.horizontal.3', android: 'tune', web: 'tune' },
} as const;

interface AppIconProps {
  name: AppIconName;
  color: string;
  size?: number;
}

/**
 * Shared production icons are decorative by default. Their meaning is exposed by the
 * adjacent text or the labelled parent control, so keeping the glyph itself out of the
 * accessibility tree prevents duplicate/unlabelled announcements across platforms.
 */
export function AppIcon({ name, color, size = 22 }: AppIconProps) {
  return (
    <SymbolView
      accessible={false}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      name={symbols[name]}
      size={size}
      tintColor={color}
    />
  );
}
