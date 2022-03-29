import Joi from 'joi';

import { BadRequestException } from '../../../Common/Shared/error.shared.js';
import RESPONSE_CONSTANTS from '../../../Common/Constants/response.constants.js';

/**
 * @class TikTokValidator
 */
class TikTokValidator {
  _accountId = Joi.number().integer().min(1);

  _accountIds = Joi.array().items(this._accountId.required()).unique().min(1);

  _teamId = Joi.number().integer().min(1);

  _cursor = Joi.string().min(1);

  _max_count = Joi.number().integer().min(1);

  _shareUrl = Joi.string().uri().min(1).max(2048);

  _basicSchema = Joi.object({
    accountId: this._accountId.required(),
    teamId: this._teamId.required(),
  });

  _basicManySchema = Joi.object({
    accountIds: this._accountIds.required(),
    teamId: this._teamId.required(),
  });

  _paginationSchema = (limit, defaultValue) => Joi.object({
    cursor: this._cursor.optional(),
    max_count: this._max_count.max(limit).default(defaultValue),
  }).rename('limit', 'max_count');

  /**
   * Validate the data is it satisfies the schema conditions
   * @param {any} data
   * @returns {object} Validated data or Error
   * @memberof TikTokValidator
   */
  tikTokBasicSchema(data) {
    return this._basicSchema.validateAsync(data);
  }

  /**
   * Validate the data is it satisfies the schema conditions
   * @param {any} data
   * @returns {object} Validated data or Error
   * @memberof TikTokValidator
   */
  tikTokManyBasicSchema(data) {
    return this._basicManySchema.validateAsync(data);
  }

  /**
   * Validate the data is it valid pagination object
   * @param {any} data
   * @returns {object} Validated data or Error
   * @memberof TikTokValidator
   */
  paginationSchema(limit, defaultValue) {
    return data => this._paginationSchema(limit, defaultValue)
      .required()
      .validateAsync(data, {
        stripUnknown: true,
        convert: true,
      });
  }

  /**
   * Validate the data is it valid url
   * @param {any} data
   * @returns {Promise<object>}
   */
  shareUrlSchema(data) {
    return this._shareUrl.required().validateAsync(data);
  }

  /**
   * Validate the file is valid
   * @param {object} fileDetails
   * @param {number} size
   * @param {string[]} mimetypes
   */
  validateFile(fileDetails, {size, mimetypes}) {
    const availableMimetypes = new RegExp(`(${mimetypes.join('|')})$`);

    const fileMimetype = fileDetails['content-type'].split('/')[1];

    if (!availableMimetypes.test(fileMimetype)) {
      throw new BadRequestException(RESPONSE_CONSTANTS.ERROR_MESSAGES.INVALID_FILE_MIMETYPE);
    }

    if (fileDetails['content-length'] > size) {
      throw new BadRequestException(RESPONSE_CONSTANTS.ERROR_MESSAGES.INVALID_FILE_SIZE);
    }
  }
}

export default new TikTokValidator();
