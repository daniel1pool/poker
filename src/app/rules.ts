export enum Suite {
    SPADES = 'SPADES',
    HEARTS = 'HEARTS',
    DIAMONDS = 'DIAMONDS',
    CLUBS = 'CLUBS'
}

enum HandRank {
    ROYAL_FLUSH = 10,
    STRAIGHT_FLUSH = 9,
    FOUR_OF_A_KIND = 8,
    FULL_HOUSE = 7,
    FLUSH = 6,
    STRAIGHT = 5,
    THREE_OF_A_KIND = 4,
    TWO_PAIR = 3,
    PAIR = 2,
    HIGH_CARD = 1
}

// Fisher-Yates shuffle (https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle)
export function getShuffledDeck(): number[] {
    const deck:number[] = Array.from(Array(52).keys());
    for (let i:number = deck.length - 1; i > 0; i--) { 
      const j = Math.floor(Math.random() * (i + 1)); 
      [deck[i], deck[j]] = [deck[j], deck[i]]; 
    } 
    return deck; 
}
  
export function dealFourHands(deck: number[]): [number[], number[][]] {
    const hands:number[][] = [[], [], [], []];
    // deal 5 cards to each player, in proper order.
    // note that the order doesn't matter, but this is how the game is played.
    for (let i:number = 0; i < 20; i++) {
      hands[i%4].push(deck.pop() as number);
    }
    return [deck,hands];
}

export function cardToSuite(card: number): string {
    if (card >= 0 && card <= 12) {
        return Suite.SPADES;
    } else if (card >= 13 && card <= 25) {
        return Suite.HEARTS;
    } else if (card >= 26 && card <= 38) {
        return Suite.DIAMONDS;
    } else if (card >= 39 && card <= 51) { 
        return Suite.CLUBS;
    }
    return 'NOT FOUND';
}

export function cardToString(card: number): string {
    const suite:string = cardToSuite(card);
    let base: number = 0;
    switch (suite) {
        case Suite.SPADES:
            base = 0x1F0A1;
            break;
        case Suite.HEARTS:
            base = 0x1F0B1;
            break;
        case Suite.DIAMONDS:
            base = 0x1F0C1;
            break;
        case Suite.CLUBS:
            base = 0x1F0D1;
            break;
    }
    let offset = card % 13;
    if (offset > 10) {
        offset += 1;
    }
    return String.fromCodePoint(base + offset);
}

// create a card for testing - this testing is a helper function
export function cft(faceValue: string, suite: Suite): number {
    let base: number = 0;
    switch (suite) {
        case Suite.SPADES:
            base = 0;
            break;
        case Suite.HEARTS:
            base = 13;
            break;
        case Suite.DIAMONDS:
            base = 26;
            break;
        case Suite.CLUBS:
            base = 39;
            break;
    }
    let card = 0;
    switch (faceValue) {
        case 'J':
            card = 10;
            break;
        case 'Q':
            card = 11;
            break;
        case 'K':
            card = 12;
            break;
        case 'A':
            card = 0;
            break;
        default:
            card = parseInt(faceValue) - 1;
            break;
    }
    return base + card;
}

function getSortedHands(hands: number[][]): number[][] {
    return hands.map(hand => sortByFaceValue(hand));
}

function sortByFaceValue(cards:number[]): number[] {
    const sorted = cards.slice();
    sorted.sort((a, b) => cardToFaceValue(a) - cardToFaceValue(b));
    return sorted;
}

export function cardToFaceValue(card: number): number {
    // map numbers from 0 to 51 to face values 2 to ace
    let faceValue = card % 13;
    if (faceValue === 0) {
        faceValue = 13; // aces are high
    }
    return faceValue;
}

function isFlush(cards:number[]): boolean {
    const suite:string = cardToSuite(cards[0]);
    return cards.every(card => cardToSuite(card) === suite);
}

function isStraight(sortedCards:number[]): boolean {
    for (let i:number = 1; i < sortedCards.length; i++) {
        if (cardToFaceValue(sortedCards[i]) !== cardToFaceValue(sortedCards[i-1]) + 1) {
            return false;
        }
    }
    return true;
}

function isStraightFlush(sortedCards:number[]): boolean {
    return isFlush(sortedCards) && isStraight(sortedCards);
}

// technically, a royal flush is a straight flush from 10 to Ace, so this is redundant,
// but as a poker player, I like to see it explicitly
function isRoyalFlush(sortedCards:number[]): boolean {
    return isStraightFlush(sortedCards) && cardToFaceValue(sortedCards[0]) === 9;
}

function isFourOfAKind(sortedCards:number[]): boolean {
    return cardToFaceValue(sortedCards[0]) === cardToFaceValue(sortedCards[3]) || cardToFaceValue(sortedCards[1]) === cardToFaceValue(sortedCards[4]);
}

function isFullHouse(sortedCards:number[]): boolean {
    return (cardToFaceValue(sortedCards[0]) === cardToFaceValue(sortedCards[2]) && cardToFaceValue(sortedCards[3]) === cardToFaceValue(sortedCards[4])) ||
           (cardToFaceValue(sortedCards[0]) === cardToFaceValue(sortedCards[1]) && cardToFaceValue(sortedCards[2]) === cardToFaceValue(sortedCards[4]));
}

function isThreeOfAKind(sortedCards:number[]): boolean {
    return  cardToFaceValue(sortedCards[0]) === cardToFaceValue(sortedCards[2]) || 
            cardToFaceValue(sortedCards[1]) === cardToFaceValue(sortedCards[3]) || 
            cardToFaceValue(sortedCards[2]) === cardToFaceValue(sortedCards[4]);
}

function isTwoPair(sortedCards:number[]): boolean {
    return (cardToFaceValue(sortedCards[0]) === cardToFaceValue(sortedCards[1]) && cardToFaceValue(sortedCards[2]) === cardToFaceValue(sortedCards[3])) ||
           (cardToFaceValue(sortedCards[0]) === cardToFaceValue(sortedCards[1]) && cardToFaceValue(sortedCards[3]) === cardToFaceValue(sortedCards[4])) ||
           (cardToFaceValue(sortedCards[1]) === cardToFaceValue(sortedCards[2]) && cardToFaceValue(sortedCards[3]) === cardToFaceValue(sortedCards[4]));
}

function isPair(sortedCards:number[]): boolean {
    return  cardToFaceValue(sortedCards[0]) === cardToFaceValue(sortedCards[1]) || 
            cardToFaceValue(sortedCards[1]) === cardToFaceValue(sortedCards[2]) || 
            cardToFaceValue(sortedCards[2]) === cardToFaceValue(sortedCards[3]) || 
            cardToFaceValue(sortedCards[3]) === cardToFaceValue(sortedCards[4]);
}

function getHandRank(cards:number[]): HandRank {
    const sortedCards = sortByFaceValue(cards);
    if (isRoyalFlush(sortedCards)) {
        return HandRank.ROYAL_FLUSH;
    } else if (isStraightFlush(sortedCards)) {
        return HandRank.STRAIGHT_FLUSH;
    } else if (isFourOfAKind(sortedCards)) {
        return HandRank.FOUR_OF_A_KIND;
    } else if (isFullHouse(sortedCards)) {
        return HandRank.FULL_HOUSE;
    } else if (isFlush(sortedCards)) {
        return HandRank.FLUSH;
    } else if (isStraight(sortedCards)) {
        return HandRank.STRAIGHT;
    } else if (isThreeOfAKind(sortedCards)) {
        return HandRank.THREE_OF_A_KIND;
    } else if (isTwoPair(sortedCards)) {
        return HandRank.TWO_PAIR;
    } else if (isPair(sortedCards)) {
        return HandRank.PAIR;
    } else {
        return HandRank.HIGH_CARD;
    }
}

// gets the tie breaker to be used when two hands have the same rank
function getTieBreaker(rank: HandRank, sortedCards:number[]): number {
    switch (rank) {
        case HandRank.ROYAL_FLUSH:
        case HandRank.STRAIGHT_FLUSH:
        case HandRank.STRAIGHT:
        case HandRank.FLUSH:
        case HandRank.HIGH_CARD:
            return cardToFaceValue(sortedCards[sortedCards.length - 1]);
        case HandRank.FOUR_OF_A_KIND:
        case HandRank.FULL_HOUSE:
        case HandRank.THREE_OF_A_KIND:
            return cardToFaceValue(sortedCards[2]);
        case HandRank.TWO_PAIR:
        case HandRank.PAIR:
            return getTieBreakerForPair(sortedCards);
        default:
            return -1;
    }
}

// gets the tie breaker to be used when comparing hands of pair, or two pair
function getTieBreakerForPair(sortedCards:number[]): number { 
    for (let i = sortedCards.length - 1; i > 0; i--) {
        if (cardToFaceValue(sortedCards[i]) === cardToFaceValue(sortedCards[i-1])) {
            return cardToFaceValue(sortedCards[i]);
        }
    }
    return -1;
}

class Score{
    handIndex: number;
    rank: HandRank;
    bestCard: number;

    constructor(index: number, rank: HandRank, bestCard: number) {
        this.handIndex = index;
        this.rank = rank;
        this.bestCard = bestCard;
    }
}

function edgeCaseCompareOneOrTwoPair(handOne: number[], handTwo: number[]): number {
    // this is overkill for two pair, but it works and avoids extra code
    return edgeCaseCompareHighCard(getUnmatchedCardsSorted(handOne), getUnmatchedCardsSorted(handTwo));
}

function getUnmatchedCardsSorted(cards:number[]): number[] {
    // counting fequency and filtering is based on suggestion from google AI
    const frequency:Map<number, number> = new Map<number, number>();
  
    // Count the frequency of each element
    for (let value of cards) {
        const faceValue:number = cardToFaceValue(value);
        const count:number = frequency.has(faceValue) ? frequency.get(faceValue) as number + 1 : 1;
        frequency.set(faceValue, count);
    }
  
    // Filter for elements that occur only once, sort by face value.
    const uniqueCards = cards.filter(card => frequency.get(cardToFaceValue(card)) === 1)
        .sort((a, b) => cardToFaceValue(a) - cardToFaceValue(b));

    return uniqueCards;
}

function edgeCaseCompareHighCard(hand1Cards: number[], hand2Cards: number[]): number {
    for(let i = hand1Cards.length - 1; i >= 0; i--) {
        if (cardToFaceValue(hand1Cards[i]) !== cardToFaceValue(hand2Cards[i])) {
            return cardToFaceValue(hand2Cards[i]) - cardToFaceValue(hand1Cards[i]);
        }
    }
    return 0;
}

function edgeCaseBaseFind(scores:Score[], cards:number[][], comparitor:(lhs:number[], rhs:number[]) => number): Score[] {
    let winners:Score[] = [scores[0]];
    for (let i = 0; i < scores.length - 1; i++) {
        let result = comparitor(cards[winners[0].handIndex], cards[scores[i+1].handIndex])
        if (result === 0) {
            winners.push(scores[i+1]); // tie - add to the winners
        } else if (result > 0) { 
            winners = [scores[i+1]]; // new winner - replace the old ones
        }
    }
    return winners;
}

// when rank and best card are the same, ties can be resolved for some
// hands by comparing the individual cards
function edgeCaseCompare(scores:Score[], cards:number[][]): Score[] {
    const rank:HandRank = scores[0].rank;
    if(rank === HandRank.PAIR || rank === HandRank.TWO_PAIR) {
        return edgeCaseBaseFind(scores, cards, edgeCaseCompareOneOrTwoPair);
    } else if (rank === HandRank.HIGH_CARD || rank === HandRank.FLUSH) {
        return edgeCaseBaseFind(scores, cards, edgeCaseCompareHighCard);
    } else {
        return scores;
    }
}
export function findWinners(hands: number[][]): number[] {
    const sortedHands = getSortedHands(hands);
    
    // try to find the winners by comparing the hands, not the individual cards
    const scores:Score[] = sortedHands.map((hand, index) => {
        const handRank:HandRank = getHandRank(hand);
        return new Score(index, handRank, getTieBreaker(handRank, hand));
    })

    scores.sort((lhs, rhs) =>{
        if (lhs.rank !== rhs.rank) {
            return rhs.rank - lhs.rank;
        } else {
            return rhs.bestCard - lhs.bestCard;
        } 
    });

    // collect the winners (ties are possible)
    let winners:Score[] = [scores[0]];
    for (let i = 1; i < scores.length; i++) {
        if (scores[i].rank === scores[0].rank && scores[i].bestCard === scores[0].bestCard) {
            winners.push(scores[i]);
        } else {
            break;
        }
    }

    // if we have ties try and resolve as an edge case
    if (winners.length > 1) {
        winners = edgeCaseCompare(winners, sortedHands);
    }

    return winners.map(score => score.handIndex);
}