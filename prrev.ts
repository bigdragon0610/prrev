import { ensureFileSync } from "https://deno.land/std@0.224.0/fs/mod.ts";
import { join } from "https://deno.land/std@0.224.0/path/mod.ts";
import { homedir } from "node:os";
import $ from "https://deno.land/x/dax@0.39.2/mod.ts";

const tokenFile = join(homedir(), ".prrev.token");

ensureFileSync(tokenFile);

if (Deno.args.length > 0 && Deno.args[0] === "configure") {
  const token = await $.prompt("Enter your GitHub token:", {
    mask: true,
  });
  if (!token) {
    console.log("Token not provided.");
    Deno.exit(1);
  }
  Deno.writeTextFileSync(tokenFile, token);
  Deno.exit();
}

let token: string | null = null;
try {
  token = Deno.readTextFileSync(tokenFile);
} catch (_) {
  console.log(
    `Token file ${tokenFile} not found.`,
  );
  Deno.exit(1);
}
if (!token) {
  console.log(`Token file ${tokenFile} is empty.`);
  Deno.exit(1);
}

const fetchWithToken = (url: string) =>
  fetch(url, {
    headers: {
      Authorization: `token ${token}`,
    },
  });

const result = await fetchWithToken("https://api.github.com/notifications");

type Notification = {
  reason: string;
  subject: {
    title: string;
    url: string;
  };
  repository: {
    full_name: string;
  };
};

const notifications: Notification[] = await result.json();
const reviewRequests = notifications.filter(
  (notification) => notification.reason === "review_requested",
);

let selectedReviewRequest: Notification | null = null;
if (reviewRequests.length === 0) {
  Deno.exit();
} else if (reviewRequests.length === 1) {
  selectedReviewRequest = reviewRequests[0];
  if (
    !await $.confirm(
      {
        message:
          `Open this review request?:\n${selectedReviewRequest.repository.full_name} - ${selectedReviewRequest.subject.title}`,
        default: true,
      },
    )
  ) {
    Deno.exit();
  }
} else {
  const selectedReviewRequestId = await $.select({
    message: "Select a review request to review:",
    options: reviewRequests.map(
      (notification) =>
        `${notification.repository.full_name} - ${notification.subject.title}`,
    ),
  });
  selectedReviewRequest = reviewRequests[selectedReviewRequestId];
}

type PullRequest = {
  html_url: string;
};

const pullRequestResponse = await fetchWithToken(
  selectedReviewRequest.subject.url,
);
const pullRequest: PullRequest = await pullRequestResponse.json();
await $`open ${pullRequest.html_url}`;
