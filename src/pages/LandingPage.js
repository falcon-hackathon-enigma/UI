import React, { useEffect, useState } from 'react';
import axios from 'axios';
import CreditCard from '../components/CreditCard';
import Modal from 'react-modal';
// import Switch from 'react-switch';
import ChatBox from '../components/ChatBox';
import './LandingPage.css';

const LandingPage = () => {
    const [cards, setCards] = useState([]);
    const [selectedCard, setSelectedCard] = useState(null);
    const [aiMode, setAiMode] = useState(false);

    useEffect(() => {
        const fetchCards = async () => {
            try {
                const response = await axios.get('http://52.5.66.129:3000/api/cards');
                // const response = [
                //     {
                //         id: 1,
                //         name: 'Emirates',
                //         photo: 'https://www.emiratesnbd.com/-/media/enbd/images/campaign-form/images-and-icon/skywardscc_cardpack1.png?h=552&w=880&la=en&hash=3E94D9C2ADC973C4752FA6D90B377545',
                //         description: 'Let your dream travel plans take flight'
                //     },
                //     {
                //         id: 2,
                //         name: 'Etihad',
                //         photo: 'https://www.emiratesnbd.com/-/media/enbd/images/campaign-form/images-and-icon/etihad-cards-cardpack1.png?h=157&w=250&la=en&hash=DF79C44FD48DB62055C1F145DB6EE07C',
                //         description: 'Access to a world of rewards'
                //     },
                //     {
                //         id: 3,
                //         name: 'LuLu',
                //         photo: 'https://www.emiratesnbd.com/-/media/enbd/images/products/cards/credit-cards/new-cards-images/lulutitanium_card.png?h=552&w=880&la=en&hash=8DAD8A5909D24F733CE0D7C1992BAF3F',
                //         description: 'Shop as usual. Get more than usual.'
                //     }
                // ]
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

    // const handleSwitchChange = (checked) => {
    //     setAiMode(checked);
    // };

    const handleSwitchChange = (e) => {
        e.preventDefault();
        setAiMode(!aiMode);
    };

    return (
        <div className="landing-page">
            <div className="header">
                {/* {!aiMode && <h1>Credit Cards</h1>} */}
                <h1>Cards Genie</h1>
                <div className="switch-container">
                    <label>AI Mode</label>
                    <div className={`toggle-switch ${aiMode ? 'active' : ''}`} onClick={handleSwitchChange}>
                        <div className="toggle-handle"></div>
                    </div>
                </div>
            </div>
            {aiMode ? (
                <ChatBox />
            ) : (
                <div className="card-container">
                    {cards.map((card) => (
                        <CreditCard key={card.id} card={card} onClick={handleCardClick} />
                    ))}
                </div>
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
                    <button onClick={closeModal}>Close</button>
                </Modal>
            )}
        </div>
    );
};

export default LandingPage;