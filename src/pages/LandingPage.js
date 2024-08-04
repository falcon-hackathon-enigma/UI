import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import CreditCard from '../components/CreditCard';
import Modal from 'react-modal';
import ChatBox from '../components/ChatBox';
import './LandingPage.css';

const LandingPage = () => {
    const [cards, setCards] = useState([]);
    const [visibleCards, setVisibleCards] = useState(10);
    const [selectedCard, setSelectedCard] = useState(null);
    const [aiMode, setAiMode] = useState(false);
    const [selectedForComparison, setSelectedForComparison] = useState([]);
    const cardSectionRef = useRef(null);

    useEffect(() => {
        const fetchCards = async () => {
            try {
                const response = await axios.get('http://52.5.66.129:3000/api/cards');
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
    };

    const scrollToCards = () => {
        cardSectionRef.current.scrollIntoView({ behavior: 'smooth' });
    };

    const switchToAiMode = () => {
        setAiMode(true);
    };

    const loadMoreCards = () => {
        setVisibleCards((prevVisibleCards) => prevVisibleCards + 10);
    };

    const handleCompareClick = () => {
        if (selectedForComparison.length >= 2) {
            setAiMode(true);
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
                <ChatBox initialMessage="Comparing selected credit cards" selectedCards={selectedForComparison} />
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
                        <p>{selectedCard.details}</p>
                    </div>
                    <button onClick={closeModal}>Close</button>
                </Modal>
            )}
        </div>
    );
};

export default LandingPage;