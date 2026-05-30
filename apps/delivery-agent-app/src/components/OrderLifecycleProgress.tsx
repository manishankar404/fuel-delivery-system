import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import {
  getOrderLifecycleIndex,
  getOrderLifecycleSteps,
} from '../shared/orderStatus';

type Props = {
  status: unknown;
  compact?: boolean;
};

export default function OrderLifecycleProgress({ status, compact = true }: Props) {
  const steps = useMemo(() => getOrderLifecycleSteps(), []);
  const activeIndex = getOrderLifecycleIndex(status);

  return (
    <View style={styles.container}>
      {steps.map((step, index) => {
        const isCompleted = index < activeIndex;
        const isActive = index === activeIndex;

        return (
          <View key={step.key} style={styles.step}>
            <View style={styles.dotRow}>
              <View
                style={[
                  styles.dot,
                  isCompleted && styles.dotCompleted,
                  isActive && styles.dotActive,
                ]}
              />
              {index !== steps.length - 1 ? (
                <View
                  style={[
                    styles.line,
                    (isCompleted || isActive) && styles.lineCompleted,
                  ]}
                />
              ) : null}
            </View>
            <Text
              style={[
                styles.label,
                compact && styles.labelCompact,
                isActive && styles.labelActive,
              ]}
              numberOfLines={1}
            >
              {step.label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 6,
    marginTop: 10,
  },
  step: {
    flex: 1,
    minWidth: 0,
  },
  dotRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#E5E7EB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  dotCompleted: {
    backgroundColor: '#111827',
    borderColor: '#111827',
  },
  dotActive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#111827',
    borderWidth: 2,
  },
  line: {
    height: 2,
    flex: 1,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 4,
    borderRadius: 2,
  },
  lineCompleted: {
    backgroundColor: '#111827',
  },
  label: {
    marginTop: 6,
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '700',
    textAlign: 'center',
  },
  labelCompact: {
    fontSize: 10,
  },
  labelActive: {
    color: '#111827',
  },
});

