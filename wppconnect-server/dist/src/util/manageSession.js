"use strict";
/*
 * Copyright 2023 WPPConnect Team
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.backupSessions = backupSessions;
exports.restoreSessions = restoreSessions;
exports.closeAllSessions = closeAllSessions;
const archiver_1 = __importDefault(require("archiver"));
const fs_1 = __importDefault(require("fs"));
const unzipper_1 = __importDefault(require("unzipper"));
const __1 = require("..");
const config_1 = __importDefault(require("../config"));
const functions_1 = require("./functions");
const getAllTokens_1 = __importDefault(require("./getAllTokens"));
const sessionUtil_1 = require("./sessionUtil");
function backupSessions(req) {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve, reject) => {
        await closeAllSessions(req);
        const output = fs_1.default.createWriteStream(__dirname + '/../backupSessions.zip');
        const archive = (0, archiver_1.default)('zip', {
            zlib: { level: 9 }, // Sets the compression level.
        });
        archive.on('error', function (err) {
            reject(err);
            req.logger.error(err);
        });
        archive.pipe(output);
        archive.directory(__dirname + '/../../tokens', 'tokens');
        fs_1.default.cpSync(config_1.default.customUserDataDir, __dirname + '/../../backupFolder', { force: true, recursive: true });
        archive.directory(__dirname + '/../../backupFolder', 'userDataDir');
        archive.finalize();
        output.on('close', () => {
            fs_1.default.rmSync(__dirname + '/../../backupFolder', { recursive: true });
            const myStream = fs_1.default.createReadStream(__dirname + '/../backupSessions.zip');
            myStream.pipe(req.res);
            myStream.on('end', () => {
                __1.logger.info('Sessions successfully backuped. Restarting sessions...');
                (0, functions_1.startAllSessions)(config_1.default, __1.logger);
                req.res?.end();
            });
            myStream.on('error', function (err) {
                console.log(err);
                reject(err);
            });
        });
    });
}
async function restoreSessions(req, file) {
    if (!file?.mimetype?.includes('zip')) {
        throw new Error('Please, send zipped file');
    }
    const path = file.path;
    __1.logger.info('Starting restore sessions...');
    await closeAllSessions(req);
    const extract = fs_1.default
        .createReadStream(path)
        .pipe(unzipper_1.default.Extract({ path: './restore' }));
    extract.on('close', () => {
        try {
            fs_1.default.cpSync(__dirname + '/../../restore/tokens', 'tokens', {
                force: true,
                recursive: true,
            });
        }
        catch (error) {
            __1.logger.info("Folder 'tokens' not found.");
        }
        try {
            fs_1.default.cpSync(__dirname + '/../../restore/userDataDir', config_1.default.customUserDataDir, {
                force: false,
                recursive: true,
            });
        }
        catch (error) {
            __1.logger.info("Folder 'userDataDir' not found.");
        }
        __1.logger.info('Sessions successfully restored. Starting...');
        (0, functions_1.startAllSessions)(config_1.default, __1.logger);
    });
    return { success: true };
}
async function closeAllSessions(req) {
    const names = await (0, getAllTokens_1.default)(req);
    names.forEach(async (session) => {
        const client = sessionUtil_1.clientsArray[session];
        try {
            delete sessionUtil_1.clientsArray[session];
            if (client?.status) {
                __1.logger.info('Stopping session: ' + session);
                await client.page.browser().close();
            }
            delete sessionUtil_1.clientsArray[session];
        }
        catch (error) {
            __1.logger.error('Not was possible stop session: ' + session);
        }
    });
}
