# Yarn Contract Desk

Standalone version of the Yarn Contract Desk app — same features (sellers,
buyers, qualities, contract generator, dual Sales/Purchase documents, PDF/Word
export, Excel import), now backed by a free Upstash Redis database on Vercel
instead of Claude's built-in storage, so it can be shared with anyone on any
plan.

## Deploy it (one-time setup)

1. **Push this folder to GitHub**
   - Create a new repository on GitHub (e.g. `yarn-contract-desk`), keep it empty (no README).
   - Upload every file in this folder to that repo (drag-and-drop on GitHub's
     "Add file → Upload files" page works fine, or use git from your machine).

2. **Import it into Vercel**
   - In your Vercel dashboard, click **Add New → Project**.
   - Choose **Import Git Repository** and pick the repo you just created.
   - Leave all settings as default (no framework preset needed) and click **Deploy**.
   - It will deploy successfully, but the app won't be able to save anything yet — that's expected, next step fixes it.

3. **Add the database**
   - In your new Vercel project, go to the **Storage** tab.
   - Click **Create Database** (or **Browse Marketplace**), choose **Upstash — Redis**.
   - Follow the prompts to create a free database and connect it to this project.
   - This automatically adds the required environment variables for you.

4. **Redeploy**
   - Go to the **Deployments** tab → click the **⋯** menu on the latest deployment → **Redeploy**.
   - (Environment variables only take effect after a redeploy.)

5. **You're live**
   - Open the URL Vercel gives you (e.g. `yarn-contract-desk.vercel.app`).
   - Share that link with your employee — anyone can open it, no Claude account or plan needed.

## Updating it later

If you ever want changes made to the app again, I can hand you an updated
`index.html` (and/or `/api` files) — just replace the matching file(s) in
your GitHub repo and Vercel redeploys automatically within a minute or two.

## Notes

- Free Upstash tier covers roughly 10,000 requests/day, far more than a small
  brokerage needs.
- Data is shared globally across everyone who opens the link (like the Claude
  version was shared within your team) — there's no per-user login.
