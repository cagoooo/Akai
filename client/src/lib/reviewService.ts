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
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    limit,
    increment,
    arrayUnion,
    arrayRemove,
    serverTimestamp,
    Timestamp,
    Firestore
} from 'firebase/firestore';
import { User } from 'firebase/auth';
import { db, isFirebaseAvailable } from './firebase';

// ==================== 類型定義 ====================

export interface Review {
    id: string;
    toolId: number;
    userId: string;
    userName: string;
    userPhoto?: string;
    rating: 1 | 2 | 3 | 4 | 5;
    comment: string;
    likes: number;
    likedBy: string[];
    createdAt: Timestamp;
    updatedAt?: Timestamp;
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

// ==================== 評論相關 ====================

/**
 * 新增評論
 */
export async function addReview(
    toolId: number,
    user: User,
    rating: number,
    comment: string
): Promise<string | null> {
    if (!isFirebaseAvailable() || !db) {
        console.warn('Firebase 不可用，無法新增評論');
        return null;
    }

    try {
        const reviewData = {
            toolId,
            userId: user.uid,
            userName: user.displayName || '匿名用戶',
            userPhoto: user.photoURL || null,
            rating: Math.min(5, Math.max(1, Math.round(rating))) as 1 | 2 | 3 | 4 | 5,
            comment: comment.trim(),
            likes: 0,
            likedBy: [],
            createdAt: serverTimestamp(),
        };

        const docRef = await addDoc(
            collection(db as Firestore, REVIEWS_COLLECTION),
            reviewData
        );

        // 更新評分統計
        await updateToolRating(toolId, reviewData.rating);

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
                id: doc.id,
                ...doc.data(),
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

/**
 * 點讚評論
 */
export async function likeReview(
    reviewId: string,
    userId: string
): Promise<boolean> {
    if (!isFirebaseAvailable() || !db) {
        return false;
    }

    try {
        const reviewRef = doc(db as Firestore, REVIEWS_COLLECTION, reviewId);
        await updateDoc(reviewRef, {
            likes: increment(1),
            likedBy: arrayUnion(userId),
        });
        return true;
    } catch (error) {
        console.error('點讚失敗:', error);
        return false;
    }
}

/**
 * 取消點讚
 */
export async function unlikeReview(
    reviewId: string,
    userId: string
): Promise<boolean> {
    if (!isFirebaseAvailable() || !db) {
        return false;
    }

    try {
        const reviewRef = doc(db as Firestore, REVIEWS_COLLECTION, reviewId);
        await updateDoc(reviewRef, {
            likes: increment(-1),
            likedBy: arrayRemove(userId),
        });
        return true;
    } catch (error) {
        console.error('取消點讚失敗:', error);
        return false;
    }
}

/**
 * 刪除評論
 */
export async function deleteReview(
    reviewId: string,
    userId: string
): Promise<boolean> {
    if (!isFirebaseAvailable() || !db) {
        return false;
    }

    try {
        const reviewRef = doc(db as Firestore, REVIEWS_COLLECTION, reviewId);
        const reviewSnap = await getDoc(reviewRef);

        if (!reviewSnap.exists()) {
            return false;
        }

        const reviewData = reviewSnap.data();
        if (reviewData.userId !== userId) {
            console.warn('無權刪除此評論');
            return false;
        }

        await deleteDoc(reviewRef);
        return true;
    } catch (error) {
        console.error('刪除評論失敗:', error);
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

/**
 * 更新工具評分統計 (內部使用)
 */
async function updateToolRating(
    toolId: number,
    newRating: number
): Promise<void> {
    if (!isFirebaseAvailable() || !db) {
        return;
    }

    try {
        const ratingRef = doc(db as Firestore, RATINGS_COLLECTION, `tool_${toolId}`);
        const ratingSnap = await getDoc(ratingRef);

        if (ratingSnap.exists()) {
            const data = ratingSnap.data() as ToolRating;
            const newTotalReviews = data.totalReviews + 1;
            const newRatingCounts = { ...data.ratingCounts };
            newRatingCounts[newRating as 1 | 2 | 3 | 4 | 5] += 1;

            // 計算新的平均分
            const totalScore = Object.entries(newRatingCounts).reduce(
                (sum, [star, count]) => sum + parseInt(star) * count,
                0
            );
            const newAverage = totalScore / newTotalReviews;

            await updateDoc(ratingRef, {
                totalReviews: newTotalReviews,
                averageRating: Math.round(newAverage * 10) / 10,
                ratingCounts: newRatingCounts,
            });
        } else {
            // 建立新記錄
            const newData: ToolRating = {
                toolId,
                averageRating: newRating,
                totalReviews: 1,
                ratingCounts: {
                    1: newRating === 1 ? 1 : 0,
                    2: newRating === 2 ? 1 : 0,
                    3: newRating === 3 ? 1 : 0,
                    4: newRating === 4 ? 1 : 0,
                    5: newRating === 5 ? 1 : 0,
                },
            };

            await updateDoc(ratingRef, newData).catch(() => {
                // 如果文檔不存在，使用 setDoc
                const { setDoc } = require('firebase/firestore');
                return setDoc(ratingRef, newData);
            });
        }
    } catch (error) {
        console.error('更新評分統計失敗:', error);
    }
}
