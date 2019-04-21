const FuzzySet = require('fuzzyset.js');
const {promisify} = require('util');
const {
    GetBulkNames
} = require('../db-local/index');

const dependencies = {
    GetNames : promisify(GetBulkNames)
};

function FilterNames(names) {
    return names.map((record) => {
        return record.name;
    })
}

async function Match(cleanText, dirtyText = '') {
    let names = await dependencies.GetNames();
    let filteredNames = FilterNames(names);
    let fuzzy = FuzzySet(filteredNames);
    return fuzzy.get(cleanText);
}

module.exports = {
    Match,
    dependencies
};