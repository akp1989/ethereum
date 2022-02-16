/**
 * Route Mappings
 * (sails.config.routes)
 *
 * Your routes tell Sails what to do each time it receives a request.
 *
 * For more information on configuring custom routes, check out:
 * https://sailsjs.com/anatomy/config/routes-js
 */

module.exports.routes = {

  "GET /": {action:"home/index"},

  'POST  /api/v1/erc20/getNameSymbol': { action: "erc-20/get-name-symbol" },
  'POST  /api/v1/erc20/getBalance': { action: "erc-20/get-balance" },
  'POST  /api/v1/erc20/getApproval': { action: "erc-20/get-approval" },
  'POST  /api/v1/erc20/transfer': { action: "erc-20/transfer" },

  'POST  /api/v1/erc721/getNameSymbol': { action: "erc-721/get-name-symbol" },
  'POST  /api/v1/erc721/getBalance': { action: "erc-721/get-balance" },
  'POST  /api/v1/erc721/getOwner': { action: "erc-721/get-owner" },
  'POST  /api/v1/erc721/getURI': { action: "erc-721/get-tokenuri" },
  'POST  /api/v1/erc721/getApproval': { action: "erc-721/get-approval" },
  'POST  /api/v1/erc721/getIsOperator': { action: "erc-721/get-is-operator" },

  'POST  /api/v1/erc721/approve': { action: "erc-721/approve" },
  'POST  /api/v1/erc721/approveOperator': { action: "erc-721/approve-operator" },
};
