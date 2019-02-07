var validator = require('validator');
var utils = require('../utils');



var clear_status = utils.clear_status;
var remove_slash = utils.remove_slash;
var format_values = utils.format_values;
var showMessage = utils.showMessage;
var ntlm = require('request-ntlm-continued');
module.exports = function (RED) {
    function KTAgetGroupNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        var tlsNode = RED.nodes.getNode(config.tls);
        // node
        node.on('input', function (msg) {
            clear_status(node)
            format_values(config)
            let url = msg.url || config.url;
            let content_type = msg.content_type || config.content_type;
            let ntlmPassword = msg.ntlmPassword || config.ntlmPassword;
            let ntlmUsername = msg.ntlmUsername || config.ntlmUsername;
            let ntlmDomain = msg.ntlmDomain || config.ntlmDomain;
            let ntlmWorkstation = msg.ntlmWorkstation || config.ntlmWorkstation;
            let Id = msg.Id || config.Id;
            let Name = msg.Name || config.Name;
            let ResourceType = msg.ResourceType || config.ResourceType;
            url = remove_slash(url);
            let body = {
                "resourceIdentity":{
                    "Id":Id,
                    "Name":Name,
                    "ResourceType":ResourceType
                },
                "sessionId": sessionId
            };
            url = `${url}TotalAgility/Services/Sdk/ResourceService.svc/json/GetAssociatedGroups`;
            let ntlmOptions = {
                password: ntlmPassword,
                username: ntlmUsername,
                ntlm_domain: ntlmDomain,
                workstation: ntlmWorkstation,
                url: url
            };
            ntlm.post(ntlmOptions, body, (err, res) => {
                if (err)
                    showMessage(500, 'Internal server error', err, 'error', err, msg, node);
                else {
                    msg.payload = res.body;
                    msg.authorization = res.request.headers.Authorization;
                    showMessage(res.statusCode, res.statusMessage, msg.payload, 'success', false, msg, node);
                }
            });
        });
    }

    RED.nodes.registerType('KTA-getGroup', KTAgetGroupNode);
}