import * as SQLite from 'expo-sqlite';

export interface Entry {
  id?: number;
  content: string;
  timestamp: string;
  date: string;
}

let db: any = null;

const initializeDB = (): any => {
  if (!db) {
    db = SQLite.openDatabaseAsync('journal.db');
  } else {
    // console.log('Database already initialized.');
  }
  return db;
};

const initDatabase = (): Promise<void> => {
  return new Promise(() => {
    const database = initializeDB();
    database.then((tx: SQLite.SQLiteDatabase) => {
      tx.execSync(
        `CREATE TABLE IF NOT EXISTS entries (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          content TEXT,
          timestamp TEXT,
          date TEXT
        )`,
      );
    });
  });
};

const saveEntry = (content: string, timestamp: string, date: string): Promise<{ insertId: number }> => {
  return new Promise((resolve, reject) => {
    const database = initializeDB();
    
    resolve(database.then(async (tx: SQLite.SQLiteDatabase) => {
      let cache = await tx.prepareAsync('INSERT INTO entries (content, timestamp, date) VALUES ($content, $timestamp, $date)')
      try {
        await cache.executeAsync({$content: content, $timestamp: timestamp, $date: date})
      } 
      finally {
        await cache.finalizeAsync();
      }
      let insert = tx.getFirstSync<Entry>(
        'SELECT id FROM entries WHERE timestamp = ?', timestamp
      )
      let insertId = insert?.id
      return { insertId }
    }))
    reject(console.error('Error saving entry', Error));
  });
};

const updateEntry = (id: number, content: string): Promise<{ rowsAffected: number }> => {
  return new Promise((resolve, reject) => {
    const database = initializeDB();
    resolve(
      database.then((tx: SQLite.SQLiteDatabase) => {
        let cache = tx.prepareSync(
          'UPDATE entries SET content = $content WHERE id = $id'
        );
        try {
          cache.executeSync({$content: content, $id: id})
        }
        finally {
          cache.finalizeSync();
          console.log('Entry updated successfully');
        }
      })
    )
    reject(console.error('Error updating entry', Error));
  });
};

const getDatesWithEntries = (): Promise<Entry[]> => {
  return new Promise((resolve, reject) => {
    const database = initializeDB();
    let entries: Entry[] = [];
    resolve(database.then( async (tx: SQLite.SQLiteDatabase) => {
      console.log('Getting dates with entries...');
      
      let result = await tx.getAllAsync(
        'SELECT date FROM entries',
      )
      
      return result;
    }))
    reject(console.error('Error getting dates with entries', Error.toString()));
  });
};

const getEntriesForDate = (date: String): Promise<Entry[]> => {
  return new Promise((resolve, reject) => {
    const database = initializeDB();
    
    resolve(database.then(async (tx: SQLite.SQLiteDatabase) => {
      let result = await tx.getAllAsync(
        'SELECT * FROM entries WHERE date = ?', [date.toString()]
      )
      return result;
    }))
  })
}

const getAllEntries = (): Promise<Entry[]> => {
  return new Promise((resolve, reject) => {
    const database = initializeDB();
    resolve(database.then(async (tx: SQLite.SQLiteDatabase) => {
      return await tx.getAllAsync('SELECT * FROM entries');
    }));
    reject(console.error('Error getting all entries', Error));
  });
};

const importEntries = (entries: Entry[]): Promise<void> => {
  return new Promise((resolve, reject) => {
    const database = initializeDB();
    resolve(database.then(async (tx: SQLite.SQLiteDatabase) => {
      for (const entry of entries) {
        await saveEntry(entry.content, entry.timestamp, entry.date);
      }
    }));
    reject(console.error('Error importing entries', Error));
  });
};

export default {
  initDatabase,
  saveEntry,
  updateEntry,
  getDatesWithEntries,
  getEntriesForDate,
  getAllEntries,
  importEntries,
};
