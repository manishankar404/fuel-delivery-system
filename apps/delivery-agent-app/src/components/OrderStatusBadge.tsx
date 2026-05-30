import { StyleSheet, Text, View } from 'react-native';

import { getOrderStatusBadgeMeta } from '../shared/orderStatus';

type Props = {
  status: unknown;
};

export default function OrderStatusBadge({ status }: Props) {
  const meta = getOrderStatusBadgeMeta(status);

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: meta.backgroundColor,
          borderColor: meta.borderColor ?? meta.backgroundColor,
        },
      ]}
    >
      <Text style={[styles.text, { color: meta.textColor }]}>{meta.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 999,
    borderWidth: 1,
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },
});
