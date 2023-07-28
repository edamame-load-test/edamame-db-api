import path from "path";
import fs from "fs";
import { fileURLToPath } from 'url';
import { promisify } from "util";
import child_process from "child_process";
const exec = promisify(child_process.exec);

const files = {
  exists: (path) => {
    return fs.existsSync(path);
  },

  makeDir: (dirName) => {
    return fs.mkdir(files.path(dirName), (err) => err);
  },

  read: (path) => {
    return fs.readFileSync(path, 'utf-8');
  },

  fileNames: (path) => {
    return fs.readdirSync(path);
  },

  write: (filePath, data) => {
    fs.writeFileSync(filePath, data);
  },

  path: (filePath) => {
    const filename = fileURLToPath(import.meta.url);
    const dirname = path.dirname(filename);
    let fullpath = path.join(dirname, filePath);
    return fullpath.replace(/ /g, '\\ ');
  },

  delete: (filePath) => {
    return fs.rm(filePath, (err) => err);
  },

  splitFile: async (filePath, partSize, fileName, outputDir) => {
    let command = `cd ${filePath} && split -b ` +
    `${partSize} ${fileName} ${outputDir}`;
    return exec(command);
  },

  numBytes: async (filePath) => {
    const { stdout } = await exec(`wc -c ${filePath}`); 
    return Number(stdout.match(/[0-9]{1,}/)[0]);
  },

  cleanUpDir: (directory) => {
    let allFiles = files.fileNames(directory);
    allFiles.forEach(fileName => {
      fs.rmSync(`${directory}/${fileName}`);
    });
  }
};

export default files;
