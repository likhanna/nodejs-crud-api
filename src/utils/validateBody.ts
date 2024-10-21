import { IncomingMessage, ServerResponse } from 'http';
import { ErrorMessages, StatusCodes } from '../constants';
import { responseError } from '../controller';
import { UserDto } from '../types';

export const validateBody = (
  buffer: Buffer[],
  response: ServerResponse<IncomingMessage>,
  callback: (body: UserDto) => void,
): void => {
  try {
    const body = JSON.parse(Buffer.concat(buffer).toString());

    const isCheckFieldsExist: boolean =
      'username' in body && 'age' in body && 'hobbies' in body;
    const isCheckFieldsTypes: boolean =
      typeof body.username === 'string' &&
      typeof body.age === 'number' &&
      Array.isArray(body.hobbies) &&
      body.hobbies.every(
        (hobby: unknown): boolean => typeof hobby === 'string',
      );

    if (isCheckFieldsExist && isCheckFieldsTypes) {
      callback(body);
      return;
    }

    responseError(
      response,
      StatusCodes.BAD_REQUEST,
      ErrorMessages.INVALID_BODY,
    );
  } catch (error) {
    responseError(
      response,
      StatusCodes.BAD_REQUEST,
      ErrorMessages.INVALID_BODY,
    );
  }
};
