import { Application } from 'probot'
// @ts-ignore
import getConfig from 'probot-config'

export = (app: Application) => {
  app.log('App Loaded')
  app.on(['pull_request.opened', 'pull_request.edited'], async (context) => {
    const config = await getConfig(context, 'pr-title.yml');
    if (config && typeof config.regex === 'string') {
      const pullRequest = context.payload.pull_request;
      const title: string = pullRequest.title;
      const checkOptions: any = {
        name: "PR-Title",
        head_branch: '',
        head_sha: pullRequest.head.sha,
        status: 'in_progress',
        output: {
          title: config.message || 'PR-Title does not meet requirement',
          summary: config.message || `The title "${pullRequest.title}" meet requirement.`,
          text: ''
        }
      }
      if ((new RegExp(config.regex)).test(title)) {
        checkOptions.status = 'completed'
        checkOptions.conclusion = 'success'
        checkOptions.completed_at = new Date()
        checkOptions.output.title = 'Ready for review'
        checkOptions.output.summary = 'PR title now meet requirement'
      }
      await context.github.checks.create(context.repo(checkOptions))
    } else {
      context.log('config file not found')
    }
  });
}
