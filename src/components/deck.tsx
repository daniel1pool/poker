interface DeckProps {
    onDeckClick: () => void;
}


export function Deck ({onDeckClick}: DeckProps){
    return (
        <div className="deck" onClick={onDeckClick}>
        <span className='card card-deck'>&#127136;</span>
        <div className="deck-label">click to deal</div>
        </div>
    );
}