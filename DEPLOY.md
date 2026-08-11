# Deployment

The admin panel is a static Vite build hosted on S3 static website hosting.

| | |
|---|---|
| Bucket | `s3://kma-admin` (ap-south-1) |
| URL | `http://kma-admin.s3-website.ap-south-1.amazonaws.com` |
| CloudFront | **none** in front of the admin panel |
| SPA routing | handled by the bucket's `ErrorDocument: index.html` |

> The CloudFront distribution `E276KSKF2LYAQW` (`d1oe4akg0fu6ja.cloudfront.net`)
> fronts the **`kma-property`** media bucket, not this app. Deploys here need no
> invalidation. If a CDN is ever put in front of `kma-admin`, add an invalidation
> step to the workflow — otherwise deploys will appear to do nothing.

## How to deploy

Push to `master`. That's it — `.github/workflows/deploy-admin.yml` builds and
uploads. `workflow_dispatch` lets you re-run it manually from the Actions tab.

**Do not run `aws s3 sync` by hand.** Doing that is what caused the site and the
repo to drift apart: a whole `src/cp` module and a `patch-payout.js` runtime
patch existed only on S3, with no copy in git.

## Required GitHub secrets

Settings → Secrets and variables → Actions:

| Secret | Value |
|---|---|
| `VITE_API_URL` | `http://15.207.193.17:3000` |
| `VITE_AWS_URL` | `https://kma-property.s3.ap-south-1.amazonaws.com/` |
| `AWS_ACCESS_KEY_ID` | deploy-only IAM user (see below) |
| `AWS_SECRET_ACCESS_KEY` | " |

`VITE_*` values are **baked into the bundle at build time**, so they must exist
in CI. The workflow fails loudly if either is missing rather than shipping a
build that silently can't reach the API.

### Deploy IAM user

Don't reuse the app's S3 upload keys. Create a user whose only policy is:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:PutObject", "s3:DeleteObject", "s3:ListBucket", "s3:GetObject"],
      "Resource": ["arn:aws:s3:::kma-admin", "arn:aws:s3:::kma-admin/*"]
    }
  ]
}
```

Better still, swap the static keys for GitHub OIDC (`role-to-assume`) so no
long-lived credentials sit in GitHub at all.

## Cache strategy

| File | Header | Why |
|---|---|---|
| `assets/index-<hash>.js/.css` | `max-age=31536000, immutable` | content-hashed, safe forever |
| `index.html` | `no-cache, no-store` | must always point at the newest hashes |
| `assets/patch-payout.js` | `no-cache, no-store` | **no content hash** — would otherwise pin forever |

The sync deliberately omits `--delete`. Users mid-session are still running the
previous `index.html` and would hit 404s on chunks removed underneath them.
Prune old builds occasionally instead:

```bash
aws s3 ls s3://kma-admin/assets/          # check what's stale first
```

## `patch-payout.js` — technical debt

`public/assets/patch-payout.js` monkey-patches `window.fetch`, intercepts any
URL containing `redeem`, and rewrites the response so the payouts table finds
the fields it expects (`accountHolderName` → `userName`, `amount` → `inr`, and a
composed `payoutDetail` string).

It was uploaded straight to S3 on 2026-06-29 and was in no branch. It is checked
in now **only** so CI reproduces production. The real fix is to map those fields
in the redeem page or the API and delete both the file and the `<script>` tag in
`index.html`.
