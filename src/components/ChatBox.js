import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import './ChatBox.css';

const ChatBox = () => {
    const [query, setQuery] = useState('');
    const [conversation, setConversation] = useState([]);
    const inputRef = useRef(null);
    const conversationEndRef = useRef(null);

    const handleQueryChange = (e) => {
        setQuery(e.target.value);
    };

    const handleSend = async () => {
        if (!query.trim()) return;

        const userMessage = { sender: 'user', text: query };
        const typingMessage = { sender: 'ai', text: 'typing...' };
        setConversation((prevConversation) => [...prevConversation, userMessage, typingMessage]);
        // setConversation([...conversation, userMessage]);

        try {
            const res = await axios.post('https://api.example.com/chat', { query });
            const aiMessage = { sender: 'ai', text: res.data.response };
            setConversation([...conversation, userMessage, aiMessage]);
        } catch (error) {
            console.error('Error fetching chat response:', error);
            const errorMessage = { sender: 'ai', text: 'Error fetching response. Please try again.' };
            setConversation([...conversation, userMessage, errorMessage]);
        }

        setQuery('');
        inputRef.current.focus();
    };

    useEffect(() => {
        conversationEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [conversation]);

    return (
        <div className="chat-box">
            <h1>Chat with Credit Cards !</h1>
            <div className="conversation-box">
                {conversation.map((message, index) => (
                    <div key={index} className={`message ${message.sender}`}>
                        {message.text}
                    </div>
                ))}
                <div ref={conversationEndRef} />
            </div>
            <div className="chat-input-container">
                <textarea
                    ref={inputRef}
                    value={query}
                    onChange={handleQueryChange}
                    placeholder="Ask a question about credit cards..."
                />
                <button onClick={handleSend}>Send</button>
            </div>
        </div>
    );
};

export default ChatBox;