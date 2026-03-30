# IntelliDocs AI - Intelligence Workspace

A premium, highly-optimized React client specifically architected for Neural Streaming (SSE) communication and Document-level Intelligence. Designed with strict minimalist authority, mimicking absolute high-end workspaces.

## 🚀 Tech Stack

- **Core**: React 18 / TypeScript / Vite
- **State Management**: Tanstack React Query (v5)
- **Routing**: React Router DOM (v6)
- **Styling Engine**: TailwindCSS + Class Variance Authority (CVA) + `clsx`
- **Animation**: Framer Motion
- **Markdown Mapping**: `react-markdown`

---

## 📐 Application Architecture

### Thread-Based Intelligence Registry
The sidebar leverages URL-aware conversational state logic. It enforces a strict **Thread-vs-Query boundary**, routing new queries perfectly into existing continuous sessions without creating "history spam" in the user interface.

### Reactive Neural Stream Consumer
At the core of the client lies the `handleSearch` asynchronous buffer reader. 
- Real-time `TextDecoder` unpacking.
- Instantly updates React State word-by-word while injecting high-fidelity metadata (like Document Grounding Evidence) natively into the UI schema.

### Dynamic Follow-Up Ecosystem
The UI implements zero-latency, context-aware suggestions. By reading the trailing payload attached to the backend stream loop, the frontend dynamically replaces hardcoded UI hints with sophisticated next-step queries unique to the current response.

---

## 🖱 UI/UX Protocols
- **Absolute Typography over Iconography**: Minimalist metadata rendering. Instead of generic badges, it utilizes direct formatting (`Based on: [Document]`).
- **Context-Aware Modules**: Elements like the **Copy Button** and **Intelligence Suggestions** are hidden out of flow and gracefully animate in based purely on layout proximity and hover triggers, ensuring 0% idle clutter.

## 🔧 Installation & Deployment

1. **Dependency Resolution**
```bash
npm install
```

2. **Environment Configuration**
Create a `.env` file reflecting your backend pipeline:
```env
VITE_API_URL="http://localhost:8000"
```

3. **Launch Development Server**
```bash
npm run dev
```
