#!/bin/bash

# 通用打包构建脚本
# 用于同时构建 iOS 和 Android 平台的安装包

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

# 默认配置
BUILD_PLATFORM="all"
BUILD_TYPE="release"

# 帮助信息
show_help() {
    echo "使用方法: $0 [选项]"
    echo ""
    echo "选项:"
    echo "  --ios              仅构建 iOS 平台"
    echo "  --android          仅构建 Android 平台"
    echo "  --all              构建所有平台（默认）"
    echo "  --preview          构建预览版本"
    echo "  --release          构建发布版本（默认）"
    echo "  --clean            清理所有构建目录"
    echo "  --help             显示此帮助信息"
    echo ""
    echo "示例:"
    echo "  $0                 # 构建所有平台的发布版本"
    echo "  $0 --ios           # 仅构建 iOS 发布版本"
    echo "  $0 --android --preview  # 构建 Android 预览版本"
    echo "  $0 --clean         # 清理构建文件"
}

# 解析参数
while [[ $# -gt 0 ]]; do
    case $1 in
        --ios)
            BUILD_PLATFORM="ios"
            shift
            ;;
        --android)
            BUILD_PLATFORM="android"
            shift
            ;;
        --all)
            BUILD_PLATFORM="all"
            shift
            ;;
        --preview)
            BUILD_TYPE="preview"
            shift
            ;;
        --release)
            BUILD_TYPE="release"
            shift
            ;;
        --clean)
            echo -e "${YELLOW}清理所有构建目录...${NC}"
            rm -rf "$PROJECT_ROOT/build"
            rm -rf "$PROJECT_ROOT/ios/build"
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
echo -e "${BLUE}   LifeTicket 通用构建脚本${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# 读取版本信息
VERSION=$(node -p "require('./app.json').expo.version")
echo -e "应用版本: ${GREEN}$VERSION${NC}"
echo -e "构建平台: ${GREEN}$BUILD_PLATFORM${NC}"
echo -e "构建类型: ${GREEN}$BUILD_TYPE${NC}"
echo ""

# 记录开始时间
START_TIME=$(date +%s)

# 构建函数
build_ios() {
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}   开始构建 iOS${NC}"
    echo -e "${BLUE}========================================${NC}"
    echo ""
    
    if [ "$BUILD_TYPE" = "preview" ]; then
        bash "$PROJECT_ROOT/scripts/build-ios.sh" --preview
    else
        bash "$PROJECT_ROOT/scripts/build-ios.sh" --release
    fi
}

build_android() {
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}   开始构建 Android${NC}"
    echo -e "${BLUE}========================================${NC}"
    echo ""
    
    if [ "$BUILD_TYPE" = "preview" ]; then
        bash "$PROJECT_ROOT/scripts/build-android.sh" --preview
    else
        bash "$PROJECT_ROOT/scripts/build-android.sh" --release
    fi
}

# 执行构建
case $BUILD_PLATFORM in
    ios)
        build_ios
        ;;
    android)
        build_android
        ;;
    all)
        build_ios
        echo ""
        build_android
        ;;
esac

# 计算构建时间
END_TIME=$(date +%s)
BUILD_TIME=$((END_TIME - START_TIME))
MINUTES=$((BUILD_TIME / 60))
SECONDS=$((BUILD_TIME % 60))

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}   所有构建完成！${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "总构建时间: ${GREEN}${MINUTES}分${SECONDS}秒${NC}"
echo ""

# 显示构建产物
echo -e "${BLUE}构建产物位置:${NC}"
if [ "$BUILD_PLATFORM" = "ios" ] || [ "$BUILD_PLATFORM" = "all" ]; then
    if [ -d "$PROJECT_ROOT/build/ios" ]; then
        echo -e "  iOS: ${GREEN}$PROJECT_ROOT/build/ios${NC}"
    fi
fi
if [ "$BUILD_PLATFORM" = "android" ] || [ "$BUILD_PLATFORM" = "all" ]; then
    if [ -d "$PROJECT_ROOT/build/android" ]; then
        echo -e "  Android: ${GREEN}$PROJECT_ROOT/build/android${NC}"
    fi
fi
echo ""

echo -e "${BLUE}构建完成${NC}"
