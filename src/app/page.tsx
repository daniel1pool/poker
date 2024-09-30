'use client';
import React, { useRef, useState } from 'react';
import {Deck} from '../components/deck';
import {Hand} from '../components/hand';
import * as rules from './rules';

export default function Home() {

  const deck = useRef<number[]>([]);
  /*
    todo : make winners and isHandFinished the same - maybe both are arrays of booleans
  */
  const [hands, setHands] = useState<number[][]>([[], [], [], []]);
  const [isHandFinished, setIsHandFinished] = React.useState<boolean[]>([false, false, false, false]);
  const [winners, setWinners] = React.useState<number[]>([]);

  function onDeckClick ()  {
    const [newDeck, newHands] = rules.dealFourHands(rules.getShuffledDeck());
    deck.current = newDeck;
    setHands(newHands);
    setIsHandFinished([false, false, false, false]);
    setWinners([]);
  }

  function finishHand(discards: number[], handIndex: number) {
    // replace discards with new cards from the deck
    const updatedHands:number[][] = hands.map(hand => hand.map(card => {
      return !discards.includes(card) ? card : deck.current.pop() as number;
    }));
    setHands(updatedHands);
    
    const updatedIsFinished:boolean[] = isHandFinished.slice();

    updatedIsFinished[handIndex] = true;
    setIsHandFinished(updatedIsFinished);

    if (!updatedIsFinished.includes(false)) {
      setWinners(rules.findWinners(hands));
    }
  }

  return (
    <div>
      <Deck onDeckClick={onDeckClick} /> 
      { 
        hands.map((hand, index) => <Hand key={index} cards={hand} handIndex={index} 
                                          finishHand={finishHand} isFinished={isHandFinished[index]}
                                          isWinner={winners.includes(index)}/>)
      }
    </div>
  );
}
