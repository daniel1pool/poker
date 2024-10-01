'use client';
import React, { useRef, useState } from 'react';
import {Deck} from '../components/deck';
import {Hand} from '../components/hand';
import * as rules from './rules';

export default function Home() {

  const deck = useRef<number[]>([]);
  const [hands, setHands] = useState<number[][]>([[], [], [], []]);
  const [isHandFinished, setIsHandFinished] = React.useState<boolean[]>([false, false, false, false]);
  const [selectedCards, setSelectedCards] = React.useState<number[][]>([[],[],[],[],[]]);
  const [winners, setWinners] = React.useState<number[]>([]);

  function onDeckClick ()  {
    const [newDeck, newHands] = rules.dealFourHands(rules.getShuffledDeck());
    deck.current = newDeck;
    setHands(newHands);
    setIsHandFinished([false, false, false, false]);
    setSelectedCards([[],[],[],[],[]]);
    setWinners([]);
  }

  function finishHand(handIndex: number) {
    // replace discards with new cards from the deck
    let discards = selectedCards[handIndex];
    if (discards.length !== 0) {
        const updatedHands:number[][] = hands.map(hand => hand.map(card => {
          return !discards.includes(card) ? card : deck.current.pop() as number;
        }));
        setHands(updatedHands);
        clearSelection(handIndex);
    }

    const updatedIsFinished:boolean[] = isHandFinished.slice();
    updatedIsFinished[handIndex] = true;
    setIsHandFinished(updatedIsFinished);

    if (!updatedIsFinished.includes(false)) {
      setWinners(rules.findWinners(hands));
    }
  }

  function updateSelection(handIndex: number, card: number) {
    const updatedSelections:number[][] = selectedCards.slice();
    if (updatedSelections[handIndex].includes(card)) {
      updatedSelections[handIndex] = updatedSelections[handIndex].filter(c => c !== card);
    } else {
      updatedSelections[handIndex].push(card);
    }
    setSelectedCards(updatedSelections);
  }

  function clearSelection(handIndex: number) {
    const updatedSelections:number[][] = selectedCards.slice();
    updatedSelections[handIndex] = [];
    setSelectedCards(updatedSelections);
  }

  return (
    <div>
      <Deck onDeckClick={onDeckClick} /> 
      { 
        hands.map((hand, index) => <Hand key={index} cards={hand} handIndex={index} 
                                          finishHand={finishHand} isFinished={isHandFinished[index]}
                                          updateSelection={updateSelection}
                                          selectedCards={selectedCards[index]}
                                          isWinner={winners.includes(index)}/>)
      }
    </div>
  );
}
