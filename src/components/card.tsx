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
    
    const suite:string = cardToSuite(value);
    const colorClass:string = (suite === Suite.SPADES || suite === Suite.CLUBS) ? ' black' : ' red';
    const selectedClass:string = selected ? ' selected-card' : '';
    const classes:string = `card${colorClass}${selectedClass}`;
    return <span onClick={onClick} className={classes}>{ cardToString(value)}</span>
}