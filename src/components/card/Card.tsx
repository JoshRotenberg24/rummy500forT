import { motion } from 'framer-motion';
import '../../styles/card.css';
import { Card as CardType } from '../../engine/types';
import { SUIT_SYMBOL, suitColorClass } from '../../utils/cardUtils';

interface CardProps {
  card: CardType;
  selected?: boolean;
  isDrawnCard?: boolean;
  hologram?: boolean;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  disabled?: boolean;
  style?: React.CSSProperties;
}

const SIZE_STYLES = {
  sm: { width: 48, height: 68, rankSize: 8, suitCenterSize: 20 },
  md: { width: 62, height: 88, rankSize: 10, suitCenterSize: 26 },
  lg: { width: 78, height: 110, rankSize: 12, suitCenterSize: 32 },
};

export function Card({ card, selected, isDrawnCard, hologram, size = 'md', onClick, disabled, style }: CardProps) {
  const dim = SIZE_STYLES[size];
  const colorClass = suitColorClass(card.suit);

  return (
    <motion.div
      className={`card ${selected ? 'selected' : ''} ${isDrawnCard ? 'drawn-card' : ''} ${hologram ? 'hologram' : ''}`}
      style={{ width: dim.width, height: dim.height, ...style }}
      onClick={!disabled ? onClick : undefined}
      whileHover={!disabled ? { scale: 1.04 } : undefined}
      whileTap={!disabled ? { scale: 0.97 } : undefined}
      layout
    >
      <div className="card-shimmer" />
      <div className="card-inner">
        {/* Top-left rank + suit */}
        <div className="flex flex-col items-start gap-0.5">
          <span className={`card-rank ${colorClass}`} style={{ fontSize: dim.rankSize }}>
            {card.rank}
          </span>
          <span className={`card-suit-small ${colorClass}`} style={{ fontSize: dim.rankSize - 1 }}>
            {SUIT_SYMBOL[card.suit]}
          </span>
        </div>

        {/* Center suit (decorative) */}
        <div className={`card-suit-center ${colorClass}`} style={{ fontSize: dim.suitCenterSize }}>
          {SUIT_SYMBOL[card.suit]}
        </div>

        {/* Bottom-right rank + suit (rotated) */}
        <div className="flex flex-col items-end gap-0.5" style={{ transform: 'rotate(180deg)' }}>
          <span className={`card-rank ${colorClass}`} style={{ fontSize: dim.rankSize }}>
            {card.rank}
          </span>
          <span className={`card-suit-small ${colorClass}`} style={{ fontSize: dim.rankSize - 1 }}>
            {SUIT_SYMBOL[card.suit]}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
