const request = require('supertest');
const app = require('./server');
const config = require('config');
const unitTestLibs = require('../../../library/utility/unitTestLibs');

expect.extend(unitTestLibs);

describe('publish integration', () => {
    test('homepage', (done) => {
        request(app)
            .get('/user')
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function (err, res) {
                if (err)
                    done(err);
                else {
                    console.log(res.body);
                    done();
                }
            });
    });
});

describe('getUploadedFiles', () => {
    test('getUploadedFiles', (done) => {
        request(app)
            .get('/v1/upload/getMediaDetails?teamId=5&privacy=2&pageId=1')
            .set('Accept', 'application/json')
            .set('x-access-token', config.get("jest.access_token"))
            .expect('Content-Type', /json/)
            .expect(200)            
            .end(function (err, res) {
                if (err) {
                    done(err);
                }
                else {                  
                    expect(res.body.code).to.equal(200);  
                    expect(res.body.status).to.equal('success');                  
                    done();
                }
            });
    });
});