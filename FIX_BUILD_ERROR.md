# Fix Build Error: Export Pose doesn't exist

## Vấn đề
Lỗi build khi Next.js cố gắng import `Pose` từ `@mediapipe/pose` trong môi trường server-side.

```
Export Pose doesn't exist in target module
./node_modules/@tensorflow-models/pose-detection/dist/pose-detection.esm.js
```

## Nguyên nhân
- `@mediapipe/pose` không tương thích với server-side rendering (SSR)
- TensorFlow.js và các package liên quan chỉ hoạt động ở client-side (browser)
- Next.js 16 sử dụng Turbopack mặc định, gây conflict với webpack config

## Giải pháp đã áp dụng

### 1. Sử dụng Webpack thay vì Turbopack
File: `package.json`
```json
"scripts": {
  "dev": "next dev --webpack",
  "build": "next build",
  "start": "next start"
}
```

### 2. Cấu hình Next.js
File: `next.config.js`
```javascript
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    // Ignore @mediapipe modules on server-side
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push({
        '@mediapipe/pose': 'commonjs @mediapipe/pose',
        '@tensorflow-models/pose-detection': 'commonjs @tensorflow-models/pose-detection',
        '@tensorflow/tfjs-core': 'commonjs @tensorflow/tfjs-core',
        '@tensorflow/tfjs-backend-webgl': 'commonjs @tensorflow/tfjs-backend-webgl',
      });
    }

    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      crypto: false,
    };

    return config;
  },
  transpilePackages: [
    '@tensorflow/tfjs',
    '@tensorflow/tfjs-core',
    '@tensorflow/tfjs-backend-webgl',
    '@tensorflow-models/pose-detection',
  ],
}
```

### 3. Lazy Loading TensorFlow
File: `src/lib/ai-detector.ts`

Thay vì import trực tiếp:
```typescript
// ❌ Sai
import * as tf from '@tensorflow/tfjs'
import * as poseDetection from '@tensorflow-models/pose-detection'
```

Sử dụng lazy loading:
```typescript
// ✅ Đúng
import type * as poseDetection from '@tensorflow-models/pose-detection'

let tf: typeof import('@tensorflow/tfjs')
let poseDetectionModule: typeof import('@tensorflow-models/pose-detection')

async function loadTensorFlow() {
  if (!tf) {
    tf = await import('@tensorflow/tfjs')
  }
  return tf
}

async function loadPoseDetection() {
  if (!poseDetectionModule) {
    poseDetectionModule = await import('@tensorflow-models/pose-detection')
  }
  return poseDetectionModule
}
```

### 4. Dynamic Import Components
Các component sử dụng AI đều được import động:

File: `src/app/meet/[code]/room/page.tsx`
```typescript
const AIBehaviorDetector = dynamic(
  () => import('../../../../components/AIBehaviorDetector'),
  { ssr: false }  // Quan trọng: disable SSR
)
```

## Cách chạy

### Development
```bash
cd "d:\Final_Edu\std_behav_update_new\std_behav_update\std_behav_update\edu-insight-meet"
npm run dev
```

Server sẽ chạy tại: http://localhost:3000

### Production Build
```bash
npm run build
npm start
```

## Kiểm tra

1. Truy cập http://localhost:3000
2. Đăng nhập/đăng ký
3. Tạo hoặc tham gia meeting
4. Kiểm tra AI detector hoạt động (chỉ ở client-side)

## Lưu ý quan trọng

### Không sử dụng Turbopack (hiện tại)
```bash
# ❌ Không dùng
npm run dev --turbopack

# ✅ Dùng
npm run dev --webpack
```

### AI chỉ hoạt động ở client-side
- AIBehaviorDetector được import với `ssr: false`
- TensorFlow được lazy load khi cần
- Không thể sử dụng AI trong server components

### Nếu vẫn gặp lỗi

1. **Xóa cache và node_modules**
```bash
rm -rf .next
rm -rf node_modules
npm install
npm run dev
```

2. **Kiểm tra dependencies**
```bash
npm list @tensorflow/tfjs
npm list @tensorflow-models/pose-detection
```

3. **Đảm bảo không import trực tiếp trong server components**
- Chỉ import trong 'use client' components
- Sử dụng dynamic import với `ssr: false`

## Tài liệu tham khảo

- [Next.js Dynamic Imports](https://nextjs.org/docs/advanced-features/dynamic-import)
- [Next.js Webpack Config](https://nextjs.org/docs/api-reference/next.config.js/custom-webpack-config)
- [TensorFlow.js](https://www.tensorflow.org/js)
- [Pose Detection](https://github.com/tensorflow/tfjs-models/tree/master/pose-detection)
