export function remapFuzzyResults(fuzzyResults: [number, string][] | null): Array<{ percentage: number, name: string }> {
    if (!fuzzyResults) {
        return [];
    }
    return fuzzyResults.map((result) => {
        const [percentage, name] = result;
        return {
            percentage,
            name
        }
    });
};
