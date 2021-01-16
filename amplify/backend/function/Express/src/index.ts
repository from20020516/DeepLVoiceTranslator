import awsServerlessExpress from 'aws-serverless-express'
import app from './app'
import { APIGatewayProxyHandler } from 'aws-lambda'

const server = awsServerlessExpress.createServer(app)

export const handler: APIGatewayProxyHandler = (event, context) => {
    console.log(`EVENT: ${JSON.stringify(event)}`)
    awsServerlessExpress.proxy(server, event, context)
}
