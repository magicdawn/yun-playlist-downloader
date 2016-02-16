'use strict';

const Promise = require('bluebird');
const request = require('superagent');

const Request = request.Request;
Request.prototype.endAsync = Promise.promisify(Request.prototype.end);