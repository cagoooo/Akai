/**
 * 評論回覆服務
 * 處理回覆的 CRUD 操作
 */

import {
    collection,
    doc,
    addDoc,
    getDocs,
    deleteDoc,
    updateDoc,
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

export interface ReviewReply {
    id: string;
    reviewId: string;       // 父評論 ID
    userId: string;
    userName: string;
    userPhotoURL?: string;
    content: string;
    createdAt: Timestamp;
    likes: number;
    likedBy: string[];
}

// ==================== 常數 ====================

const REPLIES_COLLECTION = 'reviewReplies';

// ==================== 回覆相關 ====================

/**
 * 新增回覆
 */
export async function addReply(
    reviewId: string,
    user: User,
    content: string
): Promise<string | null> {
    if (!isFirebaseAvailable() || !db) {
        console.warn('Firebase 不可用，無法新增回覆');
        return null;
    }

    try {
        const replyData = {
            reviewId,
            userId: user.uid,
            userName: user.displayName || '匿名用戶',
            userPhotoURL: user.photoURL || null,
            content: content.trim(),
            likes: 0,
            likedBy: [],
            createdAt: serverTimestamp(),
        };

        const docRef = await addDoc(
            collection(db as Firestore, REPLIES_COLLECTION),
            replyData
        );

        return docRef.id;
    } catch (error) {
        console.error('新增回覆失敗:', error);
        return null;
    }
}

/**
 * 取得評論的回覆列表
 */
export async function getReplies(
    reviewId: string,
    limitCount: number = 50
): Promise<ReviewReply[]> {
    if (!isFirebaseAvailable() || !db) {
        return [];
    }

    try {
        const q = query(
            collection(db as Firestore, REPLIES_COLLECTION),
            where('reviewId', '==', reviewId),
            orderBy('createdAt', 'asc'),
            limit(limitCount)
        );

        const querySnapshot = await getDocs(q);
        const replies: ReviewReply[] = [];

        querySnapshot.forEach((doc) => {
            replies.push({
                id: doc.id,
                ...doc.data(),
            } as ReviewReply);
        });

        return replies;
    } catch (error) {
        console.error('取得回覆列表失敗:', error);
        return [];
    }
}

/**
 * 刪除回覆
 */
export async function deleteReply(
    replyId: string
): Promise<boolean> {
    if (!isFirebaseAvailable() || !db) {
        return false;
    }

    try {
        const replyRef = doc(db as Firestore, REPLIES_COLLECTION, replyId);
        await deleteDoc(replyRef);
        return true;
    } catch (error) {
        console.error('刪除回覆失敗:', error);
        return false;
    }
}

/**
 * 點讚回覆
 */
export async function likeReply(
    replyId: string,
    userId: string
): Promise<boolean> {
    if (!isFirebaseAvailable() || !db) {
        return false;
    }

    try {
        const replyRef = doc(db as Firestore, REPLIES_COLLECTION, replyId);
        await updateDoc(replyRef, {
            likes: increment(1),
            likedBy: arrayUnion(userId),
        });
        return true;
    } catch (error) {
        console.error('點讚回覆失敗:', error);
        return false;
    }
}

/**
 * 取消點讚回覆
 */
export async function unlikeReply(
    replyId: string,
    userId: string
): Promise<boolean> {
    if (!isFirebaseAvailable() || !db) {
        return false;
    }

    try {
        const replyRef = doc(db as Firestore, REPLIES_COLLECTION, replyId);
        await updateDoc(replyRef, {
            likes: increment(-1),
            likedBy: arrayRemove(userId),
        });
        return true;
    } catch (error) {
        console.error('取消點讚回覆失敗:', error);
        return false;
    }
}

/**
 * 取得回覆數量
 */
export async function getReplyCount(
    reviewId: string
): Promise<number> {
    if (!isFirebaseAvailable() || !db) {
        return 0;
    }

    try {
        const q = query(
            collection(db as Firestore, REPLIES_COLLECTION),
            where('reviewId', '==', reviewId)
        );

        const querySnapshot = await getDocs(q);
        return querySnapshot.size;
    } catch (error) {
        console.error('取得回覆數量失敗:', error);
        return 0;
    }
}
