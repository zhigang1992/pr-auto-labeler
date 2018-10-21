import { Application } from 'probot'
// @ts-ignore
import getConfig from 'probot-config'

export = (app: Application) => {
  app.on(['pull_request.opened', 'pull_request.edited'], async (context) => {
    const config = await getConfig(context, 'pr-title.yml');
    if (config && typeof config.regex === 'string') {
      app.log(config.regex)
      app.log(context.payload.pull_request)
    } else {
      app.log('config file not found')
    }

  });
}
