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
    context: 'A scanner can receive access to an app’s repository and database. The flow needs a clear boundary before it runs.',
    decision: 'Domain verification comes before scanning. Optional repository and database access is read-only. Stored credentials are encrypted, can be deleted by the app’s owner, and expire after 14 days.',
    evidence: 'The checks produce findings; an optional AI pass rewrites their explanations and fix prompts.',
    tradeoff: 'Without the optional provider, the report uses templated explanations. Built alone; pre-launch.',
  },
  'care-platform': {
    heading: 'Keep each organization’s records in its own lane.',
    context: 'Many organizations share the care platform. Their records and roles need to stay separate.',
    decision: 'The Laravel API handles tenant boundaries, enrollment drafts and the lab catalog.',
    evidence: 'One billing report went from 16 database queries to 2 and no longer times out.',
    tradeoff: 'That result describes one report, not the entire API. The platform rewrite remains a team effort and is in progress.',
  },
}
