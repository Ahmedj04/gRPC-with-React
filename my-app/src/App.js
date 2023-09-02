import React, { useState, useEffect } from 'react';
// import * as grpcWeb from 'grpc-web';
import { ChatServerClient } from './proto/chat_grpc_web_pb';
import { Note, Empty } from './proto/chat_pb';

function App() {
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const client = new ChatServerClient('http://localhost:8080', null, null);

  useEffect(() => {
    startChat();
  }, [])

  const startChat = () => {
    const stream = client.chatStream(new Empty());
    stream.on('data', response => {
      console.log(JSON.stringify([...messages, response]))
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

  return (
    <div>
      <h1>Chat App</h1>
      <div>

        {JSON.stringify(messages.length)}

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
