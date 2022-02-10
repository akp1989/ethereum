module.exports = {


  friendlyName: 'Index',


  description: 'Index home.',


  inputs: {

  },


  exits: {
    success:{
      statusCode:200,
      description:"Success response for testing home page",

    },
  },


  fn: async function (inputs,exits) {

    return exits.success();

  }


};
