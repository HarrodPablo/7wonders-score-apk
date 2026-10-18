import alejandriaDay from '../assets/tableros/alejandria_day.jfif';
import alejandriaNight from '../assets/tableros/alejandria_night.jfif';
import babiloniaDay from '../assets/tableros/babilonia_day.jfif';
import babiloniaNight from '../assets/tableros/babilonia_night.jfif';
import efesoDay from '../assets/tableros/efeso_day.jfif';
import efesoNight from '../assets/tableros/efeso_night.jfif';
import guizaDay from '../assets/tableros/guiza_day.jfif';
import guizaNight from '../assets/tableros/guiza_night.jfif';
import halicarnasoDay from '../assets/tableros/halicarnaso_day.jfif';
import halicarnasoNight from '../assets/tableros/halicarnaso_night.jfif';
import olimpiaDay from '../assets/tableros/olimpia_day.jfif';
import olimpiaNight from '../assets/tableros/olimpia_night.jfif';
import rodasDay from '../assets/tableros/rodas_day.jfif';
import rodasNight from '../assets/tableros/rodas_night.jfif';

import bizancioDay from '../assets/tableros/bizancio_day.jfif';
import bizancioNight from '../assets/tableros/bizancio_night.jfif';
import petraDay from '../assets/tableros/petra_day.jfif';
import petraNight from '../assets/tableros/petra_night.jfif';

import abusimbelDay from '../assets/tableros/abusimbel_day.jfif';
import abusimbelNight from '../assets/tableros/abusimbel_night.jfif';
import romaDay from '../assets/tableros/roma_day.jfif';
import romaNight from '../assets/tableros/roma_night.jfif';

import cartagoDay from '../assets/tableros/cartago_day.jfif';
import cartagoNight from '../assets/tableros/cartago_night.jfif';
import urDay from '../assets/tableros/ur_day.jfif';
import urNight from '../assets/tableros/ur_night.jfif';

import siracusaDay from '../assets/tableros/siracusa_day.jpg';
import siracusaNight from '../assets/tableros/siracusa_night.jfif';

const boardImages = {
  'Alexandria (Día)': alejandriaDay,
  'Alexandria (Noche)': alejandriaNight,
  'Babylon (Día)': babiloniaDay,
  'Babylon (Noche)': babiloniaNight,
  'Éphesos (Día)': efesoDay,
  'Éphesos (Noche)': efesoNight,
  'Gizah (Día)': guizaDay,
  'Gizah (Noche)': guizaNight,
  'Halikarnassos (Día)': halicarnasoDay,
  'Halikarnassos (Noche)': halicarnasoNight,
  'Olympía (Día)': olimpiaDay,
  'Olympía (Noche)': olimpiaNight,
  'Rhódos (Día)': rodasDay,
  'Rhódos (Noche)': rodasNight,

  'Byzantium (Día)': bizancioDay,
  'Byzantium (Noche)': bizancioNight,
  'Petra (Día)': petraDay,
  'Petra (Noche)': petraNight,

  'Abu Simbel (Día)': abusimbelDay,
  'Abu Simbel (Noche)': abusimbelNight,
  'Roma (Día)': romaDay,
  'Roma (Noche)': romaNight,

  'Carthage (Día)': cartagoDay,
  'Carthage (Noche)': cartagoNight,
  'Ur (Día)': urDay,
  'Ur (Noche)': urNight,

  'Siracusa (Día)': siracusaDay,
  'Siracusa (Noche)': siracusaNight,

  // Alias legacy para compatibilidad con partidas guardadas viejas
  'Alejandría A': alejandriaDay,
  'Alejandría B': alejandriaNight,
  'Babilon A': babiloniaDay,
  'Babilon B': babiloniaNight,
  'Ephesos A': efesoDay,
  'Ephesos B': efesoNight,
  'Gizah A': guizaDay,
  'Gizah B': guizaNight,
  'Halikarnassos A': halicarnasoDay,
  'Halikarnassos B': halicarnasoNight,
  'Rhodos A': rodasDay,
  'Rhodos B': rodasNight,
  'Roma A': romaDay,
  'Roma B': romaNight,
  'Ur A': urDay,
  'Ur B': urNight,
};

/**
 * Returns the imported image path for a given board name and side.
 * @param {string} boardName - The full name of the board (e.g., "Rodas (Día)")
 * @returns {string|null} The image URL or null if not found
 */
export function getBoardImage(boardName) {
  if (!boardName) return null;
  // Try exact match first (which should be perfect now)
  if (boardImages[boardName]) {
    return boardImages[boardName];
  }
  
  // Try case insensitive match or partial match for old stats compatibility
  const normalized = boardName.toLowerCase().trim();
  const foundKey = Object.keys(boardImages).find(k => k.toLowerCase() === normalized);
  if (foundKey) {
    return boardImages[foundKey];
  }
  
  // Default fallback if nothing matches perfectly but we have the base name
  // Find any that includes the base name
  const baseName = normalized.split(' (')[0].split(' ')[0]; // E.g. "Alejandría"
  const partialKey = Object.keys(boardImages).find(k => k.toLowerCase().includes(baseName));
  return partialKey ? boardImages[partialKey] : null;
}
