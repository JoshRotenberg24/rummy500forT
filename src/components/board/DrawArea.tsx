import { useGameStore } from '../../store/gameStore';
import { findValidMelds, canExtendMeld } from '../../engine/meld';
import { Card as CardType, Meld } from '../../engine/types';
import { Card } from '../card/Card';
import { CardBack } from '../card/CardBack';

const DISCARD_OVERLAP = 18; // px exposed per discard card
const DISCARD_CARD_W = 48;  // sm card width
const DISCARD_CARD_H = 68;  // sm card height

function canMeld(hand: CardType[], discardPile: CardType[], targetIdx: number, melds: Meld[]): boolean {
  const takenCards = discardPile.slice(targetIdx);
  const targetCard = takenCards[0];
  const combined = [...hand, ...takenCards];
  const newMelds = findValidMelds(combined);
  if (newMelds.some(m => m.some(c => c.id === targetCard.id))) return true;
  return melds.some(m => canExtendMeld(m, [targetCard]));
}

export function DrawArea() {
  const state = useGameStore(s => s.state);
  const dispatch = useGameStore(s => s.dispatch);

  const { deck, discardPile, turn, melds } = state;
  const hand = state.players.player.hand;
  const canDraw = turn.phase === 'draw' && turn.activePlayer === 'player';

  const fanWidth = discardPile.length > 0
    ? DISCARD_OVERLAP * (discardPile.length - 1) + DISCARD_CARD_W
    : DISCARD_CARD_W;

  return (
    <div className="flex items-center gap-4 px-3 py-2">
      {/* Deck */}
      <div className="flex flex-col items-center gap-1 flex-shrink-0">
        <div
          className={`relative ${canDraw ? 'cursor-pointer' : 'cursor-default'}`}
          onClick={() => canDraw && dispatch({ type: 'DRAW_FROM_DECK' })}
        >
          <CardBack size="md" />
          <div
            className="absolute -top-2 -right-2 bg-purple-900 border border-purple-500 rounded-full text-[7px] neon-purple px-1.5 py-0.5"
            style={{ minWidth: 20, textAlign: 'center' }}
          >
            {deck.length}
          </div>
          {canDraw && (
            <div className="absolute inset-0 rounded-lg ring-2 ring-purple-500 ring-opacity-60 animate-pulse" />
          )}
        </div>
        <span className="text-[6px] text-gray-500">DECK</span>
      </div>

      {/* Discard pile — fanned inline */}
      <div className="flex flex-col gap-1">
        <div className="overflow-x-auto" style={{ maxWidth: 'min(50vw, 260px)' }}>
          {discardPile.length === 0 ? (
            <div
              className="rounded-lg border-2 border-dashed border-gray-700 flex items-center justify-center flex-shrink-0"
              style={{ width: DISCARD_CARD_W, height: DISCARD_CARD_H }}
            >
              <span className="text-gray-600">∅</span>
            </div>
          ) : (
            <div className="relative flex-shrink-0" style={{ width: fanWidth, height: DISCARD_CARD_H }}>
              {discardPile.map((card, i) => {
                const meldable = canMeld(hand, discardPile, i, melds);
                const isTop = i === discardPile.length - 1;
                const clickable = canDraw && meldable;
                return (
                  <div
                    key={card.id}
                    style={{
                      position: 'absolute',
                      left: i * DISCARD_OVERLAP,
                      top: 0,
                      zIndex: i + 1,
                    }}
                    className={clickable ? 'cursor-pointer' : 'cursor-default'}
                    onClick={() => clickable && dispatch({ type: 'DRAW_FROM_DISCARD', cardId: card.id })}
                    title={canDraw && !meldable ? "Can't meld this card" : undefined}
                  >
                    <Card
                      card={card}
                      size="sm"
                      disabled={!clickable}
                      style={canDraw && !meldable ? { opacity: 0.4 } : undefined}
                    />
                    {clickable && isTop && (
                      <div className="absolute inset-0 rounded-lg ring-2 ring-blue-400 ring-opacity-60 animate-pulse" />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
        <span className="text-[6px] text-gray-500">
          DISCARD {discardPile.length > 0 && `(${discardPile.length})`}
        </span>
      </div>
    </div>
  );
}
