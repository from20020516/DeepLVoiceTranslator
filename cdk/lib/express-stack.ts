import { Stack, StackProps, aws_lambda, aws_lambda_nodejs, } from 'aws-cdk-lib'
import { Construct } from 'constructs'
import dotenv from 'dotenv'
dotenv.config()

export class ExpressStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props)

    const app = new aws_lambda_nodejs.NodejsFunction(this, 'app', {
      environment: {
        app_secret: process.env.app_secret!,
        auth_key: process.env.auth_key!,
        twitter_callback_origin: process.env.twitter_callback_origin!,
        twitter_consumer_key: process.env.twitter_consumer_key!,
        twitter_consumer_secret: process.env.twitter_consumer_secret!,
      }
    })
    app.addFunctionUrl({
      /** Application provides CORS settings. */
      authType: aws_lambda.FunctionUrlAuthType.NONE,
    })
  }
}
