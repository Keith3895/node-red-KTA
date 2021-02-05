var validator = require('validator');
var utils = require('../utils');



var clear_status = utils.clear_status;
var remove_slash = utils.remove_slash;
var format_values = utils.format_values;
var showMessage = utils.showMessage;
var ntlm = require('request-ntlm-continued');
module.exports = function (RED) {
    function KTASessionCheckNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        var tlsNode = RED.nodes.getNode(config.tls);
        // node
        node.on('input', function (msg) {
            clear_status(node)
            format_values(config)
            const sessionId = msg.sessionId || config.sessionId;
            let url = msg.url || config.url;
            const content_type = msg.content_type || config.content_type;
            const ntlmPassword = msg.ntlmPassword || config.ntlmPassword;
            const ntlmUsername = msg.ntlmUsername || config.ntlmUsername;
            const ntlmDomain = msg.ntlmDomain || config.ntlmDomain;
            const ntlmWorkstation = msg.ntlmWorkstation || config.ntlmWorkstation;
            url = remove_slash(url);
            url = `${url}/TotalAgility/Services/Sdk/UserService.svc/json/ValidateSession`;
            const ntlmOptions = {
                password: ntlmPassword,
                username: ntlmUsername,
                ntlm_domain: ntlmDomain,
                workstation: ntlmWorkstation,
                url: url
            };
            let body = {
                "sessionId": sessionId,
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

    RED.nodes.registerType('KTA-Session', KTASessionCheckNode);
}