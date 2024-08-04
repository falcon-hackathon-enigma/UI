import React, { useState, useRef, useEffect } from 'react';
import './ChatBox.css';

const ChatBox = ({ initialMessage, selectedCards, conversation: initialConversation, setConversation }) => {
    const [query, setQuery] = useState('');
    const inputRef = useRef(null);
    const conversationBoxRef = useRef(null);
    const [loading, setLoading] = useState(false);

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

        setLoading(true); // Set loading to true

        const userMessage = { sender: 'user', text: message };
        setConversation((prevConversation) => [...prevConversation, userMessage]);

        setQuery('');
        inputRef.current.focus();

        // Add a "typing..." message
        const typingMessage = { sender: 'ai', text: 'typing...' };
        setConversation((prevConversation) => [...prevConversation, typingMessage]);

        try {
            const response = await fetch('https://cardgenie.ae:8443/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ msg: message }),
            });

            if (!response.body) {
                throw new Error('No response body');
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let aiMessage = { sender: 'ai', text: '' };

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                const words = chunk.split(' ');

                for (const word of words) {
                    aiMessage.text += word + ' ';
                    setConversation((prevConversation) => {
                        const updatedConversation = prevConversation.slice(0, -1);
                        return [...updatedConversation, aiMessage];
                    });
                    await new Promise((resolve) => setTimeout(resolve, 50)); // Adjust the delay as needed
                }
            }

            // Finalize the message
            setConversation((prevConversation) => {
                const updatedConversation = prevConversation.slice(0, -1);
                return [...updatedConversation, aiMessage];
            });
        } catch (error) {
            console.error('Error fetching chat response:', error);
            const errorMessage = { sender: 'ai', text: 'Error fetching response. Please try again.' };
            setConversation((prevConversation) => {
                const updatedConversation = prevConversation.slice(0, -1);
                return [...updatedConversation, errorMessage];
            });
        } finally {
            setLoading(false); // Set loading to false
        }
    };

    useEffect(() => {
        if (conversationBoxRef.current) {
            conversationBoxRef.current.scrollTop = conversationBoxRef.current.scrollHeight;
        }
    }, [initialConversation]);

    return (
        <div className="chat-box">
            <h1>Ask Genie</h1>
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
                <button onClick={() => handleSend(query)} disabled={loading}>
                    {loading ? (
                        <span className="loading-spinner"></span>
                    ) : (
                        <>
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
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default ChatBox;