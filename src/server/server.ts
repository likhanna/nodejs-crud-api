import { IncomingMessage, ServerResponse, createServer } from 'http';
import { Endpoints } from '../constants';
import { responseError } from '../controller';
import { UserService } from '../services';

export class Server {
  constructor(private userService: UserService) {}

  private server = createServer(
    async (
      request: IncomingMessage,
      response: ServerResponse<IncomingMessage>,
    ): Promise<void> => {
      try {
        const { url } = request;
        console.log('%csrcserverserver.ts:16 url', 'color: #007acc;', url);

        if (url?.startsWith(Endpoints.USERS)) {
          this.userService?.execute(request, response);
        } else {
          throw new Error('Incorrect Endpoint');
        }
      } catch (error) {
        if (error instanceof Error) {
          responseError(response, 404, error.message);
        }
      }
    },
  );

  public start = (): void => {
    this.server.listen(process.env.PORT, (): void => {
      console.log(
        `Server started on port: ${process.env.PORT}, proccess id: #${process.pid}`,
      );
    });
  };
}
