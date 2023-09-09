// HotelChat.js

import React, { useState, useEffect } from 'react';
import { ChatServerClient } from '../../proto/msg_grpc_web_pb';
import { ChatMessage, Empty } from '../../proto/msg_pb';

function HotelChat({ hotelId, userId}) {
    const [messages, setMessages] = useState([]);
    const [messageText, setMessageText] = useState('');

    const client = new ChatServerClient('http://localhost:8080', null, null);

    useEffect(() => {
        startChat();
    }, []);

    const startChat = () => {
        const stream = client.chatStream(new Empty());
        stream.on('data', response => {
            // console.log('recieved response', response)
            if (response.getToUserId() === hotelId) {
                setMessages(prevMessages => [...prevMessages, response]);
            }
        });

        stream.on('error', error => {
            console.error('Error in gRPC hotel stream:', error);
        });
    };

    const sendMessage = () => {

        if (!hotelId) {
            alert('Invalid hotel ID.');
            return;
        }

        const timestampParts = getCurrentTimestamp();

        const chatMessage = new ChatMessage();
        chatMessage.setFromUserId(hotelId);
        chatMessage.setToUserId(userId); // Send back to the user who initiated the chat
        chatMessage.setHotelId(hotelId);
        chatMessage.setContent(messageText);
        chatMessage.setContentType('text');
        // chatMessage.setTimestamp(timestampParts.date + ' ' + timestampParts.time);
        chatMessage.setTimestamp(timestampParts.now);

        client.sendChatMessage(chatMessage, {}, (err, response) => {
            if (err) {
                console.error('Error sending message:', err);
            } else {
                setMessages(prevMessages => [...prevMessages, chatMessage]);
            }
        });
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
        <div className='box'>
            <h1 style={{ textAlign: 'center' }}>Hotel Chat</h1>
            <div>
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
    );
}



export default HotelChat;
