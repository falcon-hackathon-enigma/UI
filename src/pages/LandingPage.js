import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import CreditCard from '../components/CreditCard';
import Modal from 'react-modal';
import ChatBox from '../components/ChatBox';
import './LandingPage.css';

const LandingPage = () => {
    const [cards, setCards] = useState([]);
    const [visibleCards, setVisibleCards] = useState(8);
    const [selectedCard, setSelectedCard] = useState(null);
    const [aiMode, setAiMode] = useState(false);
    const [selectedForComparison, setSelectedForComparison] = useState([]);
    const [initialMessage, setInitialMessage] = useState('');
    const [conversation, setConversation] = useState([]);
    const cardSectionRef = useRef(null);

    useEffect(() => {
        const fetchCards = async () => {
            try {
                const response = await axios.get('http://cardgenie.ae:3000/api/cards');
                setCards(response.data);
            } catch (error) {
                console.error('Error fetching credit card data:', error);
            }
        };

        fetchCards();
    }, []);

    const handleCardClick = (card) => {
        setSelectedCard(card);
    };

    const closeModal = () => {
        setSelectedCard(null);
    };

    const handleSwitchChange = (e) => {
        e.preventDefault();
        setAiMode(!aiMode);
        setInitialMessage('');
        setConversation([]);
    };

    const scrollToCards = () => {
        cardSectionRef.current.scrollIntoView({ behavior: 'smooth' });
    };

    const switchToAiMode = () => {
        setAiMode(true);
        setInitialMessage('');
        setConversation([]);
    };

    const loadMoreCards = () => {
        setVisibleCards((prevVisibleCards) => prevVisibleCards + 10);
    };

    const handleCompareClick = async () => {
        if (selectedForComparison.length >= 2) {
            setAiMode(true);
            const compareMessage = `Comparing the following credit cards: ${selectedForComparison.map(card => card.cardName).join(', ')}`;
            setConversation([{ sender: 'user', text: compareMessage }]);

            // Add "typing..." effect
            setConversation((prevConversation) => [...prevConversation, { sender: 'ai', text: 'typing...' }]);

            try {
                const response = await fetch('http://cardgenie.ae:3000/api/chat', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ msg: compareMessage }),
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
                setConversation((prevConversation) => {
                    // Remove the "typing..." message and add the error message
                    const updatedConversation = prevConversation.slice(0, -1);
                    return [...updatedConversation, { sender: 'ai', text: 'Error fetching response. Please try again.' }];
                });
            }
        } else {
            alert('Please select at least 2 credit cards to compare.');
        }
    };

    const handleCardSelect = (card) => {
        setSelectedForComparison((prevSelected) => {
            if (prevSelected.includes(card)) {
                return prevSelected.filter((c) => c !== card);
            } else {
                return [...prevSelected, card];
            }
        });
    };

    return (
        <div className="landing-page">
            <div className="header">
                <h1>Card Genie</h1>
                <div className="switch-container">
                    <label>AI Mode</label>
                    <div className={`toggle-switch ${aiMode ? 'active' : ''}`} onClick={handleSwitchChange}>
                        <div className="toggle-handle"></div>
                    </div>
                </div>
            </div>
            {!aiMode && (
                <div className="about-section">
                    <div className="about-content">
                        <h2>Welcome to Card Genie</h2>
                        <p>Your ultimate destination for finding the perfect credit card tailored to your needs. Explore our AI-powered recommendations and make informed decisions effortlessly.</p>
                        <div className="button-group">
                            <button className="scroll-button" onClick={scrollToCards}>Explore Credit Cards</button>
                            <button className="ai-button" onClick={switchToAiMode}>Ask AI</button>
                        </div>
                    </div>
                </div>
            )}
            {!aiMode && selectedForComparison.length > 0 && (
                <button className="compare-button" onClick={handleCompareClick}>
                    Compare Selected Cards
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="18px" height="18px">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
                    </svg>
                </button>
            )}
            {aiMode ? (
                <ChatBox initialMessage={initialMessage} selectedCards={selectedForComparison} conversation={conversation} setConversation={setConversation} />
            ) : (
                <>
                    <div className="card-container" ref={cardSectionRef}>
                        {cards.slice(0, visibleCards).map((card) => (
                            <CreditCard
                                key={card.id}
                                card={card}
                                onClick={handleCardClick}
                                onSelect={handleCardSelect}
                                isSelected={selectedForComparison.includes(card)}
                            />
                        ))}
                    </div>
                    {visibleCards < cards.length && (
                        <button className="load-more-button" onClick={loadMoreCards}>Load More</button>
                    )}
                </>
            )}

            {selectedCard && (
                <Modal
                    isOpen={!!selectedCard}
                    onRequestClose={closeModal}
                    contentLabel="Credit Card Details"
                    className="modal"
                    overlayClassName="overlay"
                >
                    <h2>{selectedCard.cardName}</h2>
                    <img src={selectedCard.imgUrl} alt={selectedCard.cardName} />
                    <p>{selectedCard.summary}</p>
                    <div className="card-details">
                        <h3>Details</h3>
                        <div dangerouslySetInnerHTML={{ __html: selectedCard.details }} />
                    </div>
                    <button onClick={closeModal}>Close</button>
                </Modal>
            )}
        </div>
    );
};

export default LandingPage;