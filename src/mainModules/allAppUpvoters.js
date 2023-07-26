const path = require('path');
const fs = require('fs');
const fetch = require('node-fetch');
// const csv = require('csv-stringify/sync');
const parser = require('node-html-parser');
const cliProgress = require('cli-progress');
const { stringify } = require('../helpers/csvStringify');
const { writeCsvFile } = require('../helpers/writeCsvFile');

const { graphql, colors } = require('../config/config');
const { mainUrl, commonHeaders } = graphql;

const today = new Date().toLocaleDateString().replace(/\//gi, '_');
const nd = '<NO-DATA>';
const bar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);

function usersToCsv(users, postId) {
  const csvRaw = [
    ['Name', 'Username', 'Title', 'Links', 'ProducthuntURL', 'Avatar', 'Bio']
  ];

  console.log('Staring converting users to CSV;')
  for (let i = 0; i < users.length; i++) {
    const currenUser = users[i];
    csvRaw.push(
      [
        currenUser.name, currenUser.username, currenUser.title, currenUser.links.join('\n'),
        currenUser.producthunt, currenUser.avatar, currenUser.about
      ]
    );
  }

  const csvString = stringify(csvRaw);

  writeCsvFile(csvString, `upVoters-${today}-${postId}.csv`);

  console.log('CSV file created!')

  // NOTE: for PKG use path.join(process.execPath, '..', fileName) to WRITE the file 
  // instead of path.join(__dirname, fileName) !!!
  //const usersCsvPath = path.join(process.execPath, '..', FILES_DIR_NAME, `upVoters-${today}-${postId}.csv`);
  //fs.writeFileSync(usersCsvPath, csvString);
}

const getDataPerUser = async (id, name = '', pic = '') => {
  try {
    const url = 'https://www.producthunt.com/@' + id;
    const res = {
      name: name || nd,
      username: id || nd,
      avatar: pic || nd,
      producthunt: url
    };

    const rawData = await fetch(url);
    const html = await rawData.text();

    const root = parser.parse(html);

    const aboutRaw = root.querySelectorAll('p.color-lighter-grey.fontSize-16.fontWeight-400.noOfLines-undefined')
      .find(u => u.rawAttrs.includes('styles_aboutText'));
    const about = aboutRaw ? aboutRaw.textContent : nd;

    const subTitleRaw = root.querySelector('div.mb-1.color-lighter-grey.fontSize-18.fontWeight-300.noOfLines-undefined');
    const subTitle = subTitleRaw ? subTitleRaw.textContent : nd;

    const scriptData = root.querySelector('script#__NEXT_DATA__')
    const script = JSON.parse(scriptData.textContent);
    const apolo = script.props.apolloState
    const links = Object.entries(apolo)
      .map(([o, link]) => link.__typename === 'UserLink' ? Buffer.from(link.encodedUrl, 'base64').toString('utf-8') : '')
      .filter(i => i);

    res.links = links || [];
    res.about = about;
    res.title = subTitle;

    // console.log(res);

    return res;
  } catch (err) {
    console.error(colors.Red + colors.and + colors.Reset, err);
  }
} 

const getAllUpvoterPerPost = async (id) => {
  try {
    const votersRaw = await fetch(mainUrl, {
      method: 'POST',
      headers: commonHeaders,
      body: JSON.stringify({
       "operationName": "PostPageSocialProof",
        "query": "query PostPageSocialProof($postId:ID!$limit:Int!){post(id:$postId){id contributors(limit:$limit){role user{id ...UserImage __typename}__typename}__typename}}fragment UserImage on User{id name username avatarUrl __typename}",
        "variables": {
            "postId": id,
            "limit": 1000
        }
      })
    });
    const voters = await votersRaw.json();

    return voters;
  } catch (err) {
    console.error(colors.Red + colors.and + colors.Reset, err);
  }
}

const allAppUpvoters1 = async (id) => { // NOTE: THIS ONE NEED TO BE FIXED! Data is invalid =(
  console.log('Lets find some data for you!!');

  try {
    // const file = JSON.parse(fs.readFileSync(PATH_TO_JSON, { encoding: 'utf8' }));
    const upVoters = await getAllUpvoterPerPost(id);
    const fileData = upVoters.data.post.contributors;
    const allUsers = [];

    console.log("\x1b[33m", fileData.length + ' UPVOTERS found!');

    let barValue = 0;
    bar.start(fileData.length, barValue);

    for (const user of fileData) {
      const userData = await getDataPerUser(user.user.username, user.user.name, user.user.avatarUrl);
      allUsers.push(userData);

      barValue += 1;
      bar.update(barValue);
      // console.log("\x1b[33m", user.user.username + ' added!');
      // console.log("\x1b[35m", allUsers.length + ' total length.');
    }

    usersToCsv(allUsers, id);

    console.log("\x1b[35m", 'DONE!');
  } catch (er) {
    console.error(colors.Red + colors.and + colors.Reset, err);
  }
}

// NOTE: this is temp version of GET_ALL_UPVOTERS since the full version is broken for now =(
const allAppUpvoters = async (id) => {
  console.log('Lets find some data for you!!');

  try {
    const upVoters = await getAllUpvoterPerPost(id);
    const fileData = upVoters.data.post.contributors;

    console.log("\x1b[33m", fileData.length + ' UPVOTERS found!');

    const allUsers = fileData.map(user => {
      return {
        role: user.role || nd,
        name: user.user.name || nd,
        username: user.user.username || nd,
        url: 'https://www.producthunt.com/@' + user.user.username,
      }
    });

    // usersToCsv(allUsers, id);

    const csvRaw = [
      ['Name', 'Username', 'Role', 'Link']
    ];

    console.log('Staring converting users to CSV;')

    for (let i = 0; i < allUsers.length; i++) {
      const currenUser = allUsers[i];
      csvRaw.push(
        [
          currenUser.name, currenUser.username, currenUser.role, currenUser.url
        ]
      );
    }

    const csvString = stringify(csvRaw);

    writeCsvFile(csvString, `upVoters-l-${today}-${id}.csv`);

    console.log('CSV file created!')
    console.log("\x1b[35m", 'DONE!');
  } catch (err) {
    console.error(colors.Red + colors.and + colors.Reset, err);
  }
}

// RUN:
//getDataPerUser('avinashvagh1');
//

module.exports = { allAppUpvoters };

