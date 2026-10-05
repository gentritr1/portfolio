export interface CrosswordWord {
  slug: string
  answer: string
  row: number
  col: number
  direction: 'across' | 'down'
  number: number
}

export interface CrosswordCell {
  row: number
  col: number
  letter: string
  wordIds: string[]
  number?: number
}

export const crosswordRows = 23
export const crosswordColumns = 31

export const crosswordWords: CrosswordWord[] = [
  {
    "slug": "care-platform",
    "answer": "CAREPLATFORM",
    "row": 0,
    "col": 5,
    "direction": "across",
    "number": 1
  },
  {
    "slug": "coaching-app",
    "answer": "COACHING",
    "row": 0,
    "col": 5,
    "direction": "down",
    "number": 1
  },
  {
    "slug": "epub-reader-prototype",
    "answer": "EPUBREADER",
    "row": 1,
    "col": 19,
    "direction": "down",
    "number": 2
  },
  {
    "slug": "design-dashboard",
    "answer": "DESIGNDASHBOARD",
    "row": 1,
    "col": 28,
    "direction": "down",
    "number": 3
  },
  {
    "slug": "za",
    "answer": "ZA",
    "row": 2,
    "col": 4,
    "direction": "across",
    "number": 4
  },
  {
    "slug": "fuel-loyalty-app",
    "answer": "FUELLOYALTY",
    "row": 2,
    "col": 7,
    "direction": "down",
    "number": 5
  },
  {
    "slug": "snaxx-tech",
    "answer": "SNAXXTECH",
    "row": 2,
    "col": 22,
    "direction": "across",
    "number": 6
  },
  {
    "slug": "secret-dictator",
    "answer": "SECRETDICTATOR",
    "row": 2,
    "col": 22,
    "direction": "down",
    "number": 6
  },
  {
    "slug": "open-source-forks",
    "answer": "OPENSOURCE",
    "row": 3,
    "col": 13,
    "direction": "across",
    "number": 7
  },
  {
    "slug": "bayyinah-institute",
    "answer": "INSTITUTE",
    "row": 5,
    "col": 11,
    "direction": "down",
    "number": 8
  },
  {
    "slug": "member-portal",
    "answer": "MEMBERPORTAL",
    "row": 5,
    "col": 14,
    "direction": "across",
    "number": 9
  },
  {
    "slug": "morse-trainer",
    "answer": "MORSETRAINER",
    "row": 5,
    "col": 14,
    "direction": "down",
    "number": 9
  },
  {
    "slug": "chatbot-runtime-web",
    "answer": "CHATBOTWEB",
    "row": 5,
    "col": 30,
    "direction": "down",
    "number": 10
  },
  {
    "slug": "dukagjini-bookstore",
    "answer": "DUKAGJINI",
    "row": 6,
    "col": 9,
    "direction": "down",
    "number": 11
  },
  {
    "slug": "geo-guesser",
    "answer": "GEOGUESSER",
    "row": 7,
    "col": 5,
    "direction": "across",
    "number": 12
  },
  {
    "slug": "offday",
    "answer": "OFFDAY",
    "row": 7,
    "col": 26,
    "direction": "down",
    "number": 13
  },
  {
    "slug": "design-system-react",
    "answer": "SYSTEM",
    "row": 13,
    "col": 24,
    "direction": "down",
    "number": 14
  },
  {
    "slug": "care-api",
    "answer": "CAREAPI",
    "row": 9,
    "col": 16,
    "direction": "across",
    "number": 15
  },
  {
    "slug": "bayyinah-tv",
    "answer": "BAYYINAH",
    "row": 11,
    "col": 18,
    "direction": "down",
    "number": 16
  },
  {
    "slug": "chatbot-runtime",
    "answer": "CHATBOT",
    "row": 11,
    "col": 24,
    "direction": "across",
    "number": 17
  },
  {
    "slug": "design-system-vue",
    "answer": "VUESYSTEM",
    "row": 12,
    "col": 2,
    "direction": "down",
    "number": 18
  },
  {
    "slug": "fjale",
    "answer": "FJALË",
    "row": 12,
    "col": 16,
    "direction": "across",
    "number": 19
  },
  {
    "slug": "donation-app",
    "answer": "DONATION",
    "row": 13,
    "col": 5,
    "direction": "down",
    "number": 20
  },
  {
    "slug": "incentiv",
    "answer": "INCENTIV",
    "row": 13,
    "col": 8,
    "direction": "across",
    "number": 21
  },
  {
    "slug": "form",
    "answer": "FORM",
    "row": 14,
    "col": 4,
    "direction": "across",
    "number": 22
  },
  {
    "slug": "viva-fresh",
    "answer": "VIVAFRESH",
    "row": 15,
    "col": 17,
    "direction": "across",
    "number": 23
  },
  {
    "slug": "ai-dashboard",
    "answer": "AIDASHBOARD",
    "row": 16,
    "col": 5,
    "direction": "across",
    "number": 24
  },
  {
    "slug": "offbeat",
    "answer": "OFFBEAT",
    "row": 16,
    "col": 12,
    "direction": "down",
    "number": 25
  },
  {
    "slug": "read-to-feed",
    "answer": "READTOFEED",
    "row": 17,
    "col": 16,
    "direction": "across",
    "number": 26
  },
  {
    "slug": "futurisma",
    "answer": "FUTURISMA",
    "row": 18,
    "col": 0,
    "direction": "across",
    "number": 27
  }
]

const starts = [...new Set(crosswordWords.map(word => word.row * 100 + word.col))].sort((a, b) => a - b)
for (const word of crosswordWords) word.number = starts.indexOf(word.row * 100 + word.col) + 1

export const crosswordCells: CrosswordCell[] = []
for (const word of crosswordWords) {
  Array.from(word.answer).forEach((letter, index) => {
    const row = word.row + (word.direction === 'down' ? index : 0)
    const col = word.col + (word.direction === 'across' ? index : 0)
    const existing = crosswordCells.find(cell => cell.row === row && cell.col === col)
    if (existing) {
      if (existing.letter !== letter) throw new Error(`Invalid crossword crossing: ${word.slug}`)
      existing.wordIds.push(word.slug)
      if (index === 0) existing.number = word.number
    } else {
      crosswordCells.push({ row, col, letter, wordIds: [word.slug], ...(index === 0 ? { number: word.number } : {}) })
    }
  })
}
