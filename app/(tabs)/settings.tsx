import React from 'react';
import {StyleSheet, View, Text, Switch, TouchableOpacity, Alert} from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import dbHandler from '../db/dbHandler';
import type { Entry } from '../db/dbHandler';
import { useTheme } from '../context/ThemeContext';

const SettingsScreen: React.FC = () => {
  const { isDarkMode, toggleTheme, theme, isSystemTheme, setIsSystemTheme } = useTheme();

  const exportData = async (format: 'json' | 'csv') => {
    try {
      // Get all entries
      const entries = await dbHandler.getAllEntries();
      let content: string;
      let fileName: string;

      if (format === 'json') {
        content = JSON.stringify(entries, null, 2);
        fileName = 'journal_entries.json';
      } else {
        // Create CSV content
        const headers = 'Date,Time,Content\n';
        const csvContent = entries.map((entry: Entry) => {
          const date = entry.timestamp.split(' ')[0];
          const time = entry.timestamp.split(' ')[1];
          // Escape commas and quotes in content
          const escapedContent = entry.content.replace(/"/g, '""');
          return `${date},${time},"${escapedContent}"`;
        }).join('\n');
        content = headers + csvContent;
        fileName = 'journal_entries.csv';
      }

      // Create temporary file
      const filePath = `${FileSystem.documentDirectory}${fileName}`;
      await FileSystem.writeAsStringAsync(filePath, content);

      // Share file
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(filePath, {
          mimeType: format === 'json' ? 'application/json' : 'text/csv',
          dialogTitle: 'Export Journal Entries',
          UTI: format === 'json' ? 'public.json' : 'public.comma-separated-values-text'
        });
      }
    } catch (error) {
      console.error('Export error:', error);
      Alert.alert('Export Failed', 'Failed to export entries. Please try again.');
    }
  };

  const importData = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/json', 'text/csv']
      });

      if (!result.canceled) {
        const content = await FileSystem.readAsStringAsync(result.assets[0].uri);
        
        if (result.assets[0].name.endsWith('.json')) {
          const entries = JSON.parse(content);
          await dbHandler.importEntries(entries);
        } else if (result.assets[0].name.endsWith('.csv')) {
          const lines = content.split('\n');
          const entries = lines.slice(1).map(line => {
            const [date, time, content] = line.split(',');
            return {
              timestamp: `${date} ${time}`,
              content: content.replace(/(^"|"$)/g, ''),
              date: date
            };
          });
          await dbHandler.importEntries(entries);
        }

        Alert.alert('Success', 'Entries imported successfully!');
      }
    } catch (error) {
      console.error('Import error:', error);
      Alert.alert('Import Failed', 'Failed to import entries. Please check the file format.');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Appearance</Text>
        <View style={[styles.settingItem, { borderBottomColor: theme.border }]}>
          <Text style={[styles.settingLabel, { color: theme.text }]}>Use System Theme</Text>
          <Switch
            value={isSystemTheme}
            onValueChange={setIsSystemTheme}
          />
        </View>
        {!isSystemTheme && (
          <View style={[styles.settingItem, { borderBottomColor: theme.border }]}>
            <Text style={[styles.settingLabel, { color: theme.text }]}>Dark Mode</Text>
            <Switch
              value={isDarkMode}
              onValueChange={toggleTheme}
            />
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Data Management</Text>
        <View style={styles.buttonGroup}>
          <TouchableOpacity 
            style={[styles.button, { backgroundColor: theme.primary }]}
            onPress={() => exportData('json')}
          >
            <Text style={styles.buttonText}>Export as JSON</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, { backgroundColor: theme.primary }]}
            onPress={() => exportData('csv')}
          >
            <Text style={styles.buttonText}>Export as CSV</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, { backgroundColor: theme.secondary }]}
            onPress={importData}
          >
            <Text style={styles.buttonText}>Import Data</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 30,
    marginTop: 10,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  settingLabel: {
    fontSize: 16,
  },
  buttonGroup: {
    gap: 12,
  },
  button: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SettingsScreen; 