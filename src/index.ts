import { Application } from 'probot'
// @ts-ignore
import getConfig from 'probot-config'

export = (app: Application) => {
  app.log('App Loaded')
  app.on(['pull_request.opened', 'pull_request.edited'], async (context) => {
    context.log('Event triggered')
    const config = await getConfig(context, 'pr-title.yml');
    if (config && typeof config.regex === 'string') {
      context.log(config.regex)
      const title: string = context.payload.pull_request.title;
      if ((new RegExp(config.regex)).test(title)) {
        context.log('No action needed')
        return;
      }
      const comment = context.issue({
        body: config.message || "Please correct your PR title"
      })
      context.github.issues.createComment(comment)
    } else {
      context.log('config file not found')
    }
  });
}
