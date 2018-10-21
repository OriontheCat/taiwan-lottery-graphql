const graphql = require('graphql-request');

const request = graphql.request;

const query = `{
    getWinningNumbers(month:8,year:2018) {
        special
        grand
        first
        additional
        }
}`

request('https://taiwan-recipt-lottery.now.sh/graphql', query).then(data => console.log(data))