import React from 'react';
import {Card} from './card';
import * as rules from '../app/rules';



interface HandProps {
    cards: number[];
    handIndex: number;
    finishHand: (handIndex:number) => void;
    updateSelection: (handIndex:number, card: number) => void;
    isFinished: boolean;
    isWinner: boolean;
    selectedCards: number[];
}

export function Hand({cards, handIndex, finishHand, isFinished, updateSelection, selectedCards, isWinner}: HandProps) {

    function onCardClick(card: number) {
        if (isFinished) {
            return;
        }
        updateSelection(handIndex, card);
    }

    function onFinishClick() {
        if (isFinished) {
            return;
        }
        finishHand(handIndex);
    }

    let buttonLabel:string;
    let buttonStateClass:string = ' hand-finish-button-active';
    if (isWinner) {
        buttonLabel = "Winner";
        buttonStateClass = ' hand-finish-button-winner';
    } else if (isFinished) {
        buttonLabel = "Done";
        buttonStateClass = ' hand-finish-button-disabled';
    } else if (selectedCards.length > 0) {
        buttonLabel = 'Discard';
    } else {
        buttonLabel = 'Stay';
    }


    return (
        <div className='hand no-select'>
            
            <div>
            {cards.map((card, index) => {
                const isSelected:boolean = selectedCards.includes(card);
                return <Card value={card} key={index} onCardClick={onCardClick} selected={isSelected}/>
            })}
            </div>
            {cards.length > 0 && <button onClick={onFinishClick} className={`hand-finish-button${buttonStateClass}`}>{buttonLabel}</button>}
        </div>
    );
}