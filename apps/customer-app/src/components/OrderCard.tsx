import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { ReactNode } from 'react';

import OrderStatusBadge from './OrderStatusBadge';

type Props = {
  title: string;
  status: unknown;
  primaryMeta: string;
  secondaryMeta?: string;
  footerLeft?: ReactNode;
  footerRight?: ReactNode;
  onPress?: () => void;
};

export default function OrderCard({
  title,
  status,
  primaryMeta,
  secondaryMeta,
  footerLeft,
  footerRight,
  onPress,
}: Props) {
  if (onPress) {
    return (
      <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
        <View style={styles.topRow}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          <OrderStatusBadge status={status} />
        </View>

        <Text style={styles.primaryMeta}>{primaryMeta}</Text>
        {secondaryMeta ? (
          <Text style={styles.secondaryMeta}>{secondaryMeta}</Text>
        ) : null}

        {(footerLeft || footerRight) && (
          <View style={styles.footerRow}>
            <View style={styles.footerLeft}>{footerLeft}</View>
            <View style={styles.footerRight}>{footerRight}</View>
          </View>
        )}
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        <OrderStatusBadge status={status} />
      </View>

      <Text style={styles.primaryMeta}>{primaryMeta}</Text>
      {secondaryMeta ? <Text style={styles.secondaryMeta}>{secondaryMeta}</Text> : null}

      {(footerLeft || footerRight) && (
        <View style={styles.footerRow}>
          <View style={styles.footerLeft}>{footerLeft}</View>
          <View style={styles.footerRight}>{footerRight}</View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  title: {
    flex: 1,
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },
  primaryMeta: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  secondaryMeta: {
    marginTop: 4,
    fontSize: 13,
    color: '#6B7280',
  },
  footerRow: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  footerLeft: {
    flex: 1,
  },
  footerRight: {
    alignItems: 'flex-end',
  },
});
