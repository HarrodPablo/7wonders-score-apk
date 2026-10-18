/**
 * Calcula la máxima puntuación científica posible.
 * @param {Object} symbols - Cantidad base de cada símbolo.
 * @param {number} symbols.gears - Engranajes
 * @param {number} symbols.compasses - Compases
 * @param {number} symbols.tablets - Tablillas
 * @param {number} symbols.wildcards - Símbolos comodín
 * @returns {number} La máxima puntuación posible.
 */
export function calculateMaxScienceScore(symbols) {
  const { gears = 0, compasses = 0, tablets = 0, wildcards = 0 } = symbols;
  let maxScore = 0;

  // Fuerza bruta iterando todas las formas posibles de repartir los comodines.
  // Como los comodines suelen ser < 5, esto es instantáneo.
  for (let wg = 0; wg <= wildcards; wg++) {
    for (let wc = 0; wc <= wildcards - wg; wc++) {
      const wt = wildcards - wg - wc;
      
      const totalG = gears + wg;
      const totalC = compasses + wc;
      const totalT = tablets + wt;

      // Cálculo de la puntuación para esta combinación
      const setsOf3 = Math.min(totalG, totalC, totalT);
      const points = 
        (totalG * totalG) + 
        (totalC * totalC) + 
        (totalT * totalT) + 
        (setsOf3 * 7);

      if (points > maxScore) {
        maxScore = points;
      }
    }
  }

  return maxScore;
}
