export default function FlightBg() {
  return (
    <div className="flight-bg">
      <svg viewBox="0 0 1200 500" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
        <path className="arc" d="M120,380 Q400,120 720,180" />
        <path className="arc" d="M120,380 Q500,300 980,240" style={{ animationDelay: '1s' }} />
        <path className="arc" d="M720,180 Q950,150 1120,320" style={{ animationDelay: '2s' }} />
        <circle className="node" cx="120" cy="380" r="4" />
        <circle className="node" cx="720" cy="180" r="3" />
        <circle className="node" cx="980" cy="240" r="3" />
        <circle className="node" cx="1120" cy="320" r="3" />
      </svg>
    </div>
  );
}
