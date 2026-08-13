import {
  ACCENT,
  BASS_DRUM,
  SNARE_DRUM,
  LOW_CONGA_LOW_TOM,
  MID_CONGA_MID_TOM,
  HI_CONGA_HI_TOM,
  CLAVES_RIMSHOT,
  MARACAS_HANDCLAP,
  COWBELL,
  CYMBAL,
  OPEN_HIHAT,
  CLSD_HIHAT,
  FIRST_PART,
  SECOND_PART,
  A_VARIATION,
  B_VARIATION,
} from "store-constants";

import { stepKey, patternLengthKey } from "helpers";
import { generateSong, randInt } from 'generate-pattern';

const PARTS = [FIRST_PART, SECOND_PART];
const VARIATIONS = [A_VARIATION, B_VARIATION];

const initialStepsState = (() => {
  const steps = {};
  const song = generateSong();
  for (let track = 0; track < 16; track++) {
    for (let instrument = 0; instrument < 12; instrument++) {
      PARTS.forEach(part => {
        VARIATIONS.forEach(variation => {
          for (let step = 0; step < 16; step++) {
            const key = stepKey(track, instrument, part, variation, step);
            steps[key] = track == 0 && instrument in song && part == FIRST_PART && variation == A_VARIATION && song[instrument].includes(step);
          }
        });
      });
    }
  }
  return steps;
})();

const initialRhythmLengthState = (() => {
  const lengths = {};
  for (let track = 0; track < 16; track++) {
    lengths[patternLengthKey(track, FIRST_PART)] = 16;
    lengths[patternLengthKey(track, SECOND_PART)] = 0;
  }
  return lengths;
})();

const initialInstrumentState = {
  [ACCENT]: {
    level: randInt(20, 80),
  },
  [BASS_DRUM]: {
    level: randInt(20, 80),
    tone: randInt(20, 80),
    decay: randInt(20, 80),
  },
  [SNARE_DRUM]: {
    level: randInt(20, 80),
    tone: randInt(20, 80),
    snappy: randInt(20, 80),
  },
  [LOW_CONGA_LOW_TOM]: {
    level: randInt(20, 80),
    tuning: randInt(20, 80),
    selector: randInt(0, 1),
  },
  [MID_CONGA_MID_TOM]: {
    level: randInt(20, 80),
    tuning: randInt(20, 80),
    selector: randInt(0, 1),
  },
  [HI_CONGA_HI_TOM]: {
    level: randInt(20, 80),
    tuning: randInt(20, 80),
    selector: randInt(0, 1),
  },
  [CLAVES_RIMSHOT]: {
    level: randInt(20, 80),
    selector: randInt(0, 1),
  },
  [MARACAS_HANDCLAP]: {
    level: randInt(20, 80),
    selector: randInt(0, 1),
  },
  [COWBELL]: {
    level: randInt(20, 80),
  },
  [CYMBAL]: {
    level: randInt(20, 80),
    tone: randInt(20, 80),
    decay: randInt(20, 80),
  },
  [OPEN_HIHAT]: {
    level: randInt(20, 80),
    decay: randInt(20, 80),
  },
  [CLSD_HIHAT]: {
    level: randInt(20, 80),
  },
};

export default {
  instrumentState: initialInstrumentState,
  patternLengths: initialRhythmLengthState,

  steps: initialStepsState,

  currentPart: FIRST_PART,
  currentVariation: A_VARIATION,
  currentMeasure: 0,

  selectedPattern: 0,
  currentPattern: 0,

  playing: false,

  selectedMode: 1,
  selectedInstrumentTrack: 1,

  masterVolume: 70,

  autoFillInPosition: 0,
  basicVariationPosition: 0,
  introFillVariationPosition: 0,

  selectedPlayPattern: 0,
  selectedPlayFillPattern: 0,
  fillScheduled: false,

  tempo: randInt(30, 293),
  fineTempo: randInt(-6, 6),

  currentStep: 0,

  blinkState: true,

  clearPressed: false,
  clearDragging: false,

  pendingPatternLength: 0,
};
