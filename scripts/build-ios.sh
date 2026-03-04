#!/bin/bash

# iOS 打包构建脚本
# 用于构建 iOS 平台的 .ipa 安装包

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
OUTPUT_DIR="$PROJECT_ROOT/build/ios"
ARCHIVE_PATH="$OUTPUT_DIR/LifeTicket.xcarchive"
EXPORT_PATH="$OUTPUT_DIR/ipa"

# 默认配置
BUILD_TYPE="release"
SCHEME="LifeTicket"
WORKSPACE="ios/LifeTicket.xcworkspace"
CONFIGURATION="Release"

# 帮助信息
show_help() {
    echo "使用方法: $0 [选项]"
    echo ""
    echo "选项:"
    echo "  --preview          构建预览版本（用于 TestFlight）"
    echo "  --release          构建发布版本（用于 App Store）"
    echo "  --clean            清理构建目录"
    echo "  --scheme NAME      指定 Xcode scheme"
    echo "  --help             显示此帮助信息"
    echo ""
    echo "示例:"
    echo "  $0 --preview       # 构建 TestFlight 版本"
    echo "  $0 --release       # 构建 App Store 版本"
    echo "  $0 --clean         # 清理构建文件"
}

# 解析参数
while [[ $# -gt 0 ]]; do
    case $1 in
        --preview)
            BUILD_TYPE="preview"
            shift
            ;;
        --release)
            BUILD_TYPE="release"
            shift
            ;;
        --clean)
            echo -e "${YELLOW}清理构建目录...${NC}"
            rm -rf "$OUTPUT_DIR"
            rm -rf "$PROJECT_ROOT/ios/build"
            echo -e "${GREEN}清理完成${NC}"
            exit 0
            ;;
        --scheme)
            SCHEME="$2"
            shift 2
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
echo -e "${BLUE}   LifeTicket iOS 构建脚本${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# 检查环境
echo -e "${YELLOW}[1/7] 检查构建环境...${NC}"

# 检查 Xcode
if ! command -v xcodebuild &> /dev/null; then
    echo -e "${RED}错误: 未找到 Xcode，请先安装 Xcode${NC}"
    exit 1
fi

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}错误: 未找到 Node.js，请先安装 Node.js${NC}"
    exit 1
fi

# 检查 CocoaPods
if ! command -v pod &> /dev/null; then
    echo -e "${YELLOW}警告: 未找到 CocoaPods，正在安装...${NC}"
    sudo gem install cocoapods
fi

echo -e "${GREEN}环境检查通过${NC}"
echo ""

# 读取版本信息
echo -e "${YELLOW}[2/7] 读取版本信息...${NC}"
VERSION=$(node -p "require('./app.json').expo.version")
BUILD_NUMBER=$(node -p "require('./app.json').expo.ios.buildNumber || '1'")
BUNDLE_IDENTIFIER=$(node -p "require('./app.json').expo.ios.bundleIdentifier")

echo -e "  版本号: ${GREEN}$VERSION${NC}"
echo -e "  构建号: ${GREEN}$BUILD_NUMBER${NC}"
echo -e "  Bundle ID: ${GREEN}$BUNDLE_IDENTIFIER${NC}"
echo ""

# 安装依赖
echo -e "${YELLOW}[3/7] 安装项目依赖...${NC}"
npm install
echo ""

# 生成原生项目
echo -e "${YELLOW}[4/7] 生成 iOS 原生项目...${NC}"
if [ ! -d "$PROJECT_ROOT/ios" ]; then
    echo "首次构建，正在生成 iOS 项目..."
    npx expo prebuild --platform ios
else
    echo "iOS 项目已存在，跳过生成步骤"
fi
echo ""

# 安装 iOS 依赖
echo -e "${YELLOW}[5/7] 安装 iOS 依赖 (CocoaPods)...${NC}"
cd "$PROJECT_ROOT/ios"
pod install
cd "$PROJECT_ROOT"
echo ""

# 创建输出目录
mkdir -p "$OUTPUT_DIR"

# 构建 Archive
echo -e "${YELLOW}[6/7] 构建 Archive...${NC}"
echo -e "构建类型: ${GREEN}$BUILD_TYPE${NC}"
echo ""

xcodebuild archive \
    -workspace "$WORKSPACE" \
    -scheme "$SCHEME" \
    -configuration "$CONFIGURATION" \
    -archivePath "$ARCHIVE_PATH" \
    -destination 'generic/platform=iOS' \
    CODE_SIGN_IDENTITY="" \
    CODE_SIGNING_REQUIRED=NO \
    CODE_SIGNING_ALLOWED=NO \
    | xcpretty --color --simple

if [ ${PIPESTATUS[0]} -ne 0 ]; then
    echo -e "${RED}构建失败${NC}"
    exit 1
fi

echo -e "${GREEN}Archive 构建成功${NC}"
echo ""

# 导出 IPA
echo -e "${YELLOW}[7/7] 导出 IPA...${NC}"
echo ""
echo -e "${YELLOW}注意: 此步骤需要有效的签名证书和配置文件${NC}"
echo -e "${YELLOW}如果您没有配置签名，可以手动在 Xcode 中导出${NC}"
echo ""

# 检查是否存在导出配置文件
EXPORT_OPTIONS_PLIST="$PROJECT_ROOT/ios/ExportOptions.plist"
if [ ! -f "$EXPORT_OPTIONS_PLIST" ]; then
    echo -e "${YELLOW}未找到 ExportOptions.plist，创建默认配置...${NC}"
    cat > "$EXPORT_OPTIONS_PLIST" << EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>method</key>
    <string>$([ "$BUILD_TYPE" = "preview" ] && echo "development" || echo "app-store")</string>
    <key>teamID</key>
    <string>YOUR_TEAM_ID</string>
    <key>uploadBitcode</key>
    <false/>
    <key>uploadSymbols</key>
    <true/>
</dict>
</plist>
EOF
    echo -e "${YELLOW}已创建默认 ExportOptions.plist，请修改其中的 teamID 为您的开发者团队 ID${NC}"
fi

# 尝试导出 IPA
mkdir -p "$EXPORT_PATH"

xcodebuild -exportArchive \
    -archivePath "$ARCHIVE_PATH" \
    -exportPath "$EXPORT_PATH" \
    -exportOptionsPlist "$EXPORT_OPTIONS_PLIST" \
    | xcpretty --color --simple

if [ ${PIPESTATUS[0]} -eq 0 ]; then
    echo ""
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}   构建成功！${NC}"
    echo -e "${GREEN}========================================${NC}"
    echo ""
    echo -e "IPA 文件位置: ${GREEN}$EXPORT_PATH${NC}"
    echo ""
    ls -lh "$EXPORT_PATH"/*.ipa 2>/dev/null || echo -e "${YELLOW}未找到 .ipa 文件，请检查签名配置${NC}"
    echo ""
    echo -e "${YELLOW}后续步骤:${NC}"
    echo "  1. 使用 Transporter 上传到 App Store Connect"
    echo "  2. 或使用 Xcode Organizer 进行分发"
    echo ""
else
    echo ""
    echo -e "${YELLOW}========================================${NC}"
    echo -e "${YELLOW}   Archive 构建成功，但导出失败${NC}"
    echo -e "${YELLOW}========================================${NC}"
    echo ""
    echo -e "Archive 位置: ${GREEN}$ARCHIVE_PATH${NC}"
    echo ""
    echo -e "${YELLOW}请手动在 Xcode 中打开 Archive 并导出:${NC}"
    echo "  1. 打开 Xcode"
    echo "  2. Window -> Organizer"
    echo "  3. 选择刚才的 Archive"
    echo "  4. 点击 'Distribute App'"
    echo ""
fi

echo -e "${BLUE}构建完成${NC}"
