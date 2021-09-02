import request from 'supertest';
import { REGISTER, SERVER } from '../constants';

describe('Check registration', () => {
  test('If valid user', async () => {
    await request(SERVER)
      .post(REGISTER)
      .send({
        username: 'testRegister',
        email: 'test-register@test.com',
        password: 'String_12345',
        firstName: 'test',
        lastName: 'test',
        dateOfBirth: '1970-01-01',
        profilePicture: 'https://i.imgur.com/fdzLeWY.png',
        phoneCode: '+91',
        phoneNo: '1234567890',
        country: 'in',
        timeZone: '+5:30',
        aboutMe: 'test',
      })
      .set('accept', 'application/json')
      .set('Content-Type', 'application/json')
      .expect(200)
      .expect(({ body }) => expect(body.code).toBe(400));
  });

  test('If user already exist', async () => {
    await request(SERVER)
      .post(REGISTER)
      .send({
        username: 'testRegister',
        email: 'test-register@test.com',
        password: 'String_12345',
        firstName: 'test',
        lastName: 'test',
        dateOfBirth: '1970-01-01',
        profilePicture: 'https://i.imgur.com/fdzLeWY.png',
        phoneCode: '+91',
        phoneNo: '1234567890',
        country: 'in',
        timeZone: '+5:30',
        aboutMe: 'test',
      })
      .set('accept', 'application/json')
      .set('Content-Type', 'application/json')
      .expect(200)
      .expect(({ body }) => expect(body.code).toBe(400));
  });

  test('If request user is not valid', async () => {
    await request(SERVER)
      .post(REGISTER)
      .send({
        email: 'test-register@test.com',
        password: 'String_12345',
        firstName: 'test',
        lastName: 'test',
        dateOfBirth: '1970-01-01',
        profilePicture: 'https://i.imgur.com/fdzLeWY.png',
        phoneCode: '+91',
        phoneNo: '1234567890',
        country: 'in',
        timeZone: '+5:30',
        aboutMe: 'test',
      })
      .set('accept', 'application/json')
      .set('Content-Type', 'application/json')
      .expect(200)
      .expect(({ body }) => expect(body.code).toBe(401));

    await request(SERVER)
      .post(REGISTER)
      .send({
        username: 'testRegister',
        email: 123,
        password: 'String_12345',
        firstName: 'test',
        lastName: 'test',
        dateOfBirth: '1970-01-01',
        profilePicture: 'https://i.imgur.com/fdzLeWY.png',
        phoneCode: '+91',
        phoneNo: '1234567890',
        country: 'in',
        timeZone: '+5:30',
        aboutMe: 'test',
      })
      .set('accept', 'application/json')
      .set('Content-Type', 'application/json')
      .expect(200)
      .expect(({ body }) => expect(body.code).toBe(401));

    await request(SERVER)
      .post(REGISTER)
      .send({
        username: 'testRegister',
        email: 'testRegister',
        password: 'String_12345',
        firstName: 'test',
        lastName: 'test',
        dateOfBirth: '1970-01-01',
        profilePicture: 'https://i.imgur.com/fdzLeWY.png',
        phoneCode: '+91',
        phoneNo: '1234567890',
        country: 'in',
        timeZone: '+5:30',
        aboutMe: 'test',
      })
      .set('accept', 'application/json')
      .set('Content-Type', 'application/json')
      .expect(200)
      .expect(({ body }) => expect(body.code).toBe(401));
  });
});
