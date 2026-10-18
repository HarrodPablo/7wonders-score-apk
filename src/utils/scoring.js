export function calculateScienceScore(compasses = 0, tablets = 0, gears = 0, wildcards = 0) {
  if (wildcards === 0) {
    const sets = Math.min(compasses, tablets, gears);
    const setsScore = sets * 7;
    const symbolsScore = (compasses ** 2) + (tablets ** 2) + (gears ** 2);
    return setsScore + symbolsScore;
  }

  let maxScore = 0;
  
  // Try all combinations of wildcards being C, T, or G
  // C + T + G = wildcards
  for (let c = 0; c <= wildcards; c++) {
    for (let t = 0; t <= wildcards - c; t++) {
      const g = wildcards - c - t;
      
      const currentC = compasses + c;
      const currentT = tablets + t;
      const currentG = gears + g;
      
      const sets = Math.min(currentC, currentT, currentG);
      const setsScore = sets * 7;
      const symbolsScore = (currentC ** 2) + (currentT ** 2) + (currentG ** 2);
      const total = setsScore + symbolsScore;
      
      if (total > maxScore) {
        maxScore = total;
      }
    }
  }
  
  return maxScore;
}

export function calculateTotalScore(scores, activeExpansions = {}) {
  let total = 0;
  
  // Base Game
  total += scores.military || 0;
  total += Math.floor((scores.treasury || 0) / 3);
  total += scores.wonders || 0;
  total += scores.civilian || 0;
  total += scores.commercial || 0;
  total += scores.guilds || 0;
  
  // Science
  const sc = scores.science || {};
  total += calculateScienceScore(
    sc.compasses || 0,
    sc.tablets || 0,
    sc.gears || 0,
    sc.wildcards || 0
  );
  
  // Leaders Expansion
  if (activeExpansions.leaders) {
    total += scores.leaders || 0;
  }
  
  // Cities Expansion
  if (activeExpansions.cities) {
    total += scores.cities || 0;
    total -= scores.debt || 0;
  }
  
  // Armada Expansion
  if (activeExpansions.armada) {
    total += scores.naval || 0;
    total += scores.islands || 0;
  }
  
  // Edifice Expansion
  if (activeExpansions.edifice) {
    total += scores.edifice || 0;
  }

  return total;
}
