import {
  TouchableOpacity,
  Text,
  StyleSheet,
} from 'react-native';

interface Props {
  title: string;
  onPress: () => void;
  disabled?: boolean;
}

export default function AppButton({
  title,
  onPress,
  disabled = false,
}: Props) {
  return (
    <TouchableOpacity
      style={[styles.button, disabled && styles.buttonDisabled]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={[styles.text, disabled && styles.textDisabled]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },

  buttonDisabled: {
    backgroundColor: '#B0B0B0',
  },

  text: {
    color: '#fff',
    fontWeight: 'bold',
  },

  textDisabled: {
    color: '#E5E5EA',
  },
});