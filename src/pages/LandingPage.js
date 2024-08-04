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
            {aiMode ? (
                <ChatBox />
            ) : (
                <>
                    <div className="card-container" ref={cardSectionRef}>
                        {cards.slice(0, visibleCards).map((card) => (
                            <CreditCard key={card.id} card={card} onClick={handleCardClick} />
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