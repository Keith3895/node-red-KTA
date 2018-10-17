var validator = require('validator');
var utils = require('../utils');



var clear_status = utils.clear_status;
var remove_slash = utils.remove_slash;
var format_values = utils.format_values;
var showMessage = utils.showMessage;
var ntlm = require('request-ntlm-continued');
module.exports = function (RED) {
    function KTAloginNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        var tlsNode = RED.nodes.getNode(config.tls);
        // node
        node.on('input', function (msg) {
            clear_status(node)
            format_values(config)
            let user_id = msg.user_id || config.user_id;
            let url = msg.url || config.url;
            let content_type = msg.content_type || config.content_type;
            let LogOnProtocol = msg.LogOnProtocol || config.LogOnProtocol;
            let UnconditionalLogOn = msg.UnconditionalLogOn || config.UnconditionalLogOn;
            let ntlmPassword = msg.ntlmPassword || config.ntlmPassword;
            let ntlmUsername = msg.ntlmUsername || config.ntlmUsername;
            let ntlmDomain = msg.ntlmDomain || config.ntlmDomain;
            let ntlmWorkstation = msg.ntlmWorkstation || config.ntlmWorkstation;
            url = remove_slash(url);
            url = `${url}/TotalAgility/Services/Sdk/UserService.svc/json/LogOn`;
            let ntlmOptions = {
                password: ntlmPassword,
                username: ntlmUsername,
                ntlm_domain: ntlmDomain,
                workstation: ntlmWorkstation,
                url: url
            };
            let body = {
                "userIdentity": {
                    "UserId": user_id,
                    "LogOnProtocol": LogOnProtocol,
                    "UnconditionalLogOn": UnconditionalLogOn
                }
            };
            ntlm.post(ntlmOptions, body, (err, res) => {
                console.log(res);
                if (err)
                    showMessage(500, 'Internal server error', err, 'error', err, msg, node);
                else {
                    msg.payload = res.body;
                    msg.authorization = res.request.headers.Authorization;
                    showMessage(res.statusCode, res.statusMessage, msg.payload, 'success', false, msg, node);
                }
            });
            // Object.keys(ntlm).forEach(el => {
            //     if (!validator.isEmpty(ntlm[el])) {
            //     } else {
            // showMessage(500, 'Internal server error', 'Please check authorisation and url'
            //     , 'error', 'Please check authorisation and url', msg, node);
            //     }
            // })


        });
    }

    RED.nodes.registerType('KTA-login', KTAloginNode);
}