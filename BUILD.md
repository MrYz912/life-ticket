# LifeTicket 打包构建指南

本文档详细说明如何为 LifeTicket 应用构建 iOS 和 Android 平台的安装包。

## 目录

- [环境要求](#环境要求)
- [快速开始](#快速开始)
- [iOS 打包](#ios-打包)
- [Android 打包](#android-打包)
- [版本管理](#版本管理)
- [签名配置](#签名配置)
- [常见问题](#常见问题)

---

## 环境要求

### 基础环境

- **Node.js**: v18.0.0 或更高版本
- **npm**: v9.0.0 或更高版本
- **Git**: 最新版本

### iOS 构建环境

- **macOS**: 12.0 (Monterey) 或更高版本
- **Xcode**: 14.0 或更高版本
  - 安装 Xcode Command Line Tools: `xcode-select --install`
- **CocoaPods**: 最新版本
  ```bash
  sudo gem install cocoapods
  ```
- **Apple Developer 账号** (发布到 App Store 需要)

### Android 构建环境

- **JDK**: 17 或更高版本
- **Android SDK**: 
  - 通过 Android Studio 安装
  - 或设置 `ANDROID_HOME` 环境变量
- **Android Studio**: 最新版本 (推荐)

---

## 快速开始

### 1. 安装依赖

```bash
cd LifeTicket
npm install
```

### 2. 配置环境变量

```bash
# 复制环境配置文件
cp .env.example .env

# 编辑 .env 文件，填写实际配置
vim .env
```

### 3. 构建应用

```bash
# 构建所有平台
npm run build:all

# 或单独构建
npm run build:ios        # iOS 发布版本
npm run build:android    # Android 发布版本

# 构建预览版本
npm run build:ios:preview
npm run build:android:preview
```

---

## iOS 打包

### 前置准备

1. **Apple Developer 账号配置**
   - 登录 [Apple Developer](https://developer.apple.com)
   - 创建 App ID: `com.lifeticket.app`
   - 创建开发/发布证书
   - 创建 Provisioning Profile

2. **Xcode 配置**
   - 打开 Xcode -> Preferences -> Accounts
   - 添加 Apple ID
   - 下载开发团队配置文件

### 构建步骤

#### 方法一: 使用脚本 (推荐)

```bash
# 构建发布版本
npm run build:ios

# 构建预览版本 (TestFlight)
npm run build:ios:preview

# 清理构建文件
bash scripts/build-ios.sh --clean
```

#### 方法二: 使用 Xcode

```bash
# 1. 生成原生项目
npm run prebuild:ios

# 2. 打开 Xcode
open ios/LifeTicket.xcworkspace

# 3. 在 Xcode 中:
#    - 选择目标设备: "Any iOS Device"
#    - Product -> Archive
#    - 等待构建完成
#    - 在 Organizer 中导出 IPA
```

### 签名配置

创建 `ios/ExportOptions.plist` 文件:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>method</key>
    <string>app-store</string>
    <key>teamID</key>
    <string>YOUR_TEAM_ID</string>
    <key>uploadBitcode</key>
    <false/>
    <key>uploadSymbols</key>
    <true/>
</dict>
</plist>
```

**method 选项说明**:
- `app-store`: App Store 发布
- `ad-hoc`: Ad Hoc 分发
- `development`: 开发测试
- `enterprise`: 企业分发

### 上传到 App Store

```bash
# 方法一: 使用 Transporter 应用
# 1. 打开 Transporter
# 2. 添加 IPA 文件
# 3. 点击交付

# 方法二: 使用命令行
xcrun altool --upload-app \
  --type ios \
  --file "build/ios/ipa/LifeTicket.ipa" \
  --apiKey YOUR_API_KEY \
  --apiIssuer YOUR_ISSUER_ID
```

---

## Android 打包

### 前置准备

1. **设置 ANDROID_HOME**

```bash
# macOS (bash)
echo 'export ANDROID_HOME=$HOME/Library/Android/sdk' >> ~/.bash_profile
echo 'export PATH=$PATH:$ANDROID_HOME/emulator' >> ~/.bash_profile
echo 'export PATH=$PATH:$ANDROID_HOME/platform-tools' >> ~/.bash_profile
source ~/.bash_profile

# macOS (zsh)
echo 'export ANDROID_HOME=$HOME/Library/Android/sdk' >> ~/.zshrc
echo 'export PATH=$PATH:$ANDROID_HOME/emulator' >> ~/.zshrc
echo 'export PATH=$PATH:$ANDROID_HOME/platform-tools' >> ~/.zshrc
source ~/.zshrc
```

2. **接受 Android SDK 许可**

```bash
$ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager --licenses
```

### 构建步骤

#### 方法一: 使用脚本 (推荐)

```bash
# 构建发布版本 (APK + AAB)
npm run build:android

# 仅构建 APK
bash scripts/build-android.sh --release --apk

# 仅构建 AAB
bash scripts/build-android.sh --release --aab

# 构建预览版本
npm run build:android:preview

# 清理构建文件
bash scripts/build-android.sh --clean
```

#### 方法二: 使用 Gradle

```bash
# 1. 生成原生项目
npm run prebuild:android

# 2. 构建 APK
cd android
./gradlew assembleRelease

# 3. 构建 AAB
./gradlew bundleRelease

# 4. 输出位置
# APK: android/app/build/outputs/apk/release/app-release.apk
# AAB: android/app/build/outputs/bundle/release/app-release.aab
```

### 签名配置

#### 自动生成签名密钥

首次运行构建脚本时，会自动提示创建签名密钥库。

#### 手动配置签名

1. **生成密钥库**

```bash
keytool -genkeypair -v \
  -storetype PKCS12 \
  -keystore lifeticket-release.keystore \
  -alias lifeticket \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000
```

2. **配置 gradle.properties**

在 `android/gradle.properties` 中添加:

```properties
MYAPP_RELEASE_STORE_FILE=lifeticket-release.keystore
MYAPP_RELEASE_KEY_ALIAS=lifeticket
MYAPP_RELEASE_STORE_PASSWORD=your_store_password
MYAPP_RELEASE_KEY_PASSWORD=your_key_password
```

3. **配置 build.gradle**

在 `android/app/build.gradle` 中添加:

```gradle
android {
    ...
    signingConfigs {
        release {
            if (project.hasProperty('MYAPP_RELEASE_STORE_FILE')) {
                storeFile file(MYAPP_RELEASE_STORE_FILE)
                storePassword MYAPP_RELEASE_STORE_PASSWORD
                keyAlias MYAPP_RELEASE_KEY_ALIAS
                keyPassword MYAPP_RELEASE_KEY_PASSWORD
            }
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
        }
    }
}
```

### 上传到 Google Play

```bash
# 方法一: 使用 Google Play Console
# 1. 登录 Google Play Console
# 2. 选择应用
# 3. 发布管理 -> 应用签名
# 4. 上传 AAB 文件

# 方法二: 使用命令行 (需要配置服务账号)
fastlane supply --aab build/android/aab/LifeTicket.aab
```

---

## 版本管理

### 更新版本号

编辑 `app.json`:

```json
{
  "expo": {
    "version": "1.0.1",  // 用户可见版本号
    "ios": {
      "buildNumber": "2"  // iOS 构建号
    },
    "android": {
      "versionCode": 2    // Android 版本号
    }
  }
}
```

**版本号规则**:
- `version`: 用户可见版本号 (如 1.0.0)
- `buildNumber` (iOS): 每次上传到 App Store 必须递增
- `versionCode` (Android): 每次上传到 Google Play 必须递增

### 自动化版本管理

```bash
# 使用 npm version 命令
npm version patch  # 1.0.0 -> 1.0.1
npm version minor  # 1.0.0 -> 1.1.0
npm version major  # 1.0.0 -> 2.0.0
```

---

## 签名配置

### iOS 签名

**开发签名**:
- 用于开发和测试
- Xcode 自动管理

**发布签名**:
- 用于 App Store 发布
- 需要有效的 Apple Developer 账号
- 需要配置 Provisioning Profile

### Android 签名

**Debug 签名**:
- 开发和测试使用
- 自动生成，位于 `~/.android/debug.keystore`

**Release 签名**:
- 发布到应用商店使用
- 需要自己生成并妥善保管
- **重要**: 密钥库文件丢失后无法恢复！

**备份签名密钥**:

```bash
# 备份 Android 密钥库
cp android/app/lifeticket-release.keystore ~/backup/

# 备份 iOS 证书和配置文件
# 在 Xcode 中: Preferences -> Accounts -> Download Manual Profiles
```

---

## 常见问题

### iOS 构建问题

**问题 1: "No profiles for 'com.lifeticket.app' were found"**

解决方案:
1. 确保已在 Apple Developer 创建 App ID
2. 创建并下载 Provisioning Profile
3. 在 Xcode 中选择正确的 Team

**问题 2: "Signing for 'LifeTicket' requires a development team"**

解决方案:
```bash
# 在 Xcode 中:
# 1. 选择项目 -> Signing & Capabilities
# 2. 选择你的 Team
# 3. 勾选 "Automatically manage signing"
```

**问题 3: CocoaPods 安装失败**

解决方案:
```bash
# 更新 CocoaPods
sudo gem install cocoapods

# 清理并重新安装
cd ios
pod deintegrate
pod install
```

### Android 构建问题

**问题 1: "SDK location not found"**

解决方案:
```bash
# 创建 local.properties 文件
echo "sdk.dir=$ANDROID_HOME" > android/local.properties
```

**问题 2: "Could not find tools.jar"**

解决方案:
```bash
# 确保 JAVA_HOME 指向 JDK 而非 JRE
export JAVA_HOME=/Library/Java/JavaVirtualMachines/jdk-17.jdk/Contents/Home
```

**问题 3: "Keystore was tampered with, or password was incorrect"**

解决方案:
- 确认密码正确
- 如果忘记密码，需要重新生成密钥库
- 注意: 新密钥库无法更新已有应用

**问题 4: "Execution failed for task ':app:processReleaseResources'"**

解决方案:
```bash
# 清理构建缓存
cd android
./gradlew clean
./gradlew assembleRelease
```

### 通用问题

**问题 1: "Cannot find module 'expo'"**

解决方案:
```bash
# 重新安装依赖
rm -rf node_modules
npm install
```

**问题 2: 构建速度慢**

解决方案:
```bash
# 使用缓存
# iOS: 在 Xcode 中启用 Build Cache
# Android: 在 gradle.properties 中添加
org.gradle.daemon=true
org.gradle.parallel=true
org.gradle.caching=true
```

**问题 3: 内存不足**

解决方案:
```bash
# 增加 Node.js 内存
export NODE_OPTIONS="--max-old-space-size=4096"

# 增加 Gradle 内存
# 在 android/gradle.properties 中添加
org.gradle.jvmargs=-Xmx4096m
```

---

## 构建产物

构建完成后，产物位于 `build` 目录:

```
build/
├── ios/
│   ├── LifeTicket.xcarchive    # Xcode Archive
│   └── ipa/
│       └── LifeTicket.ipa      # iOS 安装包
└── android/
    ├── apk/
    │   └── LifeTicket-v1.0.0.apk  # Android APK
    └── aab/
        └── LifeTicket-v1.0.0.aab  # Android App Bundle
```

---

## 发布检查清单

### iOS 发布前检查

- [ ] 更新版本号和构建号
- [ ] 测试所有功能
- [ ] 检查应用图标和启动页
- [ ] 验证权限描述
- [ ] 测试不同设备和 iOS 版本
- [ ] 准备 App Store 截图和描述
- [ ] 检查隐私政策 URL

### Android 发布前检查

- [ ] 更新版本号和版本代码
- [ ] 测试所有功能
- [ ] 检查应用图标和启动页
- [ ] 验证权限配置
- [ ] 测试不同 Android 版本和设备
- [ ] 准备 Google Play 截图和描述
- [ ] 检查隐私政策 URL

---

## 联系支持

如有问题，请查看:
- [Expo 官方文档](https://docs.expo.dev)
- [React Native 文档](https://reactnative.dev)
- [Apple Developer 文档](https://developer.apple.com/documentation)
- [Android Developer 文档](https://developer.android.com)

---

**最后更新**: 2026-03-03
