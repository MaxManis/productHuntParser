const path = require('path');
const fs = require('fs');
const fetch = require('node-fetch');
// const { stringify } = require('csv-stringify/sync');
const parser = require('node-html-parser');
const cliProgress = require('cli-progress');
const colors = require('ansi-colors');

const { stringify } = require('../helpers/csvStringify');
const { getAllProducts } = require('../helpers/getAllProducts');
const { isFirstLaunch } = require('../helpers/isFirstLaunch');
const { getProductData } = require('../helpers/getProductData');
const { jsonToCsv } = require('../helpers/jsonToCsv');
const { uniqObjInArray } = require('../helpers/uniqObjInArray');
const { CONFIG_DIR_NAME, FILES_DIR_NAME, DATA_DIR_NAME, NO_DATA_FILENAME } = require('../config/config');

const getAllNewProducts = async () => {
  const allApps = [];
  const appsWithData = [];
  const appsNoData = [];

  const barColor = colors.magentaBright('{bar}') + ' ' + colors.magentaBright('{percentage}%');
  const valueColor = colors.yellow.bold('{value}/{total}');
  const etaColor = colors.white('{duration} => {eta}');
  const appColor = colors.redBright('App: {appName}')
  const bar = new cliProgress.SingleBar({
    format: `Parsing | ${barColor} | ${valueColor} | ${etaColor} | ${appColor}`,
      barCompleteChar: '\u2588',
      barIncompleteChar: '\u2591',
      hideCursor: true,
  });
  let barSatus = 0;

  try {
    const allNewProducts = await getAllProducts();

    // TODO: Also get all apps from noDataFile and check info for them here:
    const noDataFilePath = path.join(process.execPath, '..', FILES_DIR_NAME, DATA_DIR_NAME, NO_DATA_FILENAME);
    let prevNoData = [];
    if (fs.existsSync(noDataFilePath)) {
      prevNoData = JSON.parse(fs.readFileSync(noDataFilePath, { encoding: 'utf-8' }));
      fs.rmSync(noDataFilePath);
    }

    const allProducts = uniqObjInArray([...allNewProducts, ...prevNoData]);

    bar.start(allProducts.length, barSatus, {
        appName: "N/A"
    });

    for (const app of allProducts) {
      if (!app || !app.url) {
        console.log('NO-DATA: ' + app);
        continue;
      }

      barSatus += 1;
      bar.update(barSatus, { appName: app.product.name });

      const rawData = await fetch(app.url);
      const html = await rawData.text();
      const isFirstLaunchApp = isFirstLaunch(html, app.id);

      if (!isFirstLaunchApp) {
        const eventId = app.id;
        const appId = app.product.id;
        const productData = getProductData(html);
        const productKey = 'Product' + appId;
        const eventKey = 'UpcomingEvent' + eventId;

        const productInfoData = productData.props.apolloState[productKey];

        const res = {
          isData: true,
          date: new Date().toLocaleDateString(),
          id: eventId,
          product: { id: appId, name: app.product.name },
          name: productInfoData.name,
          title: app.title,
          description: productInfoData.description,
          url: productInfoData.url,
          makers: productInfoData.makers.map(m => productData.props.apolloState[m.__ref]),
          urls: {
            websiteUrl:	productInfoData.websiteUrl,
            iosUrl:	productInfoData.iosUrl,
            androidUrl:	productInfoData.androidUrl,
            twitterUrl:	productInfoData.twitterUrl,
            twitterUsername: productInfoData.twitterUsername,
            instagramUrl: productInfoData.instagramUrl,
            facebookUrl: productInfoData.facebookUrl,
            linkedinUrl: productInfoData.linkedinUrl,
            githubUrl: productInfoData.githubUrl,
          }
        };
        allApps.push(res);
        appsWithData.push(res);
      } else {
        const noDataRes = {
          isData: false,
          date: new Date().toLocaleDateString(),
          id: app.id,
          product: { id: app.product.id, name: app.product.name },
          name: app.product.name,
          title: app.title,
          description: app.truncatedDescription,
          url: app.product.url,
          makers: null,
          urls: null,
        };
        allApps.push(noDataRes);
        appsNoData.push(noDataRes);

        continue;
      }
    }

    bar.stop();
    console.log('Product data fetched successfuly, moving to files: ' + appsWithData.length + ' apps');

    const csvData = jsonToCsv(appsWithData);

    const today = new Date().toLocaleDateString().replace(/\//gi, '_');
    const csvFileName = `allNewApps-${today}.csv`;

    // TODO: get apps from this file at the begining and check info for this apps:
    fs.writeFileSync(noDataFilePath, JSON.stringify(appsNoData, null, 2));
    console.log('NoData file created!');

    const pathToNewCSVFile = path.join(process.execPath, '..', FILES_DIR_NAME, csvFileName);
    fs.writeFileSync(pathToNewCSVFile, csvData);
    console.log('CSV file created!');

    console.log('DONE!');
  } catch (err) {
    console.error(err);
  }
}

const test = async () => {
  const link = 'https://www.producthunt.com/products/aircrate-tools-directory';
  const dataRaw = await fetch(link);
  const html = await dataRaw.text();
  const isFirstLaunchApp = isFirstLaunch(html, 11865);
  console.log(isFirstLaunchApp);

  if (!isFirstLaunchApp) {
    const eventId = 11865;
    const productData = getProductData(html);
    const eventKey = 'UpcomingEvent' + eventId;
    const productKey = 'Product' + 486867;
    console.log(productData);
    console.log(productData.props.apolloState[productKey]);
  }
}

// RUN: 
//getAllNewProducts();
//test();
//

module.exports = { getAllNewProducts }

