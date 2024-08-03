import React from 'react';
import './CreditCard.css';

const CreditCard = ({ card, onClick }) => {
    return (
        <div className="credit-card" onClick={() => onClick(card)}>
            <img src={card.imgUrl} alt={card.cardName} />
            <h3 className='card__title'>{card.cardName}</h3>
            <h6 className='fw-light'>{card.summary}</h6>
        </div>
    );
};

export default CreditCard;
