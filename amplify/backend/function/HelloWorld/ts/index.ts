import { APIGatewayProxyHandler } from 'aws-lambda'

export const handler: APIGatewayProxyHandler = (event, context, callback) => {
    callback(null, { statusCode: 200, body: JSON.stringify({ event, context }) })
}
