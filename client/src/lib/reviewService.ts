/**
 * 評論與評分服務
 * 處理評論的 CRUD 和評分統計
 */

import {
    collection,
    doc,
    addDoc,
    getDocs,
    getDoc,
    onSnapshot,
    runTransaction,
    query,
    where,
    orderBy,
    limit,
    serverTimestamp,
    Timestamp,
    Firestore
} from 'firebase/firestore';
import { User } from 'firebase/auth';
import { auth, db, isFirebaseAvailable } from './firebase';

// ==================== 類型定義 ====================

export interface Review {
    id: string;
    toolId: number;
    userId: string;
    userName: string;
    userPhoto?: string | null;
    rating: 1 | 2 | 3 | 4 | 5;
    comment: string;
    likes: number;
    likedBy: string[];
    createdAt: Timestamp;
    updatedAt?: Timestamp;
    edited?: boolean;
}

export interface ToolRating {
    toolId: number;
    averageRating: number;
    totalReviews: number;
    ratingCounts: {
        1: number;
        2: number;
        3: number;
        4: number;
        5: number;
    };
}

// ==================== 常數 ====================

const REVIEWS_COLLECTION = 'toolReviews';
const RATINGS_COLLECTION = 'toolRatings';

function validToolId(value: number): boolean {
    return Number.isInteger(value) && value >= 1 && value <= 100000;
}

function validRating(value: number): boolean {
    return Number.isInteger(value) && value >= 1 && value <= 5;
}

function validComment(value: string): boolean {
    return typeof value === 'string' && value.length <= 500 && value.trim().length > 0;
}

function validReviewId(value: string): boolean {
    return typeof value === 'string' && value.length > 0 && !value.includes('/');
}

// ==================== 評論相關 ====================

/**
 * 新增評論
 *
 * 注意：toolTitle 是可選但強烈建議填入 — Cloud Function `onReviewCreated`
 *       會用此欄位組 LINE 通知標題，缺少時只會顯示「工具 #ID」。
 */
export async function addReview(
    toolId: number,
    user: User,
    rating: number,
    comment: string,
    toolTitle?: string
): Promise<string | null> {
    if (!isFirebaseAvailable() || !db || !user || user.uid !== auth?.currentUser?.uid
        || !user.uid || !validToolId(toolId) || !validRating(rating) || !validComment(comment)) {
        return null;
    }

    try {
        if (toolTitle !== undefined && (typeof toolTitle !== 'string' || !toolTitle.trim())) return null;
        const reviewData = {
            toolId,
            toolTitle: (toolTitle?.trim() || `工具 #${toolId}`).slice(0, 200),
            userId: user.uid,
            userName: (user.displayName?.trim() || '匿名用戶').slice(0, 80),
            userPhoto: typeof user.photoURL === 'string' && user.photoURL.length <= 500 ? user.photoURL : null,
            rating: rating as 1 | 2 | 3 | 4 | 5,
            comment: comment.trim(),
            likes: 0,
            likedBy: [],
            createdAt: serverTimestamp(),
        };

        const docRef = await addDoc(
            collection(db as Firestore, REVIEWS_COLLECTION),
            reviewData
        );

        // 評分統計由後端依實際評論重算；評論寫入成功即可回報，不等待統計同步。
        console.log('評論已新增:', docRef.id);
        return docRef.id;
    } catch (error) {
        console.error('新增評論失敗:', error);
        return null;
    }
}

/**
 * 取得工具的評論列表
 */
export async function getReviews(
    toolId: number,
    limitCount: number = 20
): Promise<Review[]> {
    if (!isFirebaseAvailable() || !db) {
        return [];
    }

    try {
        const q = query(
            collection(db as Firestore, REVIEWS_COLLECTION),
            where('toolId', '==', toolId),
            orderBy('createdAt', 'desc'),
            limit(limitCount)
        );

        const querySnapshot = await getDocs(q);
        const reviews: Review[] = [];

        querySnapshot.forEach((doc) => {
            reviews.push({
                ...doc.data(),
                id: doc.id,
            } as Review);
        });

        return reviews;
    } catch (error) {
        console.error('取得評論列表失敗:', error);
        return [];
    }
}

/**
 * 檢查用戶是否已評論過此工具
 */
export async function hasUserReviewed(
    toolId: number,
    userId: string
): Promise<boolean> {
    if (!isFirebaseAvailable() || !db) {
        return false;
    }

    try {
        const q = query(
            collection(db as Firestore, REVIEWS_COLLECTION),
            where('toolId', '==', toolId),
            where('userId', '==', userId),
            limit(1)
        );

        const querySnapshot = await getDocs(q);
        return !querySnapshot.empty;
    } catch (error) {
        console.error('檢查用戶評論失敗:', error);
        return false;
    }
}

/** 以交易讀取目前名單，避免重複點讚、重試或其他使用者同時更新造成漂移。 */
async function changeReviewLike(reviewId: string, userId: string, adding: boolean): Promise<boolean> {
    if (!isFirebaseAvailable() || !db || !validReviewId(reviewId)
        || !userId || auth?.currentUser?.uid !== userId) return false;
    try {
        const reviewRef = doc(db as Firestore, REVIEWS_COLLECTION, reviewId);
        return await runTransaction(db as Firestore, async (transaction) => {
            if (auth?.currentUser?.uid !== userId) return false;
            const snapshot = await transaction.get(reviewRef);
            if (!snapshot.exists() || auth?.currentUser?.uid !== userId) return false;
            const { likes = 0, likedBy = [] } = snapshot.data();
            // 缺欄沿用舊版 0／空名單起始；型別錯誤不修寫，既有計數偏移不重建。
            if (!Number.isSafeInteger(likes) || likes < 0 || !Array.isArray(likedBy)
                || likedBy.some((uid: unknown) => typeof uid !== 'string')
                || new Set(likedBy).size !== likedBy.length) return false;
            const alreadyLiked = likedBy.includes(userId);
            if (adding === alreadyLiked) return true;
            const nextLikes = likes + (adding ? 1 : -1);
            if (!Number.isSafeInteger(nextLikes) || nextLikes < 0) return false;
            transaction.update(reviewRef, {
                likes: nextLikes,
                likedBy: adding ? [...likedBy, userId] : likedBy.filter((uid: string) => uid !== userId),
            });
            return true;
        });
    } catch (error) {
        console.error('更新點讚失敗:', error);
        return false;
    }
}

/** 點讚評論；重複操作視為成功且不寫入。 */
export async function likeReview(reviewId: string, userId: string): Promise<boolean> {
    return changeReviewLike(reviewId, userId, true);
}

/** 取消點讚；重複操作視為成功且不寫入。 */
export async function unlikeReview(reviewId: string, userId: string): Promise<boolean> {
    return changeReviewLike(reviewId, userId, false);
}

/**
 * 刪除評論
 */
export async function deleteReview(
    reviewId: string
): Promise<boolean> {
    const uid = auth?.currentUser?.uid;
    if (!isFirebaseAvailable() || !db || !uid || !validReviewId(reviewId)) return false;
    try {
        const reviewRef = doc(db as Firestore, REVIEWS_COLLECTION, reviewId);
        return await runTransaction(db as Firestore, async (transaction) => {
            const snapshot = await transaction.get(reviewRef);
            if (!snapshot.exists() || auth?.currentUser?.uid !== uid || snapshot.data().userId !== uid) return false;
            transaction.delete(reviewRef);
            return true;
        });
    } catch (error) {
        console.error('刪除評論失敗:', error);
        return false;
    }
}

/**
 * 更新評論
 */
export async function updateReview(
    reviewId: string,
    data: { comment?: string; rating?: number }
): Promise<boolean> {
    const uid = auth?.currentUser?.uid;
    if (!isFirebaseAvailable() || !db || !uid || !validReviewId(reviewId)
        || !data || (data.comment === undefined && data.rating === undefined)
        || (data.comment !== undefined && !validComment(data.comment))
        || (data.rating !== undefined && !validRating(data.rating))) return false;
    try {
        const reviewRef = doc(db as Firestore, REVIEWS_COLLECTION, reviewId);
        return await runTransaction(db as Firestore, async (transaction) => {
            const snapshot = await transaction.get(reviewRef);
            if (!snapshot.exists() || auth?.currentUser?.uid !== uid || snapshot.data().userId !== uid) return false;
            const updateData: { updatedAt: ReturnType<typeof serverTimestamp>; edited: boolean; comment?: string; rating?: number } = { updatedAt: serverTimestamp(), edited: true };
            if (data.comment !== undefined) updateData.comment = data.comment.trim();
            if (data.rating !== undefined) updateData.rating = data.rating;
            transaction.update(reviewRef, updateData);
            return true;
        });
    } catch (error) {
        console.error('更新評論失敗:', error);
        return false;
    }
}

// ==================== 評分統計 ====================

/**
 * 取得工具評分統計
 */
export async function getToolRating(
    toolId: number
): Promise<ToolRating | null> {
    if (!isFirebaseAvailable() || !db) {
        return null;
    }

    try {
        const ratingRef = doc(db as Firestore, RATINGS_COLLECTION, `tool_${toolId}`);
        const ratingSnap = await getDoc(ratingRef);

        if (ratingSnap.exists()) {
            return ratingSnap.data() as ToolRating;
        }
        return null;
    } catch (error) {
        console.error('取得評分統計失敗:', error);
        return null;
    }
}

/** 後端完成計票後直接推送此工具統計；回傳解除訂閱，錯誤不偽造零分。 */
export function subscribeToolRating(
    toolId: number,
    onRating: (rating: ToolRating | null) => void,
    onError?: () => void
): () => void {
    if (!isFirebaseAvailable() || !db || !validToolId(toolId)) {
        onError?.();
        return () => {};
    }
    try {
        const ratingRef = doc(db as Firestore, RATINGS_COLLECTION, `tool_${toolId}`);
        return onSnapshot(ratingRef, (snapshot) => {
            onRating(snapshot.exists() ? snapshot.data() as ToolRating : null);
        }, (error) => {
            console.warn('即時評分同步失敗:', error);
            onError?.();
        });
    } catch (error) {
        console.warn('無法啟動即時評分同步:', error);
        onError?.();
        return () => {};
    }
}
