// Appeal status is retained as a fallback while frontend/backend deploy separately.
export const isCancelled = violation => violation.is_cancelled || violation.appeal_status === 'accepted';
export const isUnpaidFine = violation => !isCancelled(violation) && violation.action_taken === 'fine' && !violation.is_paid;
