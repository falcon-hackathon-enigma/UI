import React from 'react';
import './CreditCard.css';

const CreditCard = ({ card, onClick, onSelect, isSelected }) => {
    const handleCardClick = (e) => {
        // Prevent the card click event if the checkbox is clicked
        if (e.target.type === 'checkbox') {
            return;
        }
        onClick(card);
    };

    return (
        <div className={`credit-card ${isSelected ? 'selected' : ''}`} onClick={handleCardClick}>
            <img src={card.imgUrl} alt={card.cardName} />
            <h3 className='card__title'>{card.cardName}</h3>
            <h6 className='fw-light'>{card.summary}</h6>
            <div className="checkbox-container">
                <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) => {
                        e.stopPropagation();
                        onSelect(card);
                    }}
                />
                <label>Select for Comparison</label>
            </div>
        </div>
    );
};

export default CreditCard;