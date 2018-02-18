const fs = require('fs');
const moment = require('moment');
const path = require('path');

if (process.argv.length < 3) {
  throw 'Usage: node index.js your/path/to/parse';
}

const allowedExtensions = [
  '.jpg',
  '.mp4',
  '.mov',
];

//main call
const folder = process.argv[2];
search(folder, folder);

/**
 * Search in the folder by file. If it is folder, call this function in a
 * recursive way
 * @param  {string} toFolder
 * @param  {string} searchFolder
 * @return
 */
function search(toFolder, searchFolder) {
  fs.readdir(searchFolder, (error, files) => {
    files.forEach(file => {
      const filePath = `${searchFolder}/${file}`;
      const stats = fs.lstatSync(filePath);
      const extension = path.extname(file).toLowerCase();
      if (stats.isFile()) {
        if (allowedExtensions.indexOf(extension) >= 0) {
          const date = moment(stats.birthtimeMs);
          createFolderIfNotExists(toFolder, date);
          moveOrDeleteFile(toFolder, searchFolder, date, file);
        }
      } else {
        search(toFolder, filePath);
      }
    });
  });
}

/**
 * create a folder with the "year" as name (2012, 2013...) and inside of it
 * a folder with the "date" nam (2012-10-10)
 * @param  {string} directory
 * @param  {moment} date
 * @return
 */
function createFolderIfNotExists(directory, date) {
  //year
  const yearFolder = `${directory}/${date.year()}`;
  if (!fs.existsSync(yearFolder)) {
    fs.mkdirSync(yearFolder);
  }

  //day
  const dayFolder = `${yearFolder}/${date.format('YYYY-MM-DD')}`;
  if (!fs.existsSync(dayFolder)) {
    fs.mkdirSync(dayFolder);
  }
}

/**
 * move the file to the new folder
 *
 * @param  {string} newDirectory
 * @param  {string} currentDirectory
 * @param  {moment} date
 * @param  {string} file
 * @return
 */
function moveOrDeleteFile(newDirectory, currentDirectory, date, file) {
  const oldPath = `${currentDirectory}/${file}`;
  const newPath = `${newDirectory}/${date.year()}/${date.format('YYYY-MM-DD')}/${file}`;
  if (oldPath == newPath) {
    return;
  }
  fs.rename(oldPath, newPath, (error) => {
    if (error) {
      throw error;
    }
    console.log(`${file} moved to ${newPath}`);
  });
}
