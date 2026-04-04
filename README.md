# PE2-KM-Syllabus-Curriculum-Map
*Created by M5*


## Step 1: Get the docs/all Branch Locally
If you haven't accessed this branch before, you need to "fetch" it from GitHub and switch to it.

Save your current work: `git add .` and `git commit -m "save work"` (on your current branch).

Switch to docs/all: 
```
git fetch origin
git checkout docs/all
git pull origin docs/all
```

## Step 2: Adding Your Prompt Logs or editing daily standup
**IMPORTANT:** Don't Touch Other Files! Only edit files inside the promptlogs/ or your own file. Do not delete the README.md.

## Step 3: Direct Push to GitHub
Since there is no branch protection, you can send your updates to GitHub in three quick commands:

```
git add [the files you touched]
git commit -m "docs: [message] [Your Name]"
git push origin docs/all
```
## Step 4: Go Back to Coding

Once your logs are pushed, switch back to your feature branch to continue working on the app:
```
git checkout feat/your-current-task
```

You can push your edited promptlogs every after a sprint is done, or whenever you want.

Happy coding! :>>>
