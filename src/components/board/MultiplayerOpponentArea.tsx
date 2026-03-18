import { Card as CardType, Meld } from '../../engine/types';
import { Card } from '../card/Card';
import { CardBack } from '../card/CardBack';

interface Props {
  hand: CardType[];
  melds: Meld[];
  isThinking: boolean;
}

export function MultiplayerOpponentArea({ hand, melds, isThinking }: Props) {
  return (
    <div className="flex flex-col gap-2 px-3 py-2">
      <div className="flex items-center gap-3">
        <span className="text-[8px] neon-purple font-pixel">OPPONENT</span>
        {isThinking && (
          <span className="text-[7px] neon-pink animate-pulse">THINKING...</span>
        )}
        <div className="flex items-center gap-1.5 ml-auto">
          <CardBack size="sm" />
          <span className="text-[8px] neon-blue">× {hand.length}</span>
        </div>
      </div>

      {melds.length > 0 && (
        <div className="flex gap-3 overflow-x-auto pb-1">
          {melds.map(meld => (
            <div key={meld.id} className="flex gap-0.5 shrink-0">
              {meld.cards.map(card => (
                <Card key={card.id} card={card} size="sm" disabled />
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
