'use strict';

var express = require('express');
var router = express.Router();
var fs = require('fs');
var wrench = require('wrench');

/**
 * Given a base game path, searches for the 'assets' folder in:
 *
 *      baseGamePath + '/assets'        <-- libGDX format
 *
 *      or
 *
 *      baseGamePath + '/Assets/Assets' <-- Unity format
 *
 * If none of the above options are found, null is returned.
 *
 * @param baseGamePath
 * @returns path to the 'track.txt' file inside 'assets/'(or Assers/) folder, or null
 */
var getAssetsRoute = function(baseGamePath) {
    var stat = fs.statSync(baseGamePath + '/assets');
    var assetsFile = '';
    if (stat && stat.isDirectory()) {
        assetsFile = baseGamePath + '/assets/track.txt';
    } else {
        stat = fs.statSync(baseGamePath + '/Assets/Assets');
        if (stat && stat.isDirectory()) {
            assetsFile = baseGamePath + '/Assets/Assets/track.txt';
        } else {
            return null;
        }
    }
    return assetsFile;
};

/** GET the game configurations. */
router.get('/:gameName', function (req, res, next) {
    // Read the directory

    var gameName = req.params.gameName || '';

    if (!gameName) {
        return next(new Error('A game is required!'));
    }

    var dir = './public/games/' + req.params.gameName + '/configurations';
    fs.readdir(dir, function (err, list) {
        // Return the error if something went wrong
        if (err) {
            return next(err);
        }

        var configurations = [];
        var def = JSON.parse(fs.readFileSync('./public/games/' + req.params.gameName + '/def.json', 'utf8'));
        var thumbnailPath = 'games/' + req.params.gameName + '/' + def.image;

        // For every file in the list
        list.forEach(function (file) {
            // Full path of that file
            var path = dir + '/' + file;
            // Get the file's stats
            var stat = fs.statSync(path);
            // If the file is a directory
            if (stat && stat.isDirectory()) {
                // Dive into the directory
                var config = {};
                var gamePath = 'games/' + req.params.gameName + '/configurations' + '/' + file;
                config.url = gamePath + '/index.html';
                config.title = def.title + ' - ' + file;

                var assetsFile = getAssetsRoute(dir + '/' + file);
                if (assetsFile) {
                    var trackStr = fs.readFileSync(assetsFile, 'utf8');
                    var trackParts = trackStr.split(';');
                    config.collectorUrl = trackParts[0];
                    config.trackingCode = trackParts[1];

                    configurations.push(config);
                } else {
                    console.log('Assets directory not found in game', path, '(skippied)');
                }
            } else {
                console.log('Found a file in games directory', path, '(ignored)');
            }
        });

        res.render('grid', {
            title: 'Analytics Games',
            action: 'Choose a configuration',
            gameTitle: def.title,
            thumbnailPath: thumbnailPath,
            configurations: configurations
        });
    });
});


/** POST a new game configuration. */
router.post('/:gameName', function (req, res, next) {

    var collectorUrl = req.body.collectorUrl;
    var trackingCode = req.body.trackingCode;

    if (!collectorUrl) {
        return next(new Error('A collector URL must be provided!'));
    }

    if (!trackingCode) {
        return next(new Error('A tracking code must be provided!'));
    }

    var assetStr = collectorUrl + ';' + trackingCode;

    var dir = './public/games/' + req.params.gameName + '/configurations';
    fs.readdir(dir, function (err, list) {
        // Return the error if something went wrong
        if (err) {
            return next(err);
        }

        var assetsFile = getAssetsRoute('./public/games/' + req.params.gameName + '/game');
        if (!assetsFile) {
            return next(new Error('No assets folder found in ' + req.params.gameName));
        }
        var newConfiguration = 1;

        for (var i = 1; i <= list.length; ++i) {
            var dirName = String(i);
            if (list.indexOf(dirName) === -1) {
                newConfiguration = i;
            }
        }

        wrench.copyDirRecursive('./public/games/' + req.params.gameName + '/game', dir + '/' + newConfiguration,
            {forceDelete: true /* See sync version */}, function (err) {
                if (err) {
                    return next(err);
                }
                var assetsFile = getAssetsRoute(dir + '/' + newConfiguration);
                if (!assetsFile) {
                    return next(new Error('No assets folder found in ' + req.params.gameName + '(' + newConfiguration + ')'));
                }
                fs.writeFile(assetsFile, assetStr, function (err) {
                    if (err) {
                        return next(err);
                    }
                    res.sendStatus(200);
                });
            });
    });
});

/** DELETE a new game configuration. */
router.delete('/:gameName', function (req, res, next) {

    var configurationId = req.body.configurationId;

    if (!configurationId) {
        return next(new Error('A configurationId must be provided!'));
    }

    var dir = './public/games/' + req.params.gameName + '/configurations/' + configurationId;
    wrench.rmdirSyncRecursive(dir, true);
    res.sendStatus(200);
});

/** GET the games (home page). */
router.get('', function (req, res, next) {
    // Read the directory
    var dir = './public/games';
    fs.readdir(dir, function (err, list) {
        // Return the error if something went wrong
        if (err) {
            return next(err);
        }

        var games = [];

        // For every file in the list
        list.forEach(function (file) {
            // Full path of that file
            var path = dir + '/' + file;
            // Get the file's stats
            var stat = fs.statSync(path);
            // If the file is a directory
            if (stat && stat.isDirectory()) {
                // Dive into the directory
                var gameDefString = fs.readFileSync(path + '/def.json', 'utf8');
                var def = JSON.parse(gameDefString);
                def.image = 'games/' + file + '/' + def.image;
                def.folderName = file;
                games.push(def);
            } else {
                console.log('Found a file in games directory', path, '(ignored)');
            }
        });
        res.render('index', {
            title: 'Analytics Games',
            action: 'Choose your game',
            games: games
        });
    });
});

module.exports = router;