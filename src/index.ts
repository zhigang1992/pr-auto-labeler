import { Application } from "probot";

interface Label {
  id: string;
  name: string;
}

export = (app: Application) => {
  app.log("App Loaded");
  app.on(
    ["pull_request.opened", "pull_request.edited", "pull_request.synchronize"],
    async context => {
      // @ts-ignore
      const labels: Label[] = (await context.github.issues.getLabels(
        context.issue({ per_page: 20 })
      )).data;

      const pullRequest = context.payload.pull_request;
      const title: string = pullRequest.title;
      const existingLabelIds = (pullRequest.labels as Label[]).map(l => l.id);

      const labelToAdd = labels.filter((label: Label) => {
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
