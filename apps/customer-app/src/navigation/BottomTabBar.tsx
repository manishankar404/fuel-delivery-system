import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import type { AppStackParamList } from './types';
import { CUSTOMER_TABS, type CustomerTabKey } from './tabs';

type Props = {
  active: CustomerTabKey;
};

export default function BottomTabBar({ active }: Props) {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();

  return (
    <View style={styles.container}>
      {CUSTOMER_TABS.map((tab) => {
        const isActive = tab.key === active;

        return (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, isActive && styles.tabActive]}
            onPress={() => navigation.navigate(tab.key as never)}
            activeOpacity={0.9}
          >
            <Text style={[styles.label, isActive && styles.labelActive]}>{tab.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 8,
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
  },
  tabActive: {
    backgroundColor: '#111827',
  },
  label: {
    fontSize: 12,
    fontWeight: '800',
    color: '#111827',
  },
  labelActive: {
    color: '#FFFFFF',
  },
});

