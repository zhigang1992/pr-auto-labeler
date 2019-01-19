import { Application } from "probot";

export = (app: Application) => {
  app.log("App Loaded");
  app.on(
    ["pull_request.opened", "pull_request.edited", "pull_request.synchronize"],
    async context => {
      const labels = (await context.github.issues.listLabelsForRepo(
        context.issue({ per_page: 20 })
      )).data;

      const existingLabels = (await context.github.issues.listLabelsOnIssue(
        context.issue()
      )).data;

      const pullRequest = context.payload.pull_request;
      const title: string = pullRequest.title;
      const existingLabelIds = existingLabels.map(l => l.id);

      const labelToAdd = labels.filter(label => {
        return (
          !existingLabelIds.includes(label.id) && title.includes(label.name)
        );
      });

      await context.github.issues.addLabels(
        context.issue({
          labels: labelToAdd.map(l => l.name)
        })
      );
    }
  );
};
