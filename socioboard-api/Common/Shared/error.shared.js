import RESPONSE_CONSTANTS from '../Constants/response.constants.js';

/**
 * @export
 * @class ErrorExtendable
 * @extends Error
 */
export class ErrorExtendable extends Error {
  /**
   * @constructor
   * @param {object} message
   * @param {number} statusCode
   */
  constructor({message, statusCode}) {
    super();

    this.message = message;

    this.statusCode = statusCode;
  }
}

/**
 * @export
 * @class UnauthorizedException
 * @extends ErrorExtendable
 */
export class UnauthorizedException extends ErrorExtendable {
  /**
   * @constructor
   * @param {object} message
   * @param {number} statusCode
   */
  constructor(message, statusCode = RESPONSE_CONSTANTS.STATUS_CODES.UNAUTHORIZED) {
    super({message, statusCode});
  }
}

/**
 * @export
 * @class BadRequestException
 * @extends ErrorExtendable
 */
export class BadRequestException extends ErrorExtendable {
  /**
   * @constructor
   * @param {object} message
   * @param {number} statusCode
   */
  constructor(message, statusCode = RESPONSE_CONSTANTS.STATUS_CODES.BAD_REQUEST) {
    super({message, statusCode});
  }
}

/**
 * @export
 * @class NotFoundException
 * @extends ErrorExtendable
 */
export class NotFoundException extends ErrorExtendable {
  /**
   * @constructor
   * @param {object} message
   * @param {number} statusCode
   */
  constructor(message, statusCode = RESPONSE_CONSTANTS.STATUS_CODES.NOT_FOUND) {
    super({message, statusCode});
  }
}

/**
 * @export
 * @class InternalServerErrorException
 * @extends ErrorExtendable
 */
export class InternalServerErrorException extends ErrorExtendable {
  /**
   * @constructor
   * @param {object} message
   * @param {number} statusCode
   */
  constructor(
    message,
    statusCode = RESPONSE_CONSTANTS.STATUS_CODES.INTERNAL_SERVER_ERROR
  ) {
    super({message, statusCode});
  }
}
