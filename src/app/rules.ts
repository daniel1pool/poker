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
        const handRank:HandRank = getHandRank(hand);
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

// create a card for testing - this is a test only helper function
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

function cardToFaceValue(card: number): number {
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

function isStraight(sortedHand:number[]): boolean {
    for (let i:number = 1; i < sortedHand.length; i++) {
        if (cardToFaceValue(sortedHand[i]) !== cardToFaceValue(sortedHand[i-1]) + 1) {
            return false;
        }
    }
    return true;
}

function isStraightFlush(sortedHand:number[]): boolean {
    return isFlush(sortedHand) && isStraight(sortedHand);
}

// technically, a royal flush is a straight flush from 10 to Ace, so this is redundant,
// but I still like to see it explicitly
function isRoyalFlush(sortedHand:number[]): boolean {
    return isStraightFlush(sortedHand) && cardToFaceValue(sortedHand[0]) === 9;
}

function isFourOfAKind(sortedHand:number[]): boolean {
    return cardToFaceValue(sortedHand[0]) === cardToFaceValue(sortedHand[3]) || cardToFaceValue(sortedHand[1]) === cardToFaceValue(sortedHand[4]);
}

function isFullHouse(sortedHand:number[]): boolean {
    return (cardToFaceValue(sortedHand[0]) === cardToFaceValue(sortedHand[2]) && cardToFaceValue(sortedHand[3]) === cardToFaceValue(sortedHand[4])) ||
           (cardToFaceValue(sortedHand[0]) === cardToFaceValue(sortedHand[1]) && cardToFaceValue(sortedHand[2]) === cardToFaceValue(sortedHand[4]));
}

function isThreeOfAKind(sortedHand:number[]): boolean {
    return  cardToFaceValue(sortedHand[0]) === cardToFaceValue(sortedHand[2]) || 
            cardToFaceValue(sortedHand[1]) === cardToFaceValue(sortedHand[3]) || 
            cardToFaceValue(sortedHand[2]) === cardToFaceValue(sortedHand[4]);
}

function isTwoPair(sortedHand:number[]): boolean {
    return (cardToFaceValue(sortedHand[0]) === cardToFaceValue(sortedHand[1]) && cardToFaceValue(sortedHand[2]) === cardToFaceValue(sortedHand[3])) ||
           (cardToFaceValue(sortedHand[0]) === cardToFaceValue(sortedHand[1]) && cardToFaceValue(sortedHand[3]) === cardToFaceValue(sortedHand[4])) ||
           (cardToFaceValue(sortedHand[1]) === cardToFaceValue(sortedHand[2]) && cardToFaceValue(sortedHand[3]) === cardToFaceValue(sortedHand[4]));
}

function isPair(sortedHand:number[]): boolean {
    return  cardToFaceValue(sortedHand[0]) === cardToFaceValue(sortedHand[1]) || 
            cardToFaceValue(sortedHand[1]) === cardToFaceValue(sortedHand[2]) || 
            cardToFaceValue(sortedHand[2]) === cardToFaceValue(sortedHand[3]) || 
            cardToFaceValue(sortedHand[3]) === cardToFaceValue(sortedHand[4]);
}

function getHandRank(sortedHand:number[]): HandRank {
    if (isRoyalFlush(sortedHand)) {
        return HandRank.ROYAL_FLUSH;
    } else if (isStraightFlush(sortedHand)) {
        return HandRank.STRAIGHT_FLUSH;
    } else if (isFourOfAKind(sortedHand)) {
        return HandRank.FOUR_OF_A_KIND;
    } else if (isFullHouse(sortedHand)) {
        return HandRank.FULL_HOUSE;
    } else if (isFlush(sortedHand)) {
        return HandRank.FLUSH;
    } else if (isStraight(sortedHand)) {
        return HandRank.STRAIGHT;
    } else if (isThreeOfAKind(sortedHand)) {
        return HandRank.THREE_OF_A_KIND;
    } else if (isTwoPair(sortedHand)) {
        return HandRank.TWO_PAIR;
    } else if (isPair(sortedHand)) {
        return HandRank.PAIR;
    } else {
        return HandRank.HIGH_CARD;
    }
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
// this may end up in an incorrect tie, but that is handled later
function getTieBreakerForPair(sortedHand:number[]): number { 
    for (let i:number = sortedHand.length - 1; i > 0; i--) {
        if (cardToFaceValue(sortedHand[i]) === cardToFaceValue(sortedHand[i-1])) {
            return cardToFaceValue(sortedHand[i]);
        }
    }
    return -1;
}

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

// compare two hands that are pairs or two pairs, assumes that the highest pair is a tie
function edgeCaseCompareOneOrTwoPair(sortedHandOne: number[], sortedHandTwo: number[]): number {
    // this may be overkill for two pair, but it works and avoids extra code
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
    return lowestPair(sortedHandOne) - lowestPair(sortedHandTwo);
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