function levenshteinDistance(a: string, b: string) {
    const matrix = [];

    // Increment along the first column of each row
    for (let i = 0; i <= b.length; i++) {
        matrix[i] = [i];
    }

    // Increment each column in the first row
    for (let j = 0; j <= a.length; j++) {
        matrix[0][j] = j;
    }

    // Fill in the rest of the matrix
    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) === a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1, // Substitution
                    Math.min(matrix[i][j - 1] + 1, // Insertion
                             matrix[i - 1][j] + 1) // Deletion
                );
            }
        }
    }

    return matrix[b.length][a.length];
}

function findMostSimilarTickers(tickers: [string], typedTicker: string) {
    // Calculate the Levenshtein distance for each ticker
    const distances = tickers.map(ticker => ({
        ticker: ticker,
        distance: levenshteinDistance(ticker, typedTicker)
    }));

    // Sort the tickers by distance
    distances.sort((a, b) => a.distance - b.distance);

    // Return the top five most similar tickers
    return distances.slice(0, 5).map(entry => entry.ticker);
}

export default findMostSimilarTickers;
