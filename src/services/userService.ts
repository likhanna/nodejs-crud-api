import { v4 as UUID } from 'uuid';
import { validate } from 'uuid';
import { ServiceMethod, User, UserDto } from '../types';
import { responseSuccess, responseError } from '../controller';
import { Endpoints } from '../constants';
import { validateBody } from '../utils';

export class UserService {
  public data: User[] = [];

  private get: ServiceMethod = async (request, response) => {
    const { url } = request;
    if (url === Endpoints.USERS) {
      return responseSuccess(response, 200, this.data);
    }

    const id: string | null = this.getAndValidateID(url as string);
    if (!id) {
      return responseError(response, 400, 'Invalid user id');
    }

    const user: User | undefined = this.data.find(
      (item: User): boolean => item.id === id,
    );
    if (!user) {
      return responseError(response, 404, 'User not exist');
    }

    return responseSuccess(response, 200, user);
  };

  private create: ServiceMethod = async (request, response) => {
    const { url } = request;
    if (url !== Endpoints.USERS) {
      return responseError(response, 404, 'Incorrect url');
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
          process.send && process.send({ method: 'POST', data: newUser });

          return responseSuccess(response, 201, newUser);
        });
      });
  };

  private update: ServiceMethod = async (request, response) => {
    const { url } = request;

    const id: string | null = this.getAndValidateID(url as string);
    if (!id) {
      return responseError(response, 400, 'Invalid user id');
    }

    const user: User | undefined = this.data.find(
      (item: User): boolean => item.id === id,
    );
    if (!user) {
      return responseError(response, 404, 'User not exist');
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
          process.send && process.send({ method: 'PUT', data: updatedUser });

          return responseSuccess(response, 200, updatedUser);
        });
      });
  };

  private delete: ServiceMethod = async (request, response) => {
    const { url } = request;

    const id: string | null = this.getAndValidateID(url as string);
    if (!id) {
      return responseError(response, 400, 'Incorrect user id');
    }

    const user: User | undefined = this.data.find(
      (item: User): boolean => item.id === id,
    );
    if (!user) {
      return responseError(response, 404, 'User not exist');
    }

    this.data = this.data.filter((item: User): boolean => item.id !== user.id);
    process.send && process.send({ method: 'DELETE', data: user });

    return responseSuccess(response, 204);
  };

  public execute: ServiceMethod = async (request, response) => {
    try {
      switch (request.method) {
        case 'GET':
          this.get(request, response);
          break;
        case 'POST':
          this.create(request, response);
          break;
        case 'PUT':
          this.update(request, response);
          break;
        case 'DELETE':
          this.delete(request, response);
          break;
        default:
          throw new Error('INVALID METHOD');
      }
    } catch (error) {
      if (error instanceof Error) {
        responseError(response, 500, error.message);
      }
    }
  };

  private getAndValidateID = (url: string): string | null => {
    const id = url.split('/').at(-1);
    if (!id || !validate(id)) {
      return null;
    }
    return id;
  };
}
