export const enum Endpoints {
  USERS = '/api/users',
}

export const enum HTTPMethods {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
}

export const enum StatusCodes {
  OK = 200,
  CREATED = 201,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  NOT_FOUND = 404,
  INTERNAL_ERROR = 500,
}

export enum ErrorMessages {
  INTERNAL_ERROR = 'Internal server error',
  INVALID_ENDPOINT = 'Incorrect endpoint',
  INVALID_METHOD = 'Invalid method',
  INVALID_ID = 'Invalid user id',
  INVALID_BODY = 'Invalid user data',
  ID_NOT_FOUND = 'User not found',
}
