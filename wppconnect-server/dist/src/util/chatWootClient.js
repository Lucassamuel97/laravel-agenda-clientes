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
const axios_1 = __importDefault(require("axios"));
const form_data_1 = __importDefault(require("form-data"));
const mime_types_1 = __importDefault(require("mime-types"));
const bufferutils_1 = __importDefault(require("./bufferutils"));
// import bufferUtils from './bufferutils';
const sessionUtil_1 = require("./sessionUtil");
class chatWootClient {
    constructor(config, session) {
        this.config = config;
        this.mobile_name = this.config.mobile_name
            ? this.config.mobile_name
            : `WPPConnect`;
        this.mobile_number = this.config.mobile_number
            ? this.config.mobile_number
            : '5511999999999';
        this.sender = {
            pushname: this.mobile_name,
            id: this.mobile_number,
        };
        this.account_id = this.config.account_id;
        this.inbox_id = this.config.inbox_id;
        this.api = axios_1.default.create({
            baseURL: this.config.baseURL,
            headers: {
                'Content-Type': 'application/json;charset=utf-8',
                api_access_token: this.config.token,
            },
        });
        //assina o evento do qrcode
        sessionUtil_1.eventEmitter.on(`qrcode-${session}`, (qrCode, urlCode, client) => {
            setTimeout(async () => {
                if (config?.chatwoot?.sendQrCode !== false) {
                    this.sendMessage(client, {
                        sender: this.sender,
                        chatId: this.mobile_number + '@c.us',
                        type: 'image',
                        timestamp: 'qrcode',
                        mimetype: 'image/png',
                        caption: 'leia o qrCode',
                        qrCode: qrCode.replace('data:image/png;base64,', ''),
                    });
                }
            }, 1000);
        });
        //assiona o evento do status
        sessionUtil_1.eventEmitter.on(`status-${session}`, (client, status) => {
            if (config?.chatwoot?.sendStatus !== false) {
                this.sendMessage(client, {
                    sender: this.sender,
                    chatId: this.mobile_number + '@c.us',
                    body: `wppconnect status: ${status} `,
                });
            }
        });
        //assina o evento de mensagem
        sessionUtil_1.eventEmitter.on(`mensagem-${session}`, (client, message) => {
            this.sendMessage(client, message);
        });
    }
    // async sendMessage(client: any, message: any) {
    //   if (message.isGroupMsg || message.chatId.indexOf('@broadcast') > 0) return;
    //   const contact = await this.createContact(message);
    //   const conversation = await this.createConversation(
    //     contact,
    //     message.chatId.split('@')[0]
    //   );
    //   try {
    //     if (
    //       message.type == 'image' ||
    //       message.type == 'video' ||
    //       message.type == 'in' ||
    //       message.type == 'document' ||
    //       message.type == 'ptt' ||
    //       message.type == 'audio' ||
    //       message.type == 'sticker'
    //     ) {
    //       if (message.mimetype == 'image/webp') message.mimetype = 'image/jpeg';
    //       const extension = mime.extension(message.mimetype);
    //       const filename = `${message.timestamp}.${extension}`;
    //       let b64;
    //       if (message.qrCode) b64 = message.qrCode;
    //       else {
    //         const buffer = await client.decryptFile(message);
    //         b64 = await buffer.toString('base64');
    //       }
    //       const mediaData = Buffer.from(b64, 'base64');
    //       // Create a readable stream from the Buffer
    //       const stream = new Readable();
    //       stream.push(mediaData);
    //       stream.push(null); // Signaling the end of the stream
    //       const data = new FormData();
    //       if (message.caption) {
    //         data.append('content', message.caption);
    //       }
    //       data.append('attachments[]', stream, {
    //         filename: filename,
    //         contentType: message.mimetype,
    //       });
    //       data.append('message_type', 'incoming');
    //       data.append('private', 'false');
    //       const configPost = Object.assign(
    //         {},
    //         {
    //           baseURL: this.config.baseURL,
    //           headers: {
    //             'Content-Type': 'application/json;charset=utf-8',
    //             api_access_token: this.config.token,
    //           },
    //         }
    //       );
    //       configPost.headers = { ...configPost.headers, ...data.getHeaders() };
    //       console.log('PRÉ-REQUEST');
    //       const result = await axios.post(
    //         `api/v1/accounts/${this.account_id}/conversations/${conversation.id}/messages`,
    //         data,
    //         configPost
    //       );
    //       console.log('POS-REQUEST');
    //       return result;
    //     } else {
    //       const body = {
    //         content: message.body,
    //         message_type: 'incoming',
    //       };
    //       const { data } = await this.api.post(
    //         `api/v1/accounts/${this.account_id}/conversations/${conversation.id}/messages`,
    //         body
    //       );
    //       return data;
    //     }
    //   } catch (e) {
    //     return null;
    //   }
    // }
    async sendMessage(client, message) {
        if (message.isGroupMsg || message.chatId.indexOf('@broadcast') > 0)
            return;
        const contact = await this.createContact(message);
        const conversation = await this.createConversation(contact, message.chatId.split('@')[0]);
        try {
            if ([
                'image',
                'video',
                'in',
                'document',
                'ptt',
                'audio',
                'sticker',
            ].includes(message.type)) {
                if (message.mimetype === 'image/webp')
                    message.mimetype = 'image/jpeg';
                const extension = mime_types_1.default.extension(message.mimetype);
                const filename = `${message.timestamp}.${extension}`;
                let b64;
                if (message.qrCode) {
                    b64 = message.qrCode;
                }
                else {
                    const buffer = await client.decryptFile(message);
                    b64 = buffer.toString('base64');
                }
                const mediaData = Buffer.from(b64, 'base64');
                const stream = bufferutils_1.default.bufferToReadableStream(mediaData);
                const data = new form_data_1.default();
                if (message.caption) {
                    data.append('content', message.caption);
                }
                data.append('attachments[]', stream, {
                    filename: filename,
                    contentType: message.mimetype,
                });
                data.append('message_type', 'incoming');
                data.append('private', 'false');
                const configPost = {
                    baseURL: this.config.baseURL,
                    headers: {
                        api_access_token: this.config.token,
                        ...data.getHeaders(),
                    },
                };
                const endpoint = `api/v1/accounts/${this.account_id}/conversations/${conversation.id}/messages`;
                const result = await axios_1.default.post(endpoint, data, configPost);
                return result;
            }
            else {
                const body = {
                    content: message.body,
                    message_type: 'incoming',
                };
                const endpoint = `api/v1/accounts/${this.account_id}/conversations/${conversation.id}/messages`;
                const { data } = await this.api.post(endpoint, body);
                return data;
            }
        }
        catch (e) {
            console.error('Error sending message:', e);
            return null;
        }
    }
    async findContact(query) {
        try {
            const { data } = await this.api.get(`api/v1/accounts/${this.account_id}/contacts/search/?q=${query}`);
            return data;
        }
        catch (e) {
            console.log(e);
            return null;
        }
    }
    async createContact(message) {
        const body = {
            inbox_id: this.inbox_id,
            name: message.sender.isMyContact
                ? message.sender.formattedName
                : message.sender.pushname || message.sender.formattedName,
            phone_number: typeof message.sender.id == 'object'
                ? message.sender.id.user
                : message.sender.id.split('@')[0],
        };
        body.phone_number = `+${body.phone_number}`;
        const contact = await this.findContact(body.phone_number.replace('+', ''));
        if (contact && contact.meta.count > 0)
            return contact.payload[0];
        try {
            const data = await this.api.post(`api/v1/accounts/${this.account_id}/contacts`, body);
            return data.data.payload.contact;
        }
        catch (e) {
            console.log(e);
            return null;
        }
    }
    async findConversation(contact) {
        try {
            const { data } = await this.api.get(`api/v1/accounts/${this.account_id}/contacts/${contact.id}/conversations`);
            return data.payload.find((e) => e.inbox_id == this.inbox_id && e.status != 'resolved');
        }
        catch (e) {
            console.log(e);
            return null;
        }
    }
    async createConversation(contact, source_id) {
        const conversation = await this.findConversation(contact);
        if (conversation)
            return conversation;
        const body = {
            source_id: source_id,
            inbox_id: this.inbox_id,
            contact_id: contact.id,
            status: 'open',
        };
        try {
            const { data } = await this.api.post(`api/v1/accounts/${this.account_id}/conversations`, body);
            return data;
        }
        catch (e) {
            console.log(e);
            return null;
        }
    }
}
exports.default = chatWootClient;
