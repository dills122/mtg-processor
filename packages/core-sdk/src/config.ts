export default {
    fuzzyMatching: {
        matchConstants: {
            baseMatchPercentage: .50,
            betterMatchPercentage: .65,
            bestMatchPercentage: .7
        }
    },
    api: {
        scryfall: {
            base: 'https://api.scryfall.com',
            cardRandom: 'https://api.scryfall.com/cards/random',
            templates: {
                cardNameExact: 'https://api.scryfall.com/cards/named?exact=',
                cardNameFuzzy: 'https://api.scryfall.com/cards/named?fuzzy=',
                cardListExact: 'https://api.scryfall.com/cards/search?q=name%3A'
            }
        }
    }
}