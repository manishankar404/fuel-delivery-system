import { useMemo, useState } from 'react';
import {
  Alert,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import OrderStatusBadge from './OrderStatusBadge';
import OrderLifecycleProgress from './OrderLifecycleProgress';

import type { DeliveryOrder } from '../types/order';

type Props = {
  order: DeliveryOrder;
  isBusy: boolean;
  isActive?: boolean;
  onUpdateStatus: (orderId: string, status: 'out_for_delivery' | 'delivered') => Promise<void>;
};

function canNavigateTo(order: DeliveryOrder) {
  return typeof order.latitude === 'number' && typeof order.longitude === 'number';
}

export default function AssignedOrderCard({
  order,
  isBusy,
  isActive = false,
  onUpdateStatus,
}: Props) {
  const [accepted, setAccepted] = useState<boolean>(false);
  const [pickupComplete, setPickupComplete] = useState<boolean>(false);

  const title = order.fuel_types?.name ?? 'Fuel Order';
  const customer = order.profiles?.email ?? '—';
  const address = order.delivery_address ?? '—';

  const status = order.status;
  const isOutForDelivery = status === 'out_for_delivery';
  const isDelivered = status === 'delivered';

  const primaryMeta = useMemo(() => `${order.quantity_liters} L`, [order.quantity_liters]);
  const priceMeta = useMemo(() => {
    return typeof order.total_price === 'number' ? `₹${order.total_price}` : null;
  }, [order.total_price]);

  const canStartDelivery =
    accepted &&
    pickupComplete &&
    !isBusy &&
    !isOutForDelivery &&
    !isDelivered;

  const onNavigate = async () => {
    if (!canNavigateTo(order)) {
      Alert.alert('No location', 'This order has no delivery coordinates.');
      return;
    }

    const url = `https://www.google.com/maps/dir/?api=1&destination=${order.latitude},${order.longitude}`;
    const supported = await Linking.canOpenURL(url);
    if (!supported) {
      Alert.alert('Unable to open maps');
      return;
    }

    await Linking.openURL(url);
  };

  return (
    <View style={[styles.card, isActive && styles.cardActive]}>
      <View style={styles.topRow}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        <OrderStatusBadge status={status} />
      </View>

      <View style={styles.metaGrid}>
        <View style={styles.metaItem}>
          <Text style={styles.metaLabel}>Customer</Text>
          <Text style={styles.metaValue} numberOfLines={1}>
            {customer}
          </Text>
        </View>
        <View style={styles.metaItem}>
          <Text style={styles.metaLabel}>Quantity</Text>
          <Text style={styles.metaValue}>{primaryMeta}</Text>
        </View>
        <View style={styles.metaItem}>
          <Text style={styles.metaLabel}>Total</Text>
          <Text style={styles.metaValue}>{priceMeta ?? '—'}</Text>
        </View>
      </View>

      <View style={styles.addressBlock}>
        <Text style={styles.metaLabel}>Delivery address</Text>
        <Text style={styles.addressValue} numberOfLines={2}>
          {address}
        </Text>
      </View>

      <OrderLifecycleProgress status={status} />

      <View style={styles.checklist}>
        <Text style={styles.checklistTitle}>Delivery checklist</Text>
        <TouchableOpacity
          onPress={() => setAccepted((v) => !v)}
          style={[styles.checkItem, accepted && styles.checkItemDone]}
          disabled={isBusy}
        >
          <Text style={styles.checkText}>{accepted ? '✓' : '○'} Delivery accepted</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setPickupComplete((v) => !v)}
          style={[styles.checkItem, pickupComplete && styles.checkItemDone]}
          disabled={isBusy}
        >
          <Text style={styles.checkText}>
            {pickupComplete ? '✓' : '○'} Pickup complete
          </Text>
        </TouchableOpacity>
        <Text style={styles.checkHint}>
          Checklist is for your workflow only (status updates remain the official system states).
        </Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.btn, styles.btnGhost]}
          onPress={onNavigate}
          disabled={isBusy || !canNavigateTo(order)}
        >
          <Text style={styles.btnGhostText}>Navigate</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.btn, styles.btnPrimary, !canStartDelivery && styles.btnDisabled]}
          onPress={() => onUpdateStatus(order.id, 'out_for_delivery')}
          disabled={!canStartDelivery}
        >
          <Text style={styles.btnPrimaryText}>Out for delivery</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.btn, styles.btnSuccess, (isBusy || !isOutForDelivery || isDelivered) && styles.btnDisabled]}
          onPress={() => onUpdateStatus(order.id, 'delivered')}
          disabled={isBusy || !isOutForDelivery || isDelivered}
        >
          <Text style={styles.btnPrimaryText}>Mark delivered</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
  },
  cardActive: {
    borderColor: '#F59E0B',
    backgroundColor: '#FFFBEB',
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
    fontWeight: '900',
    color: '#111827',
  },
  metaGrid: {
    marginTop: 10,
    flexDirection: 'row',
    gap: 10,
  },
  metaItem: {
    flex: 1,
    minWidth: 0,
  },
  metaLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#6B7280',
    marginBottom: 4,
  },
  metaValue: {
    fontSize: 13,
    fontWeight: '800',
    color: '#111827',
  },
  addressBlock: {
    marginTop: 12,
  },
  addressValue: {
    fontSize: 13,
    color: '#111827',
    fontWeight: '700',
  },
  checklist: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  checklistTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: '#111827',
    marginBottom: 8,
  },
  checkItem: {
    paddingVertical: 8,
  },
  checkItemDone: {
    opacity: 0.9,
  },
  checkText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
  },
  checkHint: {
    marginTop: 6,
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '600',
  },
  actions: {
    marginTop: 12,
    flexDirection: 'row',
    gap: 10,
  },
  btn: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnDisabled: {
    opacity: 0.6,
  },
  btnGhost: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  btnGhostText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#111827',
  },
  btnPrimary: {
    backgroundColor: '#111827',
  },
  btnSuccess: {
    backgroundColor: '#16A34A',
  },
  btnPrimaryText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#FFFFFF',
  },
});
