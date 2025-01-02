import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface CustomAlertProps {
  visible: boolean;
  message: string;
  onClose: () => void;
}

const CustomAlert: React.FC<CustomAlertProps> = ({ visible, message, onClose }) => {
  const { theme, isDarkMode } = useTheme();

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View style={[
          styles.alertBox,
          { backgroundColor: isDarkMode ? '#1a1a1a' : '#fff' }
        ]}>
          <Text style={[styles.message, { color: theme.text }]}>
            {message}
          </Text>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.primary }]}
            onPress={onClose}
          >
            <Text style={styles.buttonText}>OK</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertBox: {
    width: Dimensions.get('window').width * 0.8,
    padding: 20,
    borderRadius: 12,
    elevation: 5,
  },
  message: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 22,
  },
  button: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default CustomAlert; 