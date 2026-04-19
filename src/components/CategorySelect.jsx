const CATEGORIES = [
  {
    id: 'kopfrechnen',
    name: 'Kopfrechnen',
    description:
      'Addition, Subtraktion, Multiplikation, Division — schnell im Kopf loesen',
    icon: '42',
  },
  {
    id: 'quadratzahlen',
    name: 'Quadratzahlen',
    description:
      'Quadratzahlen erkennen, berechnen und Wurzeln ziehen',
    icon: 'n\u00B2',
  },
  {
    id: 'bruchrechnung',
    name: 'Bruchrechnung',
    description:
      'Addition, Subtraktion, Multiplikation, Division von Bruechen, Kuerzen, gemischte Zahlen',
    icon: '½',
  },
  {
    id: 'potenzrechnung',
    name: 'Potenzrechnung & Wurzeln',
    description:
      'Potenzen, Potenzgesetze, Quadrat-/Kubikwurzeln, rationale Exponenten',
    icon: 'x\u00B2',
  },
  {
    id: 'terme',
    name: 'Terme & Gleichungen',
    description:
      'Ausmultiplizieren, Ausklammern, Terme vereinfachen, Distributivgesetz',
    icon: '3x',
  },
  {
    id: 'binomisch',
    name: 'Binomische Formeln',
    description:
      '1., 2. und 3. binomische Formel — Ausmultiplizieren und Faktorisieren',
    icon: '(a+b)\u00B2',
  },
];

import { getEnabledCategories } from '../utils/storage';

export default function CategorySelect({ onSelect }) {
  const enabledCats = getEnabledCategories();
  const visibleCategories = CATEGORIES.filter((c) => enabledCats.includes(c.id));
  return (
    <div className="category-select">
      <div className="hero-logo">
        <img src={`${import.meta.env.BASE_URL}logo.png`} alt="FIA" />
      </div>

      <div className="special-modes">
        <button
          className="category-card challenge-card"
          onClick={() => onSelect('herausforderung')}
        >
          <span className="category-icon">&#9733;</span>
          <h3>Herausforderung</h3>
          <p>Eine Aufgabe aus jedem Bereich</p>
        </button>
        <button
          className="category-card challenge-card"
          onClick={() => onSelect('zufall')}
        >
          <span className="category-icon">&#9776;</span>
          <h3>Zufall</h3>
          <p>Zufaellige Aufgaben aus allen Bereichen</p>
        </button>
      </div>

      <h2>Thema waehlen</h2>
      <div className="category-grid">
        {visibleCategories.map((cat) => (
          <button
            key={cat.id}
            className="category-card"
            onClick={() => onSelect(cat.id)}
          >
            <span className="category-icon">{cat.icon}</span>
            <h3>{cat.name}</h3>
            <p>{cat.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
