import { onDocumentWritten } from 'firebase-functions/v2/firestore';
import { getFirestore } from 'firebase-admin/firestore';
import { syncToolRatingChange } from './lib/toolRatingAggregation';

export const akai_syncToolRating = onDocumentWritten(
  {
    document: 'toolReviews/{reviewId}',
    region: 'asia-east1',
    retry: true,
    maxInstances: 3,
    concurrency: 1,
    timeoutSeconds: 60,
  },
  async event => {
    if (!event.data) return;
    await syncToolRatingChange(
      getFirestore(),
      event.data.before.exists ? event.data.before.data() : undefined,
      event.data.after.exists ? event.data.after.data() : undefined,
    );
  },
);
