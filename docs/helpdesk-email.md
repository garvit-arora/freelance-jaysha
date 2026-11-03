# Formspark email confirmations

Every helpdesk form is saved in Supabase before email is requested. The `helpdesk-submit` edge function accepts validated guest submissions without sign-in. A private receipt authorizes `helpdesk-email` to read the corresponding saved submission, builds the corresponding email, and forwards it to Formspark. The browser cannot change recipients or email text, and guest users cannot read helpdesk tables. Delivery status is stored privately to avoid duplicate notifications.

## Formspark setup

1. Create one form and copy its action URL (`https://submit-form.com/FORM_ID`). Add it to `.env` as `FORMSPARK_HELPDESK_URL`.
2. If email sending is approved later, configure only `lakshyagrover01@gmail.com` in the form's email notification settings. Complete any recipient verification requested by Formspark. Do not add Jaysha as a recipient.
3. Set the notification template to render the submitted `message` field. The following code preserves the three supplied email bodies and their line breaks:

```html
<div style="text-align:left;white-space:pre-wrap;font-family:Arial,sans-serif;font-size:16px;line-height:1.7">{{data.message}}</div>
```

The notification subject is supplied per department. A single form can serve all three departments. Do not enable an extra autoresponder unless you want duplicate copies.

Email sending is currently paused in the edge function at the user's request. Saving a helpdesk form does not send email while this pause is active. Do not enable sending without fresh explicit approval.

## Deployment

Run `node scripts/apply-helpdesk-schema.mjs` then `node scripts/deploy-helpdesk-email.mjs`. Neither `.env` nor the temporary deployment secret file belongs in Git.

The UI reports pending email if Formspark is not configured or the request is rejected. The saved form is retained, and Retry email never resubmits it. A provider timeout remains pending for manual review because Formspark may have accepted it; check the Formspark submissions before clearing a delivery stuck in `sending`. There is no automatic background retry worker.

Reference: https://documentation.formspark.io/dashboard/email-notification-settings.html
