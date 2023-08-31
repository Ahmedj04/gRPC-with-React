import React, { useState, useEffect } from 'react';
import * as grpcWeb from 'grpc-web';
import { ChatServerClient } from './proto/chat_grpc_web_pb';
import { Note, Empty } from './proto/chat_pb';

const client = new ChatServerClient('http://localhost:11912', null, null);


function App() {
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');

  const startChat = () => {
    alert('Starting chat...');
    const stream = client.chatStream(new Empty());
    console.log(stream.on)
    stream.on('data', response => {
      setMessages(prevMessages => [...prevMessages, response]);
    });
  };

  const sendMessage = () => {
    const note = new Note();
    note.setName('User');
    note.setMessage(messageText);

    client.sendNote(note, {}, (err, response) => {
      if (err) {
        console.error('Error sending message:', err);
      } else {
        setMessages(prevMessages => [...prevMessages, note]);
      }
    });
    

    setMessageText('');
  };

  useEffect(() => {
    startChat();
  }, []);

  return (
    <div>
      <h1>Chat App</h1>
      <div>
        {messages.map((msg, index) => (
          <div key={index}>
            <strong>{msg.getName()}: </strong>
            {msg.getMessage()}
          </div>
        ))}
      </div>
      <div>
        <input
          type="text"
          value={messageText}
          onChange={e => setMessageText(e.target.value)}
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}

export default App;
