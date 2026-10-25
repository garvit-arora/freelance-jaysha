// Every message appears once per deck, without repeating at the deck boundary.
export function shuffleDeck(length, previous = -1, random = Math.random) {
  const deck = Array.from({ length }, (_, index) => index)
  for (let index = deck.length - 1; index > 0; index--) {
    const other = Math.floor(random() * (index + 1))
    ;[deck[index], deck[other]] = [deck[other], deck[index]]
  }
  if (deck.length > 1 && deck[0] === previous) {
    ;[deck[0], deck[1]] = [deck[1], deck[0]]
  }
  return deck
}
