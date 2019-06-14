'use strict';

const fse = require('fs-extra');
const http = require('https');
const path = require('path');
const unzip = require('unzip');
const child_process = require('child_process');

const gameIconsUrl = 'https://game-icons.net/archives/png/zip/ffffff/transparent/game-icons.net.png.zip';
const imgPath = '/img';
const cssPath = '/css/icons.css';
const jsPath = '/js/icons.js';
const cfgPath = '/icons.cfg';


/**
 * Download a file.
 * @param {string} url
 * @param {string} dest
 */
async function downloadFile(url, dest) {
	console.log('Downloading from ' + url + ' to ' + dest);
	http.get(url, response => {
		const file = fse.createWriteStream(dest);
		response.pipe(file);
	});
	console.log('Downloading from ' + url + ' to ' + dest + ' => DONE');
}

/**
 * Unzip a file.
 * @param {string} src
 * @param {string} dest
 */
async function unzipAll(src, dest) {
	console.log('Unzipping from ' + src + ' to ' + dest);
	fse.createReadStream(src)
		.pipe(unzip.Parse())
		.on('entry', entry => {
			const fileName = entry.path;
			const baseName = path.basename(fileName);
			const type = entry.type;
			if (type === 'File') {
				entry.pipe(fse.createWriteStream(path.join(dest, baseName)));
			} else {
				entry.autodrain();
			}
		});
	console.log('Unzipping from ' + src + ' to ' + dest + ' => DONE');
}

/**
 * Copy a file.
 * @param {string} src
 * @param {string} dest
 */
async function copyAll(src, dest) {
	console.log('Copying ' + src + ' to ' + dest);
	fse.copySync(src, dest, { overwrite : false });
	console.log('Copying ' + src + ' to ' + dest + ' => DONE');
}

/**
 * Transform icons in the given path.
 * @param {string} filepath
 * @param {string[]} excludeFolders
 */
async function transformAll(filepath, excludeFolders) {
	// Subdirectories and root icons
	let subDir = fse.readdirSync(filepath).filter(file => fse.lstatSync(filepath + '/' + file).isDirectory());
	subDir.push('');
	for (let i = 0; i < subDir.length; i++) {
		let e = excludeFolders.indexOf(filepath + '/' + subDir[i]);
		if (e >= 0)
			continue;

		try {
			console.log('Transforming png ' + filepath + '/' + subDir[i] + ' (this will take a while)...');
			// const processIconsCmd = 'mogrify -background white -alpha shape *.png';
			const processIconsCmd = 'mogrify -channel-fx "red=100%, blue=100%, green=100%" *.png';
			child_process.exec(processIconsCmd, { cwd: filepath + '/' + subDir[i] });
			console.log('Transforming png ' + filepath + '/' + subDir[i] + ' => DONE');
		} catch (error) {
			console.log('No pictures found in "' + filepath + '/' + subDir[i] + '"');
		}
	}
}

/**
 * Generate a css file with a class for each icon.
 * @param {string} src
 * @param {string} dest
 */
async function generateCSS(src, dest) {
	console.log('Generating CSS from ' + src + ' to ' + dest);
	fse.readdir(src, (err, files) => {
		if (err) {
			throw err;
		} else {
			let content = '';
			files.map(function (name) {
				if (fse.lstatSync(src + '/' + name).isDirectory()) {
					let subDirFiles = fse.readdirSync(src + '/' + name);
					subDirFiles.map(function (subDirName) {
						content += '.icon-' + name + '-' + subDirName.replace('.png', '').replace('.jpg', '') + '{background-image:url(../img/' + name + '/' + subDirName + ');}\n';
					});
				} else
					content += '.icon-' + name.replace('.png', '').replace('.jpg', '') + '{background-image:url(../img/' + name + ');}\n';
			});

			fse.outputFile(dest, content);
		}
	});
	console.log('Generating CSS from ' + src + ' to ' + dest + ' => DONE');
}

/**
 * Generate a js file with an array containing the names of all icons.
 * @param {string} src
 * @param {string} dest
 */
async function generateJS(src, dest) {
	console.log('Generating JS from ' + src + ' to ' + dest);
	fse.readdir(src, (err, files) => {
		if (err) {
			throw err;
		} else {
			let content = 'export const icon_names = [\n';
			files.map(function (name) {
				if (fse.lstatSync(src + '/' + name).isDirectory()) {
					let subDirFiles = fse.readdirSync(src + '/' + name);
					subDirFiles.map(function (subDirName) {
						content += '    \'' + name + '-' + subDirName.replace('.png', '').replace('.jpg', '') + '\',\n';
					});
				} else
					content += '    \'' + name.replace('.png', '').replace('.jpg', '') + '\',\n';
			});
			content = content.substr(0, content.length - ',\n'.length);// Remove the last comma
			content += '\n];\n';

			fse.outputFile(dest, content);
		}
	});
	console.log('Generating JS from ' + src + ' to ' + dest + ' => DONE');
}


/**
 * 
 * @param {boolean} download
 * @param {boolean} transform
 */
async function update(download, transform) {
	try {
		let tempDir = '';
		let resourcesDir = '';
		let generatorDir = '';
		let excludeFolders = [];

		const toolPathAntiSlashLength = process.argv[1].lastIndexOf('\\');
		const toolPathSlashLength = process.argv[1].lastIndexOf('/');
		const toolPath = process.argv[1].substr(0, toolPathSlashLength > toolPathAntiSlashLength ? toolPathSlashLength : toolPathAntiSlashLength);

		let buffer = fse.readFileSync(toolPath + cfgPath);
		if (buffer) {
			const cfgLines = buffer.toString().split('\n');
			for (let index = 0; index < cfgLines.length; index++) {
				if (cfgLines[index].length === 0) {
					continue;
				} else if (cfgLines[index].startsWith('# TEMP DIR')) {
					if (++index < cfgLines.length) {
						tempDir = cfgLines[index];
					}
				}
				else if (cfgLines[index].startsWith('# RESOURCES DIR')) {
					if (++index < cfgLines.length) {
						resourcesDir = cfgLines[index];
					}
				}
				else if (cfgLines[index].startsWith('# GENERATOR DIR')) {
					if (++index < cfgLines.length) {
						generatorDir = cfgLines[index];
					}
				}
				else if (cfgLines[index].startsWith('# TRANSFORM EXCLUDE')) {
					for (index++; index < cfgLines.length; index++) {
						if (!cfgLines[index]) {
							continue;
						}
						if (cfgLines[index].startsWith('#')) {
							break;
						}
						excludeFolders.push(cfgLines[index]);
					}
				}
			}
		}

		const imgDir = generatorDir + imgPath;

		if (download) {
			await Promise.all([
				fse.emptyDir(tempDir),
				fse.emptyDir(imgDir)
			]);
	
			const tempFilePath = tempDir + '.zip';
			await downloadFile(gameIconsUrl, tempFilePath);
			await unzipAll(tempFilePath, tempDir);
		} else {
			await fse.emptyDir(imgDir);
		}

		await copyAll(resourcesDir, imgDir);
		if (transform) {
			await transformAll(imgDir);
		}
		await copyAll(tempDir, imgDir);

		await Promise.all([
			generateCSS(imgDir, generatorDir + cssPath),
			generateJS(imgDir, generatorDir + jsPath)
		]);
		console.log('Done.');
	} catch (err) {
		console.error(err.stack);
	}
}


// Check parameters given to the js
let argvs = process.argv.slice(2);
let download = argvs.indexOf('download') >= 0;
let transform = argvs.indexOf('download') >= 0;

update(download, transform);
