#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SOURCE_DIR="$SCRIPT_DIR/xcode/NfcNativeHelper"
BUILD_DIR="$SCRIPT_DIR/.build"
PLUGIN_IOS_DIR=$SCRIPT_DIR

echo "==> Cleaning up..."
rm -f "$SCRIPT_DIR"/*.o
rm -rf "$BUILD_DIR"
mkdir -p "$BUILD_DIR/device" "$BUILD_DIR/sim"

echo "==> Compiling for device (arm64)..."
clang -arch arm64 \
  -isysroot $(xcrun --sdk iphoneos --show-sdk-path) \
  -c "$SOURCE_DIR"/*.m
ar rcs "$BUILD_DIR/device/libNfcNativeHelper.a" *.o
echo "    Device lib: $(lipo -info $BUILD_DIR/device/libNfcNativeHelper.a)"

echo "==> Compiling for simulator (arm64)..."
rm -f "$SOURCE_DIR"/*.o
clang -arch arm64 \
  -target arm64-apple-ios-simulator \
  -isysroot $(xcrun --sdk iphonesimulator --show-sdk-path) \
  -c "$SOURCE_DIR"/*.m
mv *.o "$BUILD_DIR/sim-arm64.o"

echo "==> Compiling for simulator (x86_64)..."
clang -arch x86_64 \
  -isysroot $(xcrun --sdk iphonesimulator --show-sdk-path) \
  -c "$SOURCE_DIR"/*.m
mv *.o "$BUILD_DIR/sim-x86.o"

echo "==> Combining simulator slices..."
libtool -static "$BUILD_DIR/sim-arm64.o" "$BUILD_DIR/sim-x86.o" \
  -o "$BUILD_DIR/sim/libNfcNativeHelper.a"
echo "    Sim lib: $(lipo -info $BUILD_DIR/sim/libNfcNativeHelper.a)"

echo "==> Creating XCFramework..."
xcodebuild -create-xcframework \
  -library "$BUILD_DIR/device/libNfcNativeHelper.a" \
  -library "$BUILD_DIR/sim/libNfcNativeHelper.a" \
  -output "$BUILD_DIR/NfcNativeHelper.xcframework"

echo "==> Copying XCFramework into plugin..."
rm -rf "$PLUGIN_IOS_DIR/NfcNativeHelper.xcframework"
rm -f "$PLUGIN_IOS_DIR/libNfcNativeHelper.a"
cp -r "$BUILD_DIR/NfcNativeHelper.xcframework" "$PLUGIN_IOS_DIR/"

echo "==> Cleaning up build artifacts..."
rm -rf "$BUILD_DIR"
rm -f "$SOURCE_DIR"/*.o

echo ""
echo "✅ Done! XCFramework built and copied to plugin."
