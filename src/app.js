const prompt = require('prompt-sync')();
const path = require('path');
const fs = require('fs');
//const { exec } = require("child_process");
const util = require('node:util');
const exec = util.promisify(require('node:child_process').exec)

// MainModules:
const { allAppUpvoters } = require('./mainModules/allAppUpvoters');
const { getAllNewProducts } = require('./mainModules/newProduct');
const { getAllTodayApps } = require('./mainModules/todayApps');

// Config:
const { FILES_DIR_NAME, VERSION, colors } = require('./config/config');

const app = async () => {
  // Clear the window before run:
  const { stdout } = await exec('clear');
  console.log(stdout);

  // Create /files dir if it doesnt exists:
  const checkDir = path.join(process.execPath, '..', FILES_DIR_NAME);
  if (!fs.existsSync(checkDir)){
      fs.mkdirSync(checkDir);
  }

  const logoPath = path.join(__dirname, 'assets/parserLogo.txt');
  const logo = fs.readFileSync(logoPath, { encoding: 'utf-8' });

  console.log("\x1b[35m%s\x1b[0m", logo); // set color to Magenta and back to default
  console.log("\x1b[35m%s\x1b[0m", 'by Max B.');
  console.log("\x1b[35m%s\x1b[0m", 'v.' + VERSION);

  console.log("\x1b[33m", ''); // set color to Yellow
  console.log('Choose what do you wand to do:');
  console.log('1. Get App\'s Upvoters     => [ Beta ]');
  console.log('2. Get all Today Apps     => [ Beta ]');
  console.log('3. Get all Upcomming Apps => [IN-DEV]');
  console.log('=======>');
  console.log('or type \"s\" or \"e\" to Stop/Exit');
  console.log('=======>');
  console.log("\x1b[0m", ''); // set color back to default

  // return user's input with a type of String:
  const mode = prompt('Choose your destiny: ');

  switch(mode) {
    case '1':
      // NOTE: IN-DEV;
      //console.log(colors.Red, 'SORRY! This feature is in development now!');
      //return;

      console.log('Please provide a PostId!');
      console.log('or type \"s\" or \"e\" to Stop/Exit');
      console.log('=======>');
      const postId = prompt('Post ID: ');

      if (postId.toLowerCase() === 's' || postId.toLowerCase() === 'e') {
        console.log('Bye!');
        return;
      }

      console.log('Looking for post with ID ' + postId);

      await allAppUpvoters(postId);

      break;
    case '2':
      console.log('Looking for all Today Apps...');
       
      await getAllTodayApps();

      break;
    case '3':
      // NOTE: IN-DEV;
      console.log(colors.Red, 'SORRY! This feature is in development now!');
      return;

      console.log('Looking for all Upcomming Apps...');
       
      await getAllNewProducts();

      break;
    case 'e':
    case 'E':
    case 's':
    case 'S':
      console.log('Bye!');
      return;
    default:
      console.log(colors.Red, 'NO WAY!!');
      console.log(colors.Red, 'If you dont know what do you want then I cant help you..');
      console.log(colors.White, 'Bye!');
      break;
  }
};

// RUN:
app();

