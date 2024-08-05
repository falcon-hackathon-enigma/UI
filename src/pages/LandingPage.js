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
    const [compareLoading, setCompareLoading] = useState(false);
    const cardSectionRef = useRef(null);

    useEffect(() => {
        const fetchCards = async () => {
            try {
                const response = await axios.get('https://cardgenie.ae:8443/api/cards');
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
        setSelectedForComparison([]); // Clear selected cards when toggling AI mode
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
        setVisibleCards((prevVisibleCards) => prevVisibleCards + 8);
    };

    const handleCompareClick = async () => {
        if (selectedForComparison.length >= 2) {
            setCompareLoading(true); // Set loading to true
            setAiMode(true);
            const compareMessage = `Comparing the following credit cards: ${selectedForComparison.map(card => card.cardName).join(', ')}`;
            setConversation([{ sender: 'user', text: compareMessage }]);

            // Add "typing..." effect
            setConversation((prevConversation) => [...prevConversation, { sender: 'ai', text: 'typing...' }]);

            try {
                const response = await fetch('https://cardgenie.ae:8443/api/chat', {
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
            } finally {
                setCompareLoading(false); // Set loading to false
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
                <div className="logo-container">
                    <img src={`${process.env.PUBLIC_URL}/genie.jpg`} alt="CardGenie Logo" className="logo" />
                    <span className="logo-text">CardGenie</span>
                </div>
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
                        <p>Your ultimate destination for finding the perfect credit card tailored to your needs. Explore our AI-powered recommendations and make informed decisions effortlessly. Click on Ask AI for more.</p>
                        <div className="button-group">
                            <button className="scroll-button" onClick={scrollToCards}>Explore Credit Cards</button>
                            <button className="ai-button" onClick={switchToAiMode}>Ask AI</button>
                        </div>
                    </div>
                </div>
            )}
            {!aiMode && selectedForComparison.length > 0 && (
                <button className="compare-button" onClick={handleCompareClick} disabled={compareLoading}>
                    {compareLoading ? (
                        <span className="loading-spinner"></span>
                    ) : (
                        <>
                            Compare Selected Cards
                        </>
                    )}
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