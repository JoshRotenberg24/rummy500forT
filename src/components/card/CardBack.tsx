import '../../styles/card.css';

interface CardBackProps {
  size?: 'sm' | 'md' | 'lg';
  style?: React.CSSProperties;
}

const SIZE_STYLES = {
  sm: { width: 48, height: 68 },
  md: { width: 62, height: 88 },
  lg: { width: 78, height: 110 },
};

export function CardBack({ size = 'md', style }: CardBackProps) {
  const dim = SIZE_STYLES[size];
  return (
    <div className="card card-back" style={{ width: dim.width, height: dim.height, ...style }}>
      <div className="card-back-pattern" />
    </div>
  );
}
