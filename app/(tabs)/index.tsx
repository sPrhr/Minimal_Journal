import React from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import dbHandler from '../db/dbHandler';
import { useTheme } from '../context/ThemeContext';

const { initDatabase, saveEntry, updateEntry } = dbHandler;

const useJournalEntry = () => {
  const [content, setContent] = React.useState<string>('');
  const [currentEntryId, setCurrentEntryId] = React.useState<number | null>(null);
  const lastTypedRef = React.useRef<Date | null>(null);
  const typingTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  React.useEffect(() => {
    initDatabase();
  }, []);

  const handleTextChange = React.useCallback((text: string) => {
    setContent(text);
    const now = new Date();

    console.log('text changing', text, now.getTime(), lastTypedRef.current?.getTime());
    

    if (!lastTypedRef.current || (now.getTime() - lastTypedRef.current.getTime() > 3 * 60 * 1000)) {
      console.log("here comes the 1st typing");
          
      const fullTime = now.toLocaleTimeString('en-IN', {hour12: false});
      const timeArray = fullTime.split(':');
      const timestamp = `${timeArray[0]}:${timeArray[1]}`;

      const date = now.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }).split('/').reverse().join('-');

      saveEntry(text, timestamp, date)
        .then(result => {
          setCurrentEntryId(result.insertId);
          lastTypedRef.current = now;
          console.log('Saved', text);
        })
        .catch(error => console.error('Error saving entry:', error));
    } else {
      console.log('went the other way');
      
      if (currentEntryId && text.trim()) {
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
        
        typingTimeoutRef.current = setTimeout(() => {
          updateEntry(currentEntryId, text)
            .catch(error => console.error('Error updating entry:', error));
        }, 500);
      }
    }

    lastTypedRef.current = now;
  }, [currentEntryId]);

  return { content, handleTextChange };
};

const JournalInput: React.FC = () => {
  const { content, handleTextChange } = useJournalEntry();
  const { theme, isDarkMode } = useTheme();

  return (
    <TextInput
      style={[
        styles.input,
        {
          color: theme.text,
          backgroundColor: isDarkMode ? '#333' : '#fff',
          borderColor: theme.border,
        }
      ]}
      multiline
      value={content}
      onChangeText={handleTextChange}
      placeholder="Write your thoughts..."
      placeholderTextColor={isDarkMode ? '#999' : '#666'}
    />
  );
};

const Index: React.FC = () => {
  const { theme } = useTheme();
  
  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <JournalInput />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  input: {
    flex: 1,
    fontSize: 16,
    textAlignVertical: 'top',
    padding: 15,
    borderRadius: 8,
  },
});

export default Index;
