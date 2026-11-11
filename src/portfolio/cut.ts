/**
 * `?cut=1`: the owner's content-cut variant (approved for comparison 2026-11-11), off by default. Read once when the home
 * module loads, so it holds for the visit and switching never animates. With no flag the page is unchanged.
 */
export const CUT = typeof location !== 'undefined' && new URLSearchParams(location.search).get('cut') === '1'
