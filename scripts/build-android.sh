#!/bin/bash

# Android 打包构建脚本
# 用于构建 Android 平台的 .apk 和 .aab 安装包

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 项目根目录
PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_ROOT"

# 输出目录
OUTPUT_DIR="$PROJECT_ROOT/build/android"
APK_OUTPUT_DIR="$OUTPUT_DIR/apk"
AAB_OUTPUT_DIR="$OUTPUT_DIR/aab"

# 默认配置
BUILD_TYPE="release"
BUILD_FORMAT="both"  # apk, aab, or both
SIGN_CONFIG="release"

# 帮助信息
show_help() {
    echo "使用方法: $0 [选项]"
    echo ""
    echo "选项:"
    echo "  --preview          构建预览版本（debug 签名）"
    echo "  --release          构建发布版本（release 签名）"
    echo "  --apk              仅构建 APK"
    echo "  --aab              仅构建 AAB (Android App Bundle)"
    echo "  --both             构建 APK 和 AAB（默认）"
    echo "  --clean            清理构建目录"
    echo "  --help             显示此帮助信息"
    echo ""
    echo "示例:"
    echo "  $0 --preview       # 构建预览版本"
    echo "  $0 --release --aab # 构建发布版 AAB"
    echo "  $0 --clean         # 清理构建文件"
}

# 解析参数
while [[ $# -gt 0 ]]; do
    case $1 in
        --preview)
            BUILD_TYPE="preview"
            SIGN_CONFIG="debug"
            shift
            ;;
        --release)
            BUILD_TYPE="release"
            SIGN_CONFIG="release"
            shift
            ;;
        --apk)
            BUILD_FORMAT="apk"
            shift
            ;;
        --aab)
            BUILD_FORMAT="aab"
            shift
            ;;
        --both)
            BUILD_FORMAT="both"
            shift
            ;;
        --clean)
            echo -e "${YELLOW}清理构建目录...${NC}"
            rm -rf "$OUTPUT_DIR"
            rm -rf "$PROJECT_ROOT/android/app/build"
            echo -e "${GREEN}清理完成${NC}"
            exit 0
            ;;
        --help)
            show_help
            exit 0
            ;;
        *)
            echo -e "${RED}未知参数: $1${NC}"
            show_help
            exit 1
            ;;
    esac
done

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}   LifeTicket Android 构建脚本${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# 检查环境
echo -e "${YELLOW}[1/7] 检查构建环境...${NC}"

# 检查 Java
if ! command -v java &> /dev/null; then
    echo -e "${RED}错误: 未找到 Java，请先安装 JDK 17 或更高版本${NC}"
    exit 1
fi

JAVA_VERSION=$(java -version 2>&1 | head -n 1 | cut -d'"' -f2 | cut -d'.' -f1)
if [ "$JAVA_VERSION" -lt 17 ]; then
    echo -e "${RED}错误: Java 版本过低，需要 JDK 17 或更高版本${NC}"
    exit 1
fi

# 检查 Android SDK
if [ -z "$ANDROID_HOME" ]; then
    if [ -d "$HOME/Library/Android/sdk" ]; then
        export ANDROID_HOME="$HOME/Library/Android/sdk"
    elif [ -d "$HOME/Android/Sdk" ]; then
        export ANDROID_HOME="$HOME/Android/Sdk"
    else
        echo -e "${RED}错误: 未找到 Android SDK，请设置 ANDROID_HOME 环境变量${NC}"
        exit 1
    fi
fi

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}错误: 未找到 Node.js，请先安装 Node.js${NC}"
    exit 1
fi

echo -e "${GREEN}环境检查通过${NC}"
echo -e "  Java 版本: ${GREEN}$JAVA_VERSION${NC}"
echo -e "  Android SDK: ${GREEN}$ANDROID_HOME${NC}"
echo ""

# 读取版本信息
echo -e "${YELLOW}[2/7] 读取版本信息...${NC}"
VERSION=$(node -p "require('./app.json').expo.version")
VERSION_CODE=$(node -p "require('./app.json').expo.android.versionCode || 1")
PACKAGE_NAME=$(node -p "require('./app.json').expo.android.package")

echo -e "  版本名: ${GREEN}$VERSION${NC}"
echo -e "  版本号: ${GREEN}$VERSION_CODE${NC}"
echo -e "  包名: ${GREEN}$PACKAGE_NAME${NC}"
echo ""

# 安装依赖
echo -e "${YELLOW}[3/7] 安装项目依赖...${NC}"
npm install
echo ""

# 生成原生项目
echo -e "${YELLOW}[4/7] 生成 Android 原生项目...${NC}"
if [ ! -d "$PROJECT_ROOT/android" ]; then
    echo "首次构建，正在生成 Android 项目..."
    npx expo prebuild --platform android
else
    echo "Android 项目已存在，跳过生成步骤"
fi
echo ""

# 检查签名配置
echo -e "${YELLOW}[5/7] 检查签名配置...${NC}"

KEYSTORE_FILE="$PROJECT_ROOT/android/app/lifeticket-release.keystore"
GRADLE_PROPERTIES="$PROJECT_ROOT/android/gradle.properties"

if [ "$BUILD_TYPE" = "release" ]; then
    if [ ! -f "$KEYSTORE_FILE" ]; then
        echo -e "${YELLOW}未找到签名密钥库文件，正在创建...${NC}"
        echo ""
        echo -e "${YELLOW}请输入密钥库信息:${NC}"
        read -p "密钥库别名 (alias): " KEY_ALIAS
        read -s -p "密钥库密码: " KEY_PASSWORD
        echo ""
        read -s -p "确认密码: " KEY_PASSWORD_CONFIRM
        echo ""
        
        if [ "$KEY_PASSWORD" != "$KEY_PASSWORD_CONFIRM" ]; then
            echo -e "${RED}错误: 密码不匹配${NC}"
            exit 1
        fi
        
        read -s -p "存储密码 (按回车使用相同密码): " STORE_PASSWORD
        echo ""
        if [ -z "$STORE_PASSWORD" ]; then
            STORE_PASSWORD="$KEY_PASSWORD"
        fi
        
        # 生成密钥库
        keytool -genkeypair -v \
            -storetype PKCS12 \
            -keystore "$KEYSTORE_FILE" \
            -alias "$KEY_ALIAS" \
            -keyalg RSA \
            -keysize 2048 \
            -validity 10000 \
            -storepass "$STORE_PASSWORD" \
            -keypass "$KEY_PASSWORD" \
            -dname "CN=LifeTicket, OU=Development, O=LifeTicket, L=Beijing, ST=Beijing, C=CN"
        
        # 更新 gradle.properties
        if ! grep -q "MYAPP_RELEASE_STORE_FILE" "$GRADLE_PROPERTIES"; then
            cat >> "$GRADLE_PROPERTIES" << EOF

# Release signing config
MYAPP_RELEASE_STORE_FILE=lifeticket-release.keystore
MYAPP_RELEASE_KEY_ALIAS=$KEY_ALIAS
MYAPP_RELEASE_STORE_PASSWORD=$STORE_PASSWORD
MYAPP_RELEASE_KEY_PASSWORD=$KEY_PASSWORD
EOF
        fi
        
        echo -e "${GREEN}签名密钥库创建成功${NC}"
    else
        echo -e "${GREEN}签名密钥库已存在${NC}"
    fi
else
    echo -e "${GREEN}使用 debug 签名${NC}"
fi
echo ""

# 创建输出目录
mkdir -p "$APK_OUTPUT_DIR"
mkdir -p "$AAB_OUTPUT_DIR"

# 构建
echo -e "${YELLOW}[6/7] 开始构建...${NC}"
echo -e "构建类型: ${GREEN}$BUILD_TYPE${NC}"
echo -e "输出格式: ${GREEN}$BUILD_FORMAT${NC}"
echo ""

cd "$PROJECT_ROOT/android"

# 清理之前的构建
./gradlew clean

# 构建 APK
if [ "$BUILD_FORMAT" = "apk" ] || [ "$BUILD_FORMAT" = "both" ]; then
    echo -e "${YELLOW}构建 APK...${NC}"
    
    if [ "$BUILD_TYPE" = "release" ]; then
        ./gradlew assembleRelease
        
        # 复制 APK 到输出目录
        cp app/build/outputs/apk/release/app-release.apk "$APK_OUTPUT_DIR/LifeTicket-v$VERSION.apk"
        
        echo -e "${GREEN}APK 构建成功${NC}"
        echo -e "APK 位置: ${GREEN}$APK_OUTPUT_DIR/LifeTicket-v$VERSION.apk${NC}"
    else
        ./gradlew assembleDebug
        
        # 复制 APK 到输出目录
        cp app/build/outputs/apk/debug/app-debug.apk "$APK_OUTPUT_DIR/LifeTicket-v$VERSION-debug.apk"
        
        echo -e "${GREEN}Debug APK 构建成功${NC}"
        echo -e "APK 位置: ${GREEN}$APK_OUTPUT_DIR/LifeTicket-v$VERSION-debug.apk${NC}"
    fi
    
    echo ""
fi

# 构建 AAB
if [ "$BUILD_FORMAT" = "aab" ] || [ "$BUILD_FORMAT" = "both" ]; then
    echo -e "${YELLOW}构建 AAB (Android App Bundle)...${NC}"
    
    if [ "$BUILD_TYPE" = "release" ]; then
        ./gradlew bundleRelease
        
        # 复制 AAB 到输出目录
        cp app/build/outputs/bundle/release/app-release.aab "$AAB_OUTPUT_DIR/LifeTicket-v$VERSION.aab"
        
        echo -e "${GREEN}AAB 构建成功${NC}"
        echo -e "AAB 位置: ${GREEN}$AAB_OUTPUT_DIR/LifeTicket-v$VERSION.aab${NC}"
    else
        ./gradlew bundleDebug
        
        # 复制 AAB 到输出目录
        cp app/build/outputs/bundle/debug/app-debug.aab "$AAB_OUTPUT_DIR/LifeTicket-v$VERSION-debug.aab"
        
        echo -e "${GREEN}Debug AAB 构建成功${NC}"
        echo -e "AAB 位置: ${GREEN}$AAB_OUTPUT_DIR/LifeTicket-v$VERSION-debug.aab${NC}"
    fi
    
    echo ""
fi

cd "$PROJECT_ROOT"

# 完成
echo -e "${YELLOW}[7/7] 构建完成${NC}"
echo ""

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}   构建成功！${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

echo -e "${BLUE}构建产物:${NC}"
if [ "$BUILD_FORMAT" = "apk" ] || [ "$BUILD_FORMAT" = "both" ]; then
    echo -e "  APK: ${GREEN}$APK_OUTPUT_DIR${NC}"
    ls -lh "$APK_OUTPUT_DIR"/*.apk 2>/dev/null || true
fi
if [ "$BUILD_FORMAT" = "aab" ] || [ "$BUILD_FORMAT" = "both" ]; then
    echo -e "  AAB: ${GREEN}$AAB_OUTPUT_DIR${NC}"
    ls -lh "$AAB_OUTPUT_DIR"/*.aab 2>/dev/null || true
fi
echo ""

echo -e "${YELLOW}后续步骤:${NC}"
if [ "$BUILD_FORMAT" = "aab" ] || [ "$BUILD_FORMAT" = "both" ]; then
    echo "  AAB 上传到 Google Play:"
    echo "    1. 登录 Google Play Console"
    echo "    2. 选择应用 -> 发布管理 -> 应用签名"
    echo "    3. 上传 .aab 文件"
    echo ""
fi
if [ "$BUILD_FORMAT" = "apk" ] || [ "$BUILD_FORMAT" = "both" ]; then
    echo "  APK 分发:"
    echo "    1. 直接安装到设备测试"
    echo "    2. 上传到应用分发平台"
    echo "    3. 或上传到其他应用商店"
    echo ""
fi

echo -e "${BLUE}构建完成${NC}"
