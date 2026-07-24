npm warn Unknown env config "devdir". This will stop working in the next major version of npm. See `npm help npmrc` for supported config options.
tsc:0
npm warn Unknown env config "devdir". This will stop working in the next major version of npm. See `npm help npmrc` for supported config options.

> cbai-enterprise@0.1.0 lint
> eslint


/Users/botirchoriev/Documents/cbai-enterprise/components/mission/MissionOperatingActions.tsx
  47:6  warning  React Hook useMemo has unnecessary dependencies: 'mission.id' and 'mission.projectId'. Either exclude them or remove the dependency array  react-hooks/exhaustive-deps

/Users/botirchoriev/Documents/cbai-enterprise/components/operating/OperatingNavigator.tsx
  21:3  warning  'cbaiSectionEyebrow' is defined but never used  @typescript-eslint/no-unused-vars

/Users/botirchoriev/Documents/cbai-enterprise/components/organization/OrganizationPageClient.tsx
  41:19  warning  'setWebsite' is assigned a value but never used  @typescript-eslint/no-unused-vars

/Users/botirchoriev/Documents/cbai-enterprise/components/project/ProjectHome.tsx
  151:5   warning  React Hook useMemo has unnecessary dependencies: 'dataRevision' and 'initialProject.id'. Either exclude them or remove the dependency array  react-hooks/exhaustive-deps
  153:67  warning  React Hook useMemo has an unnecessary dependency: 'dataRevision'. Either exclude it or remove the dependency array                           react-hooks/exhaustive-deps
  154:67  warning  React Hook useMemo has an unnecessary dependency: 'dataRevision'. Either exclude it or remove the dependency array                           react-hooks/exhaustive-deps

/Users/botirchoriev/Documents/cbai-enterprise/components/research/topic/ResearchNotesPanel.tsx
  33:59  warning  React Hook useMemo has an unnecessary dependency: 'revision'. Either exclude it or remove the dependency array  react-hooks/exhaustive-deps
  34:65  warning  React Hook useMemo has an unnecessary dependency: 'revision'. Either exclude it or remove the dependency array  react-hooks/exhaustive-deps

/Users/botirchoriev/Documents/cbai-enterprise/components/research/topic/ResearchWorkspaceActivity.tsx
  58:6  warning  React Hook useMemo has an unnecessary dependency: 'revision'. Either exclude it or remove the dependency array  react-hooks/exhaustive-deps

/Users/botirchoriev/Documents/cbai-enterprise/components/voice-operator/VoiceOperatorProvider.tsx
  209:5  warning  React Hook useMemo has an unnecessary dependency: 'transcriptRevision'. Either exclude it or remove the dependency array        react-hooks/exhaustive-deps
  652:5  warning  React Hook useCallback has a missing dependency: 'releaseLiveAudioResources'. Either include it or remove the dependency array  react-hooks/exhaustive-deps

/Users/botirchoriev/Documents/cbai-enterprise/scripts/test-localization-closure.ts
  13:8  warning  'CompanionThoughtSnapshot' is defined but never used  @typescript-eslint/no-unused-vars

✖ 12 problems (0 errors, 12 warnings)

lint:0
npm warn Unknown env config "devdir". This will stop working in the next major version of npm. See `npm help npmrc` for supported config options.

> cbai-enterprise@0.1.0 test:platform-shell
> node --import ./scripts/register-alias-loader.mjs --test scripts/test-platform-shell.ts

(node:21996) [DEP0205] DeprecationWarning: `module.register()` is deprecated. Use `module.registerHooks()` instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
✔ dashboard layout uses progressive disclosure and unified platform shell (0.447375ms)
✔ atmosphere depth reduced — no opaque gray curtain (0.551416ms)
✔ navigation uses theme-aware nav tokens with spatial accent on home only (0.171542ms)
✔ sidebar and topbar share unified dark shell (0.13175ms)
✔ investor and governance hide duplicate global mission chrome (0.072625ms)
✔ entity overview section uses translated UI labels (0.062042ms)
✔ knowledge graph gives canvas majority width at lg breakpoint (0.056708ms)
✔ voice dock reserves main scroll space globally (0.081417ms)
✔ local voice broker dev path documented without committing secrets (0.104875ms)
(node:21996) [DEP0205] DeprecationWarning: `module.register()` is deprecated. Use `module.registerHooks()` instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:21996) [MODULE_TYPELESS_PACKAGE_JSON] Warning: Module type of file:///Users/botirchoriev/Documents/cbai-enterprise/scripts/test-platform-shell.ts is not specified and it doesn't parse as CommonJS.
Reparsing as ES module because module syntax was detected. This incurs a performance overhead.
To eliminate this warning, add "type": "module" to /Users/botirchoriev/Documents/cbai-enterprise/package.json.
ℹ tests 9
ℹ suites 0
ℹ pass 9
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 85.930458
shell:0
npm warn Unknown env config "devdir". This will stop working in the next major version of npm. See `npm help npmrc` for supported config options.

> cbai-enterprise@0.1.0 test:spatial-world-intelligence
> node --import ./scripts/register-alias-loader.mjs --test scripts/test-spatial-world-intelligence.ts

(node:22008) [DEP0205] DeprecationWarning: `module.register()` is deprecated. Use `module.registerHooks()` instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
✔ PlatformHome renders Spatial World Intelligence homepage (0.489458ms)
✔ globe geography uses registry countries only with factual capital coordinates (1.202833ms)
✔ interactive globe has WebGL cleanup, keyboard access, and reduced-motion fallback (0.251458ms)
✔ homepage uses calm teal voice entry and digital OperatorOrb — no fake stats or human avatar (0.163625ms)
✔ country selection links to existing country intelligence route (0.128166ms)
✔ ecosystem strip links to real platform routes only (0.051167ms)
✔ logo mark is intelligence sphere without crescent path (0.145166ms)
✔ spatial world i18n present in all four active languages (0.116041ms)
✔ Voice Operator dock and provider remain global — spatial home does not bypass privacy (0.130208ms)
✔ globe loaded with dynamic import for static export compatibility (0.096542ms)
✔ globe uses bundled Natural Earth 110m geography without runtime map servers (0.159916ms)
✔ spatial home avoids hero/header overlap and uses readable contrast tokens (0.139208ms)
✔ integrated voice CTA and country panel avoid disconnected white pill styling (0.079166ms)
✔ spatial navigation uses readable tokens with left active indicator (0.108833ms)
✔ layout prevents horizontal overflow on spatial main canvas (0.072583ms)
(node:22008) [DEP0205] DeprecationWarning: `module.register()` is deprecated. Use `module.registerHooks()` instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:22008) [MODULE_TYPELESS_PACKAGE_JSON] Warning: Module type of file:///Users/botirchoriev/Documents/cbai-enterprise/scripts/test-spatial-world-intelligence.ts is not specified and it doesn't parse as CommonJS.
Reparsing as ES module because module syntax was detected. This incurs a performance overhead.
To eliminate this warning, add "type": "module" to /Users/botirchoriev/Documents/cbai-enterprise/package.json.
ℹ tests 15
ℹ suites 0
ℹ pass 15
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 165.392708
spatial:0
npm warn Unknown env config "devdir". This will stop working in the next major version of npm. See `npm help npmrc` for supported config options.

> cbai-enterprise@0.1.0 test:voice-operating-navigator
> node --import ./scripts/register-alias-loader.mjs --test scripts/test-voice-operating-navigator.ts

(node:22020) [DEP0205] DeprecationWarning: `module.register()` is deprecated. Use `module.registerHooks()` instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
✔ identity: canonical UZ definition and creator attribution (0.441166ms)
✔ identity: EN/RU/TR parity for core fields (0.0785ms)
✔ identity FAQ: CBAI nima / Kim yaratgan / Maqsadi / Vizioni (0.6415ms)
✔ identity FAQ resolves via voice command without navigation (0.362208ms)
✔ first-run intro is versioned and not repeated after complete (0.085708ms)
✔ first-run intro only after intentional activation — no autoplay on mount (0.2225ms)
✔ chemist: Men kimyogarman navigates Research + follow-up clarify (1.412208ms)
✔ chemist: EN/RU/TR equivalents (3.448833ms)
✔ chemist does not silently create a project (0.611666ms)
✔ safe levels: read-only FAQ=0, navigate=1, compose=2, delete speech=3 (0.074ms)
✔ create project / work card requires confirmation risk (0.884334ms)
✔ route registry: Evidence My Work About only registered hrefs (0.441541ms)
✔ instructions forbid unsupported claims (0.109958ms)
✔ EN/UZ/RU/TR voiceCommand keys include chemist + identity (0.039792ms)
✔ pathname teardown + Stop/Close still wired (0.110834ms)
✔ no OPENAI_API_KEY in browser voice modules (0.198167ms)
✔ architecture decision note exists (0.025166ms)
✔ onboarding mark API is callable in non-window environments (0.035042ms)
(node:22020) [DEP0205] DeprecationWarning: `module.register()` is deprecated. Use `module.registerHooks()` instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:22020) [MODULE_TYPELESS_PACKAGE_JSON] Warning: Module type of file:///Users/botirchoriev/Documents/cbai-enterprise/scripts/test-voice-operating-navigator.ts is not specified and it doesn't parse as CommonJS.
Reparsing as ES module because module syntax was detected. This incurs a performance overhead.
To eliminate this warning, add "type": "module" to /Users/botirchoriev/Documents/cbai-enterprise/package.json.
ℹ tests 18
ℹ suites 0
ℹ pass 18
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 239.591541
voice_nav:0
npm warn Unknown env config "devdir". This will stop working in the next major version of npm. See `npm help npmrc` for supported config options.

> cbai-enterprise@0.1.0 test:auth-collaboration-voice-os
> node --import ./scripts/register-alias-loader.mjs --test scripts/test-auth-collaboration-voice-os.ts

(node:22032) [DEP0205] DeprecationWarning: `module.register()` is deprecated. Use `module.registerHooks()` instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
✔ typed navigation Kimyo sahifasini och executes research chemistry (2.709583ms)
✔ Dalillar / My Work / Reports navigation routes (0.898833ms)
✔ Realtime tool validation rejects unknown action and arbitrary URLs (0.123625ms)
✔ Realtime tool action_id applies navigation via applyPlatformActionResult (0.220125ms)
✔ engine/mutation companion navigation still pushes (1.84475ms)
✔ internal navigation session persistence — no pathname teardown (0.205125ms)
✔ Stop/Close cleanup and duplicate session guards remain (0.105792ms)
✔ guest protected PhD intake is gated — no auto upload (0.464167ms)
✔ pending intent resume storage has no file payload (0.06975ms)
✔ authenticated PhD intake opens prepare surface without saving (0.184292ms)
✔ team create and publication prepare require confirmation surfaces (0.494791ms)
✔ scientific intake confirm stays queued_pending — never fake ready (0.111ms)
✔ no automatic account/project/team/publication creation from guest speech (0.036625ms)
✔ EN/UZ/RU/TR authCollab completeness (0.036584ms)
✔ workspace routes exist (0.065458ms)
✔ architecture decision note exists (0.031ms)
(node:22032) [DEP0205] DeprecationWarning: `module.register()` is deprecated. Use `module.registerHooks()` instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:22032) [MODULE_TYPELESS_PACKAGE_JSON] Warning: Module type of file:///Users/botirchoriev/Documents/cbai-enterprise/scripts/test-auth-collaboration-voice-os.ts is not specified and it doesn't parse as CommonJS.
Reparsing as ES module because module syntax was detected. This incurs a performance overhead.
To eliminate this warning, add "type": "module" to /Users/botirchoriev/Documents/cbai-enterprise/package.json.
ℹ tests 16
ℹ suites 0
ℹ pass 16
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 202.70725
auth_voice:0
npm warn Unknown env config "devdir". This will stop working in the next major version of npm. See `npm help npmrc` for supported config options.

> cbai-enterprise@0.1.0 test:operational-objects
> node --import ./scripts/register-alias-loader.mjs --test scripts/test-operational-objects.ts

(node:22044) [DEP0205] DeprecationWarning: `module.register()` is deprecated. Use `module.registerHooks()` instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
✔ operational object type guard accepts canonical types (0.315834ms)
✔ operational object status guard accepts required statuses (0.057125ms)
✔ operational object domain guard accepts CBAI domains (0.036875ms)
✔ isOperationalObject validates minimal shape (0.662875ms)
✔ missing required fields never fabricates defaults (0.099209ms)
✔ routing is deterministic by type and domain (0.088458ms)
✔ country linked work draft prefills factual context without creating records (0.103042ms)
✔ graph linked work draft requires selected node context (0.062958ms)
✔ report draft preset maps to work plan with reports domain (0.081583ms)
(node:22044) [DEP0205] DeprecationWarning: `module.register()` is deprecated. Use `module.registerHooks()` instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:22044) [MODULE_TYPELESS_PACKAGE_JSON] Warning: Module type of file:///Users/botirchoriev/Documents/cbai-enterprise/scripts/test-operational-objects.ts is not specified and it doesn't parse as CommonJS.
Reparsing as ES module because module syntax was detected. This incurs a performance overhead.
To eliminate this warning, add "type": "module" to /Users/botirchoriev/Documents/cbai-enterprise/package.json.
ℹ tests 9
ℹ suites 0
ℹ pass 9
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 224.865
oo:0
npm warn Unknown env config "devdir". This will stop working in the next major version of npm. See `npm help npmrc` for supported config options.

> cbai-enterprise@0.1.0 test:command-pipeline
> node --import ./scripts/register-alias-loader.mjs --test scripts/test-command-pipeline.ts

(node:22056) [DEP0205] DeprecationWarning: `module.register()` is deprecated. Use `module.registerHooks()` instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
✔ creation command opens composer — never auto-creates (0.517875ms)
✔ search command is distinct from research question creation (0.1165ms)
✔ evidence request is distinct from generic project (0.060917ms)
✔ navigation commands resolve through voice action layer (0.784042ms)
✔ ambiguous short input triggers clarification (0.791333ms)
✔ locale is captured on draft provenance (0.078958ms)
(node:22056) [DEP0205] DeprecationWarning: `module.register()` is deprecated. Use `module.registerHooks()` instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:22056) [MODULE_TYPELESS_PACKAGE_JSON] Warning: Module type of file:///Users/botirchoriev/Documents/cbai-enterprise/scripts/test-command-pipeline.ts is not specified and it doesn't parse as CommonJS.
Reparsing as ES module because module syntax was detected. This incurs a performance overhead.
To eliminate this warning, add "type": "module" to /Users/botirchoriev/Documents/cbai-enterprise/package.json.
ℹ tests 6
ℹ suites 0
ℹ pass 6
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 209.374167
cmd:0
npm warn Unknown env config "devdir". This will stop working in the next major version of npm. See `npm help npmrc` for supported config options.

> cbai-enterprise@0.1.0 test:locale-completeness
> node --import ./scripts/register-alias-loader.mjs --test scripts/test-locale-completeness.ts

(node:22068) [DEP0205] DeprecationWarning: `module.register()` is deprecated. Use `module.registerHooks()` instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
✔ UZ Research Canvas DISCOVER runtime copy has no identified English UI sentences (0.432125ms)
✔ UZ COMPARE gap statement is localized (0.119583ms)
✔ UZ DECIDE decision support uses localized boundary text (0.887625ms)
✔ UZ Research home primary UI is Uzbek (0.044083ms)
✔ UZ Research Canvas decisionSupport label localized (0.035958ms)
✔ UZ voice control includes Uzbek recognition warning (0.029709ms)
✔ OperatingNavigator home branch uses translateNavLabel (0.079125ms)
✔ EN/RU/TR/UZ dictionaries include voiceOperator keys (0.047375ms)
✔ scientific provider names remain in research canvas copy (0.037083ms)
✔ terminology registry has no conflicting primary labels (0.317167ms)
✔ no hardcoded English human-decision boundary in UZ runtime copy (0.048458ms)
✔ ResearchHero uses dictionary researchHome strings (0.051083ms)
✔ UZ operational object copy has linked work and report draft labels (0.041958ms)
✔ Country and graph linked-work entry use composer — no hardcoded English (0.099875ms)
✔ Research topic and discovery cards use localized openTopic key (0.106375ms)
✔ CreateProjectForm routes through operational composer when provider available (0.056041ms)
(node:22068) [DEP0205] DeprecationWarning: `module.register()` is deprecated. Use `module.registerHooks()` instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:22068) [MODULE_TYPELESS_PACKAGE_JSON] Warning: Module type of file:///Users/botirchoriev/Documents/cbai-enterprise/scripts/test-locale-completeness.ts is not specified and it doesn't parse as CommonJS.
Reparsing as ES module because module syntax was detected. This incurs a performance overhead.
To eliminate this warning, add "type": "module" to /Users/botirchoriev/Documents/cbai-enterprise/package.json.
ℹ tests 16
ℹ suites 0
ℹ pass 16
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 161.693709
locale:0
