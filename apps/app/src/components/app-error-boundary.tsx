import { Component, ErrorInfo, PropsWithChildren } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

interface State {
  hasError: boolean;
}

export class AppErrorBoundary extends Component<PropsWithChildren, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (__DEV__) {
      console.error('MIZAN render error', error, info.componentStack);
    }
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <View style={styles.container} accessibilityRole="alert">
        <Text style={styles.title}>تعذر عرض هذه الشاشة</Text>
        <Text style={styles.body}>حدث خطأ غير متوقع. يمكنك المحاولة مرة أخرى بدون فقد قراراتك.</Text>
        <Pressable
          accessibilityRole="button"
          onPress={() => this.setState({ hasError: false })}
          style={styles.button}>
          <Text style={styles.buttonText}>إعادة المحاولة</Text>
        </Pressable>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, gap: 12, backgroundColor: '#F7F7F3' },
  title: { fontSize: 22, fontWeight: '700', textAlign: 'right', color: '#18201C' },
  body: { fontSize: 16, lineHeight: 25, textAlign: 'right', color: '#65706A' },
  button: { minHeight: 48, borderRadius: 16, backgroundColor: '#2F6B57', alignItems: 'center', justifyContent: 'center' },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});
