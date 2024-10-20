import { IncomingMessage, ServerResponse } from 'http';

class Controller {
  static responseSuccess = (
    response: ServerResponse<IncomingMessage>,
    statusCode: number,
    data?: unknown[] | unknown,
  ): void => {
    response.setHeader('Content-Type', 'application/json');
    response.statusCode = statusCode;
    response.end(JSON.stringify(data));

    console.log(
      `Execution on port: ${process.env.executionPort}, proccess id: #${process.pid}`,
    );
  };

  static responseError = (
    response: ServerResponse<IncomingMessage>,
    statusCode: number,
    errorMessage: string,
  ): void => {
    response.setHeader('Content-Type', 'application/json');
    response.statusMessage = errorMessage;
    response.statusCode = statusCode;
    response.end(JSON.stringify({ message: errorMessage }));

    console.log(
      `Execution on port: ${process.env.executionPort}, proccess id: #${process.pid}`,
    );
  };
}

export const { responseSuccess, responseError } = Controller;
