const path = require('path');
const fs = require('fs');
const fetch = require('node-fetch');
// const { stringify } = require('csv-stringify/sync');
const parser = require('node-html-parser');
const cliProgress = require('cli-progress');
const colors = require('ansi-colors');

const { stringify } = require('../helpers/csvStringify');
const { writeCsvFile } = require('../helpers/writeCsvFile');

const { NO_DATA_STRING, graphql, colors: col } = require('../config/config');

const ALL_TODAY_BASE_URL = graphql.mainUrl;
const ALL_TODAY_BASE_HEADERS = graphql.commonHeaders;

const getAllTodayBody = (cursor = null) => {
  const queryPath = path.join(__dirname, '../config/todayAppsQuery.txt');
  const query = fs.readFileSync(queryPath, { encoding: 'utf-8' });

  return {
    "operationName": "HomePage",
    "query": query,
    "variables": {
        "cursor": cursor,
        "filters": {},
        "kind": "FEATURED"
    }
  }
}

const getAllTodayApps = async () => {
  const allApps = [];
  const allTodayApps = [];

  const barColor = colors.magentaBright('{bar}') + ' ' + colors.magentaBright('{percentage}%');
  const valueColor = colors.yellow.bold('{value}/{total}');
  const etaColor = colors.white('{duration} => {eta}');
  const appColor = colors.redBright('App: {appName}')
  const bar = new cliProgress.SingleBar({
    format: `Getting data | ${barColor} | ${valueColor} | ${etaColor} | ${appColor}`,
      barCompleteChar: '\u2588',
      barIncompleteChar: '\u2591',
      hideCursor: true,
  });
  let barSatus = 0;

  try {
    const allTodayAppsDataRaw = await fetch(
      ALL_TODAY_BASE_URL,
      {
        method: 'POST',
        headers: ALL_TODAY_BASE_HEADERS,
        body: JSON.stringify(getAllTodayBody()),
      }
    );
    const allTodayAppsData = await allTodayAppsDataRaw.json();
    allTodayApps.push(...allTodayAppsData.data.homefeed.edges[0].node.items);

    console.log(allTodayApps.length + ' apps found!');
    console.log(col.Blue + col.and + col.Reset, 'IS IT GOOD ENOUGH?');

    bar.start(allTodayApps.length, barSatus, {
        appName: "N/A"
    });

    for (const app of allTodayApps) {
      if (!app) {
        console.log('NO-DATA:');
        console.log(app);
        continue;
      }
      const urlToGetAppHTML = 'https://www.producthunt.com/posts/' + (app.slug || app.post.slug);
      const appId = app.id;

      barSatus += 1;
      bar.update(barSatus, { appName: app.name });

      const appRawData = await fetch(
        ALL_TODAY_BASE_URL, {
          method: 'POST',
          headers: ALL_TODAY_BASE_HEADERS,
          body: JSON.stringify({
            operationName: "PostPageSocialProof",
            query: "query PostPageSocialProof($postId:ID!$limit:Int!){post(id:$postId){id contributors(limit:$limit){role user{id ...UserImage __typename}__typename}__typename}}fragment UserImage on User{id name username avatarUrl __typename}",
            variables: { postId: appId, limit: 36 },
          }),
        }
      );
      const appData = await appRawData.json();
      // console.log('IS IT DATA?', appData);

      if (!appData.data.post) {
        continue;
      }

      const firstContributor = appData.data.post ? appData.data.post.contributors[0] : { user: { name: null, username: null } };

      const nd = NO_DATA_STRING;
      const res = {
        parsedAt: new Date().toLocaleDateString(),
        featuredAt: app.featuredAt || nd,
        createdAt: app.createdAt || nd,
        votes: app.votesCount || nd,
        comments: app.commentsCount || nd,
        name: app.name || nd, 
        description: app.tagline || nd,
        makerName: firstContributor.user.name || nd,
        makerUrl: firstContributor.user.username ? 'https://www.producthunt.com/@' + firstContributor.user.username : nd,
        url: urlToGetAppHTML || nd,
      };
      allApps.push(res);
    }

    bar.stop();
    console.log(col.Green + col.and + col.Reset, 'Product data fetched successfuly, moving to files: ' + allApps.length + ' apps');

    const csvData = [
      ['Name', 'Description', 'Votes', 'Comments', 'URL', 'Maker Name', 'Maker URL', 'Created_At', 'Parsed_At', 'Featured_At']
    ];
    const forCsvData = allApps.map(a => ([
      a.name, a.description, a.votes, a.comments, a.url, a.makerName, a.makerUrl, a.createdAt, a.parsedAt, a.featuredAt
    ]));
    csvData.push(...forCsvData);

    const today = new Date().toLocaleDateString().replace(/\//gi, '_');
    const baseFileNames = 'allTodayApps';
    const csvFileName = `${baseFileNames}-${today}.csv`;

    writeCsvFile(stringify(csvData), csvFileName);

    console.log('CSV file created!');
    console.log('DONE!');

    //const jsonFileName = `${baseFileNames}-${today}.json`;
    //const pathToNewJsonFile = path.join(__dirname, FILES_DIR_NAME, jsonFileName);
    //const pathToNewCSVFile = path.join(__dirname, FILES_DIR_NAME, csvFileName);
    //fs.writeFileSync(pathToNewJsonFile, JSON.stringify(allApps, null, 2));
    //console.log('JSON file created!');
  } catch (err) {
    console.error(col.Red + col.and + col.Reset, err);
  }
}

module.exports = { getAllTodayApps };

// RUN: 
// app();
//
//
//SHEMA:
const todayAppSchema = {
    "id": "404816",
    "hideVotesCount": false,
    "commentsCount": 59,
    "name": "Zeabur",
    "shortenedUrl": "/r/p/404816",
    "slug": "zeabur",
    "tagline": "Deploy painlessly and scale infinitely with just one click",
    "updatedAt": "2023-07-23T08:43:14-07:00",
    "pricingType": "free_options",
    "topics": {
        "edges": [
            {
                "node": {
                    "id": "237",
                    "name": "SaaS",
                    "slug": "saas",
                    "__typename": "Topic"
                },
                "__typename": "TopicEdge"
            }
        ],
        "__typename": "TopicConnection"
    },
    "redirectToProduct": null,
    "thumbnailImageUuid": "f3cf372c-812d-437b-89f4-8eceaeb45074.png",
    "productState": "default",
    "__typename": "Post",
    "featuredAt": "2023-07-23T00:02:51-07:00",
    "createdAt": "2023-07-23T00:02:51-07:00",
    "product": {
        "id": "543137",
        "isSubscribed": false,
        "__typename": "Product"
    },
    "disabledWhenScheduled": true,
    "hasVoted": false,
    "votesCount": 548,
    "featuredComment": null
};
