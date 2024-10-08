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


class Score{
    handIndex: number;
    rank: HandRank;
    bestCard: number;
    hand: number[];

    constructor(handIndex: number, rank: HandRank, bestCard: number, hand: number[]) {
        this.handIndex = handIndex;
        this.rank = rank;
        this.bestCard = bestCard;
        this.hand = hand;
    }
}
  
export function dealFourHands(): [number[], number[][]] {
    const hands:number[][] = [[], [], [], []];
    const deck:number[] = getShuffledDeck();
    // deal 5 cards to each player, in proper order.
    // note that the order doesn't actually matter, but this is how the game is played.
    for (let i:number = 0; i < 20; i++) {
      hands[i%4].push(deck.pop() as number);
    }

    return [deck,hands];
}

export function findWinners(hands: number[][]): number[] {
    const sortedHands = getSortedHands(hands);
    
    // try to find the winners by comparing the hands, not the individual cards
    const scores:Score[] = sortedHands.map((hand, index) => {
        const [handRank,_]= getHandRank(hand);
        return new Score(index, handRank, getTieBreaker(handRank, hand), hand);
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
    for (let i:number = 1; i < scores.length; i++) {
        if (scores[i].rank === scores[0].rank && scores[i].bestCard === scores[0].bestCard) {
            winners.push(scores[i]);
        } else {
            break;
        }
    }

    // if we have ties, try and resolve by comparing the individual cards when possible
    if (winners.length > 1) {
        winners = edgeCaseCompare(winners);
    }

    return winners.map(score => score.handIndex);
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

// this is a display function, so it is not used in the game logic
// but moving it to display layer exposes internals of the game logic.
export function cardToString(card: number): string {
    const suite:string = cardToSuite(card);
    let base:number = 0;
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
    let offset:number = card % 13;
    if (offset > 10) {
        offset += 1;
    }
    return String.fromCodePoint(base + offset);
}

// create a card for testing (cft) - this is a test only helper function
// it is not used in the game logic, but moving it to test layer exposes internals of the game logic.
export function cft(faceValue: string, suite: Suite): number {
    let base:number = 0;
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
    let card:number = 0;
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

// Fisher-Yates shuffle (https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle)
function getShuffledDeck(): number[] {
    const deck:number[] = Array.from(Array(52).keys());
    for (let i:number = deck.length - 1; i > 0; i--) { 
      const j = Math.floor(Math.random() * (i + 1)); 
      [deck[i], deck[j]] = [deck[j], deck[i]]; 
    } 
    return deck; 
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
    let faceValue:number = card % 13;
    if (faceValue === 0) {
        faceValue = 13; // aces are high
    }
    return faceValue;
}

function getFlush(cards:number[]): number[] {
    const suite:string = cardToSuite(cards[0]);
    if (cards.every(card => cardToSuite(card) === suite)) {
        return cards;
    }
    return [];
}

function getStraight(sortedHand:number[]): number[] {
    for (let i:number = 1; i < sortedHand.length; i++) {
        if (cardToFaceValue(sortedHand[i]) !== cardToFaceValue(sortedHand[i-1]) + 1) {
            return [];
        }
    }
    return sortedHand;
}

function getSraightFlush(sortedHand:number[]): number[] {
    return getFlush(sortedHand).length != 0 && getStraight(sortedHand).length != 0 ? sortedHand : [];
}

// technically, a royal flush is a straight flush from 10 to Ace, so this is redundant,
// but I still like to see it explicitly
function getRoyalFlush(sortedHand:number[]): number[] {
    return getSraightFlush(sortedHand).length != 0 && cardToFaceValue(sortedHand[0]) === 9 ? sortedHand : [];
}

function getFourOfAKind(sortedHand:number[]): number[] {
    if (cardToFaceValue(sortedHand[0]) === cardToFaceValue(sortedHand[3])) {
        return sortedHand.slice(0,4);
    } else if (cardToFaceValue(sortedHand[1]) === cardToFaceValue(sortedHand[4])) {
        return sortedHand.slice(1,5);
    }
    return [];
}

function getFullHouse(sortedHand:number[]): number[] {
    
    if ((cardToFaceValue(sortedHand[0]) === cardToFaceValue(sortedHand[2]) && cardToFaceValue(sortedHand[3]) === cardToFaceValue(sortedHand[4])) ||  
            (cardToFaceValue(sortedHand[0]) === cardToFaceValue(sortedHand[1]) && cardToFaceValue(sortedHand[2]) === cardToFaceValue(sortedHand[4]))) {
        return sortedHand;
    }

    return [];
}

function getThreeOfAKind(sortedHand:number[]): number[] {
    if (cardToFaceValue(sortedHand[0]) === cardToFaceValue(sortedHand[2])) {
        return sortedHand.slice(0,3);
    } else if (cardToFaceValue(sortedHand[1]) === cardToFaceValue(sortedHand[3])) {
        return sortedHand.slice(1,4);
    } else if (cardToFaceValue(sortedHand[2]) === cardToFaceValue(sortedHand[4])) {
        return sortedHand.slice(2,5);
    }
    return [];
}

function getTwoPair(sortedHand:number[]): number[] {
    if (cardToFaceValue(sortedHand[0]) === cardToFaceValue(sortedHand[1]) && cardToFaceValue(sortedHand[2]) === cardToFaceValue(sortedHand[3])) {
        return [sortedHand[0],sortedHand[1],sortedHand[2],sortedHand[3]]
    } else if (cardToFaceValue(sortedHand[0]) === cardToFaceValue(sortedHand[1]) && cardToFaceValue(sortedHand[3]) === cardToFaceValue(sortedHand[4])) {
        return [sortedHand[0],sortedHand[1],sortedHand[3],sortedHand[4]]
    } else if (cardToFaceValue(sortedHand[1]) === cardToFaceValue(sortedHand[2]) && cardToFaceValue(sortedHand[3]) === cardToFaceValue(sortedHand[4])) {
        return [sortedHand[1],sortedHand[2],sortedHand[3],sortedHand[4]]
    }
    return []
}

function getPair(sortedHand:number[]): number[] {
    if (cardToFaceValue(sortedHand[0]) === cardToFaceValue(sortedHand[1])) {
        return([sortedHand[0], sortedHand[1]]);
    } else if (cardToFaceValue(sortedHand[1]) === cardToFaceValue(sortedHand[2])) {
        return([sortedHand[1], sortedHand[2]]);
    } else if (cardToFaceValue(sortedHand[2]) === cardToFaceValue(sortedHand[3])) { 
        return([sortedHand[2], sortedHand[3]]);
    } else if (cardToFaceValue(sortedHand[3]) === cardToFaceValue(sortedHand[4])) {
        return([sortedHand[3], sortedHand[4]]);
    }
    
    return [];        
}


export function getWinningCards(hand:number[]): number[] {
    
    let [_,winners] = getHandRank(sortByFaceValue(hand));
    return winners;
}

function getHandRank(sortedHand:number[]): [HandRank, number[]] {

    let winners = [];
    winners = getRoyalFlush(sortedHand);
    if (winners.length != 0) {
        return [HandRank.ROYAL_FLUSH, winners];
    }
    
    winners = getSraightFlush(sortedHand);
    if (winners.length != 0) {
        return [HandRank.STRAIGHT_FLUSH, winners];
    }
        
    winners = getFourOfAKind(sortedHand);
    if (winners.length != 0) {
        return [HandRank.FOUR_OF_A_KIND, winners];
    }
    
    winners = getFullHouse(sortedHand);
    if (winners.length != 0) {
        return [HandRank.FULL_HOUSE, winners];
    }

    winners = getFlush(sortedHand);
    if (winners.length != 0) {
        return [HandRank.FLUSH, winners];
    }
    
    winners = getStraight(sortedHand);
    if (winners.length != 0) {
        return [HandRank.STRAIGHT, winners];
    }
    
    winners = getThreeOfAKind(sortedHand);
    if (winners.length != 0) {
        return [HandRank.THREE_OF_A_KIND, winners];
    }
    
    winners = getTwoPair(sortedHand);
    if (winners.length != 0) {
        return [HandRank.TWO_PAIR, winners];
    }
    
    winners = getPair(sortedHand);
    if (winners.length != 0) {
        return [HandRank.PAIR, winners];
    }

    let faceValue = cardToFaceValue(sortedHand[sortedHand.length - 1]);
    return [HandRank.HIGH_CARD, [sortedHand[sortedHand.length - 1]]];
} 

// gets the tie breaker to be used when two hands have the same rank
// may result in special case ties, but that is handled later
function getTieBreaker(rank: HandRank, sortedHand:number[]): number {
    switch (rank) {
        case HandRank.ROYAL_FLUSH:
        case HandRank.STRAIGHT_FLUSH:
        case HandRank.STRAIGHT:
        case HandRank.FLUSH:
        case HandRank.HIGH_CARD:
            return cardToFaceValue(sortedHand[sortedHand.length - 1]);
        case HandRank.FOUR_OF_A_KIND:
        case HandRank.FULL_HOUSE:
        case HandRank.THREE_OF_A_KIND:
            return cardToFaceValue(sortedHand[2]);
        case HandRank.TWO_PAIR:
        case HandRank.PAIR:
            return getTieBreakerForPair(sortedHand);
        default:
            return -1;
    }
}

// when the hand is a pair or two pair, the tie breaker is the face value of the highest pair
// this may end up in an incorrect tie when face values of the highest pair match, but that is handled later
function getTieBreakerForPair(sortedHand:number[]): number { 
    for (let i:number = sortedHand.length - 1; i > 0; i--) {
        if (cardToFaceValue(sortedHand[i]) === cardToFaceValue(sortedHand[i-1])) {
            return cardToFaceValue(sortedHand[i]);
        }
    }
    return -1;
}

/*
    The remainder of the code is used for handling edge cases where the rank and best card are the same.
    This happens with pairs, two pairs, high card, and flushes. In these cases, the individual cards are compared.
    I think that this code could be simplified, but right now I don't see how to do it. This could/should be revisted.
*/

// when rank and best card are the same, ties can be resolved for some
// hands by comparing the individual cards
function edgeCaseCompare(scores:Score[]): Score[] {
    const rank:HandRank = scores[0].rank;
    if(rank === HandRank.PAIR || rank === HandRank.TWO_PAIR) {
        return edgeCaseBaseCompare(scores, edgeCaseCompareOneOrTwoPair);
    } else if (rank === HandRank.HIGH_CARD || rank === HandRank.FLUSH) {
        return edgeCaseBaseCompare(scores, edgeCaseCompareHighCard);
    } else {
        return scores;
    }
}

// compare two hands that are one pair or two pairs, for two pair we have already determined highest pair is a tie.
function edgeCaseCompareOneOrTwoPair(sortedHandOne: number[], sortedHandTwo: number[]): number {
    // in case of one pair the low pair is also the high pair.
    const lowPairValue:number = twoPairCompareLowPair(sortedHandOne, sortedHandTwo);
    if (lowPairValue !== 0) {
        return lowPairValue;
    }
    return edgeCaseCompareHighCard(getUnmatchedCardsSorted(sortedHandOne), getUnmatchedCardsSorted(sortedHandTwo));
}

function edgeCaseCompareHighCard(handOne: number[], handTwo: number[]): number {
    for(let i:number = handOne.length - 1; i >= 0; i--) {
        if (cardToFaceValue(handOne[i]) !== cardToFaceValue(handTwo[i])) {
            return cardToFaceValue(handTwo[i]) - cardToFaceValue(handOne[i]);
        }
    }
    return 0;
}

function twoPairCompareLowPair(sortedHandOne: number[], sortedHandTwo: number[]): number {
    const lowestPair = (sortedHand:number[]): number => {
        for (let i:number = 0; i < sortedHand.length - 1; i++) {
            if (cardToFaceValue(sortedHand[i]) === cardToFaceValue(sortedHand[i+1])) {
                return cardToFaceValue(sortedHand[i]);
            }
        }
        return 0;
    }
    return  lowestPair(sortedHandTwo) - lowestPair(sortedHandOne);
}

function getUnmatchedCardsSorted(hand:number[]): number[] {
    // counting fequency and filtering is based on suggestion from google AI
    const frequency:Map<number, number> = new Map<number, number>();
  
    // Count the frequency of each element
    for (const card of hand) {
        const faceValue:number = cardToFaceValue(card);
        const count:number = frequency.has(faceValue) ? frequency.get(faceValue) as number + 1 : 1;
        frequency.set(faceValue, count);
    }
  
    // Filter for elements that occur only once, sort by face value.
    const uniqueCards = hand.filter(card => frequency.get(cardToFaceValue(card)) === 1)
        .sort((a, b) => cardToFaceValue(a) - cardToFaceValue(b));

    return uniqueCards;
}

function edgeCaseBaseCompare(scores:Score[], comparitor:(lhs:number[], rhs:number[]) => number): Score[] {
    let winners:Score[] = [scores[0]];
    for (let i:number = 0; i < scores.length - 1; i++) {
        const result:number = comparitor(winners[0].hand, scores[i+1].hand)
        if (result === 0) {
            winners.push(scores[i+1]); // tie - add to the winners
        } else if (result > 0) { 
            winners = [scores[i+1]]; // new winner - replace the old ones
        }
    }
    return winners;
}