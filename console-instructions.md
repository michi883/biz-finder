# Using Cloud Console to Modify Organization Policy

✅ **Update**: I've just granted you the `roles/orgpolicy.policyAdmin` role! 

**Please refresh the Cloud Console page** - the "Manage Policy" button should now be enabled.

## Steps

1. **Open the Organization Policy page**:
   - Go to: https://console.cloud.google.com/iam-admin/orgpolicies/iam-allowedPolicyMemberDomains?organizationId=1007968464783

2. **Modify the policy**:
   - Click "Manage Policy" or "Edit Policy"
   - Under "Policy values", you should see `C0111e5a4` (your directory customer ID)
   - Click "Add value" or similar button
   - Add: `allUsers`
   - Optionally add: `allAuthenticatedUsers`
   - Click "Save"

3. **Once saved, return here and let me know** - I'll then grant public access to the Cloud Run service

## Current Policy
```json
{
  "constraint": "constraints/iam.allowedPolicyMemberDomains",
  "listPolicy": {
    "allowedValues": [
      "C0111e5a4"
    ]
  }
}
```

## Target Policy
```json
{
  "constraint": "constraints/iam.allowedPolicyMemberDomains",
  "listPolicy": {
    "allowedValues": [
      "C0111e5a4",
      "allUsers",
      "allAuthenticatedUsers"
    ]
  }
}
```
