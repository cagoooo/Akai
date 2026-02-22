import {
    collection,
    doc,
    addDoc,
    getDocs,
    getDoc,
    updateDoc,
    deleteDoc,
    query,
    orderBy,
    serverTimestamp,
    Timestamp,
    Firestore,
    where
} from 'firebase/firestore';
import { User } from 'firebase/auth';
import { db, isFirebaseAvailable } from './firebase';

export type WishType = 'suggestion' | 'feedback';
export type WishStatus = 'pending' | 'processed';

export interface Wish {
    id: string;
    userId: string;
    userName: string;
    userPhoto?: string | null;
    type: WishType;
    content: string;
    rating?: number; // Only for feedback
    status: WishStatus;
    createdAt: Timestamp;
    updatedAt?: Timestamp;
}

export interface WishSubmitData {
    type: WishType;
    content: string;
    rating?: number;
}

const WISHES_COLLECTION = 'wishingWell';

/**
 * 提交新的許願或回饋
 */
export async function submitWish(
    user: User | null,
    data: WishSubmitData
): Promise<string | null> {
    if (!isFirebaseAvailable() || !db) {
        console.warn('Firebase 不可用，無法提交許願');
        return null;
    }

    try {
        const wishData: any = {
            userId: user?.uid || 'anonymous',
            userName: user?.displayName || '熱心老師 (未登入)',
            type: data.type,
            content: data.content.trim(),
            status: 'pending' as WishStatus,
            createdAt: serverTimestamp(),
        };

        if (user?.photoURL) {
            wishData.userPhoto = user.photoURL;
        }

        if (data.rating !== undefined) {
            wishData.rating = data.rating;
        }

        const docRef = await addDoc(
            collection(db as Firestore, WISHES_COLLECTION),
            wishData
        );

        console.log('許願/回饋已提交:', docRef.id);
        return docRef.id;
    } catch (error) {
        console.error('提交許願失敗:', error);
        return null;
    }
}

/**
 * 取得所有許願列表 (供管理員使用)
 */
export async function getWishes(statusFilter?: WishStatus): Promise<Wish[]> {
    if (!isFirebaseAvailable() || !db) {
        return [];
    }

    try {
        let q = query(
            collection(db as Firestore, WISHES_COLLECTION),
            orderBy('createdAt', 'desc')
        );

        if (statusFilter) {
            q = query(
                collection(db as Firestore, WISHES_COLLECTION),
                where('status', '==', statusFilter),
                orderBy('createdAt', 'desc')
            );
        }

        const querySnapshot = await getDocs(q);
        const wishes: Wish[] = [];

        querySnapshot.forEach((doc) => {
            wishes.push({
                id: doc.id,
                ...doc.data(),
            } as Wish);
        });

        return wishes;
    } catch (error) {
        console.error('取得許願清單失敗:', error);
        return [];
    }
}

/**
 * 更新許願狀態
 */
export async function updateWishStatus(
    wishId: string,
    status: WishStatus
): Promise<boolean> {
    if (!isFirebaseAvailable() || !db) {
        return false;
    }

    try {
        const wishRef = doc(db as Firestore, WISHES_COLLECTION, wishId);
        await updateDoc(wishRef, {
            status,
            updatedAt: serverTimestamp()
        });
        return true;
    } catch (error) {
        console.error('更新許願狀態失敗:', error);
        return false;
    }
}

/**
 * 刪除許願
 */
export async function deleteWish(wishId: string): Promise<boolean> {
    if (!isFirebaseAvailable() || !db) {
        return false;
    }

    try {
        const wishRef = doc(db as Firestore, WISHES_COLLECTION, wishId);
        await deleteDoc(wishRef);
        return true;
    } catch (error) {
        console.error('刪除許願失敗:', error);
        return false;
    }
}
