import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import './ChatBox.css';

const ChatBox = ({ initialMessage, selectedCards, conversation: initialConversation, setConversation }) => {
    const [query, setQuery] = useState('');
    const inputRef = useRef(null); // Define inputRef
    const conversationBoxRef = useRef(null);

    useEffect(() => {
        if (initialMessage) {
            const userMessage = { sender: 'user', text: initialMessage };
            setConversation([userMessage]);

            const compareMessage = `Comparing the following credit cards: ${selectedCards.map(card => card.cardName).join(', ')}`;
            const aiMessage = { sender: 'ai', text: compareMessage };
            setConversation((prevConversation) => [...prevConversation, aiMessage]);
        }
    }, [initialMessage, selectedCards, setConversation]);

    const handleQueryChange = (e) => {
        setQuery(e.target.value);
    };

    const handleSend = async (message) => {
        if (!message.trim()) return;

        const userMessage = { sender: 'user', text: message };
        setConversation((prevConversation) => [...prevConversation, userMessage]);

        setQuery('');
        inputRef.current.focus();

        // Add a "typing..." message
        const typingMessage = { sender: 'ai', text: 'typing...' };
        setConversation((prevConversation) => [...prevConversation, typingMessage]);

        try {
            const res = await axios.post('http://cardgenie.ae:3000/api/chat', { msg: message });
            const aiMessage = { sender: 'ai', text: res.data };
            setConversation((prevConversation) => {
                // Remove the "typing..." message and add the actual response
                const updatedConversation = prevConversation.slice(0, -1);
                return [...updatedConversation, aiMessage];
            });
        } catch (error) {
            console.error('Error fetching chat response:', error);
            const errorMessage = { sender: 'ai', text: 'Error fetching response. Please try again.' };
            setConversation((prevConversation) => {
                // Remove the "typing..." message and add the error message
                const updatedConversation = prevConversation.slice(0, -1);
                return [...updatedConversation, errorMessage];
            });
        }
    };

    useEffect(() => {
        if (conversationBoxRef.current) {
            conversationBoxRef.current.scrollTop = conversationBoxRef.current.scrollHeight;
        }
    }, [initialConversation]); // Ensure conversation is used correctly

    return (
        <div className="chat-box">
            <h1>AI Chat</h1>
            <div className="conversation-box" ref={conversationBoxRef}>
                {initialConversation.map((message, index) => (
                    <div key={index} className={`message-container ${message.sender}`}>
                        {message.sender === 'ai' && <div className="profile-icon ai">AI</div>}
                        <div className={`message ${message.sender}`}>
                            {message.text}
                        </div>
                        {message.sender === 'user' && <div className="profile-icon user">U</div>}
                    </div>
                ))}
            </div>
            <div className="chat-input-container">
                <textarea
                    ref={inputRef}
                    value={query}
                    onChange={handleQueryChange}
                    placeholder="Ask a question about credit cards..."
                />
                <button onClick={() => handleSend(query)}>
                    Send
                    <span className="send-icon">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            width="18px"
                            height="18px"
                        >
                            <path d="M20.5 3h-17C2.67 3 2 3.67 2 4.5v15c0 .83.67 1.5 1.5 1.5h17c.83 0 1.5-.67 1.5-1.5v-15c0-.83-.67-1.5-1.5-1.5zM20 19H4V5h16v14zM7 7h2v2H7V7zm0 4h2v2H7v-2zm0 4h2v2H7v-2zm4-8h2v2h-2V7zm0 4h2v2h-2v-2zm0 4h2v2h-2v-2zm4-8h2v2h-2V7zm0 4h2v2h-2V7zm0 4h2v2h-2v-2z" />
                        </svg>
                    </span>
                </button>
            </div>
        </div>
    );
};

export default ChatBox;