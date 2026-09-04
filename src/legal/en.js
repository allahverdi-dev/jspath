/**
 * Legal documents — English.
 *
 * This is the canonical text. Azerbaijani and Russian must say the same thing:
 * `legal.test.js` checks that the three files carry the same sections, and no
 * translation may make a promise the English does not.
 *
 * Every factual claim below is traceable to the codebase — the OAuth provider
 * set, the Gumroad integration, the two database tables, the localStorage keys,
 * the absence of analytics. Nothing here may be softened or strengthened without
 * the product actually changing.
 *
 * Blocks are `{ p }` for a paragraph and `{ ul }` for a list.
 */
export default {
  /* ================================================================== *
   * Terms of Service
   * ================================================================== */
  terms: {
    title: 'Terms of Service',
    intro:
      'These terms describe what JSPath offers, what you can expect from it, and what is expected of you when you use it. They apply to everyone who uses JSPath, with or without an account.',
    sections: {
      agreement: {
        heading: 'Agreement to these terms',
        blocks: [
          { p: 'By using JSPath you agree to these terms. If you do not agree with them, please do not use the service.' },
          { p: 'If you use JSPath on behalf of an organisation, you confirm that you are allowed to accept these terms for that organisation.' },
        ],
      },
      'what-jspath-is': {
        heading: 'What JSPath is',
        blocks: [
          { p: 'JSPath is a learning platform for JavaScript. It offers a structured curriculum, practice exercises, coding challenges, guided projects, interview preparation, a language reference, cheat sheets and an in-browser playground.' },
          { p: 'The curriculum, the reference, the cheat sheets, the playground and a set of practice exercises are free to use. A paid Pro plan opens the remaining practice material — the full challenge and project libraries, the complete interview bank, premium practice sessions and mastery insights.' },
          { p: 'JSPath is a learning resource. It is not a certification body, an employer, a recruiter or a professional advisory service.' },
        ],
      },
      operator: {
        heading: 'Who operates JSPath',
        blocks: [
          { p: 'JSPath is operated by {operator}, an individual. It is not a registered company, and no company is party to these terms.' },
          { p: 'The operator can be reached at {email}.' },
        ],
      },
      accounts: {
        heading: 'Accounts',
        blocks: [
          { p: 'You can create a JSPath account by signing in with Google or with GitHub. Those are the only two ways to sign in. JSPath does not operate a password-based account system, so there is no JSPath password to choose, store, forget or reset.' },
          { p: 'Because your JSPath account is reached through your Google or GitHub account, keeping that account secure is what keeps your JSPath account secure. If you lose control of the account you signed in with, whoever holds it can reach your JSPath progress.' },
          { p: 'An account is not required. It adds progress synchronisation across devices, bookmarks and achievements, and it is what a Pro subscription is attached to.' },
        ],
      },
      age: {
        heading: 'Minimum age',
        blocks: [
          { p: 'You must be at least {minimumAge} years old to use JSPath. By using it, you confirm that you are.' },
          { p: 'JSPath does not verify age. It does not ask for a date of birth and operates no age-verification or parental-consent process, so this is a condition of use rather than something the service checks.' },
          { p: 'If the operator becomes aware that an account belongs to someone under {minimumAge}, that account and the data held with it may be deleted or its use restricted.' },
        ],
      },
      'guest-use': {
        heading: 'Using JSPath without an account',
        blocks: [
          { p: 'You can use JSPath as a guest. Browsing the curriculum, reading lessons, using the reference and cheat sheets, running code in the playground and working through the free exercises all work with no account and no sign-in.' },
          { p: 'As a guest, your progress is stored only in the browser you are using. It is not uploaded, and it is not linked to any identity. It stays on that device, and clearing your browser data removes it. Using a different browser or device starts from scratch.' },
        ],
      },
      'acceptable-use': {
        heading: 'Acceptable use',
        blocks: [
          { p: 'JSPath is meant to be learned from. Please use it lawfully, and please do not:' },
          {
            ul: [
              'attack, overload or disrupt the service or the infrastructure it runs on',
              'attempt to bypass access controls, sign-in, or the checks that separate free and paid content',
              'extract, copy, republish or redistribute paid Pro content, in bulk or otherwise, outside your own personal learning',
              'use automated means to scrape the platform at a scale that interferes with its operation',
              'use another person\'s account, or share your account so that others use a subscription you paid for as if it were their own',
              'use the code execution features to attack other systems or to host or distribute harmful code',
            ],
          },
          { p: 'Reporting a security issue is welcome and is not a breach of these terms when it follows the project\'s security policy. Testing that damages the service or reaches other people\'s data is not covered by that.' },
        ],
      },
      'learning-content': {
        heading: 'About the learning content',
        blocks: [
          { p: 'The lessons, explanations, exercises, solutions and interview material on JSPath are educational. They are written to teach how JavaScript works and how to reason about it.' },
          { p: 'JSPath does not guarantee any outcome. Completing the curriculum, passing exercises or working through the interview bank does not guarantee employment, an interview result, a certification, a qualification or any level of income.' },
          { p: 'Code examples are written to make a concept clear, not to be dropped unchanged into production. Real systems bring their own requirements — error handling, security, performance, accessibility, browser support — and adapting an example to them is your responsibility. You are responsible for the code you write and run.' },
        ],
      },
      'free-and-pro': {
        heading: 'Free and Pro access',
        blocks: [
          { p: 'What each plan includes is shown on the pricing page and is enforced by the service itself. Paid content is held on the server and released only after your subscription has been checked, so Pro material is not present in the application you download as a free user.' },
          { p: 'Which material is free and which is Pro may change as the platform grows. Existing paid material will not be moved behind an additional charge on top of an active Pro subscription.' },
        ],
      },
      subscriptions: {
        heading: 'Subscriptions and payment',
        blocks: [
          { p: 'JSPath Pro is sold as a recurring subscription, monthly or annual. Current prices are shown at checkout.' },
          { p: 'Payments are handled by Gumroad, which acts as the seller of record for JSPath Pro. Checkout, card details, billing and renewals all take place at Gumroad under Gumroad\'s own terms. JSPath never receives or stores your card details.' },
          { p: 'When you start a checkout from JSPath, your email address and your JSPath account identifier are passed to Gumroad so that the purchase can be matched to your account. JSPath then records the subscription status Gumroad reports — the plan, whether it is active, the period it is paid through, and whether it has been cancelled.' },
          { p: 'Your subscription renews automatically at the interval you chose until it is cancelled.' },
        ],
      },
      cancellation: {
        heading: 'Cancelling',
        blocks: [
          { p: 'You can cancel a Pro subscription at any time through Gumroad, from the Gumroad library where your purchase lives. JSPath links to it from your settings.' },
          { p: 'Cancelling stops the next renewal. It does not end your access immediately: Pro remains available until the end of the period you have already paid for, and JSPath shows that date while the subscription is winding down. When that date passes, the account returns to the free plan and keeps all of its learning progress.' },
          { p: 'Cancelling is not the same as asking for money back. See the Refund Policy.' },
        ],
      },
      refunds: {
        heading: 'Refunds',
        blocks: [
          { p: 'Refunds are covered by the JSPath Refund Policy, which forms part of these terms. Where the two appear to differ on a refund question, the Refund Policy applies.' },
        ],
      },
      'third-parties': {
        heading: 'Services JSPath relies on',
        blocks: [
          { p: 'JSPath is built on services operated by other companies, and using JSPath means those services are involved:' },
          {
            ul: [
              'Supabase — accounts, the database holding your progress and subscription status, and the server functions that release paid content',
              'Vercel — hosting and delivery of the application',
              'Google and GitHub — sign-in, if you choose to create an account',
              'Gumroad — checkout, subscriptions and payment administration',
            ],
          },
          { p: 'Each of these has its own terms and its own privacy practices, and JSPath does not control them. An outage or a change at any of them can affect JSPath.' },
        ],
      },
      'intellectual-property': {
        heading: 'Ownership',
        blocks: [
          { p: 'JSPath — its source code, its written learning content, its exercises, challenges, projects, interview material, reference and cheat sheets, its design and its branding — belongs to its author and is not open source. Using JSPath gives you permission to learn from it personally. It does not give you permission to copy it, republish it, sell it, build a competing product from it or create derivative works from it.' },
          { p: 'The code you write stays yours. Anything you type into the playground, an exercise, a challenge or a project — and anything you save as a snippet — belongs to you. JSPath claims no ownership of it and does not use it for any purpose beyond running it for you and saving your progress.' },
          { p: 'Standard JavaScript syntax, common patterns and the solutions you arrive at yourself are not claimed by anyone.' },
        ],
      },
      availability: {
        heading: 'Availability',
        blocks: [
          { p: 'JSPath is provided as it is, without a guaranteed level of uptime. It may be unavailable during maintenance, during a failure at one of the services it depends on, or for reasons outside anyone\'s control.' },
          { p: 'Guest use and most free reading continue to work offline in a browser that has already loaded the application, but sign-in, progress synchronisation and paid content all need a working connection.' },
        ],
      },
      'service-changes': {
        heading: 'Changes to JSPath',
        blocks: [
          { p: 'JSPath is actively developed. Features, content and layout change, and parts of it may be added, reworked or removed.' },
          { p: 'If a change would remove something substantial from an active Pro subscription, reasonable notice will be given where it is practical to do so.' },
        ],
      },
      'terms-changes': {
        heading: 'Changes to these terms',
        blocks: [
          { p: 'These terms may be updated — for example when the platform gains a feature, changes a provider or changes how data is handled. The date at the top of this page shows when the current version was published.' },
          { p: 'Continuing to use JSPath after an update means the updated terms apply to you. If a change is significant, notice will be given in the application where that is practical.' },
        ],
      },
      suspension: {
        heading: 'Suspension and termination',
        blocks: [
          { p: 'You can stop using JSPath at any time, and you can cancel a subscription at any time.' },
          { p: 'Access may be suspended or ended where it is necessary — because of unlawful use, an attack on the service, a deliberate attempt to defeat the paid-content protections, large-scale redistribution of Pro material, or conduct that puts other learners or the platform at risk. Where circumstances allow, a warning comes first and the response is proportionate to what happened.' },
          { p: 'If access is ended for one of those reasons while a subscription is running, that does not by itself entitle you to a refund of the remaining period, except where consumer law says otherwise.' },
        ],
      },
      liability: {
        heading: 'Disclaimers and liability',
        blocks: [
          { p: 'JSPath is provided on an "as is" and "as available" basis. Its content is written and reviewed with care, but no promise is made that it is free of errors, complete, current, or suitable for any particular purpose you have in mind.' },
          { p: 'To the extent permitted by applicable law, JSPath is not liable for indirect or consequential loss, for lost profits or opportunities, for lost data where you have not kept your own copy, or for problems caused by the third-party services it depends on.' },
          { p: 'Nothing in these terms limits liability that cannot be limited by law — including liability for death or personal injury caused by negligence, or for fraud — and nothing in them removes rights that consumer law in your country gives you and does not allow to be excluded.' },
        ],
      },
      'governing-law': {
        heading: 'Governing law and disputes',
        blocks: [
          { p: 'These terms are governed by the laws of the {governingLaw}.' },
          { p: 'Disputes that cannot be settled between us may be brought before the competent courts of the {disputeVenue}.' },
          { p: 'If you use JSPath as a consumer, none of this deprives you of the protection of mandatory provisions of the law of the country you live in, or of any right you have under applicable law to bring proceedings there.' },
        ],
      },
      contact: {
        heading: 'Contact',
        blocks: [
          { p: 'Questions about these terms can be sent to {email}.' },
        ],
      },
    },
  },

  /* ================================================================== *
   * Privacy Policy
   * ================================================================== */
  privacy: {
    title: 'Privacy Policy',
    intro:
      'This policy describes what JSPath stores, where it is stored and who else is involved. It is written from how the application actually works rather than from a template, so it is specific about what is kept and what is not.',
    sections: {
      scope: {
        heading: 'What this policy covers',
        blocks: [
          { p: 'This policy covers the JSPath application and the data it handles. It does not cover Google, GitHub, Gumroad, Supabase or Vercel, each of which has its own privacy policy.' },
          { p: 'How much of this applies to you depends on how you use JSPath. A guest who never signs in is covered by very little of it.' },
        ],
      },
      'guest-and-account': {
        heading: 'Guests and signed-in learners',
        blocks: [
          { p: 'JSPath works in two modes, and they store data very differently.' },
          { p: 'As a guest, everything stays in your browser. Your progress, your settings, your playground code and your saved snippets are written to your browser\'s local storage and are not uploaded anywhere. No account exists, nothing identifies you, and nothing you do as a guest reaches a server.' },
          { p: 'When you sign in, your learning progress is synchronised to the JSPath database so that it follows you between devices. That is the point at which your learning data leaves your browser, and it is stored against your account.' },
        ],
      },
      'account-data': {
        heading: 'Account data',
        blocks: [
          { p: 'Signing in with Google or GitHub gives JSPath the profile information that provider returns:' },
          {
            ul: [
              'your email address',
              'your display name or username, where the provider supplies one',
              'your avatar image address, where the provider supplies one',
              'which provider you signed in with, and the account identifier it issued',
            ],
          },
          { p: 'JSPath never receives your Google or GitHub password. Your name and avatar are used to show who is signed in. Your email address identifies your account and is what links a Gumroad purchase to it.' },
        ],
      },
      'learning-data': {
        heading: 'Learning data',
        blocks: [
          { p: 'For a signed-in learner, one record per account holds everything the platform has to remember in order to be useful:' },
          {
            ul: [
              'which lessons, exercises, quizzes, challenges, projects and interview questions you have opened and completed',
              'XP, streaks, daily activity and unlocked achievements',
              'bookmarks',
              'the answers you got wrong, so practice can return to them',
              'your placement assessment result, where you have taken one',
              'the profile you set during onboarding — display name, self-assessed level, goals and a daily time target',
              'your settings, including interface language, theme, reduced motion, text and editor size, and the daily goal',
            ],
          },
          { p: 'This record is readable and writable only by the account it belongs to. That is enforced by the database itself, not only by the application, so one learner cannot reach another\'s row.' },
          { p: 'Playground code and saved snippets are not part of this record. They stay in your browser.' },
        ],
      },
      'billing-data': {
        heading: 'Billing data',
        blocks: [
          { p: 'JSPath does not process payments and never sees your card. Gumroad handles checkout, card details, renewals and payment administration as the seller of record.' },
          { p: 'When you begin a checkout, JSPath passes your email address and your JSPath account identifier to Gumroad so the purchase can be matched to your account. What comes back and is stored is subscription state, not payment detail:' },
          {
            ul: [
              'the plan and billing interval',
              'the subscription status — active, cancelling, expired, past due, refunded or revoked',
              'when the subscription started and the date it is paid through',
              'whether it is set to end at the close of the current period',
              'the identifiers Gumroad uses for the subscription, sale and product',
              'the email address the purchase was made with',
            ],
          },
          { p: 'JSPath also keeps a short record of each billing notification it receives, so the same event is not processed twice. That record holds the event type, the identifier of the object it concerned and a cryptographic fingerprint of the message — deliberately not the message itself.' },
        ],
      },
      'technical-data': {
        heading: 'Technical data',
        blocks: [
          { p: 'JSPath does not run its own logging, monitoring or diagnostics, and it does not collect device or browser information about you.' },
          { p: 'Delivering any website involves the server seeing the request. The providers JSPath runs on — Vercel for hosting, Supabase for accounts and the database — necessarily process connection information such as your IP address in order to serve a request, and they handle it under their own privacy policies. JSPath does not receive that information as a dataset, does not build profiles from it, and does not connect it to your learning activity.' },
        ],
      },
      'browser-storage': {
        heading: 'What is stored in your browser',
        blocks: [
          { p: 'JSPath uses your browser\'s local storage. It holds:' },
          {
            ul: [
              'your learning progress — the only copy of it if you are a guest',
              'your interface preferences, including theme and language',
              'your most recent playground code',
              'snippets you have saved in the playground',
              'if you are signed in, the session token that keeps you signed in',
            ],
          },
          { p: 'You can clear all of it from your browser settings, and JSPath\'s own settings page can reset the learning data it holds. If local storage is unavailable — a private window, or a browser configured to block it — JSPath keeps the same information in memory for the visit instead, and the application still works.' },
          { p: 'Paid Pro content is deliberately never written to browser storage. It is fetched when needed and kept only in memory, so it does not remain on a shared computer after you sign out.' },
        ],
      },
      'third-parties': {
        heading: 'Who else is involved',
        blocks: [
          { p: 'These are all of the third parties a JSPath page interacts with:' },
          {
            ul: [
              'Supabase — accounts, the database holding progress and subscription status, and the server functions that release paid content',
              'Vercel — hosting and content delivery',
              'Google — sign-in, if you choose it; and Google Fonts, which serves the typefaces the interface uses',
              'GitHub — sign-in, if you choose it',
              'Gumroad — checkout, subscriptions and payment administration',
              'jsDelivr — a public code delivery network that serves the in-browser code editor',
            ],
          },
          { p: 'Google and GitHub are involved here as sign-in providers, and Google Fonts and jsDelivr as ways of delivering files to your browser. None of them is an advertising or analytics partner of JSPath. Requesting a font or an editor file means the network delivering it sees the request, as with any file a browser loads from another domain.' },
          { p: 'JSPath does not sell personal data, and it has no mechanism for doing so. It does not share your data with advertisers, data brokers or marketing services, because it does not work with any.' },
        ],
      },
      cookies: {
        heading: 'Cookies and tracking',
        blocks: [
          { p: 'JSPath sets no cookies. It runs no analytics, no telemetry, no advertising or measurement tags, no session recording and no cross-site tracking of any kind. There is nothing following you between sites, and no profile of you is built.' },
          { p: 'What JSPath stores locally is described above: it is your own progress and preferences, kept in your browser so the application can remember them, and it is not used to track you. This is also why JSPath shows no cookie consent banner — there is nothing to consent to.' },
        ],
      },
      security: {
        heading: 'Security',
        blocks: [
          { p: 'JSPath is built with access controls intended to keep your data yours. Each learner\'s progress row is reachable only by that learner, enforced in the database. Subscription records can be read by their owner and written only by the server. Paid content is released by a server-side function that checks your subscription against records the browser cannot influence, and refuses if anything about the request cannot be verified.' },
          { p: 'The application is served with a content security policy and related protections, and learner code runs in an isolated sandbox rather than in the page.' },
          { p: 'These measures are designed to reduce risk. No online service can promise that data is completely secure, and JSPath does not make that promise.' },
        ],
      },
      'your-controls': {
        heading: 'Your controls',
        blocks: [
          { p: 'Inside JSPath you can:' },
          {
            ul: [
              'use the platform as a guest, with no account and nothing uploaded',
              'sign out, which ends the session on that device',
              'change your interface language, theme and other preferences at any time',
              'export your learning progress as a file you keep',
              'import a progress file back in',
              'reset your learning data, which clears it in the browser and, if you are signed in, replaces the stored record with an empty one',
              'manage or cancel your subscription through Gumroad, linked from your settings',
            ],
          },
        ],
      },
      retention: {
        heading: 'How long data is kept',
        blocks: [
          { p: 'JSPath does not currently operate a fixed retention schedule, and this policy does not claim one.' },
          { p: 'In practice: your learning record is kept while your account exists, because it is your progress. Subscription records are kept while they are needed to establish what access an account has had. Guest data lives in your browser and lasts exactly as long as you leave it there. Resetting your learning data from settings clears it immediately.' },
          { p: 'The database is set up so that removing an account removes the learning and subscription records attached to it.' },
        ],
      },
      'your-rights': {
        heading: 'Your rights',
        blocks: [
          { p: 'Depending on where you live, applicable law may give you rights over personal data about you — typically to ask what is held, to have it corrected, to have it deleted, to obtain a copy, or to object to certain uses.' },
          { p: 'Some of these you can exercise directly: the export in settings gives you a copy of your learning data, and the reset clears it. Others need a request to be made.' },
          { p: 'This policy is a description of how JSPath handles data. It is not a certification, and no claim is made here that JSPath has been audited or certified under any privacy framework.' },
        ],
      },
      'policy-changes': {
        heading: 'Changes to this policy',
        blocks: [
          { p: 'This policy will be updated when what JSPath does with data changes — a new provider, a new stored field, a change in how something is delivered. The date at the top of this page shows when the current version was published.' },
          { p: 'It will not be updated to describe something JSPath does not do. If a section here ever stops matching the software, the software or the section is wrong, and it should be reported.' },
        ],
      },
      deletion: {
        heading: 'Deleting your account',
        blocks: [
          { p: 'You can delete your JSPath account yourself, from Settings under "Danger zone". The deletion runs on the server rather than in your browser, and it applies only to the account you are signed in to.' },
          { p: 'Deleting your account removes the account and the learning record stored with it - completed lessons, XP, streaks, bookmarks, achievements, placement result, onboarding profile and settings - together with the subscription records held against it. JSPath data stored in the browser you are using is cleared at the same time.' },
          { p: 'If a subscription can still renew, deletion is refused until you have cancelled it at Gumroad. JSPath cannot cancel a Gumroad subscription for you, and deleting the account first would leave a payment running with no account behind it.' },
          { p: 'Some things are outside what JSPath can reach:' },
          {
            ul: [
              'Gumroad keeps its own purchase and payment records, under its own policy and its own legal obligations. Deleting a JSPath account is not a refund.',
              'Google and GitHub keep their own account records. Deleting your JSPath account does not affect the account you signed in with.',
              'JSPath keeps a small billing-event log so that a payment notification is not processed twice. It holds an event type, a provider reference and a cryptographic fingerprint of the message, and carries no reference to your account or to you.',
            ],
          },
          { p: 'Deleting an account does not cancel a Gumroad subscription for you, and it is not a refund. If you later create a new JSPath account using the same email address the purchase was made with, a Pro purchase that is still valid can be claimed on the new account with "Restore Pro purchase" in Settings. That restores the entitlement only: the deleted learning progress is gone and cannot be brought back, and the new account starts as a new learning profile.' },
          { p: 'Questions about deletion can be sent to {email}.' },
        ],
      },
      children: {
        heading: 'Age',
        blocks: [
          { p: 'JSPath is intended for people aged {minimumAge} and over, and is not knowingly provided to anyone younger.' },
          { p: 'JSPath does not verify age. It does not ask for a date of birth, and it operates no parental-consent process.' },
          { p: 'If the operator becomes aware that an account was created by someone under {minimumAge}, that account and the data held with it may be deleted or its use restricted.' },
        ],
      },
      contact: {
        heading: 'Contact',
        blocks: [
          { p: 'Privacy questions and requests can be sent to {email}. That is the channel for asking what is held about you, asking for a correction, asking about deletion, or making any other data-rights request available to you under applicable law.' },
          { p: 'Please do not send passwords, access tokens or full payment-card details. They are never needed, and JSPath has no use for them.' },
          { p: 'No fixed response time is promised here. Requests are dealt with as promptly as is practical.' },
        ],
      },
    },
  },

  /* ================================================================== *
   * Refund Policy
   * ================================================================== */
  refund: {
    title: 'Refund Policy',
    intro:
      'This policy explains how paying for JSPath Pro works, what cancelling does, and what happens when a payment is returned.',
    sections: {
      scope: {
        heading: 'What this covers',
        blocks: [
          { p: 'This policy applies to JSPath Pro subscriptions. Everything JSPath offers for free is free, and nothing here applies to it.' },
        ],
      },
      'who-you-pay': {
        heading: 'Who you pay',
        blocks: [
          { p: 'JSPath Pro is sold through Gumroad, which is the seller of record for the purchase. Your payment goes to Gumroad, your card details are handled by Gumroad, and your subscription lives in your Gumroad library.' },
          { p: 'This matters for refunds: the money is returned by the party that took it. JSPath controls access to Pro, and Gumroad controls the payment itself.' },
        ],
      },
      'cancellation-is-not-a-refund': {
        heading: 'Cancelling is not the same as a refund',
        blocks: [
          { p: 'These are two different things, and it is worth being clear about which one you want.' },
          { p: 'Cancelling stops your subscription from renewing. It does not return a payment you have already made, and it does not cut your access short — Pro stays available until the end of the period you have paid for, and JSPath shows you that date. When the date passes, your account moves to the free plan and keeps every bit of learning progress.' },
          { p: 'A refund is a payment being returned. That is a separate request and is covered by the rest of this policy.' },
          { p: 'If what you want is simply to stop paying, cancelling is enough, and you lose nothing you have already paid for.' },
        ],
      },
      'access-after-a-refund': {
        heading: 'What happens to your access',
        blocks: [
          { p: 'When a payment is refunded, the subscription stops granting Pro. JSPath records the refunded status and the account returns to the free plan, normally within a short time of the refund being reported.' },
          { p: 'Your learning progress is not affected. Lessons you have completed, XP, streaks, achievements and bookmarks all remain, and everything on the free plan stays open to you. Only the Pro material closes.' },
        ],
      },
      'payment-problems': {
        heading: 'Payment or access problems',
        blocks: [
          { p: 'Sometimes a payment succeeds but Pro does not open. This is usually a matching problem — most often a purchase made with a different email address than the one your JSPath account uses, since that address is how a purchase is connected to an account.' },
          { p: 'JSPath re-checks subscription state against Gumroad, so a delay of a few minutes often resolves on its own. Signing out and back in refreshes it too.' },
          { p: 'If Pro still has not opened, this is a support problem before it is a refund problem, and it is usually fixable — a mismatched email address does not mean the payment is lost. The same is true of being charged twice for the same subscription. Get in touch at {email} with the address you paid from, and the Gumroad receipt if you have it.' },
        ],
      },
      'statutory-rights': {
        heading: 'Your rights under consumer law',
        blocks: [
          { p: 'Consumer law in your country may give you rights to cancel or to be refunded that a policy cannot take away — for example a statutory cooling-off period for something bought online.' },
          { p: 'Nothing in this policy limits rights that cannot be excluded under applicable consumer law. Where this policy and a mandatory legal right disagree, the legal right applies.' },
          { p: 'Gumroad, as the seller of record, has its own refund handling, and a payment provider may also offer its own dispute process. Those exist independently of this policy.' },
        ],
      },
      'policy-changes': {
        heading: 'Changes to this policy',
        blocks: [
          { p: 'This policy may be updated, particularly if the payment provider or the subscription model changes. The date at the top of this page shows when the current version was published. A purchase is treated under the policy that was published when it was made.' },
        ],
      },
      eligibility: {
        heading: 'When a refund is available',
        blocks: [
          { p: 'A refund of an initial eligible Pro purchase may be requested within {refundDays} calendar days of the purchase date. Calendar days, not working days: weekends and holidays count.' },
          { p: 'Renewal payments are generally not refundable. A subscription renews on a date you know in advance, and cancelling before that date prevents the charge - that is the intended way to stop paying.' },
          { p: 'Exceptional renewal requests are looked at individually. If your circumstances are unusual it is worth getting in touch, but a case-by-case review is exactly that: an outcome is not promised, and nothing here creates a second {refundDays}-day window for renewals.' },
          { p: 'None of this affects rights you have under consumer law that cannot be excluded. See below.' },
        ],
      },
      'how-to-request': {
        heading: 'Requesting a refund',
        blocks: [
          { p: 'Send your request to {email}.' },
          { p: 'Include enough for the payment to be identified: the email address the purchase was made with, and the Gumroad receipt or order reference if you have it. A sentence about what went wrong helps, particularly where the problem is that Pro never opened.' },
          { p: 'Never send your password, an access token, or full payment-card details. They are not needed to identify a payment, and they should not be emailed to anyone.' },
        ],
      },
      contact: {
        heading: 'Contact',
        blocks: [
          { p: 'Refund and billing questions can be sent to {email}.' },
        ],
      },
    },
  },
};
