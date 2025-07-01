"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const upload_1 = __importDefault(require("../config/upload"));
const CatalogController = __importStar(require("../controller/catalogController"));
const CommunityController = __importStar(require("../controller/communityController"));
const DeviceController = __importStar(require("../controller/deviceController"));
const encryptController_1 = require("../controller/encryptController");
const GroupController = __importStar(require("../controller/groupController"));
const LabelsController = __importStar(require("../controller/labelsController"));
const MessageController = __importStar(require("../controller/messageController"));
const MiscController = __importStar(require("../controller/miscController"));
const NewsletterController = __importStar(require("../controller/newsletterController"));
const OrderController = __importStar(require("../controller/orderController"));
const SessionController = __importStar(require("../controller/sessionController"));
const StatusController = __importStar(require("../controller/statusController"));
const auth_1 = __importDefault(require("../middleware/auth"));
const HealthCheck = __importStar(require("../middleware/healthCheck"));
const prometheusRegister = __importStar(require("../middleware/instrumentation"));
const statusConnection_1 = __importDefault(require("../middleware/statusConnection"));
const swagger_json_1 = __importDefault(require("../swagger.json"));
const upload = (0, multer_1.default)(upload_1.default);
const routes = (0, express_1.Router)();
// Generate Token
routes.post('/api/:session/:secretkey/generate-token', encryptController_1.encryptSession);
// All Sessions
routes.get('/api/:secretkey/show-all-sessions', SessionController.showAllSessions);
routes.post('/api/:secretkey/start-all', SessionController.startAllSessions);
// Sessions
routes.get('/api/:session/check-connection-session', auth_1.default, SessionController.checkConnectionSession);
routes.get('/api/:session/get-media-by-message/:messageId', auth_1.default, SessionController.getMediaByMessage);
routes.get('/api/:session/get-platform-from-message/:messageId', auth_1.default, DeviceController.getPlatformFromMessage);
routes.get('/api/:session/qrcode-session', auth_1.default, SessionController.getQrCode);
routes.post('/api/:session/start-session', auth_1.default, SessionController.startSession);
routes.post('/api/:session/logout-session', auth_1.default, statusConnection_1.default, SessionController.logOutSession);
routes.post('/api/:session/:secretkey/clear-session-data', MiscController.clearSessionData);
routes.post('/api/:session/close-session', auth_1.default, SessionController.closeSession);
routes.post('/api/:session/subscribe-presence', auth_1.default, SessionController.subscribePresence);
routes.post('/api/:session/set-online-presence', auth_1.default, SessionController.setOnlinePresence);
routes.post('/api/:session/download-media', auth_1.default, statusConnection_1.default, SessionController.downloadMediaByMessage);
// Messages
routes.post('/api/:session/send-message', auth_1.default, statusConnection_1.default, MessageController.sendMessage);
routes.post('/api/:session/edit-message', auth_1.default, statusConnection_1.default, MessageController.editMessage);
routes.post('/api/:session/send-image', upload.single('file'), auth_1.default, statusConnection_1.default, MessageController.sendFile);
routes.post('/api/:session/send-sticker', upload.single('file'), auth_1.default, statusConnection_1.default, MessageController.sendImageAsSticker);
routes.post('/api/:session/send-sticker-gif', upload.single('file'), auth_1.default, statusConnection_1.default, MessageController.sendImageAsStickerGif);
routes.post('/api/:session/send-reply', auth_1.default, statusConnection_1.default, MessageController.replyMessage);
routes.post('/api/:session/send-file', upload.single('file'), auth_1.default, statusConnection_1.default, MessageController.sendFile);
routes.post('/api/:session/send-file-base64', auth_1.default, statusConnection_1.default, MessageController.sendFile);
routes.post('/api/:session/send-voice', auth_1.default, statusConnection_1.default, MessageController.sendVoice);
routes.post('/api/:session/send-voice-base64', auth_1.default, statusConnection_1.default, MessageController.sendVoice64);
routes.get('/api/:session/status-session', auth_1.default, SessionController.getSessionState);
routes.post('/api/:session/send-status', auth_1.default, statusConnection_1.default, MessageController.sendStatusText);
routes.post('/api/:session/send-link-preview', auth_1.default, statusConnection_1.default, MessageController.sendLinkPreview);
routes.post('/api/:session/send-location', auth_1.default, statusConnection_1.default, MessageController.sendLocation);
routes.post('/api/:session/send-mentioned', auth_1.default, statusConnection_1.default, MessageController.sendMentioned);
routes.post('/api/:session/send-buttons', auth_1.default, statusConnection_1.default, MessageController.sendButtons);
routes.post('/api/:session/send-list-message', auth_1.default, statusConnection_1.default, MessageController.sendListMessage);
routes.post('/api/:session/send-order-message', auth_1.default, statusConnection_1.default, MessageController.sendOrderMessage);
routes.post('/api/:session/send-poll-message', auth_1.default, statusConnection_1.default, MessageController.sendPollMessage);
// Group
routes.get('/api/:session/all-broadcast-list', auth_1.default, statusConnection_1.default, GroupController.getAllBroadcastList);
routes.get('/api/:session/all-groups', auth_1.default, statusConnection_1.default, GroupController.getAllGroups);
routes.get('/api/:session/group-members/:groupId', auth_1.default, statusConnection_1.default, GroupController.getGroupMembers);
routes.get('/api/:session/common-groups/:wid', auth_1.default, statusConnection_1.default, GroupController.getCommonGroups);
routes.get('/api/:session/group-admins/:groupId', auth_1.default, statusConnection_1.default, GroupController.getGroupAdmins);
routes.get('/api/:session/group-invite-link/:groupId', auth_1.default, statusConnection_1.default, GroupController.getGroupInviteLink);
routes.get('/api/:session/group-revoke-link/:groupId', auth_1.default, statusConnection_1.default, GroupController.revokeGroupInviteLink);
routes.get('/api/:session/group-members-ids/:groupId', auth_1.default, statusConnection_1.default, GroupController.getGroupMembersIds);
routes.post('/api/:session/create-group', auth_1.default, statusConnection_1.default, GroupController.createGroup);
routes.post('/api/:session/leave-group', auth_1.default, statusConnection_1.default, GroupController.leaveGroup);
routes.post('/api/:session/join-code', auth_1.default, statusConnection_1.default, GroupController.joinGroupByCode);
routes.post('/api/:session/add-participant-group', auth_1.default, statusConnection_1.default, GroupController.addParticipant);
routes.post('/api/:session/remove-participant-group', auth_1.default, statusConnection_1.default, GroupController.removeParticipant);
routes.post('/api/:session/promote-participant-group', auth_1.default, statusConnection_1.default, GroupController.promoteParticipant);
routes.post('/api/:session/demote-participant-group', auth_1.default, statusConnection_1.default, GroupController.demoteParticipant);
routes.post('/api/:session/group-info-from-invite-link', auth_1.default, statusConnection_1.default, GroupController.getGroupInfoFromInviteLink);
routes.post('/api/:session/group-description', auth_1.default, statusConnection_1.default, GroupController.setGroupDescription);
routes.post('/api/:session/group-property', auth_1.default, statusConnection_1.default, GroupController.setGroupProperty);
routes.post('/api/:session/group-subject', auth_1.default, statusConnection_1.default, GroupController.setGroupSubject);
routes.post('/api/:session/messages-admins-only', auth_1.default, statusConnection_1.default, GroupController.setMessagesAdminsOnly);
routes.post('/api/:session/group-pic', upload.single('file'), auth_1.default, statusConnection_1.default, GroupController.setGroupProfilePic);
routes.post('/api/:session/change-privacy-group', auth_1.default, statusConnection_1.default, GroupController.changePrivacyGroup);
// Chat
routes.get('/api/:session/all-chats', auth_1.default, statusConnection_1.default, DeviceController.getAllChats);
routes.post('/api/:session/list-chats', auth_1.default, statusConnection_1.default, DeviceController.listChats);
routes.get('/api/:session/all-chats-archived', auth_1.default, statusConnection_1.default, DeviceController.getAllChatsArchiveds);
routes.get('/api/:session/all-chats-with-messages', auth_1.default, statusConnection_1.default, DeviceController.getAllChatsWithMessages);
routes.get('/api/:session/all-messages-in-chat/:phone', auth_1.default, statusConnection_1.default, DeviceController.getAllMessagesInChat);
routes.get('/api/:session/all-new-messages', auth_1.default, statusConnection_1.default, DeviceController.getAllNewMessages);
routes.get('/api/:session/unread-messages', auth_1.default, statusConnection_1.default, DeviceController.getUnreadMessages);
routes.get('/api/:session/all-unread-messages', auth_1.default, statusConnection_1.default, DeviceController.getAllUnreadMessages);
routes.get('/api/:session/chat-by-id/:phone', auth_1.default, statusConnection_1.default, DeviceController.getChatById);
routes.get('/api/:session/message-by-id/:messageId', auth_1.default, statusConnection_1.default, DeviceController.getMessageById);
routes.get('/api/:session/chat-is-online/:phone', auth_1.default, statusConnection_1.default, DeviceController.getChatIsOnline);
routes.get('/api/:session/last-seen/:phone', auth_1.default, statusConnection_1.default, DeviceController.getLastSeen);
routes.get('/api/:session/list-mutes/:type', auth_1.default, statusConnection_1.default, DeviceController.getListMutes);
routes.get('/api/:session/load-messages-in-chat/:phone', auth_1.default, statusConnection_1.default, DeviceController.loadAndGetAllMessagesInChat);
routes.get('/api/:session/get-messages/:phone', auth_1.default, statusConnection_1.default, DeviceController.getMessages);
routes.post('/api/:session/archive-chat', auth_1.default, statusConnection_1.default, DeviceController.archiveChat);
routes.post('/api/:session/archive-all-chats', auth_1.default, statusConnection_1.default, DeviceController.archiveAllChats);
routes.post('/api/:session/clear-chat', auth_1.default, statusConnection_1.default, DeviceController.clearChat);
routes.post('/api/:session/clear-all-chats', auth_1.default, statusConnection_1.default, DeviceController.clearAllChats);
routes.post('/api/:session/delete-chat', auth_1.default, statusConnection_1.default, DeviceController.deleteChat);
routes.post('/api/:session/delete-all-chats', auth_1.default, statusConnection_1.default, DeviceController.deleteAllChats);
routes.post('/api/:session/delete-message', auth_1.default, statusConnection_1.default, DeviceController.deleteMessage);
routes.post('/api/:session/react-message', auth_1.default, statusConnection_1.default, DeviceController.reactMessage);
routes.post('/api/:session/forward-messages', auth_1.default, statusConnection_1.default, DeviceController.forwardMessages);
routes.post('/api/:session/mark-unseen', auth_1.default, statusConnection_1.default, DeviceController.markUnseenMessage);
routes.post('/api/:session/pin-chat', auth_1.default, statusConnection_1.default, DeviceController.pinChat);
routes.post('/api/:session/contact-vcard', auth_1.default, statusConnection_1.default, DeviceController.sendContactVcard);
routes.post('/api/:session/send-mute', auth_1.default, statusConnection_1.default, DeviceController.sendMute);
routes.post('/api/:session/send-seen', auth_1.default, statusConnection_1.default, DeviceController.sendSeen);
routes.post('/api/:session/chat-state', auth_1.default, statusConnection_1.default, DeviceController.setChatState);
routes.post('/api/:session/temporary-messages', auth_1.default, statusConnection_1.default, DeviceController.setTemporaryMessages);
routes.post('/api/:session/typing', auth_1.default, statusConnection_1.default, DeviceController.setTyping);
routes.post('/api/:session/recording', auth_1.default, statusConnection_1.default, DeviceController.setRecording);
routes.post('/api/:session/star-message', auth_1.default, statusConnection_1.default, DeviceController.starMessage);
routes.get('/api/:session/reactions/:id', auth_1.default, statusConnection_1.default, DeviceController.getReactions);
routes.get('/api/:session/votes/:id', auth_1.default, statusConnection_1.default, DeviceController.getVotes);
routes.post('/api/:session/reject-call', auth_1.default, statusConnection_1.default, DeviceController.rejectCall);
// Catalog
routes.get('/api/:session/get-products', auth_1.default, statusConnection_1.default, CatalogController.getProducts);
routes.get('/api/:session/get-product-by-id', auth_1.default, statusConnection_1.default, CatalogController.getProductById);
routes.post('/api/:session/add-product', auth_1.default, statusConnection_1.default, CatalogController.addProduct);
routes.post('/api/:session/edit-product', auth_1.default, statusConnection_1.default, CatalogController.editProduct);
routes.post('/api/:session/del-products', auth_1.default, statusConnection_1.default, CatalogController.delProducts);
routes.post('/api/:session/change-product-image', auth_1.default, statusConnection_1.default, CatalogController.changeProductImage);
routes.post('/api/:session/add-product-image', auth_1.default, statusConnection_1.default, CatalogController.addProductImage);
routes.post('/api/:session/remove-product-image', auth_1.default, statusConnection_1.default, CatalogController.removeProductImage);
routes.get('/api/:session/get-collections', auth_1.default, statusConnection_1.default, CatalogController.getCollections);
routes.post('/api/:session/create-collection', auth_1.default, statusConnection_1.default, CatalogController.createCollection);
routes.post('/api/:session/edit-collection', auth_1.default, statusConnection_1.default, CatalogController.editCollection);
routes.post('/api/:session/del-collection', auth_1.default, statusConnection_1.default, CatalogController.deleteCollection);
routes.post('/api/:session/send-link-catalog', auth_1.default, statusConnection_1.default, CatalogController.sendLinkCatalog);
routes.post('/api/:session/set-product-visibility', auth_1.default, statusConnection_1.default, CatalogController.setProductVisibility);
routes.post('/api/:session/set-cart-enabled', auth_1.default, statusConnection_1.default, CatalogController.updateCartEnabled);
// Status
routes.post('/api/:session/send-text-storie', auth_1.default, statusConnection_1.default, StatusController.sendTextStorie);
routes.post('/api/:session/send-image-storie', upload.single('file'), auth_1.default, statusConnection_1.default, StatusController.sendImageStorie);
routes.post('/api/:session/send-video-storie', upload.single('file'), auth_1.default, statusConnection_1.default, StatusController.sendVideoStorie);
// Labels
routes.post('/api/:session/add-new-label', auth_1.default, statusConnection_1.default, LabelsController.addNewLabel);
routes.post('/api/:session/add-or-remove-label', auth_1.default, statusConnection_1.default, LabelsController.addOrRemoveLabels);
routes.get('/api/:session/get-all-labels', auth_1.default, statusConnection_1.default, LabelsController.getAllLabels);
routes.put('/api/:session/delete-all-labels', auth_1.default, statusConnection_1.default, LabelsController.deleteAllLabels);
routes.put('/api/:session/delete-label/:id', auth_1.default, statusConnection_1.default, LabelsController.deleteLabel);
// Contact
routes.get('/api/:session/check-number-status/:phone', auth_1.default, statusConnection_1.default, DeviceController.checkNumberStatus);
routes.get('/api/:session/all-contacts', auth_1.default, statusConnection_1.default, DeviceController.getAllContacts);
routes.get('/api/:session/contact/:phone', auth_1.default, statusConnection_1.default, DeviceController.getContact);
routes.get('/api/:session/profile/:phone', auth_1.default, statusConnection_1.default, DeviceController.getNumberProfile);
routes.get('/api/:session/profile-pic/:phone', auth_1.default, statusConnection_1.default, DeviceController.getProfilePicFromServer);
routes.get('/api/:session/profile-status/:phone', auth_1.default, statusConnection_1.default, DeviceController.getStatus);
// Blocklist
routes.get('/api/:session/blocklist', auth_1.default, statusConnection_1.default, DeviceController.getBlockList);
routes.post('/api/:session/block-contact', auth_1.default, statusConnection_1.default, DeviceController.blockContact);
routes.post('/api/:session/unblock-contact', auth_1.default, statusConnection_1.default, DeviceController.unblockContact);
// Device
routes.get('/api/:session/get-battery-level', auth_1.default, statusConnection_1.default, DeviceController.getBatteryLevel);
routes.get('/api/:session/host-device', auth_1.default, statusConnection_1.default, DeviceController.getHostDevice);
routes.get('/api/:session/get-phone-number', auth_1.default, statusConnection_1.default, DeviceController.getPhoneNumber);
// Profile
routes.post('/api/:session/set-profile-pic', upload.single('file'), auth_1.default, statusConnection_1.default, DeviceController.setProfilePic);
routes.post('/api/:session/profile-status', auth_1.default, statusConnection_1.default, DeviceController.setProfileStatus);
routes.post('/api/:session/change-username', auth_1.default, statusConnection_1.default, DeviceController.setProfileName);
// Business
routes.post('/api/:session/edit-business-profile', auth_1.default, statusConnection_1.default, SessionController.editBusinessProfile);
routes.get('/api/:session/get-business-profiles-products', auth_1.default, statusConnection_1.default, OrderController.getBusinessProfilesProducts);
routes.get('/api/:session/get-order-by-messageId/:messageId', auth_1.default, statusConnection_1.default, OrderController.getOrderbyMsg);
routes.get('/api/:secretkey/backup-sessions', MiscController.backupAllSessions);
routes.post('/api/:secretkey/restore-sessions', upload.single('file'), MiscController.restoreAllSessions);
routes.get('/api/:session/take-screenshot', auth_1.default, MiscController.takeScreenshot);
routes.post('/api/:session/set-limit', MiscController.setLimit);
//Communitys
routes.post('/api/:session/create-community', auth_1.default, statusConnection_1.default, CommunityController.createCommunity);
routes.post('/api/:session/deactivate-community', auth_1.default, statusConnection_1.default, CommunityController.deactivateCommunity);
routes.post('/api/:session/add-community-subgroup', auth_1.default, statusConnection_1.default, CommunityController.addSubgroupsCommunity);
routes.post('/api/:session/remove-community-subgroup', auth_1.default, statusConnection_1.default, CommunityController.removeSubgroupsCommunity);
routes.post('/api/:session/promote-community-participant', auth_1.default, statusConnection_1.default, CommunityController.promoteCommunityParticipant);
routes.post('/api/:session/demote-community-participant', auth_1.default, statusConnection_1.default, CommunityController.demoteCommunityParticipant);
routes.get('/api/:session/community-participants/:id', auth_1.default, statusConnection_1.default, CommunityController.getCommunityParticipants);
routes.post('/api/:session/newsletter', auth_1.default, statusConnection_1.default, NewsletterController.createNewsletter);
routes.put('/api/:session/newsletter/:id', auth_1.default, statusConnection_1.default, NewsletterController.editNewsletter);
routes.delete('/api/:session/newsletter/:id', auth_1.default, statusConnection_1.default, NewsletterController.destroyNewsletter);
routes.post('/api/:session/mute-newsletter/:id', auth_1.default, statusConnection_1.default, NewsletterController.muteNewsletter);
routes.post('/api/:session/chatwoot', DeviceController.chatWoot);
// Api Doc
routes.use('/api-docs', swagger_ui_express_1.default.serve);
routes.get('/api-docs', swagger_ui_express_1.default.setup(swagger_json_1.default));
//k8s
routes.get('/healthz', HealthCheck.healthz);
routes.get('/unhealthy', HealthCheck.unhealthy);
//Metrics Prometheus
routes.get('/metrics', prometheusRegister.metrics);
exports.default = routes;
