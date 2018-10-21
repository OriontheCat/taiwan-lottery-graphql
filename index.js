const express = require('express');
const graphqlHTTP = require('express-graphql');
const fetch = require('node-fetch');
const cheerio = require('cheerio');
var {
    buildSchema
} = require('graphql');

const createWinningNumbers = winningNumbersList => new WinningNumbers(winningNumbersList[0], winningNumbersList[1], winningNumbersList[2].split('、'), winningNumbersList[3].split('、'));

const getWinningNumbers = (link) => {
    return new Promise(async (res, rej) => {
        try {
            var winningNumbersList = new Array();
            const response = await fetch(link);
            const body = await response.text();
            const $ = await cheerio.load(body);
            $('span.t18Red').each((index, element) => {
                var text = element.firstChild.data;
                winningNumbersList.push(text);
            });
            res(createWinningNumbers(winningNumbersList))
        } catch (error) {
            rej(error);
        }
    })
}

const checkLastestMonth = (desiredYear, desiredMonth) => {
    return new Promise(async (res, rej) => {
        try {
            const response = await fetch('https://www.etax.nat.gov.tw/etwmain/front/ETW183W6?site=en');
            const body = await response.text();
            const $ = await cheerio.load(body);
            var winningNumbersLinks = new Map();
            $('tbody').find("a").each((index, element) => {
                const text = element.firstChild.data;
                const year = text.substring(61, 65);
                const monthOne = parseInt(text.substring(49, 52));
                const monthTwo = parseInt(text.substring(52, 54));
                const link = 'https://www.etax.nat.gov.tw/etwmain/front/' + element.attribs.href;
                if (winningNumbersLinks[year] == undefined) winningNumbersLinks[year] = new Array();
                winningNumbersLinks[year][monthOne] = link;
                winningNumbersLinks[year][monthTwo] = link;
            });
            var desiredLink = winningNumbersLinks[desiredYear][desiredMonth];
            var winningNumbers = await getWinningNumbers(desiredLink);
            res(winningNumbers);
        } catch (error) {
            rej(error);
        }
    })
}

var schema = buildSchema(`
  type WinningNumbers {
      special: String,
      grand: String,
      first: [String],
      additional: [String]
  }

  type Query {
    getWinningNumbers(month: Int, year: Int) : WinningNumbers
  }
`);

class WinningNumbers {
    constructor(special, grand, first, additional) {
        this.special = special;
        this.grand = grand;
        this.first = first;
        this.additional = additional;
    }
}

// The root provides a resolver function for each API endpoint
var root = {
    getWinningNumbers: async ({
        month,
        year
    }) => {
        var winningNumbers = await checkLastestMonth(year, month);
        return winningNumbers;
    },
};

var app = express();
app.use('/graphql', graphqlHTTP({
    schema: schema,
    rootValue: root,
    graphiql: true,
}));
app.listen(443);
console.log('Running a GraphQL API server at localhost:4000/graphql');