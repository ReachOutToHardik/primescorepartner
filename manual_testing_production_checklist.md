# PrimeScore Partner Portal — Complete Manual Testing Checklist (All Buttons & Pages)

This document provides a 100% complete, field-by-field and button-by-button manual testing manual for the entire PrimeScore platform. Every single button, toggle, dropdown, modal, and link across all 20+ pages is listed below with sample inputs and exact expected outputs. No tables, no AI buzzwords.

---

## Index of Test Flows

### 1. Test Data & Accounts
- 0. Quick Copy-Paste Test Data

### 2. Partner Authentication
- 1.1 Partner Login Page (`/login`)
- 1.2 Partner 3-Step Registration Form (`/register`)
  - Step 1: Basic Profile & Live SMS OTP
  - Step 2: KYC Identity Documents
  - Step 3: Payout Setup & Submission

### 3. Partner Portal Workflows
- 2.1 Partner Global Header Bar
- 2.2 Partner KYC Review & QR Code Page (`/kyc`)
- 2.3 Partner Dashboard (`/dashboard`)
- 2.4 Lead Submission Page (`/refer`)
- 2.5 Referrals & Leads Tracking Page (`/referrals`)
- 2.6 Rewards & Gift Vouchers Page (`/rewards`)

### 4. Admin Management Suite
- 3.1 Admin Global Navigation & Shell Controls
- Overview Section:
  - HQ Overview (`/admin`)
  - Partner Verifications & KYC (`/admin/kyc`)
  - Referral Cases & Leads (`/admin/referrals`)
  - Team Leaders & DSAs Directory (`/admin/teams`)
- Reports Section:
  - Payouts & Reports (`/admin/analytics`)
  - Gift Voucher Claims (`/admin/gift-cards`)
- Settings & Governance Section:
  - Services Catalog (`/admin/services`)
  - Points & Reward Rates (`/admin/rewards-config`)
  - Send Messages (`/admin/notifications`)
  - Broadcast Announcements (`/admin/broadcasts`)
  - Admin Staff Roles & RBAC (`/admin/staff`)
  - System Audit Logs (`/admin/audit-logs`)
  - Platform Settings (`/admin/settings`)

### 5. Legal & Compliance Pages
- 4.1 Privacy Policy (`/privacy`)
- 4.2 Terms & Conditions (`/terms`)
- 4.3 Payout Policy (`/refund`)

### 6. Final Sign-Off
- Final Pre-Production Sign-Off Checklist

---

## 0. Quick Copy-Paste Test Data

Keep these ready while testing:
- Partner Email: `primescore37+partner@gmail.com`
- Partner Mobile: `9680530334` (receives live SMS OTP via Ishani)
- Partner Password: `Partner@Secure2026`
- Partner PAN: `ABCDE1234F`
- Partner Aadhaar: `5432 8765 1098`
- Partner Bank: `HDFC Bank`, Account `50100456789123`, IFSC `HDFC0001234`
- Team Leader Email: `primescore37+leader@gmail.com`
- Client Lead Name: `Ramesh Verma`, Mobile `9823456781`, Email `primescore37+client@gmail.com`
- Admin Gateway Route: `/admin`
- Admin Master Password: `Primescore@Admin2026`

---

## PART 1: PUBLIC & AUTHENTICATION PAGES

### 1.1 Partner Login Page (`/login`)
Route: `/login`

- Button: Password Visibility Toggle (Eye icon)
  - Action: Type `MySecretPassword` in the password input, then click the eye icon button.
  - Expected Output: Password characters change from hidden dots `••••••••` to readable plain text. Clicking it again hides them.

- Button: "Remember me" Checkbox
  - Action: Click the checkbox.
  - Expected Output: Checkbox displays a checkmark and saves login preference to local state.

- Button: "Forgot your password?" Link Button
  - Action: Click the link.
  - Expected Output: The "Reset Password" modal pops up over the login card.

- Inside Forgot Password Modal:
  - Input: Email Address (`primescore37+partner@gmail.com`)
  - Button: "Cancel"
    - Action: Click "Cancel".
    - Expected Output: Modal closes without sending an email.
  - Button: "Send Reset Link"
    - Action: Type valid email and click "Send Reset Link".
    - Expected Output: Green confirmation message appears: "Password reset instructions have been sent to your email."

- Button: "Sign In" Submit Button (Invalid Credentials)
  - Action: Type `wrong@primescore.in` and `WrongPassword123`, then click "Sign In".
  - Expected Output: Red alert banner appears: "Incorrect email/mobile or password. Please try again." The page does NOT reload.

- Button: "Sign In" Submit Button (Valid Credentials)
  - Action: Type `joshi14hardik+1@gmail.com` and `Partner@2026` (or registered email/password), then click "Sign In".
  - Expected Output: Spinner appears briefly, then redirects to `/dashboard` (or `/kyc` if review is pending).

- Button: "Register here" Link Button
  - Action: Click the "Don't have an account? Register here" link at the bottom.
  - Expected Output: Navigates immediately to `/register`.

---

### 1.2 Partner 3-Step Registration Form (`/register`)
Route: `/register`

#### Step 1: Basic Profile & Live SMS OTP
- Input: Full Name
  - What to type: `Vikram Malhotra`

- Input: Mobile Number
  - What to type: `9680530334` (auto-formats with a space: `96805 30334`).

- Button: "Send OTP"
  - Action: Click "Send OTP".
  - Expected Output: Button shows a spinner, then Ishani SMS API dispatches real OTP. A green toast appears: "OTP sent to 9680530334". A 6-box OTP entry container appears with a 10-minute countdown timer.

- Inputs: 6-Box OTP Code
  - Action: Check SMS received on phone `9680530334` and type the 6 numbers into the boxes.
  - Expected Output: Automatically validates on the 6th digit. A green badge appears: "Mobile Verified ✓". The mobile input locks and the "Send OTP" button disappears.

- Button: "Resend OTP"
  - Action: Wait for timer or click "Resend OTP" if code is not received.
  - Expected Output: Triggers a fresh SMS to the mobile number with a reset timer.

- Input: Work Email Address
  - What to type: `primescore37+partner@gmail.com`

- Input: Password & Confirm Password
  - What to type: `Partner@Secure2026` in both fields.

- Buttons: Role Selector Cards
  - Action: Click the card for "Individual Partner (DSA)".
  - Expected Output: The card highlights in dark navy with a checkmark badge. Click "Team Leader" to confirm selection switches smoothly.

- Dropdown: Profession / Occupation
  - Action: Select "Direct Selling Agent (DSA)".

- Inputs: City & State
  - What to type: City `Mumbai`, State `Maharashtra`.

- Button: "Continue to Step 2"
  - Action: Click "Continue to Step 2".
  - Expected Output: Form slides smoothly to Step 2 (KYC Documents).

- Button: "Already have an account? Sign in" Link
  - Action: Click link.
  - Expected Output: Navigates back to `/login`.

#### Step 2: KYC Identity Documents
- Input: PAN Number
  - What to type: `abcde1234f` (all lowercase).
  - Expected Output: Auto-transforms to uppercase `ABCDE1234F`. A green checkmark appears when 10 valid characters are entered.

- Input: Aadhaar Number
  - What to type: `543287651098` (12 digits continuous).
  - Expected Output: Auto-spaces into `5432 8765 1098`. A green checkmark appears.

- Button: "Back to Step 1"
  - Action: Click "Back to Step 1".
  - Expected Output: Returns to Step 1 with all previously typed profile details preserved. Click Continue to return to Step 2.

- Button: "Continue to Step 3"
  - Action: Click "Continue to Step 3".
  - Expected Output: Advances to Step 3 (Payout Setup).

#### Step 3: Payout Setup & Submission
- Inputs: Bank Details (Optional)
  - What to type: Account Holder `Vikram Malhotra`, Bank `HDFC Bank`, Account `50100456789123`, IFSC `HDFC0001234`.

- Checkbox: Terms & Conditions Agreement
  - Action: Click the checkbox "I accept the Terms & Conditions and Payout Policy".
  - Expected Output: Checkbox marks active. The "Complete Registration" button enables.

- Links: Policy Links in Disclaimer
  - Action: Click "Terms of Service" or "Payout Policy".
  - Expected Output: Opens policy details in a new tab without losing registration progress.

- Button: "Back to Step 2"
  - Action: Click button.
  - Expected Output: Returns to Step 2 with document numbers saved.

- Button: "Complete Registration"
  - Action: Click "Complete Registration".
  - Expected Output: Loading spinner shows "Creating Partner Account...". Creates Supabase user, sets initial Silver Tier + 100 welcome bonus points, and redirects to `/kyc`.

---

## PART 2: PARTNER PORTAL WORKFLOWS

### 2.1 Partner Global Header Bar (All Partner Pages)
- Button: Logo (PrimeScore)
  - Action: Click logo.
  - Expected Output: Navigates to `/dashboard`.

- Marquee Ticker Banner (Top Strip)
  - What to check: Announcement banner scrolls smoothly across the top of the portal.

- Button: Notification Bell Icon
  - Action: Click the bell icon in top right.
  - Expected Output: Opens popover drawer displaying recent partner announcements and bonus points notices.

- Button: Partner Profile Dropdown / Logout
  - Action: Click partner name / avatar in the top right.
  - Action: Click "Sign Out".
  - Expected Output: Clears partner session tokens and redirects to `/login`.

---

### 2.2 Partner KYC Review & QR Code Page (`/kyc`)
Route: `/kyc`

- Status Banner:
  - What to check: "Step 2 of 3: Verification in Progress" badge and masked identity values.

- Button: "Download Referral QR Code" (Dropdown Action)
  - Action: Click the dropdown button.
  - Expected Output: Menu opens showing:
    - "PDF Document (.pdf)"
    - "PNG Image (.png)"
    - "JPG Image (.jpg)"
  - Action: Click "PNG Image (.png)".
  - Expected Output: A high-resolution branded PNG image card downloads to your computer with your Partner Code and QR code.

- Button: "Copy Referral Link"
  - Action: Click button.
  - Expected Output: Text changes to "Copied!" for 2 seconds, and the full referral link is placed in your clipboard.

- Links: Footer Legal Compliance Links
  - Action: Click `/privacy`, `/terms`, or `/refund`.
  - Expected Output: Each link opens its clean legal page without 1800 numbers.

---

### 2.3 Partner Dashboard (`/dashboard`)
Route: `/dashboard`

- Button: "Submit New Referral" (Primary Hero Button)
  - Action: Click button.
  - Expected Output: Navigates immediately to `/refer`.

- Button: "View All Leads" Quick Button
  - Action: Click button.
  - Expected Output: Navigates to `/referrals`.

- Button: "Browse Rewards" Quick Button
  - Action: Click button.
  - Expected Output: Navigates to `/rewards`.

- Button: "Copy" on Referral Link Input
  - Action: Click "Copy" next to your referral URL.
  - Expected Output: Toast says "Referral link copied to clipboard".

- Button: "Download QR" Quick Card Button
  - Action: Click button.
  - Expected Output: Triggers immediate download of your referral QR code.

- Button: "View All" on Recent Leads Section
  - Action: Click link.
  - Expected Output: Opens the full referrals table at `/referrals`.

---

### 2.4 Lead Submission Page (`/refer`)
Route: `/refer`

- Input: Client Full Name
  - What to type: `Ramesh Verma`

- Input: Client Mobile Number
  - What to type: `9823456781`

- Input: Client Email Address
  - What to type: `primescore37+client@gmail.com`

- Dropdown: Service Required
  - Action: Open dropdown and pick "Credit Rectification".
  - Expected Output: Service fee and expected reward points preview update below.

- Inputs: City & State
  - What to type: City `Pune`, State `Maharashtra`.

- Input: Estimated Dispute / Loan Amount
  - What to type: `500000`

- Textarea: Client Notes / Case Background
  - What to type: `Client has 2 incorrect late payment marks on CIBIL report from HDFC credit card.`

- Button: "Reset Form"
  - Action: Click "Reset Form".
  - Expected Output: Clears all entered fields back to blank.

- Button: "Submit Referral"
  - Action: Fill in fields and click "Submit Referral".
  - Expected Output: Loading indicator appears, then a Success Modal pops up:
    - Displays unique Case ID (e.g. `REF-1092`).
    - Displays notification: `+20 PrimePoints Credited to Your Account`.

- Inside Lead Submission Success Modal:
  - Button: "Submit Another Referral"
    - Action: Click button.
    - Expected Output: Closes modal and resets the form for a new client.
  - Button: "View My Referrals"
    - Action: Click button.
    - Expected Output: Navigates directly to `/referrals` where the new lead is listed.

---

### 2.5 Referrals & Leads Tracking Page (`/referrals`)
Route: `/referrals`

- Input: Search Leads Textbox
  - Action: Type `Ramesh` or case ID `REF-1092`.
  - Expected Output: Table instantly filters to show only matching leads. Clearing the input restores the full list.

- Dropdown: Status Filter
  - Action: Click dropdown and select "New Lead", "In Progress", or "Completed".
  - Expected Output: Filters list by that specific stage. Select "All Statuses" to reset.

- Dropdown: Service Category Filter
  - Action: Filter by "Credit Rectification".
  - Expected Output: Shows only credit rectification referral leads.

- Button: Individual Lead Row / "View Details"
  - Action: Click on any referral row.
  - Expected Output: Slide-over details card opens showing customer contact info, dispute amount, bureau notes, and stage timeline.

- Buttons: "Contact Customer" Quick Actions
  - Action: Click the WhatsApp or Phone icon next to customer number.
  - Expected Output: Launches WhatsApp web with pre-filled message or opens phone dialer.

- Buttons: Pagination ("Previous" / "Next")
  - Action: Click "Next" (if more than 10 leads exist).
  - Expected Output: Loads page 2 smoothly.

---

### 2.6 Rewards & Gift Vouchers Page (`/rewards`)
Route: `/rewards`

- Interactive Points Calculator:
  - Input: "Enter points to calculate value"
  - Action: Type `1000`.
  - Expected Output: Displays live equivalent: `1000 PrimePoints = ₹100.00 INR`.

- Buttons: Voucher Cards ("Claim Voucher")
  - What to test: Amazon, Flipkart, MakeMyTrip vouchers.
  - Case 1 (Insufficient Balance): Click "Claim Voucher" on a 500-point card when your balance is 120.
    - Expected Output: Clear alert note says: *"You need 380 more PrimePoints to claim this voucher."*
  - Case 2 (Sufficient Balance): Click "Claim Voucher" when balance is >= 500.
    - Expected Output: Opens "Confirm Voucher Redemption" modal.

- Inside Voucher Claim Modal:
  - Button: "Cancel"
    - Action: Click "Cancel".
    - Expected Output: Closes modal without deducting any points.
  - Button: "Confirm Redemption"
    - Action: Click "Confirm Redemption".
    - Expected Output: Deducts points from balance, generates pending voucher claim record, and updates Points Ledger.

- Tabs: Points Ledger Filter ("All", "Earned", "Redeemed")
  - Action: Click "Earned".
  - Expected Output: Shows green entries for referral bonuses (`+20 pts`, `+500 pts`).
  - Action: Click "Redeemed".
  - Expected Output: Shows entries for voucher redemptions (`-500 pts`).

---

## PART 3: ADMIN MANAGEMENT SUITE

Access Admin at route: `/admin` (Unlock Password: `Primescore@Admin2026`).

---

### 3.1 Admin Global Navigation & Shell Controls
- Button: Desktop Sidebar Collapse Toggle (`<` / `>`)
  - Action: Click the toggle arrow at top right of the sidebar.
  - Expected Output: Sidebar smoothly collapses from 256px (`w-64`) down to 80px (`w-20`), showing only icons. Click again to expand back to full width.

- Button: Mobile Hamburger Menu (`List` / `X`)
  - Action: Shrink browser width to 375px (mobile view) and click the hamburger icon.
  - Expected Output: Sidebar drawer slides in from the left over a dark backdrop. Clicking outside or the `X` closes it.

- Button: Header "Sign Out"
  - Action: Click "Sign Out" in the top right header bar.
  - Expected Output: Ends admin session and shows Admin Login unlock screen.

- Button: Sidebar Footer "LOG OUT" (`[→ LOG OUT`)
  - Action: Click "LOG OUT" button beneath the Hardik Super Admin card.
  - Expected Output: Signs out immediately.

- Links: All 13 Sidebar Navigation Items
  - Action: Click each link in order:
    1. `HQ Overview` -> `/admin`
    2. `Partner Verifications (KYC)` -> `/admin/kyc`
    3. `Referral Cases & Leads` -> `/admin/referrals`
    4. `Team Leaders & DSAs` -> `/admin/teams`
    5. `Payouts & Reports` -> `/admin/analytics`
    6. `Gift Voucher Claims` -> `/admin/gift-cards`
    7. `Services Catalog` -> `/admin/services`
    8. `Points & Reward Rates` -> `/admin/rewards-config`
    9. `Send Messages` -> `/admin/notifications`
    10. `Broadcast Announcements` -> `/admin/broadcasts`
    11. `Admin Staff Roles` -> `/admin/staff`
    12. `System Audit Logs` -> `/admin/audit-logs`
    13. `Platform Settings` -> `/admin/settings`
  - Expected Output: Every page loads without error. The active item displays a red dot indicator and solid navy background.

---

### 3.2 Category: OVERVIEW

#### Page: HQ Overview (`/admin`)
- Buttons: Date Range Filter Buttons
  - Buttons available: "Today", "This Month", "This Year", "All Time".
  - Action: Click each button.
  - Expected Output: The active button turns solid navy (`bg-[#1B2A72]`). Top KPI numbers (KYCs, Partners, Leads, Cards) recalculate based on the chosen timeframe.

- Interactive KPI Metric Cards:
  - Action: Click the "Pending KYCs" card.
  - Expected Output: Navigates directly to `/admin/kyc`.

---

#### Page: Partner Verifications & KYC (`/admin/kyc`)
- Input: Search Partners
  - Action: Type `Vikram` or `ABCDE1234F`.
  - Expected Output: Filters list to Vikram's KYC card.

- Tabs: KYC Status Filter ("All", "Pending Review", "Approved", "Rejected")
  - Action: Click "Pending Review".
  - Expected Output: Shows only unverified applications.

- Button: "View Identity Documents"
  - Action: Click button on a partner card.
  - Expected Output: Displays full PAN number, Aadhaar number, and submitted bank account info.

- Button: "Approve KYC & Activate Partner" (Green Button)
  - Action: Click button on a pending partner.
  - Expected Output: Confirmation toast appears: "Partner KYC approved successfully". Status badge changes to green "KYC APPROVED". Partner is enabled to submit referrals and earn points.

- Button: "Reject KYC" (Red Button)
  - Action: Click button on a partner card.
  - Expected Output: Opens "Reject Partner Application" modal.

- Inside Reject KYC Modal:
  - Input: Rejection Reason (e.g. `Aadhaar card scan is blurred and unreadable`).
  - Button: "Cancel" -> Closes modal without rejecting.
  - Button: "Confirm Rejection" -> Rejects application, sets status to red "KYC REJECTED", and logs reason to Audit Logs.

---

#### Page: Referral Cases & Leads (`/admin/referrals`)
- Input: Search Leads
  - Action: Type client name `Ramesh` or Case ID.
  - Expected Output: Filters referral cases table in real time.

- Dropdown: Stage / Status Filter
  - Action: Select "Completed".
  - Expected Output: Shows only successfully fulfilled credit repair cases.

- Dropdown: Lead Stage Selector (Inside each lead row)
  - Stages available: "New Lead", "In Progress", "Enrolled", "Completed", "Dispute Rejected".
  - Action: Change stage on a lead from "In Progress" to "Completed".
  - Expected Output: Progress bar completes. 500 Conversion PrimePoints are automatically credited to the referring partner's account in Supabase.

- Button: "Add Internal Note"
  - Action: Click button, type `Bureau rectification filed with CIBIL on 1st Sept`, and click "Save Note".
  - Expected Output: Note is appended to the lead history with admin timestamp.

---

#### Page: Team Leaders & DSAs (`/admin/teams`)
- Input: Search Partner Directory
  - Action: Type `Hardik` or `IND-HARDIK-496`.
  - Expected Output: Shows partner profile card with Partner Code, Tier, Points, and Referral count.

- Tabs: Role Filter ("All Partners", "Team Leaders", "Individual DSAs")
  - Action: Click "Team Leaders".
  - Expected Output: Shows only partners registered as Team Leaders with sub-partner counts.

- Button: "Manual Points Adjustment" (on partner card)
  - Action: Click button.
  - Expected Output: Opens "Adjust Partner PrimePoints" modal.

- Inside Points Adjustment Modal:
  - Input: Points Amount (e.g. `100` or `-50`)
  - Input: Reason (e.g. `Special Campaign Bonus Q3`)
  - Button: "Cancel" -> Closes modal.
  - Button: "Update Balance" -> Immediately updates partner points balance and saves record to Audit Logs.

- Button: "Reset Password"
  - Action: Click button, enter new password `NewPartner@2026`, and click "Save".
  - Expected Output: Updates login password in Supabase Auth.

- Button: "Deactivate Partner" / "Activate Partner"
  - Action: Click button.
  - Expected Output: Toggles partner account between Active and Suspended.

---

### 3.3 Category: REPORTS

#### Page: Payouts & Reports (`/admin/analytics`)
- Button: "Export CSV"
  - Action: Click button at top right.
  - Expected Output: Browser downloads `primescore_payouts_report_[date].csv` containing all partner payout calculations and bank details.

- Dropdown: Commission Payout Status (Inside table)
  - Options: "Pending Approval", "Processing", "Paid Out".
  - Action: Change status to "Paid Out".
  - Expected Output: Status badge turns green and payout is marked finalized.

---

#### Page: Gift Voucher Claims (`/admin/gift-cards`)
- Tabs: Claims Filter ("Pending Claims", "Delivered / Fulfilled", "Cancelled")
  - Action: Click "Pending Claims".
  - Expected Output: Shows partner requests waiting for digital gift card coupon codes.

- Button: "Fulfill Voucher"
  - Action: Click button on a pending claim.
  - Expected Output: Opens "Deliver Gift Voucher Code" modal.

- Inside Fulfill Voucher Modal:
  - Input: Digital Gift Voucher Code (e.g. `AMZ-9981-4432-0012`)
  - Button: "Cancel" -> Closes modal.
  - Button: "Mark as Fulfilled" -> Saves code, switches status to green "Delivered", and notifies partner.

- Button: "Reject Claim"
  - Action: Click button.
  - Expected Output: Rejects claim, sets status to "Cancelled", and refunds the redeemed points back to the partner's balance.

---

### 3.4 Category: SETTINGS & GOVERNANCE

#### Page: Services Catalog (`/admin/services`)
- Toggle Switch: Service Active / Inactive
  - Action: Flip the toggle next to "Credit Score Improvement" to OFF.
  - Expected Output: Toggle turns gray. Go to `/refer` in partner portal: this service no longer appears in the referral dropdown.
  - Action: Flip toggle back to ON: service is re-enabled.

- Button: "+ Add New Service"
  - Action: Click button at top right.
  - Expected Output: Opens "Add Platform Service" modal.

- Inside Add Service Modal:
  - Input: Service Title (e.g. `Fast-Track Bureau Rectification`)
  - Dropdown: Category (e.g. `Bureau Analysis`)
  - Input: Partner Points Reward (e.g. `750`)
  - Input: Typical Fee in INR (e.g. `3500`)
  - Textarea: Description (e.g. `Priority bureau dispute filing completed within 7 business days.`)
  - Button: "Cancel" -> Closes modal.
  - Button: "Save Service" -> Service is added to the catalog table immediately.

- Button: "Edit Service" (Pencil icon)
  - Action: Click pencil icon on any service.
  - Expected Output: Opens edit modal with pre-filled fields. Change fee to `4000` and click "Update Service". Changes save immediately.

- Button: "Delete Service" (Trash icon)
  - Action: Click trash icon.
  - Expected Output: Confirms deletion and removes service from catalog.

---

#### Page: Points & Reward Rates (`/admin/rewards-config`)
- Inputs: Reward Points Engine
  - Input: "Points on Referral Submitted" (default `20`)
  - Input: "Points on Customer Enrolled" (default `100`)
  - Input: "Points on Case Completed" (default `500`)
  - Input: "Team Leader Override %" (default `10`)
  - Input: "Points per 1 INR" (default `10`)
  - Input: "Minimum Points to Redeem" (default `500`)
  - Input: "Daily Redemption Cap" (default `10000`)

- Button: "Reset to Defaults"
  - Action: Change some values, then click "Reset to Defaults".
  - Expected Output: Form values revert to standard default rates.

- Button: "Save Engine Configuration"
  - Action: Change Submission Points to `25` and click "Save Engine Configuration".
  - Expected Output: Green confirmation toast appears. All new referral submissions now grant 25 points.

---

#### Page: Send Messages (`/admin/notifications`)
- Radio Buttons: Recipient Selector
  - Options: "All Partners", "Specific Partner", "Entire Team".
  - Action: Select "Specific Partner".
  - Expected Output: A partner search dropdown input appears below.

- Input: Notification Title
  - What to type: `Weekend Server Maintenance`

- Textarea: Notification Message
  - What to type: `The partner dashboard will be undergoing scheduled optimization from 2:00 AM to 4:00 AM this Sunday.`

- Buttons: Priority / Tag Selector
  - Buttons: "Info" (Blue), "Important" (Red), "Reward" (Green), "Urgent" (Amber).
  - Action: Click "Important".
  - Expected Output: Selected tag highlights with solid active outline.

- Input: Bonus Points Attachment (Optional)
  - What to type: `0` (or `50` if rewarding bonus points).

- Button: "Clear Form"
  - Action: Click button.
  - Expected Output: Clears all entered notification fields.

- Button: "Send Targeted Message"
  - Action: Fill fields and click "Send Targeted Message".
  - Expected Output: Button shows spinner, message is dispatched to recipient inboxes, and a new record appears in the Dispatch History table below.

- Dispatch History Table:
  - Input: Search history textbox -> Filters historical sent messages.
  - Button: "Delete" on history row -> Deletes dispatch record.

---

#### Page: Broadcast Announcements (`/admin/broadcasts`)
- Button: "+ Create Announcement Banner"
  - Action: Click button at top right.
  - Expected Output: Opens "Create Announcement Banner" modal.

- Inside Create Announcement Banner Modal:
  - Input: TITLE -> Type `Special Commission Bonus Active!`
  - Buttons: SELECT ICON (6 options):
    - `Megaphone`
    - `Sparkle`
    - `Gift Box`
    - `Warning`
    - `Success`
    - `Bell`
    - Action: Click `Megaphone`.
    - Expected Output: Button turns solid dark navy (`#1B2A72`) with white text and yellow icon.
  - Buttons: TITLE COLOR (4 options):
    - `Yellow` (amber dot)
    - `Red` (red dot)
    - `Green` (green dot)
    - `White` (white dot)
    - Action: Click `Yellow`.
    - Expected Output: Button turns solid dark navy (`#1B2A72`).
  - Textarea: MESSAGE -> Type `Refer 3 credit rectification cases this week to unlock an extra 500 PrimePoints.`
  - Button: "Cancel" -> Closes modal without saving.
  - Button: "Publish Banner" -> Saves announcement banner.

- Announcement Banner Cards (On Page):
  - Card Details: Shows `PUBLISHED [DATE]`, mint green `Live` badge, and announcement title/message.
  - Button: "Deactivate Banner" (Red button `#E63329`)
    - Action: Click "Deactivate Banner".
    - Expected Output: Button switches to green "Activate Banner" and status badge changes to "Deactivated". The ticker banner is removed from partner dashboards.
  - Button: "Activate Banner" (Green button)
    - Action: Click "Activate Banner".
    - Expected Output: Ticker re-activates and displays across partner screens.
  - Button: "Delete Banner" (Trash icon button)
    - Action: Click trash icon.
    - Expected Output: Banner is permanently deleted from system.

---

#### Page: Admin Staff Roles & RBAC (`/admin/staff`)
- KPI Cards: Total Staff (4), Super Admins (2), Active Staff (4), RBAC Rules (17).

- Button: "+ Add Staff User"
  - Action: Click button at top right.
  - Expected Output: Opens "Create New Staff Member" modal.

- Inside Create Staff Member Modal:
  - Input: Full Name -> Type `Ananya Sharma`
  - Input: Work Email Address -> Type `ananya.s@primescore.in`
  - Input: Temporary Password -> Default `Staff@2026`
  - Dropdown: Assign Staff Role -> Pick `Operations Admin`
  - Checkboxes: 17 Granular Page Permissions:
    - Uncheck "Admin Staff Roles & RBAC"
    - Uncheck "System Audit Logs"
    - Leave all other 15 checkboxes checked.
  - Button: "Cancel" -> Closes modal.
  - Button: "Create Staff Account" -> Saves new staff member.
  - Expected Output: Ananya appears in the staff table.

- Staff Table Actions:
  - Toggle Switch: Active / Inactive Status
    - Action: Flip toggle switch next to Ananya to "Inactive".
    - Expected Output: Status turns gray "Inactive". Deactivated account is completely blocked from accessing any admin routes.
  - Button: "Edit Staff" (Pencil icon)
    - Action: Click pencil icon.
    - Expected Output: Opens Edit Staff modal with existing permissions. Modify checkboxes and click "Save Changes".
  - Button: "Delete Staff" (Trash icon)
    - Action: Click trash icon on a staff row.
    - Expected Output: Confirmation modal asks "Are you sure you want to delete [Staff Name]?". Click "Delete Staff" to remove permanently.

- Live RBAC Security Test:
  - Log in with staff email `ananya.s@primescore.in`.
  - Check Sidebar: "Admin Staff Roles" and "System Audit Logs" are completely hidden from the menu.
  - Type URL manually: Enter `/admin/staff` into the address bar.
  - Expected Output: Access is blocked. Displays the **403 Forbidden - You Are Not Authorized to View This Page** screen with Ananya's email and role name.

---

#### Page: System Audit Logs (`/admin/audit-logs`)
- Input: Text Search
  - Action: Type `Vikram` or `KYC`.
  - Expected Output: Filters table to matching audit events.

- Dropdown: Action Category Filter
  - Options: "All Actions", "KYC Approvals", "Lead Transitions", "Points Issued", "Broadcasts", "Staff Updates".
  - Action: Filter by "KYC Approvals".
  - Expected Output: Displays only verification events.

- Button: "Export Audit Logs (.csv)"
  - Action: Click button at top right.
  - Expected Output: Downloads complete audit history CSV file.

- Button: "Clear Audit History" (Super Admin Only)
  - Action: Click button.
  - Expected Output: Security modal asks for Super Admin confirmation. Click "Cancel" to abort.

---

#### Page: Platform Settings (`/admin/settings`)
- Health Indicators: Supabase DB (Connected), Resend Email (Active), Ishani SMS (Active).

- Toggle Switches:
  - "Public Registration Allowed" -> Toggles whether new partners can sign up.
  - "SMS OTP Required on Registration" -> Toggles whether mobile verification is mandatory.
  - "Maintenance Mode" -> Puts portal into read-only maintenance notice.
  - Action: Flip any toggle.
  - Expected Output: State updates with instant confirmation toast.

- Shortcut Cards:
  - Button: "Manage Staff Roles" -> Navigates to `/admin/staff`.
  - Button: "Inspect Audit Logs" -> Navigates to `/admin/audit-logs`.
  - Button: "Configure Announcements" -> Navigates to `/admin/broadcasts`.

---

## PART 4: PUBLIC LEGAL & POLICY PAGES

### 4.1 Privacy Policy (`/privacy`)
- Button: "Back to Home / Login" link.
- Support Email link: Click `partner@primescore.in` -> Opens default mail client.
- Verification: Confirm NO non-functional 1800 telephone numbers exist.

### 4.2 Terms & Conditions (`/terms`)
- Button: "Back to Home / Login" link.
- Support Email link: Click `partner@primescore.in`.
- Verification: Confirm NO 1800 telephone numbers exist.

### 4.3 Payout Policy (`/refund`)
- Button: "Back to Home / Login" link.
- Support Email link: Click `partner@primescore.in`.
- Verification: 15-day settlement cycle, TDS Section 194H rules, and NO 1800 telephone numbers.

---

## Final Pre-Production Sign-Off Checklist
- [ ] Live mobile SMS OTP registration completed with `9680530334`.
- [ ] Partner can submit client referral lead and receive points.
- [ ] Partner can download Referral QR card in PNG and PDF formats.
- [ ] Admin can approve partner KYC and advance lead stages.
- [ ] Admin can publish and deactivate Broadcast Announcement banners.
- [ ] Admin RBAC gates restricted staff and displays 403 Forbidden on unpermitted URLs.
- [ ] All 13 admin routes load cleanly with zero console errors.
