interface DeckProps {
    onDeckClick: () => void;
}


export function Deck ({onDeckClick}: DeckProps){
    return (
        <div className="deck no-select">
        <span className='card deck-card' onClick={onDeckClick}>&#127136;</span>
        <div className="deck-label">click deck to deal</div>
        </div>
    );
}