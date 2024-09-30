import React from 'react';
import {cardToString, cardToSuite, Suite} from '../app/rules';


interface CardProps {
    value:number;
    onCardClick: (card: number) => void;
    selected: boolean;
}

export function Card({value, onCardClick, selected}: CardProps){

    function onClick() {
        onCardClick(value);
    }
    
    let unicodeChar = cardToString(value);
    let suite = cardToSuite(value);
    let colorClass = suite === Suite.SPADES || suite === Suite.CLUBS ? ' black' : ' red';
    let selectedClass = selected ? ' selected-card' : '';
    let classes = `card${colorClass}${selectedClass}`;
    return <span onClick={onClick} className={classes}>{unicodeChar}</span>
}