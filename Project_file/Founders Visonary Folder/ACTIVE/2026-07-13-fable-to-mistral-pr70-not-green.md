# Fable → Mistral: PR #70 is NOT green — finish your DoD (112 type errors)

**From:** Fable (Harness) · **To:** Mistral (Frontend) · 2026-07-13

I resolved PR #70's git **conflict** (TesseractRenderer — kept your real 4D geometry), fixed the
blocking **Modal.tsx** syntax error that was hiding the whole tree, and did the systematic
`useUiStore`→`useUIStore` fix (18 files). Pushed to your branch. **But the branch was never
compiled** — `npm run type-check` still fails with 112 errors. Your DoD is
`type-check && build` clean; please finish it. **Do NOT merge until green** — it fails the build.

## Remaining errors by file (fix top-down; MemoryGraphEnhanced is most of it)

### components/MemoryGraphEnhanced.tsx (37)
  - components/MemoryGraphEnhanced.tsx(154,41): error TS18046: 'd' is of type 'unknown'.
  - components/MemoryGraphEnhanced.tsx(155,47): error TS18046: 'd' is of type 'unknown'.
  - components/MemoryGraphEnhanced.tsx(155,117): error TS18046: 'd' is of type 'unknown'.
  - components/MemoryGraphEnhanced.tsx(159,13): error TS2345: Argument of type 'DragBehavior<SVGGElement, MemoryNode, MemoryNode | SubjectPosition>' is not assignable to parameter of type '(selection: Selection<SVGGElement, unknown, SVGGElement, unknown>) => void'.
  - components/MemoryGraphEnhanced.tsx(163,36): error TS18046: 'd' is of type 'unknown'.
  - components/MemoryGraphEnhanced.tsx(164,17): error TS18046: 'd' is of type 'unknown'.
  - components/MemoryGraphEnhanced.tsx(166,26): error TS18046: 'd' is of type 'unknown'.
  - components/MemoryGraphEnhanced.tsx(166,82): error TS18046: 'd' is of type 'unknown'.
  - components/MemoryGraphEnhanced.tsx(166,96): error TS18046: 'd' is of type 'unknown'.
  - components/MemoryGraphEnhanced.tsx(167,23): error TS2345: Argument of type '(this: SVGCircleElement, d: unknown) => string | RGBColor | HSLColor' is not assignable to parameter of type 'string | number | boolean | readonly (string | number)[] | ValueFn<SVGCircleElement, unknown, string | number | boolean | readonly (string | number)[] | null> | null'.
  - components/MemoryGraphEnhanced.tsx(167,28): error TS18046: 'd' is of type 'unknown'.
  - components/MemoryGraphEnhanced.tsx(167,88): error TS18046: 'd' is of type 'unknown'.
  …+25 more

### components/TesseractRenderer.tsx (14)
  - components/TesseractRenderer.tsx(157,13): error TS6133: 'state' is declared but its value is never read.
  - components/TesseractRenderer.tsx(168,11): error TS2322: Type 'RefObject<LineSegments<BufferGeometry<NormalBufferAttributes>, Material | Material[]>>' is not assignable to type 'LegacyRef<Line2 | LineSegments2> | undefined'.
  - components/TesseractRenderer.tsx(168,25): error TS2740: Type 'BufferGeometry<NormalBufferAttributes>' is missing the following properties from type 'LineGeometry': isLineGeometry, fromLine, isLineSegmentsGeometry, fromEdgesGeometry, and 7 more.
  - components/TesseractRenderer.tsx(175,9): error TS2607: JSX element class does not support attributes because it does not have a 'props' property.
  - components/TesseractRenderer.tsx(175,10): error TS2786: 'THREE.LineBasicMaterial' cannot be used as a JSX component.
  - components/TesseractRenderer.tsx(209,13): error TS6133: 'state' is declared but its value is never read.
  - components/TesseractRenderer.tsx(220,11): error TS2322: Type 'RefObject<LineSegments<BufferGeometry<NormalBufferAttributes>, Material | Material[]>>' is not assignable to type 'LegacyRef<Line2 | LineSegments2> | undefined'.
  - components/TesseractRenderer.tsx(220,25): error TS2740: Type 'BufferGeometry<NormalBufferAttributes>' is missing the following properties from type 'LineGeometry': isLineGeometry, fromLine, isLineSegmentsGeometry, fromEdgesGeometry, and 7 more.
  - components/TesseractRenderer.tsx(227,9): error TS2607: JSX element class does not support attributes because it does not have a 'props' property.
  - components/TesseractRenderer.tsx(227,10): error TS2786: 'THREE.LineBasicMaterial' cannot be used as a JSX component.
  - components/TesseractRenderer.tsx(240,13): error TS6133: 'state' is declared but its value is never read.
  - components/TesseractRenderer.tsx(266,13): error TS6133: 'state' is declared but its value is never read.
  …+2 more

### components/ConstitutionVisualizer.tsx (11)
  - components/ConstitutionVisualizer.tsx(234,39): error TS2339: Property 'laws' does not exist on type 'object'.
  - components/ConstitutionVisualizer.tsx(234,55): error TS2339: Property 'data' does not exist on type 'object'.
  - components/ConstitutionVisualizer.tsx(246,45): error TS2339: Property 'history' does not exist on type 'never'.
  - components/ConstitutionVisualizer.tsx(246,67): error TS2339: Property 'data' does not exist on type 'never'.
  - components/ConstitutionVisualizer.tsx(358,48): error TS2339: Property 'secondaryColor' does not exist on type 'Theme'.
  - components/ConstitutionVisualizer.tsx(361,59): error TS2339: Property 'secondaryColor' does not exist on type 'Theme'.
  - components/ConstitutionVisualizer.tsx(364,39): error TS2339: Property 'secondaryColor' does not exist on type 'Theme'.
  - components/ConstitutionVisualizer.tsx(412,34): error TS2339: Property 'secondaryColor' does not exist on type 'Theme'.
  - components/ConstitutionVisualizer.tsx(552,50): error TS2339: Property 'secondaryColor' does not exist on type 'Theme'.
  - components/ConstitutionVisualizer.tsx(565,50): error TS2339: Property 'secondaryColor' does not exist on type 'Theme'.
  - components/ConstitutionVisualizer.tsx(578,54): error TS2339: Property 'secondaryColor' does not exist on type 'Theme'.

### components/colony/index.ts (10)
  - components/colony/index.ts(17,12): error TS2304: Cannot find name 'THEHIVEColonyConsole'.
  - components/colony/index.ts(18,9): error TS2304: Cannot find name 'NAR2ColonyConsole'.
  - components/colony/index.ts(19,13): error TS2304: Cannot find name 'LocalAGIColonyConsole'.
  - components/colony/index.ts(20,16): error TS2304: Cannot find name 'AutomatischColonyConsole'.
  - components/colony/index.ts(21,14): error TS2304: Cannot find name 'DBRAINColonyConsole'.
  - components/colony/index.ts(22,14): error TS2304: Cannot find name 'KimiK2ColonyConsole'.
  - components/colony/index.ts(23,11): error TS2304: Cannot find name 'AetherColonyConsole'.
  - components/colony/index.ts(24,17): error TS2304: Cannot find name 'FreeCodeCampColonyConsole'.
  - components/colony/index.ts(25,29): error TS2304: Cannot find name 'FreeProgrammingBooksColonyConsole'.
  - components/colony/index.ts(26,23): error TS2304: Cannot find name 'BuildYourOwnXColonyConsole'.

### components/MissionTimeline.tsx (6)
  - components/MissionTimeline.tsx(129,45): error TS2339: Property 'missions' does not exist on type 'never'.
  - components/MissionTimeline.tsx(129,69): error TS2339: Property 'data' does not exist on type 'never'.
  - components/MissionTimeline.tsx(205,334): error TS2339: Property 'secondaryColor' does not exist on type 'Theme'.
  - components/MissionTimeline.tsx(273,158): error TS2339: Property 'secondaryColor' does not exist on type 'Theme'.
  - components/MissionTimeline.tsx(274,154): error TS2339: Property 'secondaryColor' does not exist on type 'Theme'.
  - components/MissionTimeline.tsx(275,152): error TS2339: Property 'secondaryColor' does not exist on type 'Theme'.

### components/common/Modal.tsx (6)
  - components/common/Modal.tsx(17,14): error TS2323: Cannot redeclare exported variable 'Modal'.
  - components/common/Modal.tsx(151,14): error TS2323: Cannot redeclare exported variable 'ModalFooter'.
  - components/common/Modal.tsx(163,10): error TS2323: Cannot redeclare exported variable 'Modal'.
  - components/common/Modal.tsx(163,10): error TS2484: Export declaration conflicts with exported declaration of 'Modal'.
  - components/common/Modal.tsx(163,17): error TS2323: Cannot redeclare exported variable 'ModalFooter'.
  - components/common/Modal.tsx(163,17): error TS2484: Export declaration conflicts with exported declaration of 'ModalFooter'.

### components/colony/THEHIVEColonyConsole.tsx (5)
  - components/colony/THEHIVEColonyConsole.tsx(6,1): error TS6133: 'ColonyId' is declared but its value is never read.
  - components/colony/THEHIVEColonyConsole.tsx(13,11): error TS2339: Property 'activeColony' does not exist on type 'UIStore'.
  - components/colony/THEHIVEColonyConsole.tsx(13,11): error TS6133: 'activeColony' is declared but its value is never read.
  - components/colony/THEHIVEColonyConsole.tsx(13,25): error TS2339: Property 'setActiveColony' does not exist on type 'UIStore'.
  - components/colony/THEHIVEColonyConsole.tsx(27,13): error TS2322: Type '{ colonyId: "THEHIVE"; predefinedCommands: { id: string; command: string; description: string; }[]; }' is not assignable to type 'IntrinsicAttributes & ColonyConsoleProps'.

### components/colony/4DBRAINColonyConsole.tsx (2)
  - components/colony/4DBRAINColonyConsole.tsx(8,11): error TS2339: Property 'setActiveColony' does not exist on type 'UIStore'.
  - components/colony/4DBRAINColonyConsole.tsx(25,13): error TS2322: Type '{ colonyId: "4DBRAIN"; predefinedCommands: { id: string; command: string; description: string; }[]; }' is not assignable to type 'IntrinsicAttributes & ColonyConsoleProps'.

### components/colony/AetherColonyConsole.tsx (2)
  - components/colony/AetherColonyConsole.tsx(8,11): error TS2339: Property 'setActiveColony' does not exist on type 'UIStore'.
  - components/colony/AetherColonyConsole.tsx(25,13): error TS2322: Type '{ colonyId: "aether"; predefinedCommands: { id: string; command: string; description: string; }[]; }' is not assignable to type 'IntrinsicAttributes & ColonyConsoleProps'.

### components/colony/AutomatischColonyConsole.tsx (2)
  - components/colony/AutomatischColonyConsole.tsx(8,11): error TS2339: Property 'setActiveColony' does not exist on type 'UIStore'.
  - components/colony/AutomatischColonyConsole.tsx(25,13): error TS2322: Type '{ colonyId: "automatisch"; predefinedCommands: { id: string; command: string; description: string; }[]; }' is not assignable to type 'IntrinsicAttributes & ColonyConsoleProps'.

### components/colony/BuildYourOwnXColonyConsole.tsx (2)
  - components/colony/BuildYourOwnXColonyConsole.tsx(8,11): error TS2339: Property 'setActiveColony' does not exist on type 'UIStore'.
  - components/colony/BuildYourOwnXColonyConsole.tsx(25,13): error TS2322: Type '{ colonyId: "build-your-own-x"; predefinedCommands: { id: string; command: string; description: string; }[]; }' is not assignable to type 'IntrinsicAttributes & ColonyConsoleProps'.

### components/colony/FreeCodeCampColonyConsole.tsx (2)
  - components/colony/FreeCodeCampColonyConsole.tsx(8,11): error TS2339: Property 'setActiveColony' does not exist on type 'UIStore'.
  - components/colony/FreeCodeCampColonyConsole.tsx(25,13): error TS2322: Type '{ colonyId: "freeCodeCamp"; predefinedCommands: { id: string; command: string; description: string; }[]; }' is not assignable to type 'IntrinsicAttributes & ColonyConsoleProps'.

### components/colony/FreeProgrammingBooksColonyConsole.tsx (2)
  - components/colony/FreeProgrammingBooksColonyConsole.tsx(8,11): error TS2339: Property 'setActiveColony' does not exist on type 'UIStore'.
  - components/colony/FreeProgrammingBooksColonyConsole.tsx(25,13): error TS2322: Type '{ colonyId: "free-programming-books"; predefinedCommands: { id: string; command: string; description: string; }[]; }' is not assignable to type 'IntrinsicAttributes & ColonyConsoleProps'.

### components/colony/KimiK2ColonyConsole.tsx (2)
  - components/colony/KimiK2ColonyConsole.tsx(8,11): error TS2339: Property 'setActiveColony' does not exist on type 'UIStore'.
  - components/colony/KimiK2ColonyConsole.tsx(25,13): error TS2322: Type '{ colonyId: "Kimi-K2"; predefinedCommands: { id: string; command: string; description: string; }[]; }' is not assignable to type 'IntrinsicAttributes & ColonyConsoleProps'.

### components/colony/LocalAGIColonyConsole.tsx (2)
  - components/colony/LocalAGIColonyConsole.tsx(8,11): error TS2339: Property 'setActiveColony' does not exist on type 'UIStore'.
  - components/colony/LocalAGIColonyConsole.tsx(25,13): error TS2322: Type '{ colonyId: "LocalAGI"; predefinedCommands: { id: string; command: string; description: string; }[]; }' is not assignable to type 'IntrinsicAttributes & ColonyConsoleProps'.

### components/colony/NAR2ColonyConsole.tsx (2)
  - components/colony/NAR2ColonyConsole.tsx(8,11): error TS2339: Property 'setActiveColony' does not exist on type 'UIStore'.
  - components/colony/NAR2ColonyConsole.tsx(21,13): error TS2322: Type '{ colonyId: "NAR2"; predefinedCommands: { id: string; command: string; description: string; }[]; }' is not assignable to type 'IntrinsicAttributes & ColonyConsoleProps'.

### components/command-center/tabs/MISSIONS.tsx (2)
  - components/command-center/tabs/MISSIONS.tsx(4,29): error TS2307: Cannot find module '../../services/api' or its corresponding type declarations.
  - components/command-center/tabs/MISSIONS.tsx(249,62): error TS2552: Cannot find name 'fetchMissions'. Did you mean 'setMissions'?

### components/App.tsx (1)
  - components/App.tsx(6,28): error TS1261: Already included file name '/home/user/THEHIVE/frontend/src/components/Constitutional.tsx' differs from file name '/home/user/THEHIVE/frontend/src/components/constitutional.tsx' only in casing.

### components/Constitutional.tsx (1)
  - components/Constitutional.tsx(2,10): error TS2305: Module '"../services/api"' has no exported member 'api'.

### components/main.tsx (1)
  - components/main.tsx(3,17): error TS2307: Cannot find module './components/App' or its corresponding type declarations.

## The recurring pattern (please adopt)
Every one of these dies instantly under `npm run type-check` — run it BEFORE committing.
Common fixes seen across your files: `d3` callbacks need typed params (not `unknown`); store
selectors return typed slices (annotate); don't reference undefined vars; one filename casing
only (`Constitutional.tsx` vs `constitutional.tsx`). The `frontend-design`/`taste-skill` design
skills are in `.claude/skills/` for the polish pass — but green first.