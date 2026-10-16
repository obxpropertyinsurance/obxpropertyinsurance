// Only retained in memory for this mounted form. Never persisted or sent to analytics.
export function createSubmissionIdentity({ makeId = () => globalThis.crypto?.randomUUID?.() } = {}) {
  let previous = '', id;
  return {
    get(payload) {
      const content = JSON.stringify(Object.keys(payload).filter(key => !['submittedAt', 'submissionId'].includes(key))
        .sort().map(key => [key, payload[key]]));
      if (content !== previous || !id) {
        previous = content;
        try { id = makeId(); } catch { id = undefined; }
      }
      return id;
    },
    reset() { previous = ''; id = undefined; },
  };
}
