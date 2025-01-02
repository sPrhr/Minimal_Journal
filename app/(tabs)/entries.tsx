import React from 'react';
import { StyleSheet, Text, View, ScrollView, Button, TouchableOpacity, Alert, Platform, StatusBar } from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import { LinearGradient } from 'expo-linear-gradient';
import dbHandler from '../db/dbHandler';
import type { Entry } from '../db/dbHandler';
import { useTheme } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import CustomAlert from '../components/CustomAlert';

// Add interface for marked dates
interface MarkedDate {
  marked: boolean;
  dotColor?: string;
}

const EntriesScreen: React.FC = () => {
  const { theme, isDarkMode } = useTheme();
  
  React.useEffect(() => {
    StatusBar.setBarStyle(isDarkMode ? 'light-content' : 'dark-content');
    if (Platform.OS === 'android') {
      StatusBar.setBackgroundColor(isDarkMode ? '#000' : '#fff');
    }
  }, [isDarkMode]);

  dbHandler.getDatesWithEntries()
  const now = new Date();
  const date = now.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).split('/').reverse().join('-');
  const [marked, setMarkedDates] = React.useState<{[key: string]: MarkedDate}>({});
  const [entries, setEntries] = React.useState<Entry[]>([]);
  const [selectedDate, setSelectedDate] = React.useState<string>(date);
  const [toDate, setToDate] = React.useState<string>(date);
  const [showEntries, setShowEntries] = React.useState(false);
  const [alertVisible, setAlertVisible] = React.useState(false);
  const [alertMessage, setAlertMessage] = React.useState('');

  React.useEffect(() => {
    if (!showEntries){
      const loadDatesWithEntries = async () => {
        try {
          const dates = await dbHandler.getDatesWithEntries();
          
          const marked = dates.reduce((acc, date) => ({
            ...acc,
            [date.date]: { marked: true, dotColor: '#663399' }
          }), {});
          setMarkedDates(marked);

          return marked;
        } catch (error) {
          console.error('Error loading dates:', error);
        }       
      };

      loadDatesWithEntries();
    }
  }, []);

  const handleDayPress = async (day: DateData) => {
    setSelectedDate(day.dateString);
    
    try {
      const dates = await dbHandler.getDatesWithEntries();
      const dateList = dates.map((date) => date.date);
      
      if (dateList.includes(day.dateString)) {
        const dateEntries = await dbHandler.getEntriesForDate(day.dateString);
        setEntries(dateEntries);
      } else {
        setEntries([]);
        setAlertMessage('No entries for this date');
        setAlertVisible(true);
      }
    } catch (error) {
      console.error('Error loading entries:', error);
      setEntries([]);
    }
  };

  const handleSeeAll = () => {
    setToDate(selectedDate);
    setShowEntries(true);
  };

  React.useEffect(() => {
    const loadInitialEntries = async () => {
      try {
        const dateEntries = await dbHandler.getEntriesForDate(date);
        if (dateEntries.length > 0) {
          setEntries(dateEntries);
        }
      } catch (error) {
        console.error('Error loading initial entries:', error);
      }
    };

    loadInitialEntries();
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {!showEntries ? (
        <View style={styles.entriesContainer}>
          <Calendar
            style={[styles.calendar, { backgroundColor: theme.background }]}
            markedDates={marked}
            onDayPress={handleDayPress}
            theme={{
              backgroundColor: theme.background,
              calendarBackground: theme.background,
              textSectionTitleColor: isDarkMode ? '#fff' : theme.text,
              monthTextColor: isDarkMode ? '#fff' : theme.text,
              selectedDayBackgroundColor: theme.primary,
              selectedDayTextColor: isDarkMode ? theme.background : theme.text,
              todayTextColor: theme.primary,
              dayTextColor: theme.text,
              textDisabledColor: theme.border,
              arrowColor: theme.primary,
              dotColor: theme.secondary,
              selectedDotColor: theme.secondary,
            }}
          />
          {entries.length > 0 && (
            <>
              <View style={styles.entriesHeaderContainer}>
                <Text style={[styles.entriesHeader, { color: theme.text }]}>Entries</Text>
                <Button 
                  title="See All"
                  color={theme.primary}
                  onPress={handleSeeAll}
                />
              </View>
              <ScrollView style={styles.entriesList}>
                {entries.map(entry => (
                  <View key={entry.id} style={[styles.entryItem, { borderBottomColor: theme.border }]}>
                    <Text style={[styles.timestamp, { color: theme.text }]}>{entry.timestamp}</Text>
                    <Text 
                      style={[styles.entryContent, { color: theme.text }]} 
                      numberOfLines={1}
                    >
                      {entry.content}
                    </Text>
                  </View>
                ))}
              </ScrollView>
              <LinearGradient
                colors={[
                  `${theme.background}00`,
                  theme.background
                ]}
                style={styles.gradient}
                pointerEvents="none"
              />
            </>
          )}
        </View>
      ) : (
        <View style={[styles.entriesContainer, { backgroundColor: theme.background }]}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => setShowEntries(false)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons 
              name="arrow-back" 
              size={24} 
              color="#fff"
            />
          </TouchableOpacity>
          <ScrollView style={styles.timelineContainer}>
            {entries
              .sort((a, b) => {
                const timeA = parseInt(a.timestamp.split(':')[0]);
                const timeB = parseInt(b.timestamp.split(':')[0]);
                return timeA - timeB;
              })
              .map((entry, index) => (
                <View key={entry.id} style={styles.timelineRow}>
                  <View style={styles.timeColumn}>
                    <Text style={[styles.timeText, { color: theme.text }]}>
                      {entry.timestamp}
                    </Text>
                    {index !== entries.length - 1 && (
                      <View style={[styles.timelineDots, { borderColor: theme.border }]} />
                    )}
                  </View>
                  <View style={styles.entriesColumn}>
                    <View 
                      style={[
                        styles.timelineEntry,
                        { backgroundColor: isDarkMode ? '#333' : '#f5f5f5' }
                      ]}
                    >
                      <Text style={[styles.timelineContent, { color: theme.text }]}>
                        {entry.content}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
          </ScrollView>
        </View>
      )}
      <CustomAlert
        visible={alertVisible}
        message={alertMessage}
        onClose={() => setAlertVisible(false)}
      />
    </View>
  );
  
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  entriesContainer: {
    flex: 1,
    position: 'relative',
  },
  calendar: {
    borderRadius: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    marginBottom: 20,
  },
  entriesList: {
    flex: 1,
  },
  entryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  timestamp: {
    fontSize: 14,
    width: 60,
    marginRight: 10,
  },
  entryContent: {
    flex: 1,
    fontSize: 16,
  },
  gradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 50,
  },
  entriesHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 5,
  },
  entriesHeader: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  timelineContainer: {
    flex: 1,
    paddingTop: 10,
    paddingHorizontal: 10,
  },
  timelineRow: {
    flexDirection: 'row',
    minHeight: 80,
  },
  timeColumn: {
    width: 60,
    alignItems: 'flex-start',
    position: 'relative',
  },
  timeText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 10,
  },
  timelineDots: {
    position: 'absolute',
    left: 25,
    top: 24,
    bottom: -24,
    borderLeftWidth: 2,
    borderStyle: 'dotted',
  },
  entriesColumn: {
    flex: 1,
    paddingLeft: 15,
    paddingRight: 5,
  },
  timelineEntry: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    minWidth: '90%',
  },
  timelineContent: {
    fontSize: 14,
    lineHeight: 20,
  },
  backButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    padding: 10,
    zIndex: 1,
    backgroundColor: '#663399',
    borderRadius: 50,
  },
});

export default EntriesScreen; 