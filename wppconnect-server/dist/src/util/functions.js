"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.unlinkAsync = void 0;
exports.contactToArray = contactToArray;
exports.groupToArray = groupToArray;
exports.groupNameToArray = groupNameToArray;
exports.callWebHook = callWebHook;
exports.autoDownload = autoDownload;
exports.startAllSessions = startAllSessions;
exports.startHelper = startHelper;
exports.createFolders = createFolders;
exports.strToBool = strToBool;
exports.getIPAddress = getIPAddress;
exports.setMaxListners = setMaxListners;
exports.createCatalogLink = createCatalogLink;
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
const client_s3_1 = require("@aws-sdk/client-s3");
const axios_1 = __importDefault(require("axios"));
const crypto_1 = __importDefault(require("crypto"));
const fs_1 = __importDefault(require("fs"));
const mime_types_1 = __importDefault(require("mime-types"));
const os_1 = __importDefault(require("os"));
const path_1 = __importDefault(require("path"));
const util_1 = require("util");
const config_1 = __importDefault(require("../config"));
const index_1 = require("../mapper/index");
const bucketAlreadyExists_1 = require("./bucketAlreadyExists");
let mime, crypto; //, aws: any;
if (config_1.default.webhook.uploadS3) {
    mime = config_1.default.webhook.uploadS3 ? mime_types_1.default : null;
    crypto = config_1.default.webhook.uploadS3 ? crypto_1.default : null;
}
if (config_1.default?.websocket?.uploadS3) {
    mime = config_1.default.websocket.uploadS3 ? mime_types_1.default : null;
    crypto = config_1.default.websocket.uploadS3 ? crypto_1.default : null;
}
function contactToArray(number, isGroup, isNewsletter, isLid) {
    const localArr = [];
    if (Array.isArray(number)) {
        for (let contact of number) {
            isGroup || isNewsletter
                ? (contact = contact.split('@')[0])
                : (contact = contact.split('@')[0]?.replace(/[^\w ]/g, ''));
            if (contact !== '')
                if (isGroup)
                    localArr.push(`${contact}@g.us`);
                else if (isNewsletter)
                    localArr.push(`${contact}@newsletter`);
                else if (isLid || contact.length > 14)
                    localArr.push(`${contact}@lid`);
                else
                    localArr.push(`${contact}@c.us`);
        }
    }
    else {
        const arrContacts = number.split(/\s*[,;]\s*/g);
        for (let contact of arrContacts) {
            isGroup || isNewsletter
                ? (contact = contact.split('@')[0])
                : (contact = contact.split('@')[0]?.replace(/[^\w ]/g, ''));
            if (contact !== '')
                if (isGroup)
                    localArr.push(`${contact}@g.us`);
                else if (isNewsletter)
                    localArr.push(`${contact}@newsletter`);
                else if (isLid || contact.length > 14)
                    localArr.push(`${contact}@lid`);
                else
                    localArr.push(`${contact}@c.us`);
        }
    }
    return localArr;
}
function groupToArray(group) {
    const localArr = [];
    if (Array.isArray(group)) {
        for (let contact of group) {
            contact = contact.split('@')[0];
            if (contact !== '')
                localArr.push(`${contact}@g.us`);
        }
    }
    else {
        const arrContacts = group.split(/\s*[,;]\s*/g);
        for (let contact of arrContacts) {
            contact = contact.split('@')[0];
            if (contact !== '')
                localArr.push(`${contact}@g.us`);
        }
    }
    return localArr;
}
function groupNameToArray(group) {
    const localArr = [];
    if (Array.isArray(group)) {
        for (const contact of group) {
            if (contact !== '')
                localArr.push(`${contact}`);
        }
    }
    else {
        const arrContacts = group.split(/\s*[,;]\s*/g);
        for (const contact of arrContacts) {
            if (contact !== '')
                localArr.push(`${contact}`);
        }
    }
    return localArr;
}
async function callWebHook(client, req, event, data) {
    const webhook = client?.config.webhook || req.serverOptions.webhook.url || false;
    if (webhook) {
        if (req.serverOptions.webhook?.ignore &&
            (req.serverOptions.webhook.ignore.includes(event) ||
                req.serverOptions.webhook.ignore.includes(data?.from) ||
                req.serverOptions.webhook.ignore.includes(data?.type)))
            return;
        if (req.serverOptions.webhook.autoDownload)
            await autoDownload(client, req, data);
        try {
            const chatId = data.from ||
                data.chatId ||
                (data.chatId ? data.chatId._serialized : null);
            data = Object.assign({ event: event, session: client.session }, data);
            if (req.serverOptions.mapper.enable)
                data = await (0, index_1.convert)(req.serverOptions.mapper.prefix, data);
            axios_1.default
                .post(webhook, data)
                .then(() => {
                try {
                    const events = ['unreadmessages', 'onmessage'];
                    if (events.includes(event) && req.serverOptions.webhook.readMessage)
                        client.sendSeen(chatId);
                }
                catch (e) { }
            })
                .catch((e) => {
                req.logger.warn('Error calling Webhook.', e);
            });
        }
        catch (e) {
            req.logger.error(e);
        }
    }
}
async function autoDownload(client, req, message) {
    try {
        if (message && (message['mimetype'] || message.isMedia || message.isMMS)) {
            const buffer = await client.decryptFile(message);
            if (req.serverOptions.webhook.uploadS3 ||
                req.serverOptions?.websocket?.uploadS3) {
                const hashName = crypto.randomBytes(24).toString('hex');
                if (!config_1.default?.aws_s3?.region ||
                    !config_1.default?.aws_s3?.access_key_id ||
                    !config_1.default?.aws_s3?.secret_key)
                    throw new Error('Please, configure your aws configs');
                const s3Client = new client_s3_1.S3Client({
                    region: config_1.default?.aws_s3?.region,
                    endpoint: config_1.default?.aws_s3?.endpoint || undefined,
                    forcePathStyle: config_1.default?.aws_s3?.forcePathStyle || undefined,
                });
                let bucketName = config_1.default?.aws_s3?.defaultBucketName
                    ? config_1.default?.aws_s3?.defaultBucketName
                    : client.session;
                bucketName = bucketName
                    .normalize('NFD')
                    .replace(/[\u0300-\u036f]|[— _.,?!]/g, '')
                    .toLowerCase();
                bucketName =
                    bucketName.length < 3
                        ? bucketName +
                            `${Math.floor(Math.random() * (999 - 100 + 1)) + 100}`
                        : bucketName;
                const fileName = `${config_1.default.aws_s3.defaultBucketName ? client.session + '/' : ''}${hashName}.${mime.extension(message.mimetype)}`;
                if (!config_1.default.aws_s3.defaultBucketName &&
                    !(await (0, bucketAlreadyExists_1.bucketAlreadyExists)(bucketName))) {
                    await s3Client.send(new client_s3_1.CreateBucketCommand({
                        Bucket: bucketName,
                        ObjectOwnership: 'ObjectWriter',
                    }));
                    await s3Client.send(new client_s3_1.PutPublicAccessBlockCommand({
                        Bucket: bucketName,
                        PublicAccessBlockConfiguration: {
                            BlockPublicAcls: false,
                            IgnorePublicAcls: false,
                            BlockPublicPolicy: false,
                        },
                    }));
                }
                await s3Client.send(new client_s3_1.PutObjectCommand({
                    Bucket: bucketName,
                    Key: fileName,
                    Body: buffer,
                    ContentType: message.mimetype,
                    ACL: 'public-read',
                }));
                message.fileUrl = `https://${bucketName}.s3.amazonaws.com/${fileName}`;
            }
            else {
                message.body = await buffer.toString('base64');
            }
        }
    }
    catch (e) {
        req.logger.error(e);
    }
}
async function startAllSessions(config, logger) {
    try {
        await axios_1.default.post(`${config.host}:${config.port}/api/${config.secretKey}/start-all`);
    }
    catch (e) {
        logger.error(e);
    }
}
async function startHelper(client, req) {
    if (req.serverOptions.webhook.allUnreadOnStart)
        await sendUnread(client, req);
    if (req.serverOptions.archive.enable)
        await archive(client, req);
}
async function sendUnread(client, req) {
    req.logger.info(`${client.session} : Inicio enviar mensagens não lidas`);
    try {
        const chats = await client.getAllChatsWithMessages(true);
        if (chats && chats.length > 0) {
            for (let i = 0; i < chats.length; i++)
                for (let j = 0; j < chats[i].msgs.length; j++) {
                    callWebHook(client, req, 'unreadmessages', chats[i].msgs[j]);
                }
        }
        req.logger.info(`${client.session} : Fim enviar mensagens não lidas`);
    }
    catch (ex) {
        req.logger.error(ex);
    }
}
async function archive(client, req) {
    async function sleep(time) {
        return new Promise((resolve) => setTimeout(resolve, time * 10));
    }
    req.logger.info(`${client.session} : Inicio arquivando chats`);
    try {
        let chats = await client.getAllChats();
        if (chats && Array.isArray(chats) && chats.length > 0) {
            chats = chats.filter((c) => !c.archive);
        }
        if (chats && Array.isArray(chats) && chats.length > 0) {
            for (let i = 0; i < chats.length; i++) {
                const date = new Date(chats[i].t * 1000);
                if (DaysBetween(date) > req.serverOptions.archive.daysToArchive) {
                    await client.archiveChat(chats[i].id.id || chats[i].id._serialized, true);
                    await sleep(Math.floor(Math.random() * req.serverOptions.archive.waitTime + 1));
                }
            }
        }
        req.logger.info(`${client.session} : Fim arquivando chats`);
    }
    catch (ex) {
        req.logger.error(ex);
    }
}
function DaysBetween(StartDate) {
    const endDate = new Date();
    // The number of milliseconds in all UTC days (no DST)
    const oneDay = 1000 * 60 * 60 * 24;
    // A day in UTC always lasts 24 hours (unlike in other time formats)
    const start = Date.UTC(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
    const end = Date.UTC(StartDate.getFullYear(), StartDate.getMonth(), StartDate.getDate());
    // so it's safe to divide by 24 hours
    return (start - end) / oneDay;
}
function createFolders() {
    const __dirname = path_1.default.resolve(path_1.default.dirname(''));
    const dirFiles = path_1.default.resolve(__dirname, 'WhatsAppImages');
    if (!fs_1.default.existsSync(dirFiles)) {
        fs_1.default.mkdirSync(dirFiles);
    }
    const dirUpload = path_1.default.resolve(__dirname, 'uploads');
    if (!fs_1.default.existsSync(dirUpload)) {
        fs_1.default.mkdirSync(dirUpload);
    }
}
function strToBool(s) {
    return /^(true|1)$/i.test(s);
}
function getIPAddress() {
    const interfaces = os_1.default.networkInterfaces();
    for (const devName in interfaces) {
        const iface = interfaces[devName];
        for (let i = 0; i < iface.length; i++) {
            const alias = iface[i];
            if (alias.family === 'IPv4' &&
                alias.address !== '127.0.0.1' &&
                !alias.internal)
                return alias.address;
        }
    }
    return '0.0.0.0';
}
function setMaxListners(serverOptions) {
    if (serverOptions && Number.isInteger(serverOptions.maxListeners)) {
        process.setMaxListeners(serverOptions.maxListeners);
    }
}
exports.unlinkAsync = (0, util_1.promisify)(fs_1.default.unlink);
function createCatalogLink(session) {
    const [wid] = session.split('@');
    return `https://wa.me/c/${wid}`;
}
