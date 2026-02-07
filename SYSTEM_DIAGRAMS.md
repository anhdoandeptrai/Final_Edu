# 📊 System Diagrams - Edu Insight Meet

## Mục lục
- [1. Kiến trúc Hệ thống](#1-kiến-trúc-hệ-thống)
- [2. Luồng Người Dùng](#2-luồng-người-dùng)
- [3. Sơ đồ Component](#3-sơ-đồ-component)
- [4. Sequence Diagrams](#4-sequence-diagrams)
- [5. Luồng AI Detection](#5-luồng-ai-detection)
- [6. Data Flow](#6-data-flow)
- [7. Deployment Architecture](#7-deployment-architecture)

---

## 1. Kiến trúc Hệ thống

### 1.1 High-Level Architecture

```mermaid
graph TB
    subgraph "Client Browser"
        UI[React/Next.js UI]
        WRC[WebRTC Client]
        AI[TensorFlow.js AI Engine]
        LS[Local Storage]
    end
    
    subgraph "Application Server - Vercel"
        API[Next.js API Routes]
        AUTH[Authentication Service]
        TOKEN[Token Generator]
    end
    
    subgraph "LiveKit Cloud"
        SFU[SFU Server]
        ROOM[Room Manager]
        MEDIA[Media Router]
    end
    
    subgraph "AI Processing"
        TF[TensorFlow Models]
        MP[MediaPipe Face Landmarks]
        BD[Behavior Detector]
    end
    
    UI -->|HTTP/REST| API
    UI -->|WebSocket| SFU
    WRC -->|Media Streams| MEDIA
    AI -->|Video Frames| TF
    TF -->|Landmarks| MP
    MP -->|Features| BD
    BD -->|Results| UI
    
    API -->|Generate| TOKEN
    TOKEN -->|JWT| WRC
    AUTH -->|Verify| LS
    
    ROOM -->|Manage| MEDIA
    
    style UI fill:#3b82f6
    style AI fill:#10b981
    style SFU fill:#f59e0b
    style API fill:#8b5cf6
```

### 1.2 Technology Stack

```mermaid
graph LR
    subgraph "Frontend"
        NX[Next.js 14]
        RC[React 18]
        TS[TypeScript]
        CSS[CSS-in-JS]
    end
    
    subgraph "Video/Audio"
        LK[LiveKit SDK]
        WR[WebRTC]
        MSE[MediaStream API]
    end
    
    subgraph "AI/ML"
        TFJ[TensorFlow.js]
        MP[MediaPipe]
        FL[Face Landmarks]
    end
    
    subgraph "Backend"
        API[Next.js API]
        JWT[JWT Tokens]
        ENV[Environment Config]
    end
    
    subgraph "Deployment"
        VER[Vercel]
        LKC[LiveKit Cloud]
        CDN[CDN]
    end
    
    NX --> RC
    RC --> TS
    TS --> CSS
    
    NX --> LK
    LK --> WR
    WR --> MSE
    
    RC --> TFJ
    TFJ --> MP
    MP --> FL
    
    NX --> API
    API --> JWT
    JWT --> ENV
    
    NX --> VER
    LK --> LKC
    VER --> CDN
    
    style NX fill:#3b82f6
    style TFJ fill:#10b981
    style LK fill:#f59e0b
```

---

## 2. Luồng Người Dùng

### 2.1 User Journey - Teacher

```mermaid
flowchart TD
    Start([Teacher Opens App]) --> Login{Logged In?}
    Login -->|No| Auth[Login/Register Page]
    Auth --> SelectRole[Select Role: Teacher]
    SelectRole --> Dashboard[Dashboard]
    Login -->|Yes| Dashboard
    
    Dashboard --> CreateRoom[Create Meeting Room]
    CreateRoom --> GetCode[Get Room Code: ABC123]
    GetCode --> Share[Share Code with Students]
    Share --> PreJoin[Pre-join Settings]
    
    PreJoin --> CheckCam{Camera OK?}
    CheckCam -->|Yes| CheckMic{Mic OK?}
    CheckCam -->|No| FixCam[Fix Camera]
    FixCam --> CheckCam
    
    CheckMic -->|Yes| Join[Join Room]
    CheckMic -->|No| FixMic[Fix Microphone]
    FixMic --> CheckMic
    
    Join --> InRoom[In Meeting Room]
    
    InRoom --> Controls{Actions}
    Controls -->|Teach| Present[Present/Screen Share]
    Controls -->|Monitor| ViewDash[View Student Dashboard]
    Controls -->|Check| ViewStudent[Check Individual Student]
    Controls -->|Control| Toggle[Toggle Cam/Mic/AI]
    
    ViewDash --> Stats[See Class Statistics]
    Stats --> Focused[18/25 Focused]
    Stats --> Distracted[5/25 Distracted]
    Stats --> Sleeping[2/25 Sleeping]
    
    ViewStudent --> Timeline[View Student Timeline]
    Timeline --> Intervene[Intervene if Needed]
    Intervene --> InRoom
    
    Present --> ShareScreen[Share PowerPoint]
    ShareScreen --> InRoom
    
    Toggle --> InRoom
    
    Controls -->|End| Leave[Leave Meeting]
    Leave --> ExportData[Export Report]
    ExportData --> End([End])
    
    style Dashboard fill:#3b82f6
    style InRoom fill:#10b981
    style ViewDash fill:#f59e0b
    style Stats fill:#ef4444
```

### 2.2 User Journey - Student

```mermaid
flowchart TD
    Start([Student Opens App]) --> Login{Logged In?}
    Login -->|No| Auth[Login/Register Page]
    Auth --> SelectRole[Select Role: Student]
    SelectRole --> Dashboard[Dashboard]
    Login -->|Yes| Dashboard
    
    Dashboard --> InputCode[Enter Room Code: ABC123]
    InputCode --> PreJoin[Pre-join Settings]
    
    PreJoin --> CheckCam{Camera OK?}
    CheckCam -->|Yes| CheckMic{Mic OK?}
    CheckCam -->|No| FixCam[Fix Camera]
    FixCam --> CheckCam
    
    CheckMic -->|Yes| Join[Join Room]
    CheckMic -->|No| FixMic[Fix Microphone]
    FixMic --> CheckMic
    
    Join --> InRoom[In Meeting Room]
    
    InRoom --> Learning{Activities}
    Learning -->|Watch| WatchTeacher[Watch Teacher Present]
    Learning -->|Self Check| ViewHistory[View Own Behavior]
    Learning -->|Interact| RaiseHand[Raise Hand/Speak]
    Learning -->|Control| Toggle[Toggle Cam/Mic]
    
    ViewHistory --> SelfBehavior[See AI Detection]
    SelfBehavior --> Focused[🎯 Focused: 85%]
    SelfBehavior --> Distracted[😕 Distracted: 10%]
    SelfBehavior --> Sleeping[😴 Sleeping: 5%]
    
    Focused --> Improve[Self-Improve]
    Distracted --> Improve
    Sleeping --> Improve
    Improve --> InRoom
    
    WatchTeacher --> InRoom
    RaiseHand --> InRoom
    Toggle --> InRoom
    
    Learning -->|End| Leave[Leave Meeting]
    Leave --> End([End])
    
    style Dashboard fill:#3b82f6
    style InRoom fill:#10b981
    style ViewHistory fill:#8b5cf6
    style Improve fill:#10b981
```

---

## 3. Sơ đồ Component

### 3.1 Frontend Component Architecture

```mermaid
graph TB
    subgraph "Pages"
        Home[page.tsx]
        Auth[auth/page.tsx]
        Dash[dashboard/page.tsx]
        PreJoin[meet/code/page.tsx]
        Room[meet/code/room/page.tsx]
        History[history/page.tsx]
        Settings[settings/page.tsx]
    end
    
    subgraph "Layouts"
        RootLayout[layout.tsx]
        DashLayout[DashboardLayout]
        Sidebar[Sidebar]
    end
    
    subgraph "Components"
        AIDetector[AIBehaviorDetector]
        BehaviorHistory[BehaviorHistoryPanel]
        StudentPanel[StudentsBehaviorPanel]
        VideoGrid[VideoGrid]
        ControlBar[ControlBar]
    end
    
    subgraph "Contexts"
        AuthCtx[AuthContext]
        MeetingCtx[MeetingContext]
    end
    
    subgraph "Libraries"
        AILib[ai-detector.ts]
        LiveKitLib[@livekit/components-react]
    end
    
    subgraph "API Routes"
        TokenAPI[api/meet/token/route.ts]
    end
    
    RootLayout --> Home
    RootLayout --> Auth
    
    DashLayout --> Dash
    DashLayout --> History
    DashLayout --> Settings
    DashLayout --> Sidebar
    
    PreJoin --> Room
    
    Room --> AIDetector
    Room --> BehaviorHistory
    Room --> StudentPanel
    Room --> VideoGrid
    Room --> ControlBar
    
    AIDetector --> AILib
    VideoGrid --> LiveKitLib
    ControlBar --> LiveKitLib
    
    Auth --> AuthCtx
    PreJoin --> MeetingCtx
    Room --> MeetingCtx
    Room --> AuthCtx
    
    Room --> TokenAPI
    
    style Room fill:#3b82f6
    style AIDetector fill:#10b981
    style VideoGrid fill:#f59e0b
```

### 3.2 AI Detection Component Flow

```mermaid
graph LR
    subgraph "AIBehaviorDetector Component"
        Init[Initialize]
        FindVideo[Find Video Element]
        LoadModel[Load TF Models]
        Detect[Run Detection Loop]
        Process[Process Results]
        Update[Update UI]
    end
    
    subgraph "AI Detector Library"
        TFInit[TensorFlow Init]
        FaceMesh[FaceMesh Model]
        Landmarks[Extract Landmarks]
        Analyze[Analyze Behavior]
        Return[Return Result]
    end
    
    subgraph "State Management"
        BehaviorState[Behavior State]
        HistoryState[History State]
        TeacherState[Teacher Dashboard State]
    end
    
    Init --> FindVideo
    FindVideo --> LoadModel
    LoadModel --> TFInit
    TFInit --> FaceMesh
    FaceMesh --> Detect
    
    Detect --> Landmarks
    Landmarks --> Analyze
    Analyze --> Return
    Return --> Process
    
    Process --> Update
    Update --> BehaviorState
    BehaviorState --> HistoryState
    BehaviorState --> TeacherState
    
    Update -.->|500ms interval| Detect
    
    style Detect fill:#10b981
    style Analyze fill:#f59e0b
    style Update fill:#3b82f6
```

---

## 4. Sequence Diagrams

### 4.1 Create & Join Meeting Sequence

```mermaid
sequenceDiagram
    actor T as Teacher
    participant UI as UI/Browser
    participant Auth as Auth Service
    participant API as Next.js API
    participant LK as LiveKit Server
    participant S as Student
    
    Note over T,S: Teacher Creates Meeting
    
    T->>UI: Login as Teacher
    UI->>Auth: Authenticate
    Auth-->>UI: Return Session
    
    T->>UI: Click "Create Meeting"
    UI->>API: POST /api/meeting/create
    API-->>UI: Return Room Code (ABC123)
    UI-->>T: Display Code
    
    T->>S: Share Code (ABC123)
    
    Note over T,S: Teacher Joins First
    
    T->>UI: Enter Pre-join
    UI->>API: POST /api/meet/token
    Note right of API: Generate JWT with<br/>teacher permissions
    API->>LK: Validate credentials
    LK-->>API: OK
    API-->>UI: Return JWT Token
    
    T->>UI: Click "Join"
    UI->>LK: WebSocket Connect + Token
    LK-->>UI: Connected
    UI->>LK: Publish Video/Audio Tracks
    LK-->>UI: Tracks Published
    
    Note over T,S: Student Joins
    
    S->>UI: Login as Student
    S->>UI: Enter Code (ABC123)
    UI->>API: POST /api/meet/token
    API-->>UI: Return JWT Token
    
    S->>UI: Click "Join"
    UI->>LK: WebSocket Connect + Token
    LK-->>UI: Connected
    LK-->>T: New Participant Joined
    
    UI->>LK: Publish Video/Audio Tracks
    LK-->>UI: Tracks Published
    LK-->>T: Student Tracks Available
    
    Note over T,S: Both in Meeting Room
```

### 4.2 AI Behavior Detection Sequence

```mermaid
sequenceDiagram
    participant V as Video Element
    participant AID as AIBehaviorDetector
    participant AI as AI Detector Library
    participant TF as TensorFlow.js
    participant UI as UI Components
    participant TP as Teacher Panel
    
    Note over V,TP: AI Detection Lifecycle
    
    AID->>AI: initialize()
    AI->>TF: Load FaceMesh Model
    TF-->>AI: Model Ready
    AI-->>AID: Initialized ✓
    
    loop Every 500ms
        AID->>V: Get Current Frame
        V-->>AID: Video Frame
        
        AID->>AI: detect(videoFrame)
        AI->>TF: Process Frame
        TF->>AI: Return Face Landmarks
        
        AI->>AI: Analyze Head Pose
        AI->>AI: Detect Face Direction
        AI->>AI: Calculate Engagement
        
        alt Student Focused
            AI-->>AID: {label: "Tập trung", emoji: "🎯"}
        else Student Distracted
            AI-->>AID: {label: "Mất tập trung", emoji: "😕"}
        else Student Sleeping
            AI-->>AID: {label: "Buồn ngủ", emoji: "😴"}
        end
        
        AID->>UI: Update Badge
        UI-->>AID: Rendered
        
        alt Is Student
            AID->>UI: Update Own History
        else Is Teacher Monitoring
            AID->>TP: Send to Teacher Dashboard
            TP->>TP: Update Statistics
            TP-->>AID: Acknowledged
        end
    end
```

### 4.3 Screen Share Sequence

```mermaid
sequenceDiagram
    actor T as Teacher
    participant UI as Meeting UI
    participant LK as LiveKit Client
    participant SFU as LiveKit SFU
    participant S as Students
    
    T->>UI: Click Screen Share Button
    UI->>Browser: getDisplayMedia()
    Browser->>T: Select Screen/Window
    T->>Browser: Confirm Selection
    Browser-->>UI: MediaStream (Screen)
    
    UI->>LK: publishTrack(screenStream)
    LK->>SFU: Publish Screen Track
    SFU->>SFU: Create New Track
    SFU-->>LK: Track Published
    LK-->>UI: Success
    
    SFU->>S: Notify New Screen Track
    S->>SFU: Subscribe to Screen Track
    SFU->>S: Stream Screen Track
    
    S->>S: Update Layout
    Note over S: Screen Share (60% height)<br/>Video Grid (40% height)
    
    Note over T,S: Sharing in Progress
    
    T->>UI: Click Stop Share
    UI->>LK: unpublishTrack(screenTrack)
    LK->>SFU: Unpublish Track
    SFU->>S: Track Removed
    S->>S: Restore Normal Layout
```

### 4.4 Teacher Monitoring Individual Student

```mermaid
sequenceDiagram
    actor T as Teacher
    participant TP as Teacher Panel
    participant State as Behavior State
    participant Timeline as Timeline View
    participant AI as AI Detectors
    
    Note over T,Timeline: Teacher Monitors Class
    
    loop Continuous Updates
        AI->>State: addStudentBehavior(studentData)
        State->>State: Store in Array
        State->>TP: Trigger Update
        TP->>TP: Refresh Dashboard
    end
    
    TP->>T: Display Stats
    Note right of TP: 👥 25 Students<br/>✅ 18 Focused (72%)<br/>⚠️ 5 Distracted (20%)<br/>😴 2 Sleeping (8%)
    
    T->>TP: Click on "Nguyễn Văn A"
    TP->>State: getStudentHistory("student-A-id")
    State-->>TP: Return 20 recent behaviors
    
    TP->>Timeline: Render Timeline
    Timeline-->>T: Show Details
    Note right of Timeline: 10:05 - 🎯 Tập trung<br/>10:08 - ✋ Giơ tay<br/>10:15 - 😔 Cúi đầu<br/>10:20 - 🎯 Tập trung
    
    TP->>TP: Calculate Student Stats
    Note right of TP: Focused: 75%<br/>Distracted: 15%<br/>Sleeping: 10%
    
    T->>T: Make Decision
    alt Student Needs Help
        T->>UI: Ask student if OK
    else Student Doing Fine
        T->>TP: Continue monitoring
    end
```

---

## 5. Luồng AI Detection

### 5.1 AI Detection Pipeline

```mermaid
flowchart LR
    subgraph Input
        Cam[Camera Feed]
        Video[Video Element]
        Frame[Video Frame]
    end
    
    subgraph Preprocessing
        Capture[Capture Frame]
        Resize[Resize Image]
        Convert[Convert Format]
    end
    
    subgraph AI Models
        FM[FaceMesh Model]
        Landmarks[468 Face Landmarks]
        Features[Extract Features]
    end
    
    subgraph Analysis
        HeadPose[Head Pose Estimation]
        FaceDir[Face Direction]
        EyeGaze[Eye Gaze Detection]
        Posture[Posture Analysis]
    end
    
    subgraph Classification
        Rules[Behavior Rules Engine]
        Classify[Classify Behavior]
        Confidence[Confidence Score]
    end
    
    subgraph Output
        Result[Behavior Result]
        Label[Label + Emoji]
        Color[Color Code]
    end
    
    Cam --> Video
    Video --> Frame
    Frame --> Capture
    Capture --> Resize
    Resize --> Convert
    Convert --> FM
    
    FM --> Landmarks
    Landmarks --> Features
    
    Features --> HeadPose
    Features --> FaceDir
    Features --> EyeGaze
    Features --> Posture
    
    HeadPose --> Rules
    FaceDir --> Rules
    EyeGaze --> Rules
    Posture --> Rules
    
    Rules --> Classify
    Classify --> Confidence
    Confidence --> Result
    
    Result --> Label
    Label --> Color
    
    style FM fill:#10b981
    style Rules fill:#f59e0b
    style Result fill:#3b82f6
```

### 5.2 Behavior Classification Logic

```mermaid
flowchart TD
    Start[Video Frame Input] --> Detect{Face Detected?}
    
    Detect -->|No| NoFace[Return: Chưa phát hiện 👤]
    Detect -->|Yes| GetPose[Get Head Pose]
    
    GetPose --> CheckYaw{Check Yaw<br/>Face Direction}
    
    CheckYaw -->|Straight -10° to +10°| CheckPitch{Check Pitch<br/>Up/Down}
    CheckYaw -->|Left/Right > 30°| LookAway[Mất tập trung 😕]
    
    CheckPitch -->|Neutral -15° to +15°| CheckEyes{Check Eyes}
    CheckPitch -->|Down < -30°| HeadDown[Cúi đầu 😔]
    CheckPitch -->|Up > 30°| LookingUp[Nghiêng đầu 🤔]
    CheckPitch -->|Down -15° to -30°| PossibleSleep{Eyes State?}
    
    PossibleSleep -->|Closed| Sleeping[Buồn ngủ 😴]
    PossibleSleep -->|Open| Thinking[Đang suy nghĩ 🤔]
    
    CheckEyes -->|Looking Center| Focused[Tập trung 🎯]
    CheckEyes -->|Looking Away| Distracted[Mất tập trung 😕]
    
    GetPose --> CheckGesture{Detect Gesture?}
    CheckGesture -->|Hand Raised| RaiseHand[Giơ tay ✋]
    CheckGesture -->|Nodding| Nodding[Gật đầu 👍]
    CheckGesture -->|Shaking| Shaking[Lắc đầu 👎]
    CheckGesture -->|None| CheckYaw
    
    NoFace --> End[Return Result]
    LookAway --> End
    HeadDown --> End
    LookingUp --> End
    Sleeping --> End
    Thinking --> End
    Focused --> End
    Distracted --> End
    RaiseHand --> End
    Nodding --> End
    Shaking --> End
    
    style Focused fill:#10b981
    style Distracted fill:#f59e0b
    style Sleeping fill:#ef4444
    style RaiseHand fill:#3b82f6
```

---

## 6. Data Flow

### 6.1 Real-time Data Flow

```mermaid
graph TB
    subgraph "Student Browser"
        SV[Student Video]
        SAI[Student AI Detector]
        SUI[Student UI]
    end
    
    subgraph "Teacher Browser"
        TUI[Teacher UI]
        TAI[Teacher AI Manager]
        TDash[Teacher Dashboard]
    end
    
    subgraph "LiveKit SFU"
        Media[Media Streams]
        Tracks[Video/Audio Tracks]
    end
    
    subgraph "State Management"
        BStore[Behavior Store]
        HStore[History Store]
        PStore[Participant Store]
    end
    
    subgraph "Local Storage"
        Auth[Auth Data]
        Settings[User Settings]
        Cache[Session Cache]
    end
    
    SV -->|Video Stream| Media
    Media -->|Subscribe| SAI
    SAI -->|Detect| BStore
    BStore -->|Update| SUI
    BStore -->|Store| HStore
    
    Media -->|All Tracks| TAI
    TAI -->|Monitor All| BStore
    BStore -->|Aggregate| TDash
    TDash -->|Display| TUI
    
    Media -->|Participants| PStore
    PStore -->|List| TDash
    
    Auth -->|Session| SUI
    Auth -->|Session| TUI
    Settings -->|Config| SAI
    Settings -->|Config| TAI
    Cache -->|Temp Data| BStore
    
    style BStore fill:#10b981
    style Media fill:#f59e0b
    style TDash fill:#3b82f6
```

### 6.2 Token Generation Flow

```mermaid
flowchart LR
    subgraph Client
        UI[User Interface]
        Store[Session Storage]
    end
    
    subgraph API
        Route[/api/meet/token]
        Validate[Validate Request]
        Generate[Generate JWT]
    end
    
    subgraph Environment
        Key[LIVEKIT_API_KEY]
        Secret[LIVEKIT_API_SECRET]
        URL[LIVEKIT_URL]
    end
    
    subgraph LiveKit
        Verify[Verify Token]
        Grant[Grant Access]
        Room[Room Access]
    end
    
    UI -->|POST {roomName, userName}| Route
    Route --> Validate
    
    Validate -->|Read| Key
    Validate -->|Read| Secret
    
    Validate --> Generate
    Generate -->|Use| Key
    Generate -->|Sign with| Secret
    
    Generate -->|Return JWT| UI
    UI -->|Save| Store
    
    UI -->|Connect with JWT| Verify
    Verify -->|Check| Secret
    Verify -->|Valid| Grant
    Grant --> Room
    
    style Generate fill:#10b981
    style Verify fill:#f59e0b
    style Room fill:#3b82f6
```

---

## 7. Deployment Architecture

### 7.1 Production Deployment

```mermaid
graph TB
    subgraph "Users"
        Teacher[👨‍🏫 Teachers]
        Student[👨‍🎓 Students]
    end
    
    subgraph "CDN - Vercel Edge Network"
        Edge1[Edge Node - Asia]
        Edge2[Edge Node - US]
        Edge3[Edge Node - EU]
    end
    
    subgraph "Vercel Platform"
        Next[Next.js Application]
        API[API Routes]
        SSR[Server-Side Rendering]
        Static[Static Assets]
    end
    
    subgraph "LiveKit Cloud"
        SFU1[SFU Server - Singapore]
        SFU2[SFU Server - Tokyo]
        SFU3[SFU Server - US-West]
        Turn[TURN Servers]
    end
    
    subgraph "Client Processing"
        TF[TensorFlow.js]
        Video[WebRTC]
        AI[AI Detection]
    end
    
    subgraph "Storage"
        LS[Browser LocalStorage]
        SS[Session Storage]
    end
    
    Teacher --> Edge1
    Student --> Edge1
    Teacher --> Edge2
    Student --> Edge3
    
    Edge1 --> Next
    Edge2 --> Next
    Edge3 --> Next
    
    Next --> API
    Next --> SSR
    Next --> Static
    
    API --> SFU1
    SSR --> SFU2
    API --> SFU3
    
    SFU1 --> Turn
    SFU2 --> Turn
    SFU3 --> Turn
    
    Turn --> Video
    Video --> TF
    TF --> AI
    
    AI --> LS
    API --> SS
    
    style Next fill:#3b82f6
    style SFU1 fill:#f59e0b
    style AI fill:#10b981
```

### 7.2 Network Flow & Performance

```mermaid
flowchart TB
    subgraph Client["Client Device"]
        Browser[Web Browser]
        Camera[Camera/Mic]
        GPU[GPU/WebGL]
    end
    
    subgraph Processing["Client-Side Processing"]
        Encode[Video Encoding<br/>H.264/VP8]
        Decode[Video Decoding]
        AIProcess[AI Processing<br/>TensorFlow.js]
    end
    
    subgraph Network["Network Layer"]
        WS[WebSocket<br/>Signaling]
        RTC[WebRTC<br/>Media]
        HTTPS[HTTPS<br/>API Calls]
    end
    
    subgraph Servers["Server Infrastructure"]
        Vercel[Vercel<br/>Application Server]
        LiveKit[LiveKit SFU<br/>Media Server]
        TURN[TURN<br/>Relay Server]
    end
    
    Camera -->|MediaStream| Encode
    Encode -->|Compressed| RTC
    RTC <-->|P2P/Relay| TURN
    TURN <--> LiveKit
    
    LiveKit -->|Media Stream| RTC
    RTC -->|Received| Decode
    Decode -->|Video Frames| AIProcess
    AIProcess -->|Use| GPU
    AIProcess -->|Results| Browser
    
    Browser <-->|REST API| HTTPS
    Browser <-->|Real-time| WS
    HTTPS --> Vercel
    WS --> LiveKit
    
    style AIProcess fill:#10b981
    style LiveKit fill:#f59e0b
    style Browser fill:#3b82f6
    
    note1[Latency: < 100ms]
    note2[Bandwidth: Adaptive<br/>500kbps - 2.5Mbps]
    note3[AI: 2 FPS<br/>500ms interval]
```

### 7.3 Scaling Strategy

```mermaid
graph LR
    subgraph "Load Balancing"
        LB[Load Balancer]
        Health[Health Check]
    end
    
    subgraph "Application Tier - Auto-scale"
        App1[Next.js Instance 1]
        App2[Next.js Instance 2]
        App3[Next.js Instance N]
    end
    
    subgraph "Media Tier - LiveKit"
        SFU1[SFU Instance 1<br/>Max: 500 participants]
        SFU2[SFU Instance 2<br/>Max: 500 participants]
        SFU3[SFU Instance N]
    end
    
    subgraph "Edge Computing"
        EdgeAI[Edge AI Processing<br/>Client-side only]
    end
    
    Users[Users] --> LB
    LB --> Health
    Health --> App1
    Health --> App2
    Health --> App3
    
    App1 --> SFU1
    App2 --> SFU2
    App3 --> SFU3
    
    SFU1 -.->|No Server Processing| EdgeAI
    SFU2 -.->|No Server Processing| EdgeAI
    SFU3 -.->|No Server Processing| EdgeAI
    
    note1[Horizontal Scaling:<br/>Add more instances<br/>based on load]
    note2[No Database:<br/>All state in memory<br/>or client-side]
    note3[Cost Efficient:<br/>AI runs on client GPU<br/>No server AI compute]
    
    style LB fill:#3b82f6
    style SFU1 fill:#f59e0b
    style EdgeAI fill:#10b981
```

---

## 8. Security Architecture

### 8.1 Authentication & Authorization Flow

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant A as Auth Service
    participant L as LocalStorage
    participant API as API Routes
    participant LK as LiveKit
    
    U->>F: Login (email, password)
    F->>A: Authenticate
    A->>A: Validate Credentials
    A->>A: Generate Session Token
    A-->>F: Return Token + User Data
    F->>L: Store Token + User Info
    
    Note over U,LK: User wants to join meeting
    
    U->>F: Join Meeting (roomCode)
    F->>L: Get Session Token
    L-->>F: Return Token
    
    F->>API: Request LiveKit Token
    Note right of API: Include session token<br/>& user role
    
    API->>API: Verify Session
    API->>API: Check Role (Teacher/Student)
    
    alt Teacher
        API->>API: Grant Admin Permissions
    else Student
        API->>API: Grant Participant Permissions
    end
    
    API->>API: Generate LiveKit JWT
    Note right of API: Sign with LIVEKIT_API_SECRET
    API-->>F: Return LiveKit Token
    
    F->>LK: Connect with Token
    LK->>LK: Verify Token
    LK->>LK: Check Permissions
    LK-->>F: Connection Established
    
    Note over U,LK: User in Meeting
```

### 8.2 Data Privacy & Security

```mermaid
flowchart TB
    subgraph "Data Categories"
        PII[Personal Info<br/>Email, Name]
        Video[Video/Audio<br/>Streams]
        AI[AI Detection<br/>Data]
        Session[Session<br/>Data]
    end
    
    subgraph "Storage"
        Local[LocalStorage<br/>Client-side]
        Memory[In-Memory<br/>Temporary]
        None[Not Stored]
    end
    
    subgraph "Encryption"
        HTTPS[HTTPS<br/>TLS 1.3]
        SRTP[SRTP<br/>Media Encryption]
        JWT[JWT<br/>Signed Tokens]
    end
    
    subgraph "Security Measures"
        Expire[Token Expiration]
        Validate[Input Validation]
        CORS[CORS Policy]
        CSP[Content Security Policy]
    end
    
    PII -->|Encrypted| Local
    Video -->|End-to-end| SRTP
    AI -->|Temporary| Memory
    Session -->|Signed| JWT
    
    Local --> HTTPS
    SRTP --> None
    Memory --> Expire
    JWT --> Validate
    
    HTTPS --> CORS
    Validate --> CSP
    
    style Video fill:#ef4444
    style AI fill:#10b981
    style HTTPS fill:#3b82f6
    
    note1[⚠️ Video never stored on server<br/>AI processed locally only<br/>No recording feature]
    note2[🔒 All API calls over HTTPS<br/>WebRTC encrypted with SRTP<br/>Tokens expire after session]
```

---

## 9. Performance Metrics

### 9.1 System Performance Targets

```mermaid
graph LR
    subgraph "Latency Targets"
        API[API Response<br/>< 200ms]
        Video[Video Feed<br/>< 100ms]
        AI[AI Detection<br/>500ms cycle]
    end
    
    subgraph "Throughput"
        Students[Support 50+<br/>students per room]
        Rooms[Multiple rooms<br/>concurrent]
        AIRate[AI: 2 FPS<br/>per student]
    end
    
    subgraph "Resource Usage"
        CPU[CPU: 30-50%<br/>with AI enabled]
        Memory[Memory: 200-400MB<br/>per tab]
        Bandwidth[Bandwidth: 1-2.5 Mbps<br/>per participant]
    end
    
    subgraph "Quality Metrics"
        VideoQ[Video: 720p 30fps]
        AudioQ[Audio: 48kHz]
        AIAcc[AI Accuracy: > 85%]
    end
    
    style AI fill:#10b981
    style Video fill:#f59e0b
    style AIAcc fill:#3b82f6
```

---

## 📚 Tài liệu tham khảo

- **Next.js:** https://nextjs.org/docs
- **LiveKit:** https://docs.livekit.io
- **TensorFlow.js:** https://www.tensorflow.org/js
- **MediaPipe:** https://google.github.io/mediapipe/
- **WebRTC:** https://webrtc.org/

---

**© 2026 Edu Insight Meet - System Architecture Documentation**
