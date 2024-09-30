import React from 'react';
import {Card} from './card';

interface HandProps {
    cards: number[];
    handIndex: number;
    finishHand: (cards: number[], index:number) => void;
    isFinished: boolean;
    isWinner: boolean
}

export function Hand({cards, handIndex, finishHand, isFinished, isWinner}: HandProps) {

    const [selectedCards, setSelectedCards] = React.useState<number[]>([]);

    function onCardClick(card: number) {
        if (isFinished) {
            return;
        }
        const index:number = selectedCards.indexOf(card);
    
        const updatedSelectedCards:number[] = selectedCards.slice();

        if (index === -1) {
            updatedSelectedCards.push(card);
        } else {
            updatedSelectedCards.splice(index, 1);
        }
        setSelectedCards(updatedSelectedCards);
    }

    function onFinishClick() {
        if (isFinished) {
            return;
        }
        finishHand(selectedCards, handIndex);
        setSelectedCards([]);
    }

    let buttonLabel:string;
    if (isWinner) {
        buttonLabel = "Winner";
    } else if (isFinished) {
        buttonLabel = "Done";
    } else if (selectedCards.length > 0) {
        buttonLabel = 'Discard';
    } else {
        buttonLabel = 'Stay';
    }

    let buttonClass:string = 'hand-finish-button';
    if(isWinner) {
        buttonClass += ' hand-finish-button-winner';
    } else if (isFinished) {
        buttonClass += ' hand-finish-button-disabled';
    } else {
        buttonClass += ' hand-finish-button-active';
    }

    return (
        <div className='hand'>
            <div>
            {cards.map((card, index) => {
                const isSelected:boolean = selectedCards.includes(card);
                return <Card value={card} key={index} onCardClick={onCardClick} selected={isSelected}/>
            })}
            </div>
            {cards.length > 0 && <button onClick={onFinishClick} className={buttonClass}>{buttonLabel}</button>}
        </div>
    );
}