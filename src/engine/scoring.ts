import { Card, GameState, Meld, PlayerId } from './types';

export function cardPoints(card: Card): number {
  if (card.rank === 'A') return 15;
  if (['J', 'Q', 'K'].includes(card.rank)) return 10;
  return 5;
}

export function scoreHand(cards: Card[]): number {
  return cards.reduce((sum, c) => sum + cardPoints(c), 0);
}

export function scoreMelds(melds: Meld[], playerId: PlayerId): number {
  return melds
    .filter(m => m.ownerId === playerId)
    .reduce((sum, m) => sum + scoreHand(m.cards), 0);
}

export function calculateRoundScores(state: GameState): Record<PlayerId, number> {
  const playerMeldScore = scoreMelds(state.melds, 'player');
  const opponentMeldScore = scoreMelds(state.melds, 'opponent');

  const playerHandPenalty = scoreHand(state.players.player.hand);
  const opponentHandPenalty = scoreHand(state.players.opponent.hand);

  return {
    player: playerMeldScore - playerHandPenalty,
    opponent: opponentMeldScore - opponentHandPenalty,
  };
}
