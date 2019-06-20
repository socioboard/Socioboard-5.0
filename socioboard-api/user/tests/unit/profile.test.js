const ProfileUtils = require('../../../user/core/profiles/utils/profilelibs');
const profileUtils = new ProfileUtils();

describe('getFacebookPages', () => {

    test('getFacebookPages_shouldReturn_successMessageForValidInput', () => {
        var code = 'AQBRTCMhEmnOIqoHUxk59JgQ86vUbYCcLEddl3Elp60Sp4drew396RklRH_P0At7QprQgcAbxNabdcTQAroqutvmuQEafq6QBzWN8DCYLk8kNXlI5M6zgFbAvGDRZqSXBHA67XmNEEXj01bLMXbe9hts9QJ2f8iYjcXj4GjDi7cdy4OfCyRLHCpurIWXRNZCRstMWltMrKXjT5WTMO6cA63OVNWCOPCHkgCMb5QBCCO5P58m3nu_VFP-Qc9U-YRkFsUt9Ybpd4eRsZ6aaRE2p_hxUYY__gIetqoXl5SXCqIYI7sQ58wVHcp8K5ekj8yvr_qms9-Q9DEh8limk5zrJQKF';
        return profileUtils.getFacebookPages(code)
            .then((results) => {
                expect(results).not.toHaveProperty('message');
            });
    });

    test('getFacebookPages_shouldReturn_errorMessageForInvalidInputs', () => {
        var code = 'xafsfassdefwefecef';
        return profileUtils.getFacebookPages(code)
            .catch((error) => {
                expect(error).toHaveProperty('message');
            });
    });

    test('getFacebookPages_shouldReturn_errorMessageForMissingInputs', () => {
        return profileUtils.getFacebookPages('')
            .catch((error) => {
                expect(error).toHaveProperty('message');
            });
    });

});


// descibe('getOwnFacebookGroups',()=>{
//     test('',()=>{
//          var code = 'AQCJ9AkxO2sKHI20tkEJgm6uGIJV73AsXPoU4tC7lO1aNNyFR29DdrIFYzo7i4IjtHx8BVjYVlwEcpglXX2FS46cQdvmkcOo-McZoiN97y2yrSksplAcP4TxrvujbzAANxlFzizFLOxjMy7d8A5EtxNiQvmrak9kU2OJhS1EEHlx7VE-FhAk5NH8iNWRNYQabepJna5S20DEU3hFWv6c6hMaD69niwS6tKbadTk_q0aZZrvk8ylhmR69rIfwNkVWWXtS3Q9hCol2Cfz4NNicf0pMzxVX-VCZhN4MkW2NotmZKNSohBedkZZyy1ZpY2wTxmAXwGGON2nzecIuKtOgrnvQ';
//         return profileUtils.getFacebookGroups(userId, accountId, teamId)
//         .then((result) => {
//             expect(result).not.toHaveProperty('message');
//         })
//     })
// })

describe('isUserMemberOfATeam', () => {

    test('isUserMemberOfATeam_shouldReturn_successMessageForValidInput', () => {
        var userId = 1;
        var teamId = 1;
        return profileUtils.isUserMemberOfATeam(userId, teamId)
            .then((result) => {
                expect(result).not.toHaveProperty('message');
            });
    });


    test('isUserMemberOfATeam_shouldReturn_errorMessageForInvalidInputs', () => {
        var userId = 2;
        var teamId = 12;
        return profileUtils.isUserMemberOfATeam(userId, teamId)
            .catch((error) => {
                expect(error).toHaveProperty('message');
            });
    });

    test('isUserMemberOfATeam_shouldReturn_errorMessageForMissingInputs', () => {
        var userId = 2;
        return profileUtils.isUserMemberOfATeam(userId, '')
            .catch((error) => {
                expect(error).toHaveProperty('message');
            });
    });

});

describe('isAccountLocked', () => {

    test('isAccountLocked_shouldReturn_successMessageForValidInput', () => {
        var accountId = 13;
        var teamId = 5;
        return profileUtils.isAccountLocked(accountId, teamId)
            .then((result) => {
                expect(result).not.toHaveProperty('message');
            });
    });


    test('isAccountLocked_shouldReturn_errorMessageForInvalidInputs', () => {
        var accountId = 2;
        var teamId = 4;
        return profileUtils.isAccountLocked(accountId, teamId)
            .catch((error) => {
                expect(error).toHaveProperty('message');
            });
    });

    test('isAccountLocked_shouldReturn_errorMessageForMissingInputs', () => {
        var accountId = 2;
        return profileUtils.isAccountLocked(accountId, '')
            .catch((error) => {
                expect(error).toHaveProperty('message');
            });
    });

});

describe('getFacebookJoinedGroups', () => {

    test('getFacebookJoinedGroups_shouldReturn_successMessageForValidInput', () => {
        var accountId = 5;
        var userId = 1;
        var teamId = 1;
        return profileUtils.getFacebookGroups(userId, accountId, teamId)
            .then((result) => {
                expect(result).not.toHaveProperty('message');
            });
    });

    test('getFacebookJoinedGroups_shouldReturn_errorMessageForInvalidInputs', () => {
        var accountId = 8;
        var userId = 2;
        var teamId = 1;
        return profileUtils.getFacebookGroups(userId, accountId, teamId)
            .catch((error) => {
                expect(error).toHaveProperty('message');
            });
    });

    test('getFacebookJoinedGroups_shouldReturn_errorMessageForMissingInputs', () => {
        var userId = 2;
        var teamId = 1;
        return profileUtils.getFacebookGroups(userId, '', teamId)
            .catch((error) => {
                expect(error).toHaveProperty('message');
            });
    });

});

describe('getOwnFacebookGroups', () => {

    test('getOwnFacebookGroups_shouldReturn_successMessageForValidInput', () => {
        var code = 'AQCENvwQsGeZ2Cd0AWwxLbytiSactVSMXdxNwavnguGZm0qjzk65evGSLx866-OiMwwHT9FQOPT1wkdNy9Gt8eeDpUfbH2a5hnGkkS-I9lAB7lPp7Ra-QJYqrBYpYVfY8LFbOVAKzB8FJvVuGYJPlElICHznFNFHPBqBjU4p8KEh7NF2SDKr-8_PDAOLgPHERjXM2JW0eFlqFpC5gyiAbGii0cl_9FDxvEQqe3iArfFioDk2MlGHDH1M-t-oPItCQMvurV7G-okhMVfKM4b97wR-P4vLk1PQ_m2D_-yqNCPUZKSC5f7yobkmUbVIwPPAuorCNq-AjyTiN3Bdf37nUURi';
        return profileUtils.getOwnFacebookGroups(code)
            .then((result) => {
                expect(result).not.toHaveProperty('message');
            });
    });

    test('getOwnFacebookGroups_shouldReturn_errorMessageForInvalidInputs', () => {
        var code = 'sdfsdfgrgdgdesggfdgtggdgfgg';
        return profileUtils.getOwnFacebookGroups(code)
            .catch((error) => {
                expect(error).toHaveProperty('message');
            });
    });

    test('getOwnFacebookGroups_shouldReturn_errorMessageForMissingInputs', () => {
        return profileUtils.getOwnFacebookGroups()
            .catch((error) => {
                expect(error).toHaveProperty('message');
            });
    });

});

describe('getInstaBusinessAccount', () => {

    test('getInstaBusinessAccount_shouldReturn_successMessageForValidInput', () => {
        var code = '10471078746.7099aa0.cbc101d1c67c448d9ff6390afda472b5';
        return profileUtils.getInstaBusinessAccount(code)
            .then((result) => {
                expect(result).not.toHaveProperty('message');
            });
    });

    test('getInstaBusinessAccount_shouldReturn_errorMessageForInvalidInputs', () => {
        var code = 'fasfsdgrgergdxvgrdvregr';
        return profileUtils.getInstaBusinessAccount(code)
            .catch((error) => {
                expect(error).toHaveProperty('message');
            });
    });

    test('getInstaBusinessAccount_shouldReturn_errorMessageForMissingInputs', () => {
        return profileUtils.getInstaBusinessAccount('')
            .catch((error) => {
                expect(error).toHaveProperty('message');
            });
    });

});

describe('getcompanyProfileDetails', () => {

    test('getcompanyProfileDetails_shouldReturn_successMessageForValidInput', () => {
        var code = 'AQT-i2cMmTfoXFZu5njO3Eiw1vvsKihRnLoKcJToHOdZxQcG-UHM5PmT63ooOf_7x6Q7xb4HuZfL2MYlP2grgMC6MMBOCk30sg2Fxa8pwIUD-QdQSKXe6Fz-erofhYkzR97FKwzAOpjcg9NAHXsaXbXGWGuesDe6djXZeSEOE8VE9SD_39CJSltY42MaGw';
        return profileUtils.getcompanyProfileDetails(code)
            .then((result) => {
                expect(result).not.toHaveProperty('message');
            });
    });

    test('getcompanyProfileDetails_shouldReturn_errorMessageForInvalidInputs', () => {
        var code = 'ggrsdgrdgzergdrsgxdgregdgg';
        return profileUtils.getcompanyProfileDetails(code)
            .catch((error) => {
                expect(error).toHaveProperty('message');
            });
    });

    test('getcompanyProfileDetails_shouldReturn_errorMessageForMissingInputs', () => {
        return profileUtils.getcompanyProfileDetails('')
            .catch((error) => {
                expect(error).toHaveProperty('message');
            });
    });

});

describe('getYoutubeChannels', () => {

    test('getYoutubeChannels_shouldReturn_successMessageForValidInput', () => {
        var code = '4/OAE9pHCIrviHrP3yuPxGnZjdIP04nmuzq5996vtsv--vnZUQRITwuSd0EBbMqOPxh_JCTVFJmcTjHJN4rzIU0QY';
        return profileUtils.getYoutubeChannels(code)
            .then((result) => {
                expect(result).not.toHaveProperty('message');
            });
    });

    test('getYoutubeChannels_shouldReturn_errorMessageForInvalidInputs', () => {
        var code = '4/OAE9pHCIrviHrP3yuPxGnZjdIP04nmuzq5996vtsv--vnZUQRITwuSd0EBbMqOPxh_JCTVFJmcTjHJN4r';
        return profileUtils.getYoutubeChannels(code)
            .catch((error) => {
                expect(error).toHaveProperty('message');
            });
    });

    test('getYoutubeChannels_shouldReturn_errorMessageForMissingInputs', () => {
        return profileUtils.getYoutubeChannels('')
            .catch((error) => {
                expect(error).toHaveProperty('message');
            });
    });

});

describe('getGoogleAnalyticAccounts', () => {

    test('getGoogleAnalyticAccounts_shouldReturn_successMessageForValidInput', () => {
        var code = '4/OAFLZePCQ6bvoplJpHzx7t-iZhDn33RYs9nqo1C4c26xkp5id8H_BHyzyUP7o35quqpOVT6pCy-u-Ia1Qs7kQLY';
        return profileUtils.getGoogleAnalyticAccounts(code)
            .then((result) => {
                expect(result).not.toHaveProperty('message');
            });
    });

    test('getGoogleAnalyticAccounts_shouldReturn_errorMessageForInvalidInputs', () => {
        var code = '4/OAFLZePCQ6bvoplJpHzx7t-iZhDn33RYs9nqo1C4c26xkp5id8H_BHyzyUP7o35quqpOVT6pCy-u';
        return profileUtils.getGoogleAnalyticAccounts(code)
            .catch((error) => {
                expect(error).toHaveProperty('message');
            });
    });

    test('getGoogleAnalyticAccounts_shouldReturn_errorMessageForMissingInputs', () => {
        return profileUtils.getGoogleAnalyticAccounts('')
            .catch((error) => {
                expect(error).toHaveProperty('message');
            });
    });

});

describe('fetchNewPinterestBoards', () => {

    test('fetchNewPinterestBoards_shouldReturn_successMessageForValidInput', () => {
        var accountId = 4;
        var access_token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbiI6eyJ1c2VyX2lkIjoxLCJlbWFpbCI6InN1cmVzaGJhYnVAZ2xvYnVzc29mdC5pbiIsInBob25lX25vIjoiMCIsImZpcnN0X25hbWUiOiJTdXJlc2giLCJsYXN0X25hbWUiOiJCYWJ1IiwicHJvZmlsZV9waWN0dXJlIjoiaHR0cHM6Ly9saDYuZ29vZ2xldXNlcmNvbnRlbnQuY29tLy1lWW5tbkk2THhaQS9BQUFBQUFBQUFBSS9BQUFBQUFBQUFCVS9NUHRvdmtpLW9vWS9waG90by5qcGciLCJpc19hY2NvdW50X2xvY2tlZCI6ZmFsc2UsImlzX2FkbWluX3VzZXIiOnRydWUsIkFjdGl2YXRpb25zIjp7ImlkIjoxLCJsYXN0X2xvZ2luIjoiMjAxOS0wNC0yNSAwODoyOToxOSIsInVzZXJfcGxhbiI6NiwicGF5bWVudF90eXBlIjoxLCJhY2NvdW50X2V4cGlyZV9kYXRlIjoiMjAxOS0wNS0yNSAwODoyMzo0MyIsInNpZ251cF90eXBlIjoxLCJhY3RpdmF0aW9uX3N0YXR1cyI6MSwiYWN0aXZhdGVfMnN0ZXBfdmVyaWZpY2F0aW9uIjpmYWxzZSwiZW1haWxfdmFsaWRhdGVfdG9rZW4iOiI3MDQxMWZlMC02NzMzLTExZTktYTAwZC0zZmQ4OGJjYzI0YTUiLCJmb3Jnb3RfcGFzc3dvcmRfdmFsaWRhdGVfdG9rZW4iOiI3MDQxMWZlMS02NzMzLTExZTktYTAwZC0zZmQ4OGJjYzI0YTUiLCJmb3Jnb3RfcGFzc3dvcmRfdG9rZW5fZXhwaXJlIjoiMjAxOS0wNC0yNiAwODoyMzo0MyJ9LCJ1c2VyUGxhbkRldGFpbHMiOnsiaWQiOjcsInBsYW5faWQiOjYsInBsYW5fbmFtZSI6IkdvbGQiLCJwbGFuX3ByaWNlIjoiNzkuOTkiLCJhY2NvdW50X2NvdW50Ijo1MDAsIm1lbWJlcl9jb3VudCI6ODAsImF2YWlsYWJsZV9uZXR3b3JrIjoiMS00LTUtNi05LTEwLTExLTEyIiwiYnJvd3Nlcl9leHRlbnNpb24iOnRydWUsInNjaGVkdWxpbmdfcG9zdGluZyI6dHJ1ZSwibW9iaWxlX2FwcHMiOnRydWUsInN1cHBvcnRfMjRfNyI6dHJ1ZSwiY3JtIjp0cnVlLCJjYWxlbmRhciI6dHJ1ZSwicnNzX2ZlZWRzIjp0cnVlLCJzb2NpYWxfcmVwb3J0Ijp0cnVlLCJkaXNjb3ZlcnkiOnRydWUsInR3aXR0ZXJfZW5nYWdlbWVudCI6dHJ1ZSwibGlua19zaG9ydGVuaW5nIjp0cnVlLCJzaGFyZWF0aG9uIjp0cnVlLCJjb250ZW50X3N0dWRpbyI6dHJ1ZSwidGVhbV9yZXBvcnQiOnRydWUsImJvYXJkX21lIjp0cnVlLCJzaGFyZV9saWJyYXJ5Ijp0cnVlLCJjdXN0b21fcmVwb3J0IjpmYWxzZSwibWF4aW11bV9zY2hlZHVsZSI6MzAwLCJtYXhpbXVtX3JlZmVyYWxfY291bnQiOjN9fSwiaGVhZGVyIjp7InR5cCI6IkpXVCIsImFsZyI6ImFlcy0yNTYtY2JjIn0sImlhdCI6MTU1NjE4MDk1OSwiZXhwIjoxNTU2MjY3MzU5fQ.70Lezz6goukkaA0aoujAy8VcHA80qVVEIumRih5olAU";
        return profileUtils.getNewBoards(accountId, access_token)
            .then((result) => {
                expect(result).toHaveProperty('boards');
            });
    });

    test('fetchNewPinterestBoards_shouldReturn_errorMessageForInvalidInputs', () => {
        var accountId = 3;
        var access_token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbiI6eyJ1c2VyX2lkIjoxLCJlbWFpbCI6InN1cmVzaGJhYnVAZ2xvYnVzc29mdC5pbiIsInBob25lX25vIjoiMCIsImZpcnN0X25hbWUiOiJTdXJlc2giLCJsYXN0X25hbWUiOiJCYWJ1IiwicHJvZmlsZV9waWN0dXJlIjoiaHR0cHM6Ly9saDYuZ29vZ2xldXNlcmNvbnRlbnQuY29tLy1lWW5tbkk2THhaQS9BQUFBQUFBQUFBSS9BQUFBQUFBQUFCVS9NUHRvdmtpLW9vWS9waG90by5qcGciLCJpc19hY2NvdW50X2xvY2tlZCI6ZmFsc2UsImlzX2FkbWluX3VzZXIiOnRydWUsIkFjdGl2YXRpb25zIjp7ImlkIjoxLCJsYXN0X2xvZ2luIjoiMjAxOS0wNC0yNSAwODoyOToxOSIsInVzZXJfcGxhbiI6NiwicGF5bWVudF90eXBlIjoxLCJhY2NvdW50X2V4cGlyZV9kYXRlIjoiMjAxOS0wNS0yNSAwODoyMzo0MyIsInNpZ251cF90eXBlIjoxLCJhY3RpdmF0aW9uX3N0YXR1cyI6MSwiYWN0aXZhdGVfMnN0ZXBfdmVyaWZpY2F0aW9uIjpmYWxzZSwiZW1haWxfdmFsaWRhdGVfdG9rZW4iOiI3MDQxMWZlMC02NzMzLTExZTktYTAwZC0zZmQ4OGJjYzI0YTUiLCJmb3Jnb3RfcGFzc3dvcmRfdmFsaWRhdGVfdG9rZW4iOiI3MDQxMWZlMS02NzMzLTExZTktYTAwZC0zZmQ4OGJjYzI0YTUiLCJmb3Jnb3RfcGFzc3dvcmRfdG9rZW5fZXhwaXJlIjoiMjAxOS0wNC0yNiAwODoyMzo0MyJ9LCJ1c2VyUGxhbkRldGFpbHMiOnsiaWQiOjcsInBsYW5faWQiOjYsInBsYW5fbmFtZSI6IkdvbGQiLCJwbGFuX3ByaWNlIjoiNzkuOTkiLCJhY2NvdW50X2NvdW50Ijo1MDAsIm1lbWJlcl9jb3VudCI6ODAsImF2YWlsYWJsZV9uZXR3b3JrIjoiMS00LTUtNi05LTEwLTExLTEyIiwiYnJvd3Nlcl9leHRlbnNpb24iOnRydWUsInNjaGVkdWxpbmdfcG9zdGluZyI6dHJ1ZSwibW9iaWxlX2FwcHMiOnRydWUsInN1cHBvcnRfMjRfNyI6dHJ1ZSwiY3JtIjp0cnVlLCJjYWxlbmRhciI6dHJ1ZSwicnNzX2ZlZWRzIjp0cnVlLCJzb2NpYWxfcmVwb3J0Ijp0cnVlLCJkaXNjb3ZlcnkiOnRydWUsInR3aXR0ZXJfZW5nYWdlbWVudCI6dHJ1ZSwibGlua19zaG9ydGVuaW5nIjp0cnVlLCJzaGFyZWF0aG9uIjp0cnVlLCJjb250ZW50X3N0dWRpbyI6dHJ1ZSwidGVhbV9yZXBvcnQiOnRydWUsImJvYXJkX21lIjp0cnVlLCJzaGFyZV9saWJyYXJ5Ijp0cnVlLCJjdXN0b21fcmVwb3J0IjpmYWxzZSwibWF4aW11bV9zY2hlZHVsZSI6MzAwLCJtYXhpbXVtX3JlZmVyYWxfY291bnQiOjN9fSwiaGVhZGVyIjp7InR5cCI6IkpXVCIsImFsZyI6ImFlcy0yNTYtY2JjIn0sImlhdCI6MTU1NjE4MDk1OSwiZXhwIjoxNTU2MjY3MzU5fQ.70Lezz6goukkaA0aoujAy8VcHA80qVVEIumRih5olAU";

        return profileUtils.getNewBoards(accountId, access_token)
            .catch((error) => {
                expect(error).toHaveProperty('message');
            });
    });

    test('fetchNewPinterestBoards_shouldReturn_errorMessageForMissingInputs', () => {
        var accountId = 1;

        return profileUtils.getNewBoards(accountId, '')
            .catch((error) => {
                expect(error).toHaveProperty('message');
            });
    });

});

describe('createPinterestBoards', () => {

    test('createPinterestBoards_shouldReturn_successMessageForValidInput', () => {
        var accountId = 12;
        var boardName = 'string123';
        var description = 'string connector';
        return profileUtils.createPinterestBoards(accountId, boardName, description)
            .then((result) => {
                expect(result).not.toHaveProperty('message');
            });
    });

    test('createPinterestBoards_shouldReturn_errorMessageForInvalidInputs', () => {
        var accountId = 4;
        var boardName = 4;
        var description = 'string connector';
        return profileUtils.createPinterestBoards(accountId, boardName, description)
            .catch((error) => {
                expect(error).toHaveProperty('message');
            });
    });

    test('createPinterestBoards_shouldReturn_errorMessageForMissingInputs', () => {
        var accountId = 12;
        return profileUtils.createPinterestBoards(accountId, '', '')
            .catch((error) => {
                expect(error).toHaveProperty('message');
            });
    });

});

describe('deletePinterestBoards', () => {

    test('deletePinterestBoards_shouldReturn_successMessageForValidInput', () => {
        var accountId = 12;
        var boardId = 772367473533359814;
        return profileUtils.deletePinterestBoards(accountId, boardId)
            .then((result) => {
                expect(result).not.toHaveProperty('message');
            });
    });

    test('deletePinterestBoards_shouldReturn_errorMessageForInvalidInputs', () => {
        var accountId = 12;
        var boardId = 772367473533360441;
        return profileUtils.deletePinterestBoards(accountId, boardId)
            .catch((error) => {
                expect(error).toHaveProperty('message');
            });
    });

    test('deletePinterestBoards_shouldReturn_errorMessageForMissingInputs', () => {
        var accountId = 4;
        return profileUtils.deletePinterestBoards(accountId, '')
            .catch((error) => {
                expect(error).toHaveProperty('message');
            });
    });

});

