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
exports.backupAllSessions = backupAllSessions;
exports.restoreAllSessions = restoreAllSessions;
exports.takeScreenshot = takeScreenshot;
exports.clearSessionData = clearSessionData;
exports.setLimit = setLimit;
const fs_1 = __importDefault(require("fs"));
const __1 = require("..");
const config_1 = __importDefault(require("../config"));
const manageSession_1 = require("../util/manageSession");
const sessionUtil_1 = require("../util/sessionUtil");
async function backupAllSessions(req, res) {
    /**
       * #swagger.tags = ["Misc"]
       * #swagger.description = 'Please, open the router in your browser, in swagger this not run'
       * #swagger.produces = ['application/octet-stream']
       * #swagger.consumes = ['application/octet-stream']
         #swagger.autoBody=false
         #swagger.parameters["secretkey"] = {
            required: true,
            schema: 'THISISMYSECURETOKEN'
         }
         #swagger.responses[200] = {
          description: 'A ZIP file contaings your backup. Please, open this link in your browser',
          content: {
            "application/zip": {
              schema: {}
            }
          },
        }
       */
    const { secretkey } = req.params;
    if (secretkey !== config_1.default.secretKey) {
        res.status(400).json({
            response: 'error',
            message: 'The token is incorrect',
        });
    }
    try {
        res.setHeader('Content-Type', 'application/zip');
        res.send(await (0, manageSession_1.backupSessions)(req));
    }
    catch (error) {
        res.status(500).json({
            status: false,
            message: 'Error on backup session',
            error: error,
        });
    }
}
async function restoreAllSessions(req, res) {
    /**
     #swagger.tags = ["Misc"]
     #swagger.autoBody=false
      #swagger.parameters["secretkey"] = {
      required: true,
      schema: 'THISISMYSECURETOKEN'
      }
      #swagger.requestBody = {
        required: true,
        content: {
          "multipart/form-data": {
            schema: {
              type: 'object',
              properties: {
                file: {
                  type: "string",
                  format: "binary"
                }
              },
              required: ['file'],
            }
          }
        }
      }
    */
    const { secretkey } = req.params;
    if (secretkey !== config_1.default.secretKey) {
        res.status(400).json({
            response: 'error',
            message: 'The token is incorrect',
        });
    }
    try {
        const result = await (0, manageSession_1.restoreSessions)(req, req.file);
        res.status(200).json(result);
    }
    catch (error) {
        res.status(500).json({
            status: false,
            message: 'Error on restore session',
            error: error,
        });
    }
}
async function takeScreenshot(req, res) {
    /**
     #swagger.tags = ["Misc"]
     #swagger.autoBody=false
      #swagger.security = [{
            "bearerAuth": []
      }]
      #swagger.parameters["session"] = {
      schema: 'NERDWHATS_AMERICA'
      }
    */
    try {
        const result = await req.client.takeScreenshot();
        res.status(200).json(result);
    }
    catch (error) {
        res.status(500).json({
            status: false,
            message: 'Error on take screenshot',
            error: error,
        });
    }
}
async function clearSessionData(req, res) {
    /**
     #swagger.tags = ["Misc"]
     #swagger.autoBody=false
      #swagger.parameters["secretkey"] = {
      required: true,
      schema: 'THISISMYSECURETOKEN'
      }
      #swagger.parameters["session"] = {
      schema: 'NERDWHATS_AMERICA'
      }
    */
    try {
        const { secretkey, session } = req.params;
        if (secretkey !== config_1.default.secretKey) {
            res.status(400).json({
                response: 'error',
                message: 'The token is incorrect',
            });
        }
        if (req?.client?.page) {
            delete sessionUtil_1.clientsArray[req.params.session];
            await req.client.logout();
        }
        const path = config_1.default.customUserDataDir + session;
        const pathToken = __dirname + `../../../tokens/${session}.data.json`;
        if (fs_1.default.existsSync(path)) {
            await fs_1.default.promises.rm(path, {
                recursive: true,
            });
        }
        if (fs_1.default.existsSync(pathToken)) {
            await fs_1.default.promises.rm(pathToken);
        }
        res.status(200).json({ success: true });
    }
    catch (error) {
        __1.logger.error(error);
        res.status(500).json({
            status: false,
            message: 'Error on clear session data',
            error: error,
        });
    }
}
async function setLimit(req, res) {
    /**
     #swagger.tags = ["Misc"]
     #swagger.description = 'Change limits of whatsapp web. Types value: maxMediaSize, maxFileSize, maxShare, statusVideoMaxDuration, unlimitedPin;'
     #swagger.autoBody=false
      #swagger.security = [{
            "bearerAuth": []
      }]
      #swagger.parameters["session"] = {
      schema: 'NERDWHATS_AMERICA'
      }
       #swagger.requestBody = {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                type: { type: 'string' },
                value: { type: 'any' },
              },
              required: ['type', 'value'],
            },
            examples: {
              'Default': {
                value: {
                  type: 'maxFileSize',
                  value: 104857600
                },
              },
            },
          },
        },
      }
    */
    try {
        const { type, value } = req.body;
        if (!type || !value)
            throw new Error('Send de type and value');
        const result = await req.client.setLimit(type, value);
        res.status(200).json(result);
    }
    catch (error) {
        res.status(500).json({
            status: false,
            message: 'Error on set limit',
            error: error,
        });
    }
}
