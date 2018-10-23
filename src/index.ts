import { Application } from "probot";
// @ts-ignore
import getConfig from "probot-config";
import { ChecksCreateParams } from "@octokit/rest";

type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>

export = (app: Application) => {
  app.log("App Loaded");
  app.on(["pull_request.opened", "pull_request.edited", "pull_request.synchronize"], async context => {
    const config = await getConfig(context, "pr-title.yml");
    if (config && typeof config.regex === "string") {
      const pullRequest = context.payload.pull_request;
      const title: string = pullRequest.title;
      const titlePassRegexTest = new RegExp(config.regex).test(title);
      const checkOptions: Omit<ChecksCreateParams, 'owner' | 'repo'> = {
        name: "PR-Title",
        head_sha: pullRequest.head.sha,
        conclusion: titlePassRegexTest ? "success" : "failure",
        completed_at: (new Date()).toISOString(),
        output: {
          title: titlePassRegexTest
            ? "Ready for review"
            : config.message || "PR-Title does not meet requirement",
          summary:
            titlePassRegexTest
            ? "PR title now meet requirement"
            : config.message || `The title "${pullRequest.title}" meet requirement.`
        }
      };
      await context.github.checks.create(context.repo(checkOptions));
    } else {
      context.log("config file not found");
    }
  });
};
