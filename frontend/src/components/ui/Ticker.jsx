const ITEMS = ['Visa Infinite','Mastercard World','Amex Platinum','HDFC Regalia','Axis Magnus','ICICI Amazon Pay','Kotak 811','Citibank Premier Miles','SBI SimplyCLICK','Flipkart Axis']

export default function Ticker() {
  const doubled = [...ITEMS, ...ITEMS]
  return (
    <div className="ticker-wrap">
      <div className="ticker-track">
        {doubled.map((item, i) => (
          <span className="ticker-item" key={i}>
            {item}<span className="ticker-sep">◆</span>
          </span>
        ))}
      </div>
    </div>
  )
}
