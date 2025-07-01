"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setProfileName = setProfileName;
exports.showAllContacts = showAllContacts;
exports.getAllChats = getAllChats;
exports.listChats = listChats;
exports.getAllChatsWithMessages = getAllChatsWithMessages;
exports.getAllMessagesInChat = getAllMessagesInChat;
exports.getAllNewMessages = getAllNewMessages;
exports.getAllUnreadMessages = getAllUnreadMessages;
exports.getChatById = getChatById;
exports.getMessageById = getMessageById;
exports.getBatteryLevel = getBatteryLevel;
exports.getHostDevice = getHostDevice;
exports.getPhoneNumber = getPhoneNumber;
exports.getBlockList = getBlockList;
exports.deleteChat = deleteChat;
exports.deleteAllChats = deleteAllChats;
exports.clearChat = clearChat;
exports.clearAllChats = clearAllChats;
exports.archiveChat = archiveChat;
exports.archiveAllChats = archiveAllChats;
exports.getAllChatsArchiveds = getAllChatsArchiveds;
exports.deleteMessage = deleteMessage;
exports.reactMessage = reactMessage;
exports.reply = reply;
exports.forwardMessages = forwardMessages;
exports.markUnseenMessage = markUnseenMessage;
exports.blockContact = blockContact;
exports.unblockContact = unblockContact;
exports.pinChat = pinChat;
exports.setProfilePic = setProfilePic;
exports.getUnreadMessages = getUnreadMessages;
exports.getChatIsOnline = getChatIsOnline;
exports.getLastSeen = getLastSeen;
exports.getListMutes = getListMutes;
exports.loadAndGetAllMessagesInChat = loadAndGetAllMessagesInChat;
exports.getMessages = getMessages;
exports.sendContactVcard = sendContactVcard;
exports.sendMute = sendMute;
exports.sendSeen = sendSeen;
exports.setChatState = setChatState;
exports.setTemporaryMessages = setTemporaryMessages;
exports.setTyping = setTyping;
exports.setRecording = setRecording;
exports.checkNumberStatus = checkNumberStatus;
exports.getContact = getContact;
exports.getAllContacts = getAllContacts;
exports.getNumberProfile = getNumberProfile;
exports.getProfilePicFromServer = getProfilePicFromServer;
exports.getStatus = getStatus;
exports.setProfileStatus = setProfileStatus;
exports.rejectCall = rejectCall;
exports.starMessage = starMessage;
exports.getReactions = getReactions;
exports.getVotes = getVotes;
exports.chatWoot = chatWoot;
exports.getPlatformFromMessage = getPlatformFromMessage;
const functions_1 = require("../util/functions");
const sessionUtil_1 = require("../util/sessionUtil");
function returnSucess(res, session, phone, data) {
    res.status(201).json({
        status: 'Success',
        response: {
            message: 'Information retrieved successfully.',
            contact: phone,
            session: session,
            data: data,
        },
    });
}
function returnError(req, res, session, error) {
    req.logger.error(error);
    res.status(400).json({
        status: 'Error',
        response: {
            message: 'Error retrieving information',
            session: session,
            log: error,
        },
    });
}
async function setProfileName(req, res) {
    /**
     * #swagger.tags = ["Profile"]
       #swagger.autoBody=false
       #swagger.security = [{
              "bearerAuth": []
       }]
       #swagger.parameters["session"] = {
        schema: 'NERDWHATS_AMERICA'
       }
       #swagger.requestBody = {
        required: false,
        "@content": {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                name: { type: "string" },
              }
            },
            examples: {
              "Default": {
                value: {
                  name: "My new name",
                }
              },
            }
          }
        }
       }
     */
    const { name } = req.body;
    if (!name)
        res
            .status(400)
            .json({ status: 'error', message: 'Parameter name is required!' });
    try {
        const result = await req.client.setProfileName(name);
        res.status(200).json({ status: 'success', response: result });
    }
    catch (error) {
        req.logger.error(error);
        res.status(500).json({
            status: 'error',
            message: 'Error on set profile name.',
            error: error,
        });
    }
}
async function showAllContacts(req, res) {
    /**
     * #swagger.tags = ["Contacts"]
       #swagger.autoBody=false
       #swagger.security = [{
              "bearerAuth": []
       }]
       #swagger.parameters["session"] = {
        schema: 'NERDWHATS_AMERICA'
       }
     */
    try {
        const contacts = await req.client.getAllContacts();
        res.status(200).json({ status: 'success', response: contacts });
    }
    catch (error) {
        req.logger.error(error);
        res.status(500).json({
            status: 'error',
            message: 'Error fetching contacts',
            error: error,
        });
    }
}
async function getAllChats(req, res) {
    /**
     * #swagger.tags = ["Chat"]
     * #swagger.summary = 'Deprecated in favor of 'list-chats'
     * #swagger.deprecated = true
       #swagger.autoBody=false
       #swagger.security = [{
              "bearerAuth": []
       }]
       #swagger.parameters["session"] = {
        schema: 'NERDWHATS_AMERICA'
       }
     */
    try {
        const response = await req.client.getAllChats();
        res
            .status(200)
            .json({ status: 'success', response: response, mapper: 'chat' });
    }
    catch (e) {
        req.logger.error(e);
        res
            .status(500)
            .json({ status: 'error', message: 'Error on get all chats' });
    }
}
async function listChats(req, res) {
    /**
     * #swagger.tags = ["Chat"]
     * #swagger.summary = 'Retrieve a list of chats'
     * #swagger.description = 'This body is not required. Not sent body to get all chats or filter.'
       #swagger.security = [{
              "bearerAuth": []
       }]
       #swagger.parameters["session"] = {
        schema: 'NERDWHATS_AMERICA'
       }
       #swagger.requestBody = {
        required: false,
        "@content": {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                id: { type: "string" },
                count: { type: "number" },
                direction: { type: "string" },
                onlyGroups: { type: "boolean" },
                onlyUsers: { type: "boolean" },
                onlyWithUnreadMessage: { type: "boolean" },
                withLabels: { type: "array" },
              }
            },
            examples: {
              "All options - Edit this": {
                value: {
                  id: "<chatId>",
                  count: 20,
                  direction: "after",
                  onlyGroups: false,
                  onlyUsers: false,
                  onlyWithUnreadMessage: false,
                  withLabels: []
                }
              },
              "All chats": {
                value: {
                }
              },
              "Chats group": {
                value: {
                  onlyGroups: true,
                }
              },
              "Only with unread messages": {
                value: {
                  onlyWithUnreadMessage: false,
                }
              },
              "Paginated results": {
                value: {
                  id: "<chatId>",
                  count: 20,
                  direction: "after",
                }
              },
            }
          }
        }
       }
     */
    try {
        const { id, count, direction, onlyGroups, onlyUsers, onlyWithUnreadMessage, withLabels, } = req.body;
        const response = await req.client.listChats({
            id: id,
            count: count,
            direction: direction,
            onlyGroups: onlyGroups,
            onlyUsers: onlyUsers,
            onlyWithUnreadMessage: onlyWithUnreadMessage,
            withLabels: withLabels,
        });
        res.status(200).json(response);
    }
    catch (e) {
        req.logger.error(e);
        res
            .status(500)
            .json({ status: 'error', message: 'Error on get all chats' });
    }
}
async function getAllChatsWithMessages(req, res) {
    /**
     * #swagger.tags = ["Chat"]
     * #swagger.summary = 'Deprecated in favor of list-chats'
     * #swagger.deprecated = true
       #swagger.autoBody=false
       #swagger.security = [{
              "bearerAuth": []
       }]
       #swagger.parameters["session"] = {
        schema: 'NERDWHATS_AMERICA'
       }
     */
    try {
        const response = await req.client.listChats();
        res.status(200).json({ status: 'success', response: response });
    }
    catch (e) {
        req.logger.error(e);
        res.status(500).json({
            status: 'error',
            message: 'Error on get all chats whit messages',
            error: e,
        });
    }
}
/**
 * Depreciado em favor de getMessages
 */
async function getAllMessagesInChat(req, res) {
    /**
     * #swagger.tags = ["Chat"]
       #swagger.autoBody=false
       #swagger.security = [{
              "bearerAuth": []
       }]
       #swagger.parameters["session"] = {
        schema: 'NERDWHATS_AMERICA'
       }
       #swagger.parameters["phone"] = {
        schema: '5521999999999'
       }
       #swagger.parameters["isGroup"] = {
        schema: 'false'
       }
       #swagger.parameters["includeMe"] = {
        schema: 'true'
       }
       #swagger.parameters["includeNotifications"] = {
        schema: 'true'
       }
     */
    try {
        const { phone } = req.params;
        const { isGroup = false, includeMe = true, includeNotifications = true, } = req.query;
        let response;
        for (const contato of (0, functions_1.contactToArray)(phone, isGroup)) {
            response = await req.client.getAllMessagesInChat(contato, includeMe, includeNotifications);
        }
        res.status(200).json({ status: 'success', response: response });
    }
    catch (e) {
        req.logger.error(e);
        res.status(500).json({
            status: 'error',
            message: 'Error on get all messages in chat',
            error: e,
        });
    }
}
async function getAllNewMessages(req, res) {
    /**
     * #swagger.tags = ["Chat"]
       #swagger.autoBody=false
       #swagger.security = [{
              "bearerAuth": []
       }]
       #swagger.parameters["session"] = {
        schema: 'NERDWHATS_AMERICA'
       }
     */
    try {
        const response = await req.client.getAllNewMessages();
        res.status(200).json({ status: 'success', response: response });
    }
    catch (e) {
        req.logger.error(e);
        res.status(500).json({
            status: 'error',
            message: 'Error on get all messages in chat',
            error: e,
        });
    }
}
async function getAllUnreadMessages(req, res) {
    /**
     * #swagger.tags = ["Chat"]
       #swagger.autoBody=false
       #swagger.security = [{
              "bearerAuth": []
       }]
       #swagger.parameters["session"] = {
        schema: 'NERDWHATS_AMERICA'
       }
     */
    try {
        const response = await req.client.getAllUnreadMessages();
        res.status(200).json({ status: 'success', response: response });
    }
    catch (e) {
        req.logger.error(e);
        res.status(500).json({
            status: 'error',
            message: 'Error on get all messages in chat',
            error: e,
        });
    }
}
async function getChatById(req, res) {
    /**
     * #swagger.tags = ["Chat"]
       #swagger.autoBody=false
       #swagger.security = [{
              "bearerAuth": []
       }]
       #swagger.parameters["session"] = {
        schema: 'NERDWHATS_AMERICA'
       }
       #swagger.parameters["phone"] = {
        schema: '5521999999999'
       }
       #swagger.parameters["isGroup"] = {
        schema: 'false'
       }
     */
    const { phone } = req.params;
    const { isGroup } = req.query;
    try {
        let result = {};
        if (isGroup) {
            result = await req.client.getChatById(`${phone}@g.us`);
        }
        else {
            result = await req.client.getChatById(`${phone}@c.us`);
        }
        res.status(200).json(result);
    }
    catch (e) {
        req.logger.error(e);
        res.status(500).json({
            status: 'error',
            message: 'Error changing chat by Id',
            error: e,
        });
    }
}
async function getMessageById(req, res) {
    /**
     * #swagger.tags = ["Chat"]
       #swagger.autoBody=false
       #swagger.security = [{
              "bearerAuth": []
       }]
       #swagger.parameters["session"] = {
        schema: 'NERDWHATS_AMERICA'
       }
       #swagger.parameters["messageId"] = {
        required: true,
        schema: '<message_id>'
       }
     */
    const session = req.session;
    const { messageId } = req.params;
    try {
        const result = await req.client.getMessageById(messageId);
        returnSucess(res, session, result.chatId.user, result);
    }
    catch (error) {
        returnError(req, res, session, error);
    }
}
async function getBatteryLevel(req, res) {
    /**
     * #swagger.tags = ["Misc"]
       #swagger.autoBody=false
       #swagger.security = [{
              "bearerAuth": []
       }]
       #swagger.parameters["session"] = {
        schema: 'NERDWHATS_AMERICA'
       }
     */
    try {
        const response = await req.client.getBatteryLevel();
        res.status(200).json({ status: 'Success', response: response });
    }
    catch (e) {
        req.logger.error(e);
        res.status(500).json({
            status: 'error',
            message: 'Error retrieving battery status',
            error: e,
        });
    }
}
async function getHostDevice(req, res) {
    /**
     * #swagger.tags = ["Misc"]
       #swagger.autoBody=false
       #swagger.security = [{
              "bearerAuth": []
       }]
       #swagger.parameters["session"] = {
        schema: 'NERDWHATS_AMERICA'
       }
     */
    try {
        const response = await req.client.getHostDevice();
        const phoneNumber = await req.client.getWid();
        res.status(200).json({
            status: 'success',
            response: { ...response, phoneNumber },
            mapper: 'device',
        });
    }
    catch (e) {
        req.logger.error(e);
        res.status(500).json({
            status: 'error',
            message: 'Erro ao recuperar dados do telefone',
            error: e,
        });
    }
}
async function getPhoneNumber(req, res) {
    /**
     * #swagger.tags = ["Misc"]
       #swagger.autoBody=false
       #swagger.security = [{
              "bearerAuth": []
       }]
       #swagger.parameters["session"] = {
        schema: 'NERDWHATS_AMERICA'
       }
     */
    try {
        const phoneNumber = await req.client.getWid();
        res
            .status(200)
            .json({ status: 'success', response: phoneNumber, mapper: 'device' });
    }
    catch (e) {
        req.logger.error(e);
        res.status(500).json({
            status: 'error',
            message: 'Error retrieving phone number',
            error: e,
        });
    }
}
async function getBlockList(req, res) {
    /**
     * #swagger.tags = ["Misc"]
       #swagger.autoBody=false
       #swagger.security = [{
              "bearerAuth": []
       }]
       #swagger.parameters["session"] = {
        schema: 'NERDWHATS_AMERICA'
       }
     */
    const response = await req.client.getBlockList();
    try {
        const blocked = response.map((contato) => {
            return { phone: contato ? contato.split('@')[0] : '' };
        });
        res.status(200).json({ status: 'success', response: blocked });
    }
    catch (e) {
        req.logger.error(e);
        res.status(500).json({
            status: 'error',
            message: 'Error retrieving blocked contact list',
            error: e,
        });
    }
}
async function deleteChat(req, res) {
    /**
     * #swagger.tags = ["Chat"]
       #swagger.autoBody=false
       #swagger.security = [{
              "bearerAuth": []
       }]
       #swagger.parameters["session"] = {
        schema: 'NERDWHATS_AMERICA'
       }
       #swagger.requestBody = {
        required: false,
        "@content": {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                phone: { type: "string" },
                isGroup: { type: "boolean" },
              }
            },
            examples: {
              "Default": {
                value: {
                  phone: "5521999999999",
                  isGroup: false,
                }
              },
            }
          }
        }
       }
     */
    const { phone } = req.body;
    const session = req.session;
    try {
        const results = {};
        for (const contato of phone) {
            results[contato] = await req.client.deleteChat(contato);
        }
        returnSucess(res, session, phone, results);
    }
    catch (error) {
        returnError(req, res, session, error);
    }
}
async function deleteAllChats(req, res) {
    /**
     * #swagger.tags = ["Chat"]
       #swagger.autoBody=false
       #swagger.security = [{
              "bearerAuth": []
       }]
       #swagger.parameters["session"] = {
        schema: 'NERDWHATS_AMERICA'
       }
     */
    try {
        const chats = await req.client.getAllChats();
        for (const chat of chats) {
            await req.client.deleteChat(chat.chatId);
        }
        res.status(200).json({ status: 'success' });
    }
    catch (error) {
        req.logger.error(error);
        res.status(500).json({
            status: 'error',
            message: 'Error on delete all chats',
            error: error,
        });
    }
}
async function clearChat(req, res) {
    /**
     * #swagger.tags = ["Chat"]
       #swagger.autoBody=false
       #swagger.security = [{
              "bearerAuth": []
       }]
       #swagger.parameters["session"] = {
        schema: 'NERDWHATS_AMERICA'
       }
       
       #swagger.requestBody = {
        required: false,
        "@content": {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                phone: { type: "string" },
                isGroup: { type: "boolean" },
              }
            },
            examples: {
              "Default": {
                value: {
                  phone: "5521999999999",
                  isGroup: false,
                }
              },
            }
          }
        }
       }
     */
    const { phone } = req.body;
    const session = req.session;
    try {
        const results = {};
        for (const contato of phone) {
            results[contato] = await req.client.clearChat(contato);
        }
        returnSucess(res, session, phone, results);
    }
    catch (error) {
        returnError(req, res, session, error);
    }
}
async function clearAllChats(req, res) {
    /**
     * #swagger.tags = ["Chat"]
       #swagger.autoBody=false
       #swagger.security = [{
              "bearerAuth": []
       }]
       #swagger.parameters["session"] = {
        schema: 'NERDWHATS_AMERICA'
       }
     */
    try {
        const chats = await req.client.getAllChats();
        for (const chat of chats) {
            await req.client.clearChat(`${chat.chatId}`);
        }
        res.status(201).json({ status: 'success' });
    }
    catch (e) {
        req.logger.error(e);
        res
            .status(500)
            .json({ status: 'error', message: 'Error on clear all chats', error: e });
    }
}
async function archiveChat(req, res) {
    /**
     * #swagger.tags = ["Chat"]
       #swagger.autoBody=false
       #swagger.security = [{
              "bearerAuth": []
       }]
       #swagger.parameters["session"] = {
        schema: 'NERDWHATS_AMERICA'
       }
       
       #swagger.requestBody = {
        required: false,
        "@content": {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                phone: { type: "string" },
                isGroup: { type: "boolean" },
                value: { type: "boolean" },
              }
            },
            examples: {
              "Default": {
                value: {
                  phone: "5521999999999",
                  isGroup: false,
                  value: true,
                }
              },
            }
          }
        }
       }
     */
    const { phone, value = true } = req.body;
    try {
        const response = await req.client.archiveChat(`${phone}`, value);
        res.status(201).json({ status: 'success', response: response });
    }
    catch (e) {
        req.logger.error(e);
        res
            .status(500)
            .json({ status: 'error', message: 'Error on archive chat', error: e });
    }
}
async function archiveAllChats(req, res) {
    /**
     * #swagger.tags = ["Chat"]
       #swagger.autoBody=false
       #swagger.security = [{
              "bearerAuth": []
       }]
       #swagger.parameters["session"] = {
        schema: 'NERDWHATS_AMERICA'
       }
     */
    try {
        const chats = await req.client.getAllChats();
        for (const chat of chats) {
            await req.client.archiveChat(`${chat.chatId}`, true);
        }
        res.status(201).json({ status: 'success' });
    }
    catch (e) {
        req.logger.error(e);
        res.status(500).json({
            status: 'error',
            message: 'Error on archive all chats',
            error: e,
        });
    }
}
async function getAllChatsArchiveds(req, res) {
    /**
     * #swagger.tags = ["Chat"]
     * #swagger.description = 'Retrieves all archived chats.'
       #swagger.autoBody=false
       #swagger.security = [{
              "bearerAuth": []
       }]
       #swagger.parameters["session"] = {
        schema: 'NERDWHATS_AMERICA'
       }
     */
    try {
        const chats = await req.client.getAllChats();
        const archived = [];
        for (const chat of chats) {
            if (chat.archive === true) {
                archived.push(chat);
            }
        }
        res.status(201).json(archived);
    }
    catch (e) {
        req.logger.error(e);
        res.status(500).json({
            status: 'error',
            message: 'Error on archive all chats',
            error: e,
        });
    }
}
async function deleteMessage(req, res) {
    /**
     * #swagger.tags = ["Messages"]
       #swagger.autoBody=false
       #swagger.security = [{
              "bearerAuth": []
       }]
       #swagger.parameters["session"] = {
        schema: 'NERDWHATS_AMERICA'
       }
       
       #swagger.requestBody = {
        required: false,
        "@content": {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                phone: { type: "string" },
                isGroup: { type: "boolean" },
                messageId: { type: "string" },
                onlyLocal: { type: "boolean" },
                deleteMediaInDevice: { type: "boolean" },
              }
            },
            examples: {
              "Delete message to all": {
                value: {
                  phone: "5521999999999",
                  isGroup: false,
                  messageId: "<messageId>",
                  deleteMediaInDevice: true,
                }
              },
              "Delete message only me": {
                value: {
                  phone: "5521999999999",
                  isGroup: false,
                  messageId: "<messageId>",
                }
              },
            }
          }
        }
       }
     */
    const { phone, messageId, deleteMediaInDevice, onlyLocal } = req.body;
    try {
        const result = await req.client.deleteMessage(`${phone}`, messageId, onlyLocal, deleteMediaInDevice);
        if (result) {
            res
                .status(200)
                .json({ status: 'success', response: { message: 'Message deleted' } });
        }
        res.status(401).json({
            status: 'error',
            response: { message: 'Error unknown on delete message' },
        });
    }
    catch (e) {
        req.logger.error(e);
        res
            .status(500)
            .json({ status: 'error', message: 'Error on delete message', error: e });
    }
}
async function reactMessage(req, res) {
    /**
     * #swagger.tags = ["Messages"]
       #swagger.autoBody=false
       #swagger.security = [{
              "bearerAuth": []
       }]
       #swagger.parameters["session"] = {
        schema: 'NERDWHATS_AMERICA'
       }
       #swagger.requestBody = {
        required: false,
        "@content": {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                msgId: { type: "string" },
                reaction: { type: "string" },
              }
            },
            examples: {
              "Default": {
                value: {
                  msgId: "<messageId>",
                  reaction: "😜",
                }
              },
            }
          }
        }
       }
     */
    const { msgId, reaction } = req.body;
    try {
        await req.client.sendReactionToMessage(msgId, reaction);
        res
            .status(200)
            .json({ status: 'success', response: { message: 'Reaction sended' } });
    }
    catch (e) {
        req.logger.error(e);
        res.status(500).json({
            status: 'error',
            message: 'Error on send reaction to message',
            error: e,
        });
    }
}
async function reply(req, res) {
    /**
     * #swagger.deprecated=true
       #swagger.tags = ["Messages"]
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
                messageid: { type: "string" },
                text: { type: "string" },
              }
            },
            examples: {
              "Default": {
                value: {
                phone: "5521999999999",
                isGroup: false,
                messageid: "<messageId>",
                text: "Text to reply",
                }
              },
            }
          }
        }
       }
     */
    const { phone, text, messageid } = req.body;
    try {
        const response = await req.client.reply(`${phone}@c.us`, text, messageid);
        res.status(200).json({ status: 'success', response: response });
    }
    catch (e) {
        req.logger.error(e);
        res
            .status(500)
            .json({ status: 'error', message: 'Error replying message', error: e });
    }
}
async function forwardMessages(req, res) {
    /**
       #swagger.tags = ["Messages"]
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
                messageId: { type: "string" },
              }
            },
            examples: {
              "Default": {
                value: {
                  phone: "5521999999999",
                  isGroup: false,
                  messageId: "<messageId>",
                }
              },
            }
          }
        }
       }
     */
    const { phone, messageId, isGroup = false } = req.body;
    try {
        let response;
        if (!isGroup) {
            response = await req.client.forwardMessage(`${phone[0]}`, messageId);
        }
        else {
            response = await req.client.forwardMessage(`${phone[0]}`, messageId);
        }
        res.status(201).json({ status: 'success', response: response });
    }
    catch (e) {
        req.logger.error(e);
        res
            .status(500)
            .json({ status: 'error', message: 'Error forwarding message', error: e });
    }
}
async function markUnseenMessage(req, res) {
    /**
       #swagger.tags = ["Messages"]
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
              }
            },
            examples: {
              "Default": {
                value: {
                  phone: "5521999999999",
                  isGroup: false,
                }
              },
            }
          }
        }
       }
     */
    const { phone } = req.body;
    try {
        await req.client.markUnseenMessage(`${phone}`);
        res
            .status(200)
            .json({ status: 'success', response: { message: 'unseen checked' } });
    }
    catch (e) {
        req.logger.error(e);
        res
            .status(500)
            .json({ status: 'error', message: 'Error on mark unseen', error: e });
    }
}
async function blockContact(req, res) {
    /**
       #swagger.tags = ["Misc"]
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
              }
            },
            examples: {
              "Default": {
                value: {
                phone: "5521999999999",
                isGroup: false,
                }
              },
            }
          }
        }
       }
     */
    const { phone } = req.body;
    try {
        await req.client.blockContact(`${phone}`);
        res
            .status(200)
            .json({ status: 'success', response: { message: 'Contact blocked' } });
    }
    catch (e) {
        req.logger.error(e);
        res
            .status(500)
            .json({ status: 'error', message: 'Error on block contact', error: e });
    }
}
async function unblockContact(req, res) {
    /**
       #swagger.tags = ["Misc"]
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
              }
            },
            examples: {
              "Default": {
                value: {
                phone: "5521999999999",
                isGroup: false,
                }
              },
            }
          }
        }
       }
     */
    const { phone } = req.body;
    try {
        await req.client.unblockContact(`${phone}`);
        res
            .status(200)
            .json({ status: 'success', response: { message: 'Contact UnBlocked' } });
    }
    catch (e) {
        req.logger.error(e);
        res
            .status(500)
            .json({ status: 'error', message: 'Error on unlock contact', error: e });
    }
}
async function pinChat(req, res) {
    /**
       #swagger.tags = ["Chat"]
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
          $phone: '5521999999999',
          $isGroup: false,
          $state: true,
        }
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
                state: { type: "boolean" },
              }
            },
            examples: {
              "Default": {
                value: {
                phone: "5521999999999",
                state: true,
                }
              },
            }
          }
        }
       }
     */
    const { phone, state } = req.body;
    try {
        for (const contato of phone) {
            await req.client.pinChat(contato, state === 'true', false);
        }
        res
            .status(200)
            .json({ status: 'success', response: { message: 'Chat fixed' } });
    }
    catch (e) {
        req.logger.error(e);
        res.status(500).json({
            status: 'error',
            message: e.text || 'Error on pin chat',
            error: e,
        });
    }
}
async function setProfilePic(req, res) {
    /**
       #swagger.tags = ["Profile"]
       #swagger.autoBody=false
       #swagger.security = [{
              "bearerAuth": []
       }]
       #swagger.parameters["session"] = {
        schema: 'NERDWHATS_AMERICA'
       }
       #swagger.consumes = ['multipart/form-data']
        #swagger.parameters['file'] = {
            in: 'formData',
            type: 'file',
            required: 'true',
        }
     */
    if (!req.file)
        res
            .status(400)
            .json({ status: 'Error', message: 'File parameter is required!' });
    try {
        const { path: pathFile } = req.file;
        await req.client.setProfilePic(pathFile);
        await (0, functions_1.unlinkAsync)(pathFile);
        res.status(200).json({
            status: 'success',
            response: { message: 'Profile photo successfully changed' },
        });
    }
    catch (e) {
        req.logger.error(e);
        res.status(500).json({
            status: 'error',
            message: 'Error changing profile photo',
            error: e,
        });
    }
}
async function getUnreadMessages(req, res) {
    /**
       #swagger.deprecated=true
       #swagger.tags = ["Messages"]
       #swagger.autoBody=false
       #swagger.security = [{
              "bearerAuth": []
       }]
       #swagger.parameters["session"] = {
        schema: 'NERDWHATS_AMERICA'
       }
     */
    try {
        const response = await req.client.getUnreadMessages(false, false, true);
        res.status(200).json({ status: 'success', response: response });
    }
    catch (e) {
        req.logger.error(e);
        res
            .status(500)
            .json({ status: 'error', response: 'Error on open list', error: e });
    }
}
async function getChatIsOnline(req, res) {
    /**
       #swagger.tags = ["Chat"]
       #swagger.autoBody=false
       #swagger.security = [{
              "bearerAuth": []
       }]
       #swagger.parameters["session"] = {
        schema: 'NERDWHATS_AMERICA'
       }
       #swagger.parameters["phone"] = {
        schema: '5521999999999',
       }
     */
    const { phone } = req.params;
    try {
        const response = await req.client.getChatIsOnline(`${phone}@c.us`);
        res.status(200).json({ status: 'success', response: response });
    }
    catch (e) {
        req.logger.error(e);
        res.status(500).json({
            status: 'error',
            response: 'Error on get chat is online',
            error: e,
        });
    }
}
async function getLastSeen(req, res) {
    /**
       #swagger.tags = ["Chat"]
       #swagger.autoBody=false
       #swagger.security = [{
              "bearerAuth": []
       }]
       #swagger.parameters["session"] = {
        schema: 'NERDWHATS_AMERICA'
       }
       #swagger.parameters["phone"] = {
        schema: '5521999999999',
       }
     */
    const { phone } = req.params;
    try {
        const response = await req.client.getLastSeen(`${phone}@c.us`);
        res.status(200).json({ status: 'success', response: response });
    }
    catch (error) {
        req.logger.error(error);
        res.status(500).json({
            status: 'error',
            response: 'Error on get chat last seen',
            error: error,
        });
    }
}
async function getListMutes(req, res) {
    /**
       #swagger.tags = ["Chat"]
       #swagger.autoBody=false
       #swagger.security = [{
              "bearerAuth": []
       }]
       #swagger.parameters["session"] = {
        schema: 'NERDWHATS_AMERICA'
       }
       #swagger.parameters["type"] = {
        schema: 'all',
       }
     */
    const { type = 'all' } = req.params;
    try {
        const response = await req.client.getListMutes(type);
        res.status(200).json({ status: 'success', response: response });
    }
    catch (error) {
        req.logger.error(error);
        res.status(500).json({
            status: 'error',
            response: 'Error on get list mutes',
            error: error,
        });
    }
}
async function loadAndGetAllMessagesInChat(req, res) {
    /**
       #swagger.deprecated=true
       #swagger.tags = ["Chat"]
       #swagger.autoBody=false
       #swagger.security = [{
              "bearerAuth": []
       }]
       #swagger.parameters["session"] = {
        schema: 'NERDWHATS_AMERICA'
       }
       #swagger.parameters["phone"] = {
        schema: '5521999999999'
       }
       #swagger.parameters["includeMe"] = {
        schema: 'true'
       }
       #swagger.parameters["includeNotifications"] = {
        schema: 'false'
       }
     */
    const { phone, includeMe = true, includeNotifications = false } = req.params;
    try {
        const response = await req.client.loadAndGetAllMessagesInChat(`${phone}@c.us`, includeMe, includeNotifications);
        res.status(200).json({ status: 'success', response: response });
    }
    catch (error) {
        req.logger.error(error);
        res
            .status(500)
            .json({ status: 'error', response: 'Error on open list', error: error });
    }
}
async function getMessages(req, res) {
    /**
       #swagger.tags = ["Messages"]
       #swagger.autoBody=false
       #swagger.security = [{
              "bearerAuth": []
       }]
       #swagger.parameters["session"] = {
        schema: 'NERDWHATS_AMERICA'
       }
       #swagger.parameters["phone"] = {
        schema: '5521999999999@c.us'
       }
       #swagger.parameters["count"] = {
        schema: '20'
       }
       #swagger.parameters["direction"] = {
        schema: 'before'
       }
       #swagger.parameters["id"] = {
        schema: '<message_id_to_use_direction>'
       }
     */
    const { phone } = req.params;
    const { count = 20, direction = 'before', id = null } = req.query;
    try {
        const response = await req.client.getMessages(`${phone}`, {
            count: parseInt(count),
            direction: direction.toString(),
            id: id,
        });
        res.status(200).json({ status: 'success', response: response });
    }
    catch (e) {
        req.logger.error(e);
        res
            .status(401)
            .json({ status: 'error', response: 'Error on open list', error: e });
    }
}
async function sendContactVcard(req, res) {
    /**
       #swagger.tags = ["Messages"]
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
                name: { type: "string" },
                contactsId: { type: "array" },
              }
            },
            examples: {
              "Default": {
                value: {
                  phone: "5521999999999",
                  isGroup: false,
                  name: 'Name of contact',
                  contactsId: ['5521999999999'],
                }
              },
            }
          }
        }
       }
     */
    const { phone, contactsId, name = null, isGroup = false } = req.body;
    try {
        let response;
        for (const contato of (0, functions_1.contactToArray)(phone, isGroup)) {
            response = await req.client.sendContactVcard(`${contato}`, contactsId, name);
        }
        res.status(200).json({ status: 'success', response: response });
    }
    catch (error) {
        req.logger.error(error);
        res.status(500).json({
            status: 'error',
            message: 'Error on send contact vcard',
            error: error,
        });
    }
}
async function sendMute(req, res) {
    /**
       #swagger.tags = ["Chat"]
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
                time: { type: "number" },
                type: { type: "string" },
              }
            },
            examples: {
              "Default": {
                value: {
                  phone: "5521999999999",
                  isGroup: false,
                  time: 1,
                  type: 'hours',
                }
              },
            }
          }
        }
       }
     */
    const { phone, time, type = 'hours', isGroup = false } = req.body;
    try {
        let response;
        for (const contato of (0, functions_1.contactToArray)(phone, isGroup)) {
            response = await req.client.sendMute(`${contato}`, time, type);
        }
        res.status(200).json({ status: 'success', response: response });
    }
    catch (error) {
        req.logger.error(error);
        res
            .status(500)
            .json({ status: 'error', message: 'Error on send mute', error: error });
    }
}
async function sendSeen(req, res) {
    /**
       #swagger.tags = ["Chat"]
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
              }
            },
            examples: {
              "Default": {
                value: {
                  phone: "5521999999999",
                  isGroup: false,
                }
              },
            }
          }
        }
       }
     */
    const { phone } = req.body;
    const session = req.session;
    try {
        const results = [];
        for (const contato of phone) {
            results.push(await req.client.sendSeen(contato));
        }
        returnSucess(res, session, phone, results);
    }
    catch (error) {
        returnError(req, res, session, error);
    }
}
async function setChatState(req, res) {
    /**
       #swagger.deprecated=true
       #swagger.tags = ["Chat"]
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
                chatstate: { type: "string" },
              }
            },
            examples: {
              "Default": {
                value: {
                  phone: "5521999999999",
                  isGroup: false,
                  chatstate: "1",
                }
              },
            }
          }
        }
       }
     */
    const { phone, chatstate, isGroup = false } = req.body;
    try {
        let response;
        for (const contato of (0, functions_1.contactToArray)(phone, isGroup)) {
            response = await req.client.setChatState(`${contato}`, chatstate);
        }
        res.status(200).json({ status: 'success', response: response });
    }
    catch (error) {
        req.logger.error(error);
        res.status(500).json({
            status: 'error',
            message: 'Error on send chat state',
            error: error,
        });
    }
}
async function setTemporaryMessages(req, res) {
    /**
       #swagger.tags = ["Messages"]
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
                value: { type: "boolean" },
              }
            },
            examples: {
              "Default": {
                value: {
                  phone: "5521999999999",
                  isGroup: false,
                  value: true,
                }
              },
            }
          }
        }
       }
     */
    const { phone, value = true, isGroup = false } = req.body;
    try {
        let response;
        for (const contato of (0, functions_1.contactToArray)(phone, isGroup)) {
            response = await req.client.setTemporaryMessages(`${contato}`, value);
        }
        res.status(200).json({ status: 'success', response: response });
    }
    catch (error) {
        req.logger.error(error);
        res.status(500).json({
            status: 'error',
            message: 'Error on set temporary messages',
            error: error,
        });
    }
}
async function setTyping(req, res) {
    /**
       #swagger.tags = ["Chat"]
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
                value: { type: "boolean" },
              }
            },
            examples: {
              "Default": {
                value: {
                  phone: "5521999999999",
                  isGroup: false,
                  value: true,
                }
              },
            }
          }
        }
       }
     */
    const { phone, value = true, isGroup = false } = req.body;
    try {
        let response;
        for (const contato of (0, functions_1.contactToArray)(phone, isGroup)) {
            if (value)
                response = await req.client.startTyping(contato);
            else
                response = await req.client.stopTyping(contato);
        }
        res.status(200).json({ status: 'success', response: response });
    }
    catch (error) {
        req.logger.error(error);
        res
            .status(500)
            .json({ status: 'error', message: 'Error on set typing', error: error });
    }
}
async function setRecording(req, res) {
    /**
       #swagger.tags = ["Chat"]
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
                duration: { type: "number" },
                value: { type: "boolean" },
              }
            },
            examples: {
              "Default": {
                value: {
                  phone: "5521999999999",
                  isGroup: false,
                  duration: 5,
                  value: true,
                }
              },
            }
          }
        }
       }
     */
    const { phone, value = true, duration, isGroup = false } = req.body;
    try {
        let response;
        for (const contato of (0, functions_1.contactToArray)(phone, isGroup)) {
            if (value)
                response = await req.client.startRecording(contato, duration);
            else
                response = await req.client.stopRecoring(contato);
        }
        res.status(200).json({ status: 'success', response: response });
    }
    catch (error) {
        req.logger.error(error);
        res.status(500).json({
            status: 'error',
            message: 'Error on set recording',
            error: error,
        });
    }
}
async function checkNumberStatus(req, res) {
    /**
       #swagger.tags = ["Misc"]
       #swagger.autoBody=false
       #swagger.security = [{
              "bearerAuth": []
       }]
       #swagger.parameters["session"] = {
        schema: 'NERDWHATS_AMERICA'
       }
       #swagger.parameters["phone"] = {
        schema: '5521999999999'
       }
     */
    const { phone } = req.params;
    try {
        let response;
        for (const contato of (0, functions_1.contactToArray)(phone, false)) {
            response = await req.client.checkNumberStatus(`${contato}`);
        }
        res.status(200).json({ status: 'success', response: response });
    }
    catch (error) {
        req.logger.error(error);
        res.status(500).json({
            status: 'error',
            message: 'Error on check number status',
            error: error,
        });
    }
}
async function getContact(req, res) {
    /**
       #swagger.tags = ["Chat"]
       #swagger.autoBody=false
       #swagger.security = [{
              "bearerAuth": []
       }]
       #swagger.parameters["session"] = {
        schema: 'NERDWHATS_AMERICA'
       }
       #swagger.parameters["phone"] = {
        schema: '5521999999999'
       }
     */
    const { phone = true } = req.params;
    try {
        let response;
        for (const contato of (0, functions_1.contactToArray)(phone, false)) {
            response = await req.client.getContact(contato);
        }
        res.status(200).json({ status: 'success', response: response });
    }
    catch (error) {
        req.logger.error(error);
        res
            .status(500)
            .json({ status: 'error', message: 'Error on get contact', error: error });
    }
}
async function getAllContacts(req, res) {
    /**
     * #swagger.tags = ["Contact"]
       #swagger.autoBody=false
       #swagger.security = [{
              "bearerAuth": []
       }]
       #swagger.parameters["session"] = {
        schema: 'NERDWHATS_AMERICA'
       }
     */
    try {
        const response = await req.client.getAllContacts();
        res.status(200).json({ status: 'success', response: response });
    }
    catch (error) {
        req.logger.error(error);
        res.status(500).json({
            status: 'error',
            message: 'Error on get all constacts',
            error: error,
        });
    }
}
async function getNumberProfile(req, res) {
    /**
       #swagger.deprecated=true
       #swagger.tags = ["Chat"]
       #swagger.autoBody=false
       #swagger.security = [{
              "bearerAuth": []
       }]
       #swagger.parameters["session"] = {
        schema: 'NERDWHATS_AMERICA'
       }
       #swagger.parameters["phone"] = {
        schema: '5521999999999'
       }
     */
    const { phone = true } = req.params;
    try {
        let response;
        for (const contato of (0, functions_1.contactToArray)(phone, false)) {
            response = await req.client.getNumberProfile(contato);
        }
        res.status(200).json({ status: 'success', response: response });
    }
    catch (error) {
        req.logger.error(error);
        res.status(500).json({
            status: 'error',
            message: 'Error on get number profile',
            error: error,
        });
    }
}
async function getProfilePicFromServer(req, res) {
    /**
       #swagger.tags = ["Contact"]
       #swagger.autoBody=false
       #swagger.security = [{
              "bearerAuth": []
       }]
       #swagger.parameters["session"] = {
        schema: 'NERDWHATS_AMERICA'
       }
       #swagger.parameters["phone"] = {
        schema: '5521999999999'
       }
     */
    const { phone = true } = req.params;
    const { isGroup = false } = req.query;
    try {
        let response;
        for (const contato of (0, functions_1.contactToArray)(phone, isGroup)) {
            response = await req.client.getProfilePicFromServer(contato);
        }
        res.status(200).json({ status: 'success', response: response });
    }
    catch (error) {
        req.logger.error(error);
        res.status(500).json({
            status: 'error',
            message: 'Error on  get profile pic',
            error: error,
        });
    }
}
async function getStatus(req, res) {
    /**
       #swagger.tags = ["Contact"]
       #swagger.autoBody=false
       #swagger.security = [{
              "bearerAuth": []
       }]
       #swagger.parameters["session"] = {
        schema: 'NERDWHATS_AMERICA'
       }
       #swagger.parameters["phone"] = {
        schema: '5521999999999'
       }
     */
    const { phone = true } = req.params;
    try {
        let response;
        for (const contato of (0, functions_1.contactToArray)(phone, false)) {
            response = await req.client.getStatus(contato);
        }
        res.status(200).json({ status: 'success', response: response });
    }
    catch (error) {
        req.logger.error(error);
        res
            .status(500)
            .json({ status: 'error', message: 'Error on  get status', error: error });
    }
}
async function setProfileStatus(req, res) {
    /**
       #swagger.tags = ["Profile"]
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
          $status: 'My new status',
        }
       }
       
       #swagger.requestBody = {
        required: true,
        "@content": {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                status: { type: "string" },
              }
            },
            examples: {
              "Default": {
                value: {
                  status: "My new status",
                }
              },
            }
          }
        }
       }
     */
    const { status } = req.body;
    try {
        const response = await req.client.setProfileStatus(status);
        res.status(200).json({ status: 'success', response: response });
    }
    catch (e) {
        req.logger.error(e);
        res
            .status(500)
            .json({ status: 'error', message: 'Error on set profile status' });
    }
}
async function rejectCall(req, res) {
    /**
       #swagger.tags = ["Misc"]
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
                callId: { type: "string" },
              }
            },
            examples: {
              "Default": {
                value: {
                  callId: "<callid>",
                }
              },
            }
          }
        }
       }
     */
    const { callId } = req.body;
    try {
        const response = await req.client.rejectCall(callId);
        res.status(200).json({ status: 'success', response: response });
    }
    catch (e) {
        req.logger.error(e);
        res
            .status(500)
            .json({ status: 'error', message: 'Error on rejectCall', error: e });
    }
}
async function starMessage(req, res) {
    /**
       #swagger.tags = ["Messages"]
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
                messageId: { type: "string" },
                star: { type: "boolean" },
              }
            },
            examples: {
              "Default": {
                value: {
                  messageId: "5521999999999",
                  star: true,
                }
              },
            }
          }
        }
       }
     */
    const { messageId, star = true } = req.body;
    try {
        const response = await req.client.starMessage(messageId, star);
        res.status(200).json({ status: 'success', response: response });
    }
    catch (error) {
        req.logger.error(error);
        res.status(500).json({
            status: 'error',
            message: 'Error on  start message',
            error: error,
        });
    }
}
async function getReactions(req, res) {
    /**
       #swagger.tags = ["Messages"]
       #swagger.autoBody=false
       #swagger.security = [{
              "bearerAuth": []
       }]
       #swagger.parameters["session"] = {
        schema: 'NERDWHATS_AMERICA'
       }
       #swagger.parameters["messageId"] = {
        schema: '<messageId>'
       }
     */
    const messageId = req.params.id;
    try {
        const response = await req.client.getReactions(messageId);
        res.status(200).json({ status: 'success', response: response });
    }
    catch (error) {
        req.logger.error(error);
        res.status(500).json({
            status: 'error',
            message: 'Error on get reactions',
            error: error,
        });
    }
}
async function getVotes(req, res) {
    /**
       #swagger.tags = ["Messages"]
       #swagger.autoBody=false
       #swagger.security = [{
              "bearerAuth": []
       }]
       #swagger.parameters["session"] = {
        schema: 'NERDWHATS_AMERICA'
       }
       #swagger.parameters["messageId"] = {
        schema: '<messageId>'
       }
     */
    const messageId = req.params.id;
    try {
        const response = await req.client.getVotes(messageId);
        res.status(200).json({ status: 'success', response: response });
    }
    catch (error) {
        req.logger.error(error);
        res
            .status(500)
            .json({ status: 'error', message: 'Error on get votes', error: error });
    }
}
async function chatWoot(req, res) {
    /**
       #swagger.tags = ["Misc"]
       #swagger.description = 'You can point your Chatwoot to this route so that it can perform functions.'
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
                event: { type: "string" },
                private: { type: "string" },
              }
            },
            examples: {
              "Default": {
                value: {
                  messageId: "conversation_status_changed",
                  private: "false",
                }
              },
            }
          }
        }
       }
     */
    const { session } = req.params;
    const client = sessionUtil_1.clientsArray[session];
    if (client == null || client.status !== 'CONNECTED')
        return;
    try {
        if (await client.isConnected()) {
            const event = req.body.event;
            const is_private = req.body.private || req.body.is_private;
            if (event == 'conversation_status_changed' ||
                event == 'conversation_resolved' ||
                is_private) {
                return res
                    .status(200)
                    .json({ status: 'success', message: 'Success on receive chatwoot' });
            }
            const { message_type, phone = req.body.conversation.meta.sender.phone_number.replace('+', ''), message = req.body.conversation.messages[0], } = req.body;
            if (event != 'message_created' && message_type != 'outgoing')
                return res
                    .status(200)
                    .json({ status: 'success', message: 'Success on receive chatwoot' });
            for (const contato of (0, functions_1.contactToArray)(phone, false)) {
                if (message_type == 'outgoing') {
                    if (message.attachments) {
                        const base_url = `${client.config.chatWoot.baseURL}/${message.attachments[0].data_url.substring(message.attachments[0].data_url.indexOf('/rails/') + 1)}`;
                        // Check if attachments is Push-to-talk and send this
                        if (message.attachments[0].file_type === 'audio') {
                            return client.sendPtt(`${contato}`, base_url, 'Voice Audio', message.content);
                        }
                        await client.sendFile(`${contato}`, base_url, 'file', message.content);
                    }
                    else {
                        await client.sendText(contato, message.content);
                    }
                }
            }
            res
                .status(200)
                .json({ status: 'success', message: 'Success on  receive chatwoot' });
        }
    }
    catch (e) {
        console.log(e);
        res.status(400).json({
            status: 'error',
            message: 'Error on  receive chatwoot',
            error: e,
        });
    }
}
async function getPlatformFromMessage(req, res) {
    /**
     * #swagger.tags = ["Misc"]
       #swagger.autoBody=false
       #swagger.security = [{
              "bearerAuth": []
       }]
       #swagger.parameters["session"] = {
        schema: 'NERDWHATS_AMERICA'
       }
       #swagger.parameters["messageId"] = {
        schema: '<messageId>'
       }
     */
    try {
        const result = await req.client.getPlatformFromMessage(req.params.messageId);
        res.status(200).json(result);
    }
    catch (e) {
        req.logger.error(e);
        res.status(500).json({
            status: 'error',
            message: 'Error on get get platform from message',
            error: e,
        });
    }
}
