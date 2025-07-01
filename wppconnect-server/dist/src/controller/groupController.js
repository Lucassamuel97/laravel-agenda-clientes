"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllGroups = getAllGroups;
exports.joinGroupByCode = joinGroupByCode;
exports.createGroup = createGroup;
exports.leaveGroup = leaveGroup;
exports.getGroupMembers = getGroupMembers;
exports.addParticipant = addParticipant;
exports.removeParticipant = removeParticipant;
exports.promoteParticipant = promoteParticipant;
exports.demoteParticipant = demoteParticipant;
exports.getGroupAdmins = getGroupAdmins;
exports.getGroupInviteLink = getGroupInviteLink;
exports.revokeGroupInviteLink = revokeGroupInviteLink;
exports.getAllBroadcastList = getAllBroadcastList;
exports.getGroupInfoFromInviteLink = getGroupInfoFromInviteLink;
exports.getGroupMembersIds = getGroupMembersIds;
exports.setGroupDescription = setGroupDescription;
exports.setGroupProperty = setGroupProperty;
exports.setGroupSubject = setGroupSubject;
exports.setMessagesAdminsOnly = setMessagesAdminsOnly;
exports.changePrivacyGroup = changePrivacyGroup;
exports.setGroupProfilePic = setGroupProfilePic;
exports.getCommonGroups = getCommonGroups;
const functions_1 = require("../util/functions");
async function getAllGroups(req, res) {
    /**
       #swagger.tags = ["Group"]
       #swagger.deprecated = true
       #swagger.summary = 'Deprecated in favor of 'list-chats'
       #swagger.autoBody=false
       #swagger.security = [{
              "bearerAuth": []
       }]
       #swagger.parameters["session"] = {
        schema: 'NERDWHATS_AMERICA'
       }
     */
    try {
        const response = await req.client.getAllGroups();
        res.status(200).json({ status: 'success', response: response });
    }
    catch (e) {
        req.logger.error(e);
        res
            .status(500)
            .json({ status: 'error', message: 'Error fetching groups', error: e });
    }
}
async function joinGroupByCode(req, res) {
    /**
       #swagger.tags = ["Group"]
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
          "application/json": {
            schema: {
              type: "object",
              properties: {
                inviteCode: {
                  type: "string"
                }
              },
              required: ["inviteCode"]
            },
            examples: {
              "Default": {
                value: {
                  inviteCode: "5644444"
                }
              }
            }
          }
        }
      }
     */
    const { inviteCode } = req.body;
    if (!inviteCode)
        res.status(400).send({ message: 'Invitation Code is required' });
    try {
        await req.client.joinGroup(inviteCode);
        res.status(201).json({
            status: 'success',
            response: {
                message: 'The informed contact(s) entered the group successfully',
                contact: inviteCode,
            },
        });
    }
    catch (error) {
        req.logger.error(error);
        res.status(500).json({
            status: 'error',
            message: 'The informed contact(s) did not join the group successfully',
            error: error,
        });
    }
}
async function createGroup(req, res) {
    /**
       #swagger.tags = ["Group"]
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
          "application/json": {
            schema: {
              type: "object",
              properties: {
                participants: {
                  type: "array",
                  items: {
                    type: "string"
                  }
                },
                name: {
                  type: "string"
                }
              },
              required: ["participants", "name"]
            },
            examples: {
              "Default": {
                value: {
                  participants: ["5521999999999"],
                  name: "Group name"
                }
              }
            }
          }
        }
      }
     */
    const { participants, name } = req.body;
    try {
        let response = {};
        const infoGroup = [];
        for (const group of (0, functions_1.groupNameToArray)(name)) {
            response = await req.client.createGroup(group, (0, functions_1.contactToArray)(participants));
            infoGroup.push({
                name: group,
                id: response.gid.user,
                participants: response.participants,
            });
        }
        res.status(201).json({
            status: 'success',
            response: {
                message: 'Group(s) created successfully',
                group: name,
                groupInfo: infoGroup,
            },
        });
    }
    catch (e) {
        req.logger.error(e);
        res
            .status(500)
            .json({ status: 'error', message: 'Error creating group(s)', error: e });
    }
}
async function leaveGroup(req, res) {
    /**
       #swagger.tags = ["Group"]
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
                groupId: { type: "string" }
              },
              required: ["groupId"]
            }
          }
        }
      }
     */
    const { groupId } = req.body;
    try {
        for (const group of (0, functions_1.groupToArray)(groupId)) {
            await req.client.leaveGroup(group);
        }
        res.status(200).json({
            status: 'success',
            response: { messages: 'Você saiu do grupo com sucesso', group: groupId },
        });
    }
    catch (e) {
        req.logger.error(e);
        res.status(500).json({
            status: 'error',
            message: 'Erro ao sair do(s) grupo(s)',
            error: e,
        });
    }
}
async function getGroupMembers(req, res) {
    /**
       #swagger.tags = ["Group"]
       #swagger.autoBody=false
       #swagger.security = [{
              "bearerAuth": []
       }]
       #swagger.parameters["session"] = {
        schema: 'NERDWHATS_AMERICA'
       }
     */
    const { groupId } = req.params;
    try {
        let response = {};
        for (const group of (0, functions_1.groupToArray)(groupId)) {
            response = await req.client.getGroupMembers(group);
        }
        res.status(200).json({ status: 'success', response: response });
    }
    catch (e) {
        req.logger.error(e);
        res.status(500).json({
            status: 'error',
            message: 'Error on get group members',
            error: e,
        });
    }
}
async function addParticipant(req, res) {
    /**
       #swagger.tags = ["Group"]
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
          "application/json": {
            schema: {
              type: "object",
              properties: {
                groupId: { type: "string" },
                phone: { type: "string" }
              },
              required: ["groupId", "phone"]
            },
            examples: {
              "Default": {
                value: {
                  groupId: "<groupId>",
                  phone: "5521999999999"
                }
              }
            }
          }
        }
      }
     */
    const { groupId, phone } = req.body;
    try {
        let response = {};
        const arrayGroups = [];
        for (const group of (0, functions_1.groupToArray)(groupId)) {
            response = await req.client.addParticipant(group, (0, functions_1.contactToArray)(phone));
            arrayGroups.push(response);
        }
        res.status(201).json({
            status: 'success',
            response: {
                message: 'Addition to group attempted.',
                participants: phone,
                groups: (0, functions_1.groupToArray)(groupId),
                result: arrayGroups,
            },
        });
    }
    catch (e) {
        req.logger.error(e);
        res.status(500).json({
            status: 'error',
            message: 'Error adding participant(s)',
            error: e,
        });
    }
}
async function removeParticipant(req, res) {
    /**
       #swagger.tags = ["Group"]
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
                "groupId": { type: "string" },
                "phone": { type: "string" }
              },
              required: ["groupId", "phone"]
            },
            examples: {
              "Default": {
                value: {
                  "groupId": "<groupId>",
                  "phone": "5521999999999"
                }
              }
            }
          }
        }
      }
     */
    const { groupId, phone } = req.body;
    try {
        let response = {};
        const arrayGroups = [];
        for (const group of (0, functions_1.groupToArray)(groupId)) {
            response = await req.client.removeParticipant(group, (0, functions_1.contactToArray)(phone));
            arrayGroups.push(response);
        }
        res.status(200).json({
            status: 'success',
            response: {
                message: 'Participant(s) removed successfully',
                participants: phone,
                groups: arrayGroups,
            },
        });
    }
    catch (e) {
        req.logger.error(e);
        res.status(500).json({
            status: 'error',
            message: 'Error removing participant(s)',
            error: e,
        });
    }
}
async function promoteParticipant(req, res) {
    /**
       #swagger.tags = ["Group"]
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
                "groupId": { type: "string" },
                "phone": { type: "string" }
              },
              required: ["groupId", "phone"]
            },
            examples: {
              "Default": {
                value: {
                  "groupId": "<groupId>",
                  "phone": "5521999999999"
                }
              }
            }
          }
        }
      }
     */
    const { groupId, phone } = req.body;
    try {
        const arrayGroups = [];
        for (const group of (0, functions_1.groupToArray)(groupId)) {
            await req.client.promoteParticipant(group, (0, functions_1.contactToArray)(phone));
            arrayGroups.push(group);
        }
        res.status(201).json({
            status: 'success',
            response: {
                message: 'Successful promoted participant(s)',
                participants: phone,
                groups: arrayGroups,
            },
        });
    }
    catch (e) {
        req.logger.error(e);
        res.status(500).json({
            status: 'error',
            message: 'Error promoting participant(s)',
            error: e,
        });
    }
}
async function demoteParticipant(req, res) {
    /**
       #swagger.tags = ["Group"]
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
                "groupId": { type: "string" },
                "phone": { type: "string" }
              },
              required: ["groupId", "phone"]
            },
            examples: {
              "Default": {
                value: {
                  "groupId": "<groupId>",
                  "phone": "5521999999999"
                }
              }
            }
          }
        }
      }
     */
    const { groupId, phone } = req.body;
    try {
        const arrayGroups = [];
        for (const group of (0, functions_1.groupToArray)(groupId)) {
            await req.client.demoteParticipant(group, (0, functions_1.contactToArray)(phone));
            arrayGroups.push(group);
        }
        res.status(201).json({
            status: 'success',
            response: {
                message: 'Admin of participant(s) revoked successfully',
                participants: phone,
                groups: arrayGroups,
            },
        });
    }
    catch (e) {
        req.logger.error(e);
        res.status(500).json({
            status: 'error',
            message: "Error revoking participant's admin(s)",
            error: e,
        });
    }
}
async function getGroupAdmins(req, res) {
    /**
       #swagger.tags = ["Group"]
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
                "groupId": { type: "string" }
              },
              required: ["groupId"]
            },
            examples: {
              "Default": {
                value: {
                  "groupId": "<groupId>"
                }
              }
            }
          }
        }
      }
     */
    const { groupId } = req.params;
    try {
        let response = {};
        const arrayGroups = [];
        for (const group of (0, functions_1.groupToArray)(groupId)) {
            response = await req.client.getGroupAdmins(group);
            arrayGroups.push(response);
        }
        res.status(200).json({ status: 'success', response: arrayGroups });
    }
    catch (e) {
        req.logger.error(e);
        res.status(500).json({
            status: 'error',
            message: 'Error retrieving group admin(s)',
            error: e,
        });
    }
}
async function getGroupInviteLink(req, res) {
    /**
       #swagger.tags = ["Group"]
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
                groupId: { type: "string" }
              }
            }
          }
        }
      }
     */
    const { groupId } = req.params;
    try {
        let response = {};
        for (const group of (0, functions_1.groupToArray)(groupId)) {
            response = await req.client.getGroupInviteLink(group);
        }
        res.status(200).json({ status: 'success', response: response });
    }
    catch (e) {
        req.logger.error(e);
        res.status(500).json({
            status: 'error',
            message: 'Error on get group invite link',
            error: e,
        });
    }
}
async function revokeGroupInviteLink(req, res) {
    /**
       #swagger.tags = ["Group"]
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
                $groupId: { type: "string" }
              }
            }
          }
        }
      }
     */
    const { groupId } = req.params;
    let response = {};
    try {
        for (const group of (0, functions_1.groupToArray)(groupId)) {
            response = await req.client.revokeGroupInviteLink(group);
        }
        res.status(200).json({
            status: 'Success',
            response: response,
        });
    }
    catch (e) {
        req.logger.error(e);
        res.status(400).json({
            status: 'error',
            message: 'Error on revoke group invite link',
            error: e,
        });
    }
}
async function getAllBroadcastList(req, res) {
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
        const response = await req.client.getAllBroadcastList();
        res.status(200).json({ status: 'success', response: response });
    }
    catch (e) {
        req.logger.error(e);
        res.status(500).json({
            status: 'error',
            message: 'Error on get all broad cast list',
            error: e,
        });
    }
}
async function getGroupInfoFromInviteLink(req, res) {
    /**
       #swagger.tags = ["Group"]
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
                $invitecode: { type: "string" }
              }
            }
          }
        }
      }
     */
    try {
        const { invitecode } = req.body;
        const response = await req.client.getGroupInfoFromInviteLink(invitecode);
        res.status(200).json({ status: 'success', response: response });
    }
    catch (e) {
        req.logger.error(e);
        res.status(500).json({
            status: 'error',
            message: 'Error on get group info from invite link',
            error: e,
        });
    }
}
async function getGroupMembersIds(req, res) {
    /**
       #swagger.tags = ["Group"]
       #swagger.autoBody=false
       #swagger.security = [{
              "bearerAuth": []
       }]
       #swagger.parameters["session"] = {
        schema: 'NERDWHATS_AMERICA'
       }
       #swagger.parameters["groupId"] = {
        schema: '<groupId>'
       }
     */
    const { groupId } = req.params;
    let response = {};
    try {
        for (const group of (0, functions_1.groupToArray)(groupId)) {
            response = await req.client.getGroupMembersIds(group);
        }
        res.status(200).json({ status: 'success', response: response });
    }
    catch (e) {
        req.logger.error(e);
        res.status(500).json({
            status: 'error',
            message: 'Error on get group members ids',
            error: e,
        });
    }
}
async function setGroupDescription(req, res) {
    /**
       #swagger.tags = ["Group"]
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
                $groupId: { type: "string" },
                $description: { type: "string" }
              }
            }
          }
        }
      }
     */
    const { groupId, description } = req.body;
    let response = {};
    try {
        for (const group of (0, functions_1.groupToArray)(groupId)) {
            response = await req.client.setGroupDescription(group, description);
        }
        res.status(200).json({ status: 'success', response: response });
    }
    catch (e) {
        req.logger.error(e);
        res.status(500).json({
            status: 'error',
            message: 'Error on set group description',
            error: e,
        });
    }
}
async function setGroupProperty(req, res) {
    /**
       #swagger.tags = ["Group"]
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
                $groupId: { type: "string" },
                $property: { type: "string" },
                $value: { type: "boolean" }
              }
            }
          }
        }
      }
     */
    const { groupId, property, value = true } = req.body;
    let response = {};
    try {
        for (const group of (0, functions_1.groupToArray)(groupId)) {
            response = await req.client.setGroupProperty(group, property, value);
        }
        res.status(200).json({ status: 'success', response: response });
    }
    catch (e) {
        req.logger.error(e);
        res.status(500).json({
            status: 'error',
            message: 'Error on set group property',
            error: e,
        });
    }
}
async function setGroupSubject(req, res) {
    /**
       #swagger.tags = ["Group"]
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
                $groupId: { type: "string" },
                $title: { type: "string" }
              }
            }
          }
        }
      }
     */
    const { groupId, title } = req.body;
    let response = {};
    try {
        for (const group of (0, functions_1.groupToArray)(groupId)) {
            response = await req.client.setGroupSubject(group, title);
        }
        res.status(200).json({ status: 'success', response: response });
    }
    catch (e) {
        req.logger.error(e);
        res.status(500).json({
            status: 'error',
            message: 'Error on set group subject',
            error: e,
        });
    }
}
async function setMessagesAdminsOnly(req, res) {
    /**
       #swagger.tags = ["Group"]
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
                $groupId: { type: "string" },
                $value: { type: "boolean" }
              }
            }
          }
        }
      }
     */
    const { groupId, value = true } = req.body;
    let response = {};
    try {
        for (const group of (0, functions_1.groupToArray)(groupId)) {
            response = await req.client.setMessagesAdminsOnly(group, value);
        }
        res.status(200).json({ status: 'success', response: response });
    }
    catch (e) {
        req.logger.error(e);
        res.status(500).json({
            status: 'error',
            message: 'Error on set messages admins only',
            error: e,
        });
    }
}
async function changePrivacyGroup(req, res) {
    /**
       #swagger.tags = ["Group"]
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
                $groupId: { type: "string" },
                $status: { type: "boolean" }
              }
            }
          }
        }
      }
     */
    const { groupId, status } = req.body;
    try {
        for (const group of (0, functions_1.contactToArray)(groupId)) {
            await req.client.setGroupProperty(group, 'restrict', status === 'true');
        }
        res.status(200).json({
            status: 'success',
            response: { message: 'Group privacy changed successfully' },
        });
    }
    catch (e) {
        req.logger.error(e);
        res.status(500).json({
            status: 'error',
            message: 'Error changing group privacy',
            error: e,
        });
    }
}
async function setGroupProfilePic(req, res) {
    /**
       #swagger.tags = ["Group"]
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
                $groupId: { type: "string" },
                $path: { type: "string" }
              }
            }
          }
        }
      }
     */
    const { groupId, path } = req.body;
    if (!path && !req.file)
        res.status(401).send({
            message: 'Sending the image is mandatory',
        });
    const pathFile = path || req.file?.path;
    try {
        for (const contact of (0, functions_1.contactToArray)(groupId, true)) {
            await req.client.setGroupIcon(contact, pathFile);
        }
        res.status(201).json({
            status: 'success',
            response: { message: 'Group profile photo successfully changed' },
        });
    }
    catch (e) {
        req.logger.error(e);
        res.status(500).json({
            status: 'error',
            message: 'Error changing group photo',
            error: e,
        });
    }
}
async function getCommonGroups(req, res) {
    /**
       #swagger.tags = ["Group"]
       #swagger.autoBody=false
       #swagger.security = [{
              "bearerAuth": []
       }]
       #swagger.parameters["session"] = {
        schema: 'NERDWHATS_AMERICA'
       }
       #swagger.parameters["wid"] = {
        schema: '5521999999999@c.us'
       }
     */
    const { wid } = req.params;
    try {
        res.status(200).json(await req.client.getCommonGroups(wid));
    }
    catch (e) {
        req.logger.error(e);
        res.status(500).json({
            status: 'error',
            message: 'Error on get common groups',
            error: e,
        });
    }
}
