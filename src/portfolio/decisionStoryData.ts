interface DecisionStory {
  heading: string
  context: string
  decision: string
  evidence: string
  tradeoff: string
}

/** Copy and source checkpoints: CONTENT.md §11. No unsourced performance or production-readiness claims. */
export const decisionStories: Record<string, DecisionStory> = {
  offday: {
    heading: 'A shared calendar does not mean shared access.',
    context: 'Employees and managers use the same calendar, with different permissions. Each organization has its own workspace.',
    decision: 'Organization membership and roles are checked on the server. Private notes stay with the requester and managers, and are omitted from the assistant’s context.',
    evidence: 'Tests cover organization separation, permissions and private notes.',
    tradeoff: 'Built with one other developer. A working MVP, with commercial features still to finish.',
  },
  leakscan: {
    heading: 'Prove ownership before a scan starts.',
    context: 'The scanner can access an app’s code and database. Before it runs, the person requesting the scan must prove they control the domain.',
    decision: 'Domain verification comes before scanning. Optional repository and database access is read-only. Stored credentials are encrypted, can be deleted by the app’s owner, and expire after 14 days.',
    evidence: 'The checks find the issues. An optional AI pass rewrites the explanations and fix prompts.',
    tradeoff: 'Without AI, the report uses predefined explanations. Built alone and not yet launched.',
  },
  // The owner's reason for the rebuild (2026-11-01); the scope figures are CONTENT.md §3. No switchover figures exist.
  'bayyinah-tv': {
    heading: 'Rebuilt from an empty template, organized by feature.',
    context: 'Version two moved to Vue 3 and Nuxt 3, and had to carry much more: live streams, subscriptions, gifting and an Arabic, right-to-left interface. The first version’s template was hard to extend that far.',
    decision: 'Instead of upgrading the old template in place, the team started from an empty Nuxt 3 project with a cleaner, feature-based structure built for the larger product.',
    evidence: 'The rebuild covers 34 routes, 270+ components and 25 stores, and the same web app runs in the browser and inside both store apps.',
    tradeoff: 'Every screen had to be rebuilt. No downtime or retention figures are available for the switch.',
  },
  'care-platform': {
    heading: 'Keep each organization’s records separate.',
    context: 'Care teams use device vitals, care plans, labs and billing records in one platform. Many organizations share it, with different roles and timezones.',
    decision: 'The Laravel API enforces organization boundaries and role checks. Backend work also covers timezone fixes, enrollment drafts and the lab catalog.',
    evidence: 'One billing report went from 16 database queries to 2 and no longer times out.',
    tradeoff: 'That result describes one report, not the entire API. The platform rewrite remains a team effort and is in progress.',
  },
}
