import { v4 as UUID } from 'uuid';
import { ServiceMethod, User, UserDto } from '../types';
import { responseSuccess, responseError } from '../controller';
import {
  ErrorMessages,
  HTTPMethods,
  StatusCodes,
  Endpoints,
} from '../constants';
import { getAndValidateId, validateBody } from '../utils';

export class UserService {
  public data: User[] = [];

  private get: ServiceMethod = async (request, response) => {
    const { url } = request;
    if (url === Endpoints.USERS) {
      return responseSuccess(response, StatusCodes.OK, this.data);
    }

    const id: string | null = getAndValidateId(url as string);
    if (!id) {
      return responseError(
        response,
        StatusCodes.BAD_REQUEST,
        ErrorMessages.INVALID_ID,
      );
    }

    const user: User | undefined = this.data.find(
      (item: User): boolean => item.id === id,
    );
    if (!user) {
      return responseError(
        response,
        StatusCodes.NOT_FOUND,
        ErrorMessages.ID_NOT_FOUND,
      );
    }

    return responseSuccess(response, StatusCodes.OK, user);
  };

  private create: ServiceMethod = async (request, response) => {
    const { url } = request;
    if (url !== Endpoints.USERS) {
      return responseError(
        response,
        StatusCodes.NOT_FOUND,
        ErrorMessages.INVALID_ENDPOINT,
      );
    }

    const buffer: Buffer[] = [];
    request
      .on('data', (chunk: Buffer): void => {
        buffer.push(chunk);
      })
      .on('end', (): void => {
        validateBody(buffer, response, (body: UserDto): void => {
          const newUser: User = { ...body, id: UUID() };
          this.data.push(newUser);
          process.send &&
            process.send({ method: HTTPMethods.POST, data: newUser });

          return responseSuccess(response, StatusCodes.CREATED, newUser);
        });
      });
  };

  private update: ServiceMethod = async (request, response) => {
    const { url } = request;

    const id: string | null = getAndValidateId(url as string);
    if (!id) {
      return responseError(
        response,
        StatusCodes.BAD_REQUEST,
        ErrorMessages.INVALID_ID,
      );
    }

    const user: User | undefined = this.data.find(
      (item: User): boolean => item.id === id,
    );
    if (!user) {
      return responseError(
        response,
        StatusCodes.NOT_FOUND,
        ErrorMessages.ID_NOT_FOUND,
      );
    }

    const buffer: Buffer[] = [];
    request
      .on('data', (chunk: Buffer): void => {
        buffer.push(chunk);
      })
      .on('end', (): void => {
        validateBody(buffer, response, (body: UserDto): void => {
          const updatedUser: User = { ...body, id };
          this.data = this.data.map(
            (item: User): User => (item.id === id ? updatedUser : item),
          );
          process.send &&
            process.send({ method: HTTPMethods.PUT, data: updatedUser });

          return responseSuccess(response, StatusCodes.OK, updatedUser);
        });
      });
  };

  private delete: ServiceMethod = async (request, response) => {
    const { url } = request;

    const id: string | null = getAndValidateId(url as string);
    if (!id) {
      return responseError(
        response,
        StatusCodes.BAD_REQUEST,
        ErrorMessages.INVALID_ID,
      );
    }

    const user: User | undefined = this.data.find(
      (item: User): boolean => item.id === id,
    );
    if (!user) {
      return responseError(
        response,
        StatusCodes.NOT_FOUND,
        ErrorMessages.ID_NOT_FOUND,
      );
    }

    this.data = this.data.filter((item: User): boolean => item.id !== user.id);
    process.send && process.send({ method: HTTPMethods.DELETE, data: user });

    return responseSuccess(response, StatusCodes.NO_CONTENT);
  };

  public execute: ServiceMethod = async (request, response) => {
    try {
      switch (request.method) {
        case HTTPMethods.GET:
          this.get(request, response);
          break;
        case HTTPMethods.POST:
          this.create(request, response);
          break;
        case HTTPMethods.PUT:
          this.update(request, response);
          break;
        case HTTPMethods.DELETE:
          this.delete(request, response);
          break;
        default:
          throw new Error(ErrorMessages.INVALID_METHOD);
      }
    } catch (error) {
      if (error instanceof Error) {
        responseError(response, StatusCodes.INTERNAL_ERROR, error.message);
      }
    }
  };
}
