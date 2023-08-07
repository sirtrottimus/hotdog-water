import { Response } from 'express';
import { UserInt } from '../database/schema/User';
import FunctionLog from '../database/schema/FunctionLog';

// Define an array of function names to be logged
const functionsToLog = [
  'create',
  'delete',
  'update',
  'getAllAudits',
  'getAuditById',
  'post',
];

export async function handleRequest(
  res: Response,
  serviceFunction: Function,
  user: UserInt,
  params: { [key: string]: any },
  controller: string
) {
  try {
    const response = await serviceFunction({ userId: user._id, ...params });

    // Check if the current function should be logged
    if (functionsToLog.includes(serviceFunction.name) || !response.success) {
      // Determine the success status and error message
      const success = response.success ? true : false;
      const errorMessage = response.error || (response.msg ? response.msg : '');
      // Log the function call to the database
      await logToDatabase(
        controller,
        user,
        serviceFunction.name,
        success,
        errorMessage,
        params,
        response.data ?? response.msg ?? response.error ?? {}
      );
    }

    if (!response.success) {
      if (response.error) {
        throw new Error(response.error);
      }
      if (response.msg) {
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.status(405).send({
          msg: `${response.msg} (This response was logged.)`,
        });
        return;
      }
    }
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.send(response.data);
  } catch (error) {
    console.error(
      `[CONTROLLER/${controller.toUpperCase()}/${serviceFunction.name.toUpperCase()}]:`,
      error
    );

    logToDatabase(
      controller,
      user,
      serviceFunction.name,
      false,
      (error as Error).message,
      params,
      { 'Failed to process request': 'See server logs for more information.' }
    );

    res.status(400).send({
      msg: 'An error occurred while processing your request. For more information, please contact the system administrator. (This response was logged.)',
    });
  }
}

// Function to log the function call to the database
export async function logToDatabase(
  controller: string,
  user: UserInt,
  functionName: string,
  success: boolean,
  errorMessage: string,
  params: { [key: string]: any },
  data: { [key: string]: any }
) {
  try {
    const functionLog = new FunctionLog({
      user,
      controller,
      functionName,
      success,
      errorMessage,
      params,
      data,
    });

    await functionLog.save();
  } catch (error) {
    console.error(`Error logging ${functionName} call to the database:`, error);
    logToDatabase(
      'helpers',
      user,
      'logToDatabase',
      false,
      (error as Error).message,
      {},
      {}
    );
  }
}
