import React, { useState, useEffect } from 'react';
import { SafeAreaView, View, Text, TextInput, Button, FlatList, StyleSheet, Alert } from 'react-native';
import SQLite from 'react-native-sqlite-storage';

const db = SQLite.openDatabase(
  {
    name: 'MoviesDB.db',
    location: 'default',
  },
  () => console.log('База даних відкрита'),
  error => console.log(error)
);

interface Movie {
  id: number;
  title: string;
  year: string;
  director: string;
  rating: string;
}

const App: React.FC = () => {
  const [title, setTitle] = useState<string>('');
  const [year, setYear] = useState<string>('');
  const [director, setDirector] = useState<string>('');
  const [rating, setRating] = useState<string>('');
  const [movies, setMovies] = useState<Movie[]>([]);

  useEffect(() => {
    db.transaction(tx => {
      tx.executeSql(
        'CREATE TABLE IF NOT EXISTS Movies (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, year INTEGER, director TEXT, rating REAL)',
        [],
        () => console.log('Таблиця успішно створена'),
        error => console.log(error)
      );
    });
    loadMovies();
  }, []);

  const addMovie = () => {
    if (!title || !year || !director || !rating) {
      Alert.alert(
        "Попередження",
        "Будь ласка, заповніть усі поля",
        [
          { text: "OK" }
        ]
      );
      return;
    }

    db.transaction(tx => {
      tx.executeSql(
        'INSERT INTO Movies (title, year, director, rating) VALUES (?, ?, ?, ?)',
        [title, year, director, parseFloat(rating)],
        () => {
          setTitle('');
          setYear('');
          setDirector('');
          setRating('');
          loadMovies(); // Перезавантаження списку фільмів
        },
        error => console.log(error)
      );
    });
  };

  const loadMovies = () => {
    db.transaction(tx => {
      tx.executeSql('SELECT * FROM Movies', [], (tx, results) => {
        let allMovies = [];
        for (let i = 0; i < results.rows.length; ++i) {
          allMovies.push(results.rows.item(i));
        }
        setMovies(allMovies);
      });
    });
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.container}>
        <TextInput
          style={styles.inputStyle}
          placeholder="Назва"
          value={title}
          onChangeText={setTitle}
        />
        <TextInput
          style={styles.inputStyle}
          placeholder="Рік"
          value={year}
          onChangeText={setYear}
          keyboardType="numeric"
        />
        <TextInput
          style={styles.inputStyle}
          placeholder="Режисер"
          value={director}
          onChangeText={setDirector}
        />
        <TextInput
          style={styles.inputStyle}
          placeholder="Рейтинг"
          value={rating}
          onChangeText={setRating}
          keyboardType="numeric"
        />
        <Button title="Додати фільм" onPress={addMovie} />
        <FlatList
          data={movies}
          renderItem={({ item }) => (
            <View style={styles.item}>
              <Text style={styles.title}>{item.title}, {item.year}</Text>
              <Text>Режисер: {item.director}</Text>
              <Text>Рейтинг: {item.rating}</Text>
            </View>
          )}
          keyExtractor={item => item.id.toString()}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  inputStyle: {
    width: '100%',
    marginBottom: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: 'gray',
  },
  item: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'gray',
    marginBottom: 10,
  },
  title: {
    fontWeight: 'bold',
  },
});

export default App;
