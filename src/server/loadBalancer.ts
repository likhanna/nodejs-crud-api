import cluster, { Worker } from 'cluster';
import { createServer, IncomingMessage, ServerResponse, request as makeRequest, ClientRequest } from 'http';
import { cpus } from 'os';

import { Server } from './server';
import { getPort } from '../utils';
import { UserService } from '../services';
import { responseError } from '../controller';
import { DBSchema, User, WorkerMsg } from '../types';
import { ErrorMessages, HTTPMethods, StatusCodes } from '../constants';

export class LoadBalancer {
  private _currentWorker: number = 0;
  private _workers: Worker[] = [];
  private _dataBase: DBSchema = {
    users: [],
  };

  constructor() {}

  private balancer = createServer(
    async (request: IncomingMessage, response: ServerResponse<IncomingMessage>): Promise<void> => {
      try {
        const endpoint: string = `http://localhost:${getPort() + this._currentWorker}${request.url}`;

        const clientRequest: ClientRequest = makeRequest(
          endpoint,
          { method: request.method, headers: request.headers },
          (clientResponse: IncomingMessage): void => {
            if (clientResponse.statusCode) {
              response.writeHead(clientResponse.statusCode, clientResponse.statusMessage, clientResponse.headers);
            }

            clientResponse.pipe(response);
          },
        );

        request.pipe(clientRequest);

        const cpuQty = cpus().length;
        this._currentWorker = this._currentWorker === cpuQty ? 0 : this._currentWorker + 1;
      } catch {
        responseError(response, StatusCodes.INTERNAL_ERROR, ErrorMessages.INTERNAL_ERROR);
      }
    },
  );

  private updateDB = ({ method, data }: WorkerMsg): void => {
    const isUserData: boolean = 'username' in data && 'age' in data && 'hobbies' in data;

    if (isUserData) {
      switch (method) {
        case HTTPMethods.POST:
          this._dataBase.users.push(data);
          break;
        case HTTPMethods.PUT:
          this._dataBase.users = this._dataBase.users.map((user: User): User => (user.id === data.id ? data : user));
          break;
        case HTTPMethods.DELETE:
          this._dataBase.users = this._dataBase.users.filter((user: User): boolean => user.id !== data.id);
          break;
        default:
          break;
      }
      this._workers.forEach((worker: Worker): boolean => worker.send(this._dataBase));
    }
  };

  private start = (mode?: string): void => {
    if (mode === 'multi') {
      if (cluster.isPrimary) {
        this.balancer.listen(getPort());
        const cpuQty = cpus().length;

        for (let i = 0; i < cpuQty; i++) {
          const worker: Worker = cluster.fork({ increment: i + 1 });

          worker.on('message', (msg: WorkerMsg): void => {
            this.updateDB(msg);
          });

          this._workers.push(worker);
        }
      } else {
        const server = new Server(getPort(), new UserService());
        server.start();

        process.on('message', (DB: DBSchema): void => {
          server.setData(DB.users);
        });
      }
    } else {
      const server = new Server(getPort(), new UserService());
      server.start();
    }
  };

  static run(mode?: string) {
    new LoadBalancer().start(mode);
  }
}
