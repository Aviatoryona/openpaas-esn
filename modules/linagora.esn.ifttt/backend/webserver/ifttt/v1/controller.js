'use strict';

module.exports = dependencies => {
  const lib = require('../../../lib/ifttt')(dependencies);

  return {
    status,
    userInfo,
    testSetup
  };

  /////

  function status(req, res) {
    res.status(isValidChannelKeyInTheRequest(req) ? 200 : 401).end();
  }

  function isValidChannelKeyInTheRequest(req) {
    const channelKey = req.get('IFTTT-Channel-Key');

    return lib.constants.SERVICE_KEY === channelKey;
  }

  function testSetup(req, res) {
    if (isValidChannelKeyInTheRequest(req)) {
      res.status(200).json({
        data: {
          accessToken: 'VCcOWg2sXcmaFPJtWsgYRCnXb2XtZhfGRL7rnFrx',
          samples: {
            actions: {
              post_community_message: {
                message: 'message',
                community: 'community'
              },
              post_chat_message: {
                message: 'message',
                conversation: 'conversation'
              }
            },
            triggers: {
              new_event_with_hashtag: {
                hashtag: 'SDK'
              }
            }
          }
        }
      });
    } else {
      res.status(401).end();
    }
  }

  function userInfo(req, res) {
    const user = req.user;

    res.status(200).json({
      data: {
        id: user.id,
        name: user.firstname + ' ' + user.lastname
      }
    });
  }
};
