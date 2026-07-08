# AI Content Studio — Complete Setup Guide
### For someone with no React experience

---

## What you are building

A professional web application frontend that connects to your LangGraph Python backend.
Users pick a content format, configure options, and receive AI-generated content.

---

## PART 1 — Install the tools (one-time setup)

### Step 1 — Install Node.js

Node.js is the engine that runs React. You only need to install it once.

1. Open your browser and go to: https://nodejs.org
2. Download the LTS version (the green button on the left)
3. Run the installer, click Next on every screen, keep all defaults
4. When done, open VS Code Terminal: menu Terminal then New Terminal
5. Type this and press Enter to verify:

    node --version

   You should see something like v20.11.0. If you do, Node is installed.

---

### Step 2 — Open this project in VS Code

1. In VS Code, go to: File then Open Folder
2. Navigate to and select the aipcc folder (this project folder)
3. VS Code will load all files in the left sidebar

---

## PART 2 — Run the app

### Step 3 — Install project dependencies

In VS Code Terminal, type:

    npm install

Wait for it to finish. It downloads React and other libraries.
A node_modules folder will appear. That is normal.

---

### Step 4 — Start the development server

In the Terminal, type:

    npm run dev

You will see output like:

    VITE v5.x  ready in 300ms
    Local: http://localhost:3000/

Open your browser and go to: http://localhost:3000

The app is now running. Any file change you save instantly updates the browser.

To stop the server: press Ctrl+C in the Terminal.

---

## PART 3 — Connect your Python backend

### Step 5 — Run your FastAPI / LangGraph backend

Open a second terminal and start your Python server:

    python app.py   (or however you run your LangGraph server)

It should be listening on port 8000.

### Step 6 — Uncomment the real API call

Open: src/hooks/useContentForm.js

Find the commented block near line 30:

    // const res = await fetch(API_ENDPOINT, {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify(form),
    // });
    // if (!res.ok) throw new Error("Backend error");
    // const data = await res.json();
    // setResult(data);

Remove the // from every line above to uncomment them.

Then DELETE the mock lines below:

    await new Promise(r => setTimeout(r, 4000));
    setResult({ content: "Sample output ... });

Save the file. The frontend now calls your real backend.

---

## PART 4 — Customise the app

Everything configurable lives in ONE file: src/config/constants.js

  What to change              Edit this
  ─────────────────────────── ──────────────────
  AI model used               DEFAULT_MODEL
  Content format options      MODES array
  Tone options                TONES array
  Audience options            AUDIENCES array
  Word count range            WORD_LIMIT object
  Loading screen quotes       LOADING_QUOTES array
  Backend server URL          API_ENDPOINT

Example — add a new loading quote:

    { quote: "Your new quote here.", author: "Author Name" },

Example — change the AI model:

    export const DEFAULT_MODEL = "gpt4";

---

## PART 5 — Project file map

    aipcc/
    src/
      config/
        constants.js          <-- All settings live here
      hooks/
        useContentForm.js     <-- All form state and API logic
      components/
        StepIndicator.jsx     <-- Progress bar at the top
        ModeSelector.jsx      <-- Step 1: pick a format
        ConfigPanel.jsx       <-- Step 2: configure the content
        LoadingScreen.jsx     <-- Quotes shown while generating
        ResultPanel.jsx       <-- Step 3: view the result
      App.jsx                 <-- Root layout, wires components together
      App.css                 <-- All visual styles
      main.jsx                <-- Entry point (do not edit)
    index.html                <-- HTML shell (do not edit)
    package.json              <-- Dependencies (do not edit)
    vite.config.js            <-- Dev server config (do not edit)

---

## Troubleshooting

  Problem                           Fix
  ───────────────────────────────── ─────────────────────────────────────────
  npm install fails                 Make sure Node is installed: node --version
  App wont start on port 3000       Change port: 3000 to port: 3001 in vite.config.js
  Failed to fetch error in browser  Your Python backend is not running. Start it first.
  Changes not showing               Save the file with Ctrl+S
  Red errors in terminal            Copy the error, check the file it names

---

## Deploy to production (when ready)

Run:

    npm run build

This creates a dist/ folder with optimised files ready to host on
Netlify, Vercel, or any static web server.