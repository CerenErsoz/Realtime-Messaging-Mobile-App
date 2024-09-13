import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr';

const ChatScreen = () => {

  const [connection, setConnection] = useState(null);
  const [username, setUsername] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const messageInputRef = useRef(null);

  const setupConnection = async () => {
    try {
      const conn = new HubConnectionBuilder()
        .withUrl("http://10.0.2.2:5224/chatHub")
        .configureLogging(LogLevel.Information)
        .build();

      conn.on("ReceiveMessage", (user, message) => {
        setMessages(prevMessages => [...prevMessages, { user, message }]);
      });

      await conn.start();
      console.log("Connection OK");
      setConnection(conn);
    } catch (err) {
      console.error("Connection error: ", err);
    }
  };

  useEffect(() => {
    setupConnection();
  }, []);

  const sendMessage = async () => {
    if (connection && username && message) {
      try {
        await connection.invoke("SendMessage", username, message);
        setMessage('');
        if (messageInputRef.current) {
          messageInputRef.current.blur(); // Dismiss the keyboard
        }
      } catch (err) {
        console.error("Message send error: ", err);
      }
    }
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  return (
    <TouchableWithoutFeedback onPress={dismissKeyboard}>
      <View style={styles.container}>
        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Kullanıcı Adınız"
            value={username}
            onChangeText={setUsername}
          />
          <TextInput
            style={styles.input}
            placeholder="Mesajınız"
            value={message}
            onChangeText={setMessage}
            ref={messageInputRef}
          />
          <Button title="Mesaj Gönder" onPress={sendMessage} />
        </View>
        <FlatList
          style={styles.messagesList}
          data={messages}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <View style={styles.message}>
              <Text style={styles.messageUser}>{item.user}:</Text>
              <Text style={styles.messageText}>{item.message}</Text>
            </View>
          )}
        />
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  form: {
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
    backgroundColor: '#fff',
  },
  messagesList: {
    flex: 1,
    marginTop: 10,
  },
  message: {
    backgroundColor: '#e1e1e1',
    padding: 10,
    marginVertical: 5,
    borderRadius: 5,
  },
  messageUser: {
    fontWeight: 'bold',
    marginBottom: 2,
  },
  messageText: {
    fontSize: 16,
  },
});

export default ChatScreen;
