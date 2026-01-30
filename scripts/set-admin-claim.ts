
import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import * as readline from 'readline';
import * as fs from 'fs';
import * as path from 'path';

// 檢查 Service Account 金鑰
const SERVICE_ACCOUNT_PATH = path.join(process.cwd(), 'service-account.json');

console.log('正在尋找 Service Account 金鑰:', SERVICE_ACCOUNT_PATH);

if (!fs.existsSync(SERVICE_ACCOUNT_PATH)) {
    console.error('❌ 錯誤：找不到 service-account.json');
    console.error('請前往 Firebase Console > 專案設定 > 服務帳戶，產生新的私密金鑰，並將其下載命名為 service-account.json 放在專案根目錄。');
    process.exit(1);
}

try {
    const serviceAccount = JSON.parse(fs.readFileSync(SERVICE_ACCOUNT_PATH, 'utf8'));

    initializeApp({
        credential: cert(serviceAccount)
    });

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    console.log('🔐 Firebase Admin 權限設定工具');
    console.log('--------------------------------');

    rl.question('請輸入要設定為管理員的 Email: ', async (email) => {
        try {
            console.log(`正在查找使用者: ${email}...`);
            const user = await getAuth().getUserByEmail(email);

            console.log(`找到使用者 UID: ${user.uid}`);
            console.log('正在設定 admin claim...');

            await getAuth().setCustomUserClaims(user.uid, { admin: true });

            console.log(`✅ 成功！已將 ${email} 設定為管理員。`);
            console.log(`⚠️ 請注意：該用戶必須「登出並重新登入」才會生效。`);
        } catch (error: any) {
            console.error('❌ 設定失敗:', error.message);
            if (error.code === 'auth/user-not-found') {
                console.error('原因：找不到該 Email 的使用者，請確認該用戶已註冊。');
            }
        } finally {
            rl.close();
            process.exit(0);
        }
    });

} catch (error) {
    console.error('無法讀取 Service Account:', error);
}
