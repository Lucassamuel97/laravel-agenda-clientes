"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.download = download;
exports.startAllSessions = startAllSessions;
exports.showAllSessions = showAllSessions;
exports.startSession = startSession;
exports.closeSession = closeSession;
exports.logOutSession = logOutSession;
exports.checkConnectionSession = checkConnectionSession;
exports.downloadMediaByMessage = downloadMediaByMessage;
exports.getMediaByMessage = getMediaByMessage;
exports.getSessionState = getSessionState;
exports.getQrCode = getQrCode;
exports.killServiceWorker = killServiceWorker;
exports.restartService = restartService;
exports.subscribePresence = subscribePresence;
exports.setOnlinePresence = setOnlinePresence;
exports.editBusinessProfile = editBusinessProfile;
const fs_1 = __importDefault(require("fs"));
const mime_types_1 = __importDefault(require("mime-types"));
const qrcode_1 = __importDefault(require("qrcode"));
const package_json_1 = require("../../package.json");
const config_1 = __importDefault(require("../config"));
const createSessionUtil_1 = __importDefault(require("../util/createSessionUtil"));
const functions_1 = require("../util/functions");
const getAllTokens_1 = __importDefault(require("../util/getAllTokens"));
const sessionUtil_1 = require("../util/sessionUtil");
const SessionUtil = new createSessionUtil_1.default();
async function downloadFileFunction(message, client, logger) {
    try {
        const buffer = await client.decryptFile(message);
        const filename = `./WhatsAppImages/file${message.t}`;
        if (!fs_1.default.existsSync(filename)) {
            let result = '';
            if (message.type === 'ptt') {
                result = `${filename}.oga`;
            }
            else {
                result = `${filename}.${mime_types_1.default.extension(message.mimetype)}`;
            }
            await fs_1.default.writeFile(result, buffer, (err) => {
                if (err) {
                    logger.error(err);
                }
            });
            return result;
        }
        else {
            return `${filename}.${mime_types_1.default.extension(message.mimetype)}`;
        }
    }
    catch (e) {
        logger.error(e);
        logger.warn('Erro ao descriptografar a midia, tentando fazer o download direto...');
        try {
            const buffer = await client.downloadMedia(message);
            const filename = `./WhatsAppImages/file${message.t}`;
            if (!fs_1.default.existsSync(filename)) {
                let result = '';
                if (message.type === 'ptt') {
                    result = `${filename}.oga`;
                }
                else {
                    result = `${filename}.${mime_types_1.default.extension(message.mimetype)}`;
                }
                await fs_1.default.writeFile(result, buffer, (err) => {
                    if (err) {
                        logger.error(err);
                    }
                });
                return result;
            }
            else {
                return `${filename}.${mime_types_1.default.extension(message.mimetype)}`;
            }
        }
        catch (e) {
            logger.error(e);
            logger.warn('Não foi possível baixar a mídia...');
        }
    }
}
async function download(message, client, logger) {
    try {
        const path = await downloadFileFunction(message, client, logger);
        return path?.replace('./', '');
    }
    catch (e) {
        logger.error(e);
    }
}
async function startAllSessions(req, res) {
    /**
     * #swagger.tags = ["Auth"]
       #swagger.autoBody=false
       #swagger.operationId = 'startAllSessions'
       #swagger.security = [{
              "bearerAuth": []
       }]
       #swagger.parameters["session"] = {
        schema: 'NERDWHATS_AMERICA'
       }
       #swagger.parameters["secretkey"] = {
        schema: 'THISISMYSECURECODE'
       }
     */
    const { secretkey } = req.params;
    const { authorization: token } = req.headers;
    let tokenDecrypt = '';
    if (secretkey === undefined) {
        tokenDecrypt = token.split(' ')[0];
    }
    else {
        tokenDecrypt = secretkey;
    }
    const allSessions = await (0, getAllTokens_1.default)(req);
    if (tokenDecrypt !== req.serverOptions.secretKey) {
        res.status(400).json({
            response: 'error',
            message: 'The token is incorrect',
        });
    }
    allSessions.map(async (session) => {
        const util = new createSessionUtil_1.default();
        await util.opendata(req, session);
    });
    return await res
        .status(201)
        .json({ status: 'success', message: 'Starting all sessions' });
}
async function showAllSessions(req, res) {
    /**
     * #swagger.tags = ["Auth"]
       #swagger.autoBody=false
       #swagger.operationId = 'showAllSessions'
       #swagger.autoQuery=false
       #swagger.autoHeaders=false
       #swagger.security = [{
              "bearerAuth": []
       }]
       #swagger.parameters["secretkey"] = {
        schema: 'THISISMYSECURETOKEN'
       }
     */
    const { secretkey } = req.params;
    const { authorization: token } = req.headers;
    let tokenDecrypt = '';
    if (secretkey === undefined) {
        tokenDecrypt = token?.split(' ')[0];
    }
    else {
        tokenDecrypt = secretkey;
    }
    const arr = [];
    if (tokenDecrypt !== req.serverOptions.secretKey) {
        res.status(400).json({
            response: false,
            message: 'The token is incorrect',
        });
    }
    Object.keys(sessionUtil_1.clientsArray).forEach((item) => {
        arr.push({ session: item });
    });
    res.status(200).json({ response: await (0, getAllTokens_1.default)(req) });
}
async function startSession(req, res) {
    /**
     * #swagger.tags = ["Auth"]
       #swagger.autoBody=false
       #swagger.operationId = 'startSession'
       #swagger.security = [{
              "bearerAuth": []
       }]
       #swagger.parameters["session"] = {
        schema: 'NERDWHATS_AMERICA'
       }
       #swagger.requestBody = {
        required: true,
        "@content": {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                webhook: { type: "string" },
                waitQrCode: { type: "boolean" },
              }
            },
            example: {
              webhook: "",
              waitQrCode: false,
            }
          }
        }
       }
     */
    const session = req.session;
    const { waitQrCode = false } = req.body;
    await getSessionState(req, res);
    await SessionUtil.opendata(req, session, waitQrCode ? res : null);
}
async function closeSession(req, res) {
    /**
     * #swagger.tags = ["Auth"]
       #swagger.operationId = 'closeSession'
       #swagger.autoBody=true
       #swagger.security = [{
              "bearerAuth": []
       }]
       #swagger.parameters["session"] = {
        schema: 'NERDWHATS_AMERICA'
       }
     */
    const session = req.session;
    try {
        if (sessionUtil_1.clientsArray[session].status === null) {
            return await res
                .status(200)
                .json({ status: true, message: 'Session successfully closed' });
        }
        else {
            sessionUtil_1.clientsArray[session] = { status: null };
            await req.client.close();
            req.io.emit('whatsapp-status', false);
            (0, functions_1.callWebHook)(req.client, req, 'closesession', {
                message: `Session: ${session} disconnected`,
                connected: false,
            });
            return await res
                .status(200)
                .json({ status: true, message: 'Session successfully closed' });
        }
    }
    catch (error) {
        req.logger.error(error);
        return await res
            .status(500)
            .json({ status: false, message: 'Error closing session', error });
    }
}
async function logOutSession(req, res) {
    /**
     * #swagger.tags = ["Auth"]
       #swagger.operationId = 'logoutSession'
     * #swagger.description = 'This route logout and delete session data'
       #swagger.autoBody=false
       #swagger.security = [{
              "bearerAuth": []
       }]
       #swagger.parameters["session"] = {
        schema: 'NERDWHATS_AMERICA'
       }
     */
    try {
        const session = req.session;
        await req.client.logout();
        (0, sessionUtil_1.deleteSessionOnArray)(req.session);
        setTimeout(async () => {
            const pathUserData = config_1.default.customUserDataDir + req.session;
            const pathTokens = __dirname + `../../../tokens/${req.session}.data.json`;
            if (fs_1.default.existsSync(pathUserData)) {
                await fs_1.default.promises.rm(pathUserData, {
                    recursive: true,
                    maxRetries: 5,
                    force: true,
                    retryDelay: 1000,
                });
            }
            if (fs_1.default.existsSync(pathTokens)) {
                await fs_1.default.promises.rm(pathTokens, {
                    recursive: true,
                    maxRetries: 5,
                    force: true,
                    retryDelay: 1000,
                });
            }
            req.io.emit('whatsapp-status', false);
            (0, functions_1.callWebHook)(req.client, req, 'logoutsession', {
                message: `Session: ${session} logged out`,
                connected: false,
            });
            return await res
                .status(200)
                .json({ status: true, message: 'Session successfully closed' });
        }, 500);
        /*try {
          await req.client.close();
        } catch (error) {}*/
    }
    catch (error) {
        req.logger.error(error);
        res
            .status(500)
            .json({ status: false, message: 'Error closing session', error });
    }
}
async function checkConnectionSession(req, res) {
    /**
     * #swagger.tags = ["Auth"]
       #swagger.operationId = 'CheckConnectionState'
       #swagger.autoBody=false
       #swagger.security = [{
              "bearerAuth": []
       }]
       #swagger.parameters["session"] = {
        schema: 'NERDWHATS_AMERICA'
       }
     */
    try {
        await req.client.isConnected();
        res.status(200).json({ status: true, message: 'Connected' });
    }
    catch (error) {
        res.status(200).json({ status: false, message: 'Disconnected' });
    }
}
async function downloadMediaByMessage(req, res) {
    /**
     * #swagger.tags = ["Messages"]
       #swagger.autoBody=false
       #swagger.operationId = 'downloadMediabyMessage'
       #swagger.security = [{
              "bearerAuth": []
       }]
       #swagger.parameters["session"] = {
        schema: 'NERDWHATS_AMERICA'
       }
       #swagger.requestBody = {
        required: true,
        "@content": {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                messageId: { type: "string" },
              }
            },
            example: {
              messageId: '<messageId>'
            }
          }
        }
       }
     */
    const client = req.client;
    const { messageId } = req.body;
    let message;
    try {
        if (!messageId.isMedia || !messageId.type) {
            message = await client.getMessageById(messageId);
        }
        else {
            message = messageId;
        }
        if (!message)
            res.status(400).json({
                status: 'error',
                message: 'Message not found',
            });
        if (!(message['mimetype'] || message.isMedia || message.isMMS))
            res.status(400).json({
                status: 'error',
                message: 'Message does not contain media',
            });
        const buffer = await client.decryptFile(message);
        res
            .status(200)
            .json({ base64: buffer.toString('base64'), mimetype: message.mimetype });
    }
    catch (e) {
        req.logger.error(e);
        res.status(400).json({
            status: 'error',
            message: 'Decrypt file error',
            error: e,
        });
    }
}
async function getMediaByMessage(req, res) {
    /**
     * #swagger.tags = ["Messages"]
       #swagger.autoBody=false
       #swagger.operationId = 'getMediaByMessage'
       #swagger.security = [{
              "bearerAuth": []
       }]
       #swagger.parameters["session"] = {
        schema: 'NERDWHATS_AMERICA'
       }
       #swagger.parameters["session"] = {
        schema: 'messageId'
       }
     */
    const client = req.client;
    const { messageId } = req.params;
    try {
        const message = await client.getMessageById(messageId);
        if (!message)
            res.status(400).json({
                status: 'error',
                message: 'Message not found',
            });
        if (!(message['mimetype'] || message.isMedia || message.isMMS))
            res.status(400).json({
                status: 'error',
                message: 'Message does not contain media',
            });
        const buffer = await client.decryptFile(message);
        res
            .status(200)
            .json({ base64: buffer.toString('base64'), mimetype: message.mimetype });
    }
    catch (ex) {
        req.logger.error(ex);
        res.status(500).json({
            status: 'error',
            message: 'The session is not active',
            error: ex,
        });
    }
}
async function getSessionState(req, res) {
    /**
       #swagger.tags = ["Auth"]
       #swagger.operationId = 'getSessionState'
       #swagger.summary = 'Retrieve status of a session'
       #swagger.autoBody = false
       #swagger.security = [{
              "bearerAuth": []
       }]
       #swagger.parameters["session"] = {
        schema: 'NERDWHATS_AMERICA'
       }
     */
    try {
        const { waitQrCode = false } = req.body;
        const client = req.client;
        const qr = client?.urlcode != null && client?.urlcode != ''
            ? await qrcode_1.default.toDataURL(client.urlcode)
            : null;
        if ((client == null || client.status == null) && !waitQrCode)
            res.status(200).json({ status: 'CLOSED', qrcode: null });
        else if (client != null)
            res.status(200).json({
                status: client.status,
                qrcode: qr,
                urlcode: client.urlcode,
                version: package_json_1.version,
            });
    }
    catch (ex) {
        req.logger.error(ex);
        res.status(500).json({
            status: 'error',
            message: 'The session is not active',
            error: ex,
        });
    }
}
async function getQrCode(req, res) {
    /**
     * #swagger.tags = ["Auth"]
       #swagger.autoBody=false
       #swagger.operationId = 'getQrCode'
       #swagger.security = [{
              "bearerAuth": []
       }]
       #swagger.parameters["session"] = {
        schema: 'NERDWHATS_AMERICA'
       }
     */
    try {
        if (req?.client?.urlcode) {
            // We add options to generate the QR code in higher resolution
            // The /qrcode-session request will now return a readable qrcode.
            const qrOptions = {
                errorCorrectionLevel: 'M',
                type: 'image/png',
                scale: 5,
                width: 500,
            };
            const qr = req.client.urlcode
                ? await qrcode_1.default.toDataURL(req.client.urlcode, qrOptions)
                : null;
            const img = Buffer.from(qr.replace(/^data:image\/(png|jpeg|jpg);base64,/, ''), 'base64');
            res.writeHead(200, {
                'Content-Type': 'image/png',
                'Content-Length': img.length,
            });
            res.end(img);
        }
        else if (typeof req.client === 'undefined') {
            res.status(200).json({
                status: null,
                message: 'Session not started. Please, use the /start-session route, for initialization your session',
            });
        }
        else {
            res.status(200).json({
                status: req.client.status,
                message: 'QRCode is not available...',
            });
        }
    }
    catch (ex) {
        req.logger.error(ex);
        res
            .status(500)
            .json({ status: 'error', message: 'Error retrieving QRCode', error: ex });
    }
}
async function killServiceWorker(req, res) {
    /**
     * #swagger.ignore=true
     * #swagger.tags = ["Messages"]
       #swagger.operationId = 'killServiceWorkier'
       #swagger.autoBody=false
       #swagger.security = [{
              "bearerAuth": []
       }]
       #swagger.parameters["session"] = {
        schema: 'NERDWHATS_AMERICA'
       }
     */
    try {
        res.status(200).json({ status: 'error', response: 'Not implemented yet' });
    }
    catch (ex) {
        req.logger.error(ex);
        res.status(500).json({
            status: 'error',
            message: 'The session is not active',
            error: ex,
        });
    }
}
async function restartService(req, res) {
    /**
     * #swagger.ignore=true
     * #swagger.tags = ["Messages"]
       #swagger.operationId = 'restartService'
       #swagger.autoBody=false
       #swagger.security = [{
              "bearerAuth": []
       }]
       #swagger.parameters["session"] = {
        schema: 'NERDWHATS_AMERICA'
       }
     */
    try {
        res.status(200).json({ status: 'error', response: 'Not implemented yet' });
    }
    catch (ex) {
        req.logger.error(ex);
        res.status(500).json({
            status: 'error',
            response: { message: 'The session is not active', error: ex },
        });
    }
}
async function subscribePresence(req, res) {
    /**
     * #swagger.tags = ["Misc"]
       #swagger.operationId = 'subscribePresence'
       #swagger.autoBody=false
       #swagger.security = [{
              "bearerAuth": []
       }]
       #swagger.parameters["session"] = {
        schema: 'NERDWHATS_AMERICA'
       }
       #swagger.requestBody = {
        required: true,
        "@content": {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                phone: { type: "string" },
                isGroup: { type: "boolean" },
                all: { type: "boolean" },
              }
            },
            example: {
              phone: '5521999999999',
              isGroup: false,
              all: false,
            }
          }
        }
       }
     */
    try {
        const { phone, isGroup = false, all = false } = req.body;
        if (all) {
            let contacts;
            if (isGroup) {
                const groups = await req.client.getAllGroups(false);
                contacts = groups.map((p) => p.id._serialized);
            }
            else {
                const chats = await req.client.getAllContacts();
                contacts = chats.map((c) => c.id._serialized);
            }
            await req.client.subscribePresence(contacts);
        }
        else
            for (const contato of (0, functions_1.contactToArray)(phone, isGroup)) {
                await req.client.subscribePresence(contato);
            }
        res.status(200).json({
            status: 'success',
            response: { message: 'Subscribe presence executed' },
        });
    }
    catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Error on subscribe presence',
            error: error,
        });
    }
}
async function setOnlinePresence(req, res) {
    /**
     * #swagger.tags = ["Misc"]
       #swagger.operationId = 'setOnlinePresence'
       #swagger.autoBody=false
       #swagger.security = [{
              "bearerAuth": []
       }]
       #swagger.parameters["session"] = {
        schema: 'NERDWHATS_AMERICA'
       }
       #swagger.requestBody = {
        required: true,
        "@content": {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                isOnline: { type: "boolean" },
              }
            },
            example: {
     isOnline: false,
            }
          }
        }
       }
     */
    try {
        const { isOnline = true } = req.body;
        await req.client.setOnlinePresence(isOnline);
        res.status(200).json({
            status: 'success',
            response: { message: 'Set Online Presence Successfully' },
        });
    }
    catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Error on set online presence',
            error: error,
        });
    }
}
async function editBusinessProfile(req, res) {
    /**
     * #swagger.tags = ["Profile"]
       #swagger.operationId = 'editBusinessProfile'
     * #swagger.description = 'Edit your bussiness profile'
       #swagger.autoBody=false
       #swagger.security = [{
              "bearerAuth": []
       }]
       #swagger.parameters["session"] = {
        schema: 'NERDWHATS_AMERICA'
       }
       #swagger.parameters["obj"] = {
        in: 'body',
        schema: {
          $adress: 'Av. Nossa Senhora de Copacabana, 315',
          $email: 'test@test.com.br',
          $categories: {
            $id: "133436743388217",
            $localized_display_name: "Artes e entretenimento",
            $not_a_biz: false,
          },
          $website: [
            "https://www.wppconnect.io",
            "https://www.teste2.com.br",
          ],
        }
       }
       
       #swagger.requestBody = {
        required: true,
        "@content": {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                adress: { type: "string" },
                email: { type: "string" },
                categories: { type: "object" },
                websites: { type: "array" },
              }
            },
            example: {
              adress: 'Av. Nossa Senhora de Copacabana, 315',
              email: 'test@test.com.br',
              categories: {
                $id: "133436743388217",
                $localized_display_name: "Artes e entretenimento",
                $not_a_biz: false,
              },
              website: [
                "https://www.wppconnect.io",
                "https://www.teste2.com.br",
              ],
            }
          }
        }
       }
     */
    try {
        res.status(200).json(await req.client.editBusinessProfile(req.body));
    }
    catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Error on edit business profile',
            error: error,
        });
    }
}
