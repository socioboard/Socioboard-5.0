"use strict";

import { stringify } from "qs";
import oauth from "oauth";

export default class Twitter {
  static instance = null;

  _links = {
    oauth_request_token: "https://twitter.com/oauth/request_token",
    oauth_access_token: "https://twitter.com/oauth/access_token",
  };

  _apiUrl = "https://api.twitter.com/1.1";
  _consumerKey = "";
  _consumerSecret = "";
  _callback = "";

  constructor({ consumerKey, consumerSecret, callback, baseUrl = null }) {
    if (Twitter.instance) {
      return Twitter.instance;
    }

    this._apiUrl = baseUrl ?? this._apiUrl;

    this._consumerKey = consumerKey;
    this._consumerSecret = consumerSecret;
    this._callback = callback;

    this._connection = new oauth.OAuth(
      this._links.oauth_request_token,
      this._links.oauth_access_token,
      consumerKey,
      consumerSecret,
      "1.0A",
      callback,
      "HMAC-SHA1"
    );

    Twitter.instance = this;
  }

  getRequest(uri, { token, secret }, query) {
    const url = this.buildRequestUrlWithQuery(uri, query);

    return new Promise((resolve, reject) =>
      this._connection.get(url, token, secret, (error, data, res) => {
        if (error) return reject(error);

        return resolve(JSON.parse(data));
      })
    );
  }

  postRequest(uri, { token, secret }, body) {
    return new Promise((resolve, reject) =>
      this._connection.post(
        this.buildRequestUrl(uri),
        token,
        secret,
        body,
        (error, data) => {
          if (error) return reject(error);

          return resolve(JSON.parse(data));
        }
      )
    );
  }

  buildAuthorizationHeader(uri, { accessToken, refreshToken }, method) {
    return this._connection.authHeader(
      this.buildRequestUrl(uri),
      accessToken,
      refreshToken,
      method
    );
  }

  buildRequestUrl(uri) {
    return `${this._apiUrl}/${uri}.json`;
  }

  buildRequestUrlWithQuery(uri, query) {
    return `${this.buildRequestUrl(uri)}?${stringify(query)}`;
  }

  get getApiUrl() {
    return this._apiUrl;
  }

  set setApiUrl(apiUrl) {
    this._apiUrl = apiUrl;
  }

  set setLink({ name, value }) {
    this._links[name] = value;
  }
}
