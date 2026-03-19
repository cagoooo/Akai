import os
import re

def inject_secrets():
    # 定義需要替換的檔案路徑 (打包後的路徑)
    target_file = 'dist/public/index.html'
    
    if not os.path.exists(target_file):
        print(f"Error: {target_file} not found. Skipping injection.")
        return

    with open(target_file, 'r', encoding='utf-8') as f:
        content = f.read()

    # 讀取環境變數並替換佔位符
    # 格式: (佔位符, 環境變數名稱)
    secrets = [
        ('__GA_MEASUREMENT_ID__', 'VITE_GA_MEASUREMENT_ID'),
        ('__FIREBASE_API_KEY__', 'VITE_FIREBASE_API_KEY'),
        ('__FIREBASE_AUTH_DOMAIN__', 'VITE_FIREBASE_AUTH_DOMAIN'),
        ('__FIREBASE_PROJECT_ID__', 'VITE_FIREBASE_PROJECT_ID'),
        ('__FIREBASE_STORAGE_BUCKET__', 'VITE_FIREBASE_STORAGE_BUCKET'),
        ('__FIREBASE_MESSAGING_SENDER_ID__', 'VITE_FIREBASE_MESSAGING_SENDER_ID__'),
        ('__FIREBASE_APP_ID__', 'VITE_FIREBASE_APP_ID'),
        ('__FIREBASE_MEASUREMENT_ID__', 'VITE_FIREBASE_MEASUREMENT_ID'),
    ]

    for placeholder, env_var in secrets:
        value = os.environ.get(env_var)
        if value:
            content = content.replace(placeholder, value)
            print(f"Injected: {env_var}")
        else:
            print(f"Warning: Environment variable {env_var} not set. Placeholder {placeholder} remains.")

    with open(target_file, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"Successfully injected secrets into {target_file}")

if __name__ == "__main__":
    inject_secrets()
