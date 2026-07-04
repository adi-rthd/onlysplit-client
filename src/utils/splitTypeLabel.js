/**
 * Returns a human-readable label for a split type.
 * Uses the backend-provided splitType as the single source of truth.
 *
 * @param {string} splitType - The split type from the API (equal, percentage, exact, shares)
 * @returns {string} Human-readable label
 */
export function getSplitTypeLabel(splitType) {
  switch (splitType?.toLowerCase()) {
    case 'equal':
      return 'Equal Split';
    case 'percentage':
      return 'Percentage Split';
    case 'exact':
      return 'Exact Split';
    case 'shares':
      return 'Share Split';
    default:
      return 'Split';
  }
}
