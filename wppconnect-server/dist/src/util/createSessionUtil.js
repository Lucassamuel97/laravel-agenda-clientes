"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/*
 * Copyright 2021 WPPConnect Team
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
const wppconnect_1 = require("@wppconnect-team/wppconnect");
const sessionController_1 = require("../controller/sessionController");
const chatWootClient_1 = __importDefault(require("./chatWootClient"));
const functions_1 = require("./functions");
const sessionUtil_1 = require("./sessionUtil");
const factory_1 = __importDefault(require("./tokenStore/factory"));
class CreateSessionUtil {
    startChatWootClient(client) {
        if (client.config.chatWoot && !client._chatWootClient)
            client._chatWootClient = new chatWootClient_1.default(client.config.chatWoot, client.session);
        return client._chatWootClient;
    }
    async createSessionUtil(req, clientsArray, session, res) {
        try {
            let client = this.getClient(session);
            if (client.status != null && client.status !== 'CLOSED')
                return;
            client.status = 'INITIALIZING';
            client.config = req.body;
            const tokenStore = new factory_1.default();
            const myTokenStore = tokenStore.createTokenStory(client);
            const tokenData = await myTokenStore.getToken(session);
            // we need this to update phone in config every time session starts, so we can ask for code for it again.
            myTokenStore.setToken(session, tokenData ?? {});
            this.startChatWootClient(client);
            if (req.serverOptions.customUserDataDir) {
                req.serverOptions.createOptions.puppeteerOptions = {
                    userDataDir: req.serverOptions.customUserDataDir + session,
                };
            }
            const wppClient = await (0, wppconnect_1.create)(Object.assign({}, { tokenStore: myTokenStore }, req.serverOptions.createOptions, {
                session: session,
                phoneNumber: client.config.phone ?? null,
                deviceName: client.config.phone == undefined // bug when using phone code this shouldn't be passed (https://github.com/wppconnect-team/wppconnect-server/issues/1687#issuecomment-2099357874)
                    ? client.config?.deviceName ||
                        req.serverOptions.deviceName ||
                        'WppConnect'
                    : undefined,
                poweredBy: client.config.phone == undefined // bug when using phone code this shouldn't be passed (https://github.com/wppconnect-team/wppconnect-server/issues/1687#issuecomment-2099357874)
                    ? client.config?.poweredBy ||
                        req.serverOptions.poweredBy ||
                        'WPPConnect-Server'
                    : undefined,
                catchLinkCode: (code) => {
                    this.exportPhoneCode(req, client.config.phone, code, client, res);
                },
                catchQR: (base64Qr, asciiQR, attempt, urlCode) => {
                    this.exportQR(req, base64Qr, urlCode, client, res);
                },
                onLoadingScreen: (percent, message) => {
                    req.logger.info(`[${session}] ${percent}% - ${message}`);
                },
                statusFind: (statusFind) => {
                    try {
                        sessionUtil_1.eventEmitter.emit(`status-${client.session}`, client, statusFind);
                        if (statusFind === 'autocloseCalled' ||
                            statusFind === 'desconnectedMobile') {
                            client.status = 'CLOSED';
                            client.qrcode = null;
                            client.close();
                            clientsArray[session] = undefined;
                        }
                        (0, functions_1.callWebHook)(client, req, 'status-find', {
                            status: statusFind,
                            session: client.session,
                        });
                        req.logger.info(statusFind + '\n\n');
                    }
                    catch (error) { }
                },
            }));
            client = clientsArray[session] = Object.assign(wppClient, client);
            await this.start(req, client);
            if (req.serverOptions.webhook.onParticipantsChanged) {
                await this.onParticipantsChanged(req, client);
            }
            if (req.serverOptions.webhook.onReactionMessage) {
                await this.onReactionMessage(client, req);
            }
            if (req.serverOptions.webhook.onRevokedMessage) {
                await this.onRevokedMessage(client, req);
            }
            if (req.serverOptions.webhook.onPollResponse) {
                await this.onPollResponse(client, req);
            }
            if (req.serverOptions.webhook.onLabelUpdated) {
                await this.onLabelUpdated(client, req);
            }
        }
        catch (e) {
            req.logger.error(e);
            if (e instanceof Error && e.name == 'TimeoutError') {
                const client = this.getClient(session);
                client.status = 'CLOSED';
            }
        }
    }
    async opendata(req, session, res) {
        await this.createSessionUtil(req, sessionUtil_1.clientsArray, session, res);
    }
    exportPhoneCode(req, phone, phoneCode, client, res) {
        sessionUtil_1.eventEmitter.emit(`phoneCode-${client.session}`, phoneCode, client);
        Object.assign(client, {
            status: 'PHONECODE',
            phoneCode: phoneCode,
            phone: phone,
        });
        req.io.emit('phoneCode', {
            data: phoneCode,
            phone: phone,
            session: client.session,
        });
        (0, functions_1.callWebHook)(client, req, 'phoneCode', {
            phoneCode: phoneCode,
            phone: phone,
            session: client.session,
        });
        if (res && !res._headerSent)
            res.status(200).json({
                status: 'phoneCode',
                phone: phone,
                phoneCode: phoneCode,
                session: client.session,
            });
    }
    exportQR(req, qrCode, urlCode, client, res) {
        sessionUtil_1.eventEmitter.emit(`qrcode-${client.session}`, qrCode, urlCode, client);
        Object.assign(client, {
            status: 'QRCODE',
            qrcode: qrCode,
            urlcode: urlCode,
        });
        qrCode = qrCode.replace('data:image/png;base64,', '');
        const imageBuffer = Buffer.from(qrCode, 'base64');
        req.io.emit('qrCode', {
            data: 'data:image/png;base64,' + imageBuffer.toString('base64'),
            session: client.session,
        });
        (0, functions_1.callWebHook)(client, req, 'qrcode', {
            qrcode: qrCode,
            urlcode: urlCode,
            session: client.session,
        });
        if (res && !res._headerSent)
            res.status(200).json({
                status: 'qrcode',
                qrcode: qrCode,
                urlcode: urlCode,
                session: client.session,
            });
    }
    async onParticipantsChanged(req, client) {
        await client.isConnected();
        await client.onParticipantsChanged((message) => {
            (0, functions_1.callWebHook)(client, req, 'onparticipantschanged', message);
        });
    }
    async start(req, client) {
        try {
            await client.isConnected();
            Object.assign(client, { status: 'CONNECTED', qrcode: null });
            req.logger.info(`Started Session: ${client.session}`);
            //callWebHook(client, req, 'session-logged', { status: 'CONNECTED'});
            req.io.emit('session-logged', { status: true, session: client.session });
            (0, functions_1.startHelper)(client, req);
        }
        catch (error) {
            req.logger.error(error);
            req.io.emit('session-error', client.session);
        }
        await this.checkStateSession(client, req);
        await this.listenMessages(client, req);
        if (req.serverOptions.webhook.listenAcks) {
            await this.listenAcks(client, req);
        }
        if (req.serverOptions.webhook.onPresenceChanged) {
            await this.onPresenceChanged(client, req);
        }
    }
    async checkStateSession(client, req) {
        await client.onStateChange((state) => {
            req.logger.info(`State Change ${state}: ${client.session}`);
            const conflits = [wppconnect_1.SocketState.CONFLICT];
            if (conflits.includes(state)) {
                client.useHere();
            }
        });
    }
    async listenMessages(client, req) {
        await client.onMessage(async (message) => {
            sessionUtil_1.eventEmitter.emit(`mensagem-${client.session}`, client, message);
            (0, functions_1.callWebHook)(client, req, 'onmessage', message);
            if (message.type === 'location')
                client.onLiveLocation(message.sender.id, (location) => {
                    (0, functions_1.callWebHook)(client, req, 'location', location);
                });
        });
        await client.onAnyMessage(async (message) => {
            message.session = client.session;
            if (message.type === 'sticker') {
                (0, sessionController_1.download)(message, client, req.logger);
            }
            if (req.serverOptions?.websocket?.autoDownload ||
                (req.serverOptions?.webhook?.autoDownload && message.fromMe == false)) {
                await (0, functions_1.autoDownload)(client, req, message);
            }
            req.io.emit('received-message', { response: message });
            if (req.serverOptions.webhook.onSelfMessage && message.fromMe)
                (0, functions_1.callWebHook)(client, req, 'onselfmessage', message);
        });
        await client.onIncomingCall(async (call) => {
            req.io.emit('incomingcall', call);
            (0, functions_1.callWebHook)(client, req, 'incomingcall', call);
        });
    }
    async listenAcks(client, req) {
        await client.onAck(async (ack) => {
            req.io.emit('onack', ack);
            (0, functions_1.callWebHook)(client, req, 'onack', ack);
        });
    }
    async onPresenceChanged(client, req) {
        await client.onPresenceChanged(async (presenceChangedEvent) => {
            req.io.emit('onpresencechanged', presenceChangedEvent);
            (0, functions_1.callWebHook)(client, req, 'onpresencechanged', presenceChangedEvent);
        });
    }
    async onReactionMessage(client, req) {
        await client.isConnected();
        await client.onReactionMessage(async (reaction) => {
            req.io.emit('onreactionmessage', reaction);
            (0, functions_1.callWebHook)(client, req, 'onreactionmessage', reaction);
        });
    }
    async onRevokedMessage(client, req) {
        await client.isConnected();
        await client.onRevokedMessage(async (response) => {
            req.io.emit('onrevokedmessage', response);
            (0, functions_1.callWebHook)(client, req, 'onrevokedmessage', response);
        });
    }
    async onPollResponse(client, req) {
        await client.isConnected();
        await client.onPollResponse(async (response) => {
            req.io.emit('onpollresponse', response);
            (0, functions_1.callWebHook)(client, req, 'onpollresponse', response);
        });
    }
    async onLabelUpdated(client, req) {
        await client.isConnected();
        await client.onUpdateLabel(async (response) => {
            req.io.emit('onupdatelabel', response);
            (0, functions_1.callWebHook)(client, req, 'onupdatelabel', response);
        });
    }
    encodeFunction(data, webhook) {
        data.webhook = webhook;
        return JSON.stringify(data);
    }
    decodeFunction(text, client) {
        const object = JSON.parse(text);
        if (object.webhook && !client.webhook)
            client.webhook = object.webhook;
        delete object.webhook;
        return object;
    }
    getClient(session) {
        let client = sessionUtil_1.clientsArray[session];
        if (!client)
            client = sessionUtil_1.clientsArray[session] = {
                status: null,
                session: session,
            };
        return client;
    }
}
exports.default = CreateSessionUtil;
