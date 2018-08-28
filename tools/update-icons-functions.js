'use strict'

const mv = require('mv');
const fse = require('fs-extra');
const http = require('http');
const path = require('path');
const walk = require('walk');
const unzip = require('unzip');
const child_process = require('child_process');
const ncp = require('ncp');

const gameIconsUrl = "http://game-icons.net/archives/png/zip/ffffff/transparent/game-icons.net.png.zip";
const tempFilePath = "./temp.zip";
const tempDir = "./temp";
const imgDir = "./generator/img";
const imgSrcDir = "./resources";
const cssPath = "./generator/css/icons.css";
const jsPath = "./generator/js/icons.js";
const excludeCfgPath = "./ignore.cfg";
// const processIconsCmd = 'mogrify -background white -alpha shape *.png';
const processIconsCmd = 'mogrify -channel-fx "red=100%, blue=100%, green=100%" *.png';

// ----------------------------------------------------------------------------
// Download
// ----------------------------------------------------------------------------
async function downloadFile(url, dest) {
	console.log('Downloading from ' + url + ' to ' + dest);
	http.get(url, response => {
		const file = fse.createWriteStream(dest);
		response.pipe(file);
	});
	console.log('Downloading from ' + url + ' to ' + dest + ' => DONE');
}

// ----------------------------------------------------------------------------
// Unzip
// ----------------------------------------------------------------------------
async function unzipAll(src, dest) {
	console.log('Unzipping from ' + src + ' to ' + dest);
	fse.createReadStream(src)
		.pipe(unzip.Parse())
		.on('entry', entry => {
			const fileName = entry.path;
			const baseName = path.basename(fileName);
			const type = entry.type;
			if (type === "File") {
				entry.pipe(fse.createWriteStream(path.join(dest, baseName)));
			} else {
				entry.autodrain();
			}
		});
	console.log('Unzipping from ' + src + ' to ' + dest + ' => DONE');
}

// ----------------------------------------------------------------------------
// Copy
// ----------------------------------------------------------------------------
async function copyAll(src, dest) {
	console.log('Copying ' + src + ' to ' + dest);
	fse.copySync(src, dest);
	console.log('Copying ' + src + ' to ' + dest + ' => DONE');
}

// ----------------------------------------------------------------------------
// Process icons
// ----------------------------------------------------------------------------
async function transformAll(path) {
	console.log('Transforming png ' + path + ' (this will take a while)...');
	try {
		child_process.exec(processIconsCmd, { cwd: path });
	} catch (err) { }
	console.log('Transforming png ' + path + ' => DONE');

	var buffer = fse.readFileSync(excludeCfgPath);
	var excludeFolders = [];
	if (buffer) {
		excludeFolders = buffer.toString().split("\n");
	}

	// Subdirectories icons
	var subDir = fse.readdirSync(path).filter(file => fse.lstatSync(path + '/' + file).isDirectory());
	for (var i = 0; i < subDir.length; i++) {
		var e = excludeFolders.indexOf(path + '/' + subDir[i]);
		if (e >= 0)
			continue;
		try {
			console.log('Transforming png ' + path + '/' + subDir[i] + ' (this will take a while)...');
			child_process.exec(processIconsCmd, { cwd: path + '/' + subDir[i] });
			console.log('Transforming png ' + path + '/' + subDir[i] + ' => DONE');
		} catch (error) {
			console.log('No pictures found in "' + subDir[i] + '"');
		}
	}
}

// ----------------------------------------------------------------------------
// Generate CSS
// ----------------------------------------------------------------------------
async function generateCSS(src, dest) {
	console.log('Generating CSS from ' + src + ' to ' + dest);
	fse.readdir(src, (err, files) => {
		if (err) {
			throw err;
		} else {
			var content = "";
			files.map(function (name) {
				if (fse.lstatSync(src + "/" + name).isDirectory()) {
					var subDirFiles = fse.readdirSync(src + "/" + name);
					subDirFiles.map(function (subDirName) {
						content += '.icon-' + name + '-' + subDirName.replace(".png", "").replace(".jpg", "") + '{background-image:url(../img/' + name + '/' + subDirName + ');}\n';
					});
				} else
					content += '.icon-' + name.replace(".png", "").replace(".jpg", "") + '{background-image:url(../img/' + name + ');}\n';
			});

			fse.outputFile(dest, content);
		}
	});
	console.log('Generating CSS from ' + src + ' to ' + dest + ' => DONE');
}

// ----------------------------------------------------------------------------
// Generate JS
// ----------------------------------------------------------------------------
async function generateJS(src, dest) {
	console.log('Generating JS from ' + src + ' to ' + dest);
	fse.readdir(src, (err, files) => {
		if (err) {
			throw err;
		} else {
			var content = "var icon_names = [\n";
			files.map(function (name) {
				if (fse.lstatSync(src + "/" + name).isDirectory()) {
					var subDirFiles = fse.readdirSync(src + "/" + name);
					subDirFiles.map(function (subDirName) {
						content += '    "' + name + '-' + subDirName.replace(".png", "").replace(".jpg", "") + '",\n';
					});
				} else
					content += '    "' + name.replace(".png", "").replace(".jpg", "") + '",\n';
			});
			content += '];\n';

			fse.outputFile(dest, content);
		}
	});
	console.log('Generating JS from ' + src + ' to ' + dest + ' => DONE');
}


exports.update = async function () {
	try {
		await Promise.all([
			fse.emptyDir(tempDir),
			fse.emptyDir(imgDir)
		]);

		await downloadFile(gameIconsUrl, tempFilePath);
		await unzipAll(tempFilePath, tempDir);

		await copyAll(imgSrcDir, imgDir);
		await transformAll(imgDir);
		await copyAll(tempDir, imgDir);

		await Promise.all([
			generateCSS(imgDir, cssPath),
			generateJS(imgDir, jsPath)
		]);
		console.log('Done.');
	} catch (err) {
		console.error('Error', err);
	}
}

exports.update_no_dl = async function () {
	try {
		await fse.emptyDir(imgDir);

		await copyAll(imgSrcDir, imgDir);
		await transformAll(imgDir);
		await copyAll(tempDir, imgDir);

		await Promise.all([
			generateCSS(imgDir, cssPath),
			generateJS(imgDir, jsPath)
		]);
		console.log('Done.');
	} catch (err) {
		console.error('Error', err);
	}
}

exports.update_no_dl_no_transform = async function () {
	try {
		await copyAll(imgSrcDir, imgDir);

		await Promise.all([
			generateCSS(imgDir, cssPath),
			generateJS(imgDir, jsPath)
		]);
		console.log('Done.');
	} catch (err) {
		console.error('Error', err);
	}
}