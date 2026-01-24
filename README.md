# Anagram Snatch

A real-time competitive word game where players race to form words and steal opponents' words through clever anagrams.

## Play Now

**[Play Anagram Snatch](https://karth2512.github.io/snatch-game/)**

## How to Play

1. **Create or Join a Room** - One player creates a game and shares the room code with a friend
2. **Race for Words** - Letters are revealed one at a time. Form words (4+ letters) from the available letters
3. **Steal Words** - Rearrange an opponent's word + add letters from the pool to steal it
4. **Win** - The player with the most words when all letters are revealed wins

### Stealing Rules

To steal a word, you must:
- Use ALL letters from the target word
- Add at least 1 letter from the open pool
- Rearrange the letters (can't just add to the start or end)

| Target | Open Letters | Attempt | Valid? | Reason |
|--------|--------------|---------|--------|--------|
| CART | S, E | CARTS | No | Just appended S |
| CART | S, E | CRATES | Yes | Rearranged + added E, S |
| HOST | I, L, E | HOSTILE | Yes | Rearranged + added I, L, E |

## Tech Stack

- **Frontend**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Real-time**: PartyKit WebSockets

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## License

MIT
