// import React, { useState, useEffect } from 'react';
// // import * as grpcWeb from 'grpc-web';
// import { ChatServerClient } from './proto/chat_grpc_web_pb';
// import { Note, Empty } from './proto/chat_pb';
// import './App.css';


// function App() {
//   const [messages, setMessages] = useState([]);
//   const [messageText, setMessageText] = useState('');
//   const [userName, setUserName] = useState('');

//   const client = new ChatServerClient('http://localhost:8080', null, null);


//   // useEffect(() => {
//   //   const name = prompt('Please enter your name:');
//   //   if (name) {
//   //     setUserName(name);
//   //   }
//   //   if (userName) {
//   //     startChat();
//   //   }
//   // }, [userName])
//   useEffect(() => {
//     if (!userName) {
//       const storedName = localStorage.getItem('userName');
//       if (storedName) {
//         setUserName(storedName);
//       } else {
//         const name = prompt('Please enter your name:');
//         if (name) {
//           setUserName(name);
//           localStorage.setItem('userName', name);
//         }
//       }
//     }
//   }, [userName]);

//   useEffect(() => {
//     if (userName) {
//       startChat();
//     }
//   }, [userName]);

//   const startChat = () => {
//     const stream = client.chatStream(new Empty());
//     stream.on('data', response => {
//         console.log("helo")
//     //   console.log(JSON.stringify([...messages, response]))
//       setMessages(prevMessages => [...prevMessages, response]);
//     });
//   };

//   const sendMessage = () => {
//     if (!userName) {
//       alert('Please enter your name first.');
//       return;
//     }
//     const note = new Note();
//     note.setName(userName);
//     note.setMessage(messageText);

//     client.sendNote(note, {}, (err, response) => {
//       if (err) {
//         console.error('Error sending message:', err);
//       } else {
//         setMessages(prevMessages => [...prevMessages, note]);
//       }
//     });
//     setMessageText('');

//   };

//   return (
//     <div className='box'>

//       <h1 style={{textAlign:'center'}}>Chat App</h1>

//       <div>
//         {JSON.stringify(messages.length)}
//         {messages.map((msg, index) => (
//           <div key={index}>

//             <strong>{msg.getName()}: </strong>

//             {msg.getMessage()}

//           </div>

//         ))}
//       </div>

//       <div style={{display:'flex',marginTop:'10px' }}>
//         <input
//           style={{width:'100%'}}
//           type="text"
//           value={messageText}
//           onChange={e => setMessageText(e.target.value)}
//         />
//         <button onClick={sendMessage}>Send</button>
//       </div>

//     </div>
//   );
// }

// export default App;

// -----------------------------       used msg.proto file  -----------------------------------------------------------
// import React, { useState, useEffect } from 'react';
// import { ChatServerClient } from './proto/msg_grpc_web_pb';
// import { ChatMessage, Empty } from './proto/msg_pb';
// import './App.css';

// function App() {
//     const [messages, setMessages] = useState([]);
//     const [messageText, setMessageText] = useState('');
//     const [userName, setUserName] = useState('');

//     const client = new ChatServerClient('http://localhost:8080', null, null);

//     useEffect(() => {
//         if (!userName) {
//             const storedName = localStorage.getItem('userName');
//             if (storedName) {
//                 setUserName(storedName);
//             } else {
//                 const name = prompt('Please enter your name:');
//                 if (name) {
//                     setUserName(name);
//                     localStorage.setItem('userName', name);
//                 }
//             }
//         }
//     }, [userName]);

//     useEffect(() => {
//         if (userName) {
//             startChat();
//             console.log('hogaya start')
//         }
//     }, [userName]);

//     const startChat = () => {
//         const stream = client.chatStream(new Empty());
//         stream.on('data', response => {
//             console.log('streaming')
//             setMessages(prevMessages => [...prevMessages, response]);
//         });
//         console.log(messages)
//     };

//     const getCurrentTimestamp = () => {
//         const now = new Date();
//         return now.toISOString(); // Convert the current date to ISO format (e.g., "2023-09-05T12:00:00.000Z")
//     };
//     const formatTimestamp = (timestamp) => {
//         const date = new Date(timestamp);
//         const currentDay = date.getDate();
//         const currentMonth = date.getMonth();
//         const currentYear = date.getFullYear();
//         const time = date.toLocaleTimeString(); // Format the time as a string

//         return `${currentDay}-${currentMonth}-${currentYear} ${time}`;
//     };


//     const sendMessage = () => {
//         if (!userName) {
//             alert('Please enter your name first.');
//             return;
//         }
//         const chatMessage = new ChatMessage();
//         chatMessage.setFromUserId(userName);
//         chatMessage.setContent(messageText);
//         chatMessage.setContentType('text');
//         chatMessage.setTimestamp(formatTimestamp(getCurrentTimestamp()))

//         client.sendChatMessage(chatMessage, {}, (err, response) => {
//             if (err) {
//                 console.error('Error sending message:', err);
//             } else {
//                 setMessages(prevMessages => [...prevMessages, chatMessage]);
//             }
//         });
//         setMessageText('');
//     };

//     return (
//         <div className='box'>
//             <h1 style={{ textAlign: 'center' }}>Chat App</h1>
//             <div>
//                 {JSON.stringify(messages.length)}
//                 {messages.map((msg, index) => (
//                     <div key={index}>
//                         <strong>{msg.getFromUserId()}: </strong>
//                         {msg.getContent()}
//                     </div>
//                 ))}
//             </div>
//             <div style={{ display: 'flex', marginTop: '10px' }}>
//                 <input
//                     style={{ width: '100%' }}
//                     type="text"
//                     value={messageText}
//                     onChange={e => setMessageText(e.target.value)}
//                 />
//                 <button onClick={sendMessage}>Send</button>
//             </div>
//         </div>
//     );
// }

// export default App;

// ------------------------------ modified and added to whom the message is being sent-----------------------
import React, { useState, useEffect } from 'react';
import { ChatServerClient } from './proto/msg_grpc_web_pb';
import { ChatMessage, Empty } from './proto/msg_pb';
import HotelChat from './components/HotelChat';
import './App.css';

function App() {
    const [messages, setMessages] = useState([]);
    const [messageText, setMessageText] = useState('');
    const [userName, setUserName] = useState('');
    const [selectedHotel, setSelectedHotel] = useState(''); // Selected hotel ID

    const client = new ChatServerClient('http://localhost:8080', null, null);

    // Define a list of available hotels and their IDs
    const availableHotels = [
        { id: 'hotel1', name: 'Hotel 1' },
        { id: 'hotel2', name: 'Hotel 2' },
        { id: 'hotel3', name: 'Hotel 3' },
        // Add more hotels as needed
    ];

    useEffect(() => {
        if (!userName) {
            const storedName = localStorage.getItem('userName');
            if (storedName) {
                setUserName(storedName);
            } else {
                const name = prompt('Please enter your name:');
                if (name) {
                    setUserName(name);
                    localStorage.setItem('userName', name);
                }
            }
        }
    }, [userName]);

    useEffect(() => {
        if (userName) {
            startChat();
        }
    }, [userName]);

    const startChat = () => {
        const stream = client.chatStream(new Empty());
        console.log('start chat on app.js')

        stream.on('data', response => {
            console.log('streaming')
            setMessages(prevMessages => [...prevMessages, response]);
        });

        stream.on('error', error => {
            console.error('Error in gRPC stream:', error);
        });

    };


    const sendMessage = () => {
        if (!userName) {
            alert('Please enter your name first.');
            return;
        }

        if (!selectedHotel) {
            alert('Please select a hotel from the dropdown.');
            return;
        }

        const timestampParts = getCurrentTimestamp();
        const chatMessage = new ChatMessage();
        chatMessage.setFromUserId(userName);
        chatMessage.setToUserId(selectedHotel); // User can select a hotel from the dropdown
        chatMessage.setHotelId(selectedHotel); // Set the hotel's ID
        chatMessage.setContent(messageText);
        chatMessage.setContentType('text');
        // chatMessage.setTimestamp(timestampParts.date + ' ' + timestampParts.time);
        chatMessage.setTimestamp(timestampParts.date);

        client.sendChatMessage(chatMessage, {}, (err, response) => {
            if (err) {
                console.error('Error sending message:', err);
            } else {
                setMessages(prevMessages => [...prevMessages, chatMessage]);
            }
        });
        console.log(messageText)
        setMessageText('');
    };

    const getCurrentTimestamp = () => {
        const now = new Date();
        const isoTimestamp = now.toISOString();
        const [datePart, timePart] = isoTimestamp.split('T');
        const [dateYear, dateMonth, dateDay] = datePart.split('-');
        // const [timeHour, timeMinute, timeSecond] = timePart.split(':');
        return {
            date: `${dateDay}-${dateMonth}-${dateYear}`,
            // time: `${timeHour}:${timeMinute}:${timeSecond}`,
        };
    };

    return (
        <div>
            <div className='box'>
                <h1 style={{ textAlign: 'center' }}>Chat App</h1>
                <div>

                    <div>
                        <label>Select a Hotel:</label>
                        <select
                            value={selectedHotel}
                            onChange={e => setSelectedHotel(e.target.value)}
                        >
                            <option value="">Select a Hotel</option>

                            {availableHotels.map(hotel => (
                                <option key={hotel.id} value={hotel.id}>
                                    {hotel.name}
                                </option>
                            ))}

                        </select>
                    </div>

                    {JSON.stringify(messages.length)}
                    {messages.map((msg, index) => (
                        <div key={index}>
                            <strong>{msg.getFromUserId()}: </strong>
                            {msg.getContent()}
                        </div>
                    ))}
                </div>
                
                <div style={{ display: 'flex', marginTop: '10px' }}>
                    <input
                        style={{ width: '100%' }}
                        type="text"
                        value={messageText}
                        onChange={e => setMessageText(e.target.value)}
                    />
                    
                    <button onClick={sendMessage}>Send</button>
                </div>

            </div>

            {selectedHotel && (
                <HotelChat hotelId={selectedHotel} userId={userName} />
            )}

        </div>

    );
}

export default App;
