// SprintOps demo mode: an in-browser stand-in for the Express API and Socket.IO server.
// It only activates on static hosting (*.github.io) or with ?demo in the URL, so the
// real backend is untouched when the app is served by `npm start`.
(function () {
    const params = new URLSearchParams(location.search);
    const isDemo = location.hostname.endsWith('.github.io') || params.has('demo') ||
        (window.parent !== window && (() => { try { return !!window.parent.SPRINTOPS_DEMO; } catch (e) { return false; } })());
    if (!isDemo) return;
    window.SPRINTOPS_DEMO = true;

    const STORAGE_KEY = 'sprintops-demo-state-v1';
    const uid = (prefix) => prefix + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    const now = () => new Date().toISOString();

    // Sample tasks spread across the current week so the calendar, kanban and velocity panels have data.
    function at(dayOffset, hour) {
        const d = new Date();
        const monday = new Date(d);
        monday.setDate(d.getDate() + (d.getDay() === 0 ? -6 : 1 - d.getDay()));
        monday.setHours(hour, 0, 0, 0);
        monday.setDate(monday.getDate() + dayOffset);
        return monday.toISOString();
    }

    function task(title, taskType, priority, dayOffset, hour, status, description, requirements) {
        return {
            id: uid('task-'), workspaceId: 'ws-default', title, description, projectPath: './',
            taskType, priority, scheduledTime: at(dayOffset, hour), estimatedDuration: 60, status,
            requirements: requirements || [], createdAt: now(), updatedAt: now()
        };
    }

    function defaultState() {
        return {
            workspaces: {
                activeWorkspaceId: 'ws-default',
                workspaces: [
                    { id: 'ws-default', name: 'SprintOps Platform', host: 'https://demo.sprintops.dev', projectPath: './sprintops',
                      collaborators: ['alex@sprintops.dev', 'priya@sprintops.dev', 'sam@sprintops.dev'], createdAt: now(), updatedAt: now() },
                    { id: 'ws-mobile', name: 'Mobile App', host: 'https://mobile.sprintops.dev', projectPath: './mobile-app',
                      collaborators: ['jordan@sprintops.dev'], createdAt: now(), updatedAt: now() }
                ]
            },
            events: [
                task('Add OAuth login with GitHub', 'feature', 'high', 0, 9, 'completed', 'Let users sign in with their GitHub account.', ['Store tokens encrypted', 'Unit test coverage']),
                task('Fix flaky calendar timezone test', 'bugfix', 'medium', 0, 14, 'completed', 'Calendar tests fail when the runner is not in UTC.'),
                task('Refactor KanbanManager persistence', 'refactor', 'low', 1, 10, 'completed', 'Move board overrides to a single JSON store.'),
                task('Speed up security scanner on large repos', 'optimization', 'high', 1, 15, 'in_progress', 'Skip vendored folders and stream file reads.'),
                task('Write onboarding guide for Teams integration', 'documentation', 'medium', 2, 11, 'scheduled', 'Step-by-step Teams webhook setup.'),
                task('Patch XSS in retro card rendering', 'bugfix', 'urgent', 2, 16, 'scheduled', 'Escape user text before inserting into the board.', ['Backward compatibility']),
                task('Sprint velocity forecast widget', 'feature', 'medium', 3, 9, 'scheduled', 'Show predicted finish date on the dashboard.'),
                task('Migrate JIRA sync to webhooks v2', 'refactor', 'high', 3, 13, 'scheduled', 'Adopt the new JIRA webhook payload format.'),
                task('Cache LLM responses for repeated prompts', 'optimization', 'low', 4, 10, 'scheduled', 'Reduce cost for identical planning prompts.'),
                task('Release notes for v1.2', 'documentation', 'low', 4, 15, 'scheduled', 'Summarize shipped features for the changelog.')
            ],
            kanbanOverrides: {},
            retros: [
                { id: 'retro-demo-2', workspaceId: 'ws-default', sprintName: 'Sprint 7 - Integrations Hardening', createdAt: now(),
                  aiSummary: 'Sprint 7 closed 3 of 4 committed items with a 75% completion rate. The security scanner work slipped because large repositories exposed slow file reads. Recommendation: profile scanner I/O before the next sprint.',
                  columns: {
                      wentWell: [
                          { id: 'card-a1', text: 'GitHub OAuth shipped a day early', author: 'alex', votes: 4 },
                          { id: 'card-a2', text: 'Pairing on the timezone bug paid off', author: 'priya', votes: 2 }
                      ],
                      didNotGoWell: [
                          { id: 'card-a3', text: 'Security scan takes minutes on monorepos', author: 'sam', votes: 3 },
                          { id: 'card-a4', text: 'Unclear ownership of JIRA webhook migration', author: 'priya', votes: 1 }
                      ],
                      actionItems: [
                          { id: 'card-a5', text: 'Profile scanner file I/O and add folder skips', author: 'sam', votes: 2, convertedToTaskId: null }
                      ],
                      ideas: [
                          { id: 'card-a6', text: 'Daily Teams digest with velocity trend', author: 'alex', votes: 3 }
                      ]
                  } },
                { id: 'retro-demo-1', workspaceId: 'ws-default', sprintName: 'Sprint 6 - Initial Release', createdAt: now(),
                  aiSummary: 'Sprint 6 achieved a 100% completion rate. Automated JIRA updates and Teams notifications ran cleanly. Recommendation: keep expanding automated test suites.',
                  columns: {
                      wentWell: [{ id: 'card-b1', text: 'PR automation worked seamlessly', author: 'alex', votes: 3 }],
                      didNotGoWell: [{ id: 'card-b2', text: 'Unit tests needed extra timeout configuration', author: 'sam', votes: 1 }],
                      actionItems: [{ id: 'card-b3', text: 'Add performance benchmarks to CI', author: 'priya', votes: 1, convertedToTaskId: null }],
                      ideas: [{ id: 'card-b4', text: 'Docker health checks in the status tab', author: 'sam', votes: 2 }]
                  } }
            ],
            docs: [
                { id: 'doc-demo-1', workspaceId: 'ws-default', title: 'System Architecture & Sequence Diagram', type: 'mermaid', diagramType: 'sequence',
                  content: 'sequenceDiagram\n    actor User as Product Manager / Dev\n    participant Client as SprintOps Studio UI\n    participant Server as Express Backend\n    participant LLM as AI Engine\n    participant External as GitHub & JIRA & Teams\n\n    User->>Client: Voice Command / Chat Prompt\n    Client->>Server: POST /api/speech/parse-command\n    Server->>LLM: Parse command\n    LLM-->>Server: Structured task\n    Server->>External: Create JIRA ticket & Teams alert\n    Server->>Client: Task scheduled',
                  author: 'SprintOps Architecture AI', createdAt: now(), updatedAt: now() },
                { id: 'doc-demo-2', workspaceId: 'ws-default', title: 'Task Execution Flow', type: 'mermaid', diagramType: 'flowchart',
                  content: 'flowchart LR\n    A[Scheduled task] --> B[Analyze project]\n    B --> C[Generate plan]\n    C --> D[Execute plan]\n    D --> E{Success?}\n    E -- yes --> F[Open PR & update JIRA]\n    E -- no --> G[Notify Teams]',
                  author: 'SprintOps Architecture AI', createdAt: now(), updatedAt: now() },
                { id: 'doc-demo-3', workspaceId: 'ws-default', title: 'SprintOps Technical Specification', type: 'markdown',
                  content: '# SprintOps Architecture Spec\n\n## 1. Overview\nSprintOps is an autonomous agile development agent platform that bridges voice prompts, JIRA tickets, and GitHub pull requests.\n\n## 2. Key Pillars\n- **Workspace scoping:** tasks, retros and docs are isolated per workspace.\n- **Local LLM privacy:** supports containerized LLMs (Ollama, LocalAI, vLLM).\n- **Retrospectives:** retro boards with AI insights and action item conversion.',
                  author: 'SprintOps Architecture AI', createdAt: now(), updatedAt: now() }
            ],
            config: {
                OPENAI_API_KEY: '', GEMINI_API_KEY: '********', ANTHROPIC_API_KEY: '', GITHUB_TOKEN: '********',
                JIRA_BASE_URL: 'https://sprintops-demo.atlassian.net', JIRA_EMAIL: 'demo@sprintops.dev', JIRA_API_TOKEN: '********',
                JIRA_PROJECT_KEY: 'KAN', TEAMS_WEBHOOK_URL: '********', AI_MODEL: 'gemini-1.5-flash',
                customLLM: { baseUrl: '', apiKey: '', modelName: '' }
            }
        };
    }

    // sessionStorage is shared between this page and the same-origin agent iframe, so both see one state.
    let memoryState = null;
    function load() {
        try {
            const raw = sessionStorage.getItem(STORAGE_KEY);
            if (raw) return JSON.parse(raw);
        } catch (e) { /* storage unavailable */ }
        if (!memoryState) { memoryState = defaultState(); save(memoryState); }
        return memoryState;
    }
    function save(state) {
        memoryState = state;
        try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) { /* storage unavailable */ }
    }

    // ---- Fake Socket.IO, broadcast across the page and its iframe ----
    const listeners = {};
    let channel = null;
    try { channel = new BroadcastChannel('sprintops-demo'); } catch (e) { /* unsupported */ }
    function dispatch(name, data) { (listeners[name] || []).forEach(fn => { try { fn(data); } catch (e) { console.error(e); } }); }
    function broadcast(name, data) {
        dispatch(name, data);
        if (channel) channel.postMessage({ name, data });
    }
    if (channel) channel.onmessage = (e) => dispatch(e.data.name, e.data.data);
    const fakeSocket = {
        on(name, fn) { (listeners[name] = listeners[name] || []).push(fn); return this; },
        // Mirror the server: client 'task_progress' is rebroadcast as 'task_update'.
        emit(name, data) { if (name === 'task_progress') broadcast('task_update', data); return this; }
    };
    // Keep the fake even if the real socket.io client script loads later (e.g. ?demo on the Node server).
    Object.defineProperty(window, 'io', { configurable: true, get: () => () => fakeSocket, set: () => {} });

    // ---- API handlers (mirror src/index.js routes and the managers' response shapes) ----
    function activeWorkspace(state) {
        const ws = state.workspaces.workspaces;
        return ws.find(w => w.id === state.workspaces.activeWorkspaceId) || ws[0];
    }
    const inWs = (state, item) => !item.workspaceId || item.workspaceId === activeWorkspace(state).id;

    function createEvent(state, data) {
        const ev = {
            id: uid('task-'), workspaceId: data.workspaceId || activeWorkspace(state).id, title: data.title,
            description: data.description, projectPath: data.projectPath, taskType: data.taskType,
            priority: data.priority || 'medium', scheduledTime: new Date(data.scheduledTime || Date.now() + 3600000).toISOString(),
            estimatedDuration: data.estimatedDuration || 60, status: 'scheduled', requirements: data.requirements || [],
            createdAt: now(), updatedAt: now()
        };
        state.events.push(ev);
        return ev;
    }

    function velocity(events) {
        const points = { urgent: 8, high: 5, medium: 3, low: 1 };
        let done = 0, backlog = 0, doneCount = 0;
        events.forEach(e => {
            const p = points[e.priority] || 3;
            if (e.status === 'completed') { done += p; doneCount++; } else { backlog += p; }
        });
        const daily = done > 0 ? done / 7 : 5;
        const days = Math.ceil(backlog / Math.max(1, daily));
        const target = new Date();
        target.setDate(target.getDate() + days);
        return {
            totalTasksCount: events.length, completedTasksCount: doneCount, completedStoryPoints: done,
            backlogStoryPoints: backlog, dailyVelocity: Math.round(daily * 10) / 10,
            completionRatePercentage: events.length ? Math.round(doneCount / events.length * 100) : 0,
            predictedDaysToFinish: days,
            targetCompletionDate: target.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        };
    }

    function simulateExecution(id) {
        const steps = [
            ['analyzing', 'Analyzing project context...'],
            ['planning', 'Generating implementation plan...'],
            ['executing', 'Executing implementation plan...'],
            ['integrating', 'Processing integrations (JIRA/GitHub)...']
        ];
        const state = load();
        const ev = state.events.find(e => e.id === id);
        if (ev) { ev.status = 'in_progress'; ev.startedAt = now(); save(state); }
        steps.forEach(([status, message], i) => {
            setTimeout(() => broadcast('task_update', { taskId: id, status, message, timestamp: now() }), 700 * (i + 1));
        });
        setTimeout(() => {
            const s = load();
            const e = s.events.find(x => x.id === id);
            if (e) { e.status = 'completed'; e.completedAt = now(); save(s); }
            broadcast('task_completed', { taskId: id, result: { success: true, demo: true }, timestamp: now() });
        }, 700 * (steps.length + 1));
    }

    const routes = [
        ['GET', /^\/api\/workspaces$/, (s) => s.workspaces],
        ['POST', /^\/api\/workspaces$/, (s, b) => {
            const ws = { id: uid('ws-'), name: b.name || 'New Workspace', host: b.host || 'https://demo.sprintops.dev',
                projectPath: b.projectPath || './', collaborators: b.collaborators || [], createdAt: now(), updatedAt: now() };
            s.workspaces.workspaces.push(ws);
            s.workspaces.activeWorkspaceId = ws.id;
            return ws;
        }],
        ['POST', /^\/api\/workspaces\/select$/, (s, b) => { s.workspaces.activeWorkspaceId = b.id; return s.workspaces; }],
        ['POST', /^\/api\/workspaces\/([^/]+)\/invite$/, (s, b, m) => {
            const ws = s.workspaces.workspaces.find(w => w.id === m[1]);
            const email = String(b.email || '').trim().toLowerCase();
            if (ws && email && !ws.collaborators.includes(email)) ws.collaborators.push(email);
            return ws;
        }],
        ['DELETE', /^\/api\/workspaces\/([^/]+)\/invite$/, (s, b, m) => {
            const ws = s.workspaces.workspaces.find(w => w.id === m[1]);
            const email = String(b.email || '').trim().toLowerCase();
            if (ws) ws.collaborators = ws.collaborators.filter(e => e !== email);
            return ws;
        }],

        ['GET', /^\/api\/calendar\/events$/, (s) => s.events.filter(e => inWs(s, e))],
        ['POST', /^\/api\/calendar\/events$/, (s, b) => createEvent(s, b)],
        ['DELETE', /^\/api\/calendar\/events\/([^/]+)$/, (s, b, m) => {
            s.events = s.events.filter(e => e.id !== m[1]);
            setTimeout(() => broadcast('task_update', { taskId: m[1], status: 'cancelled', message: 'Task cancelled by user' }), 0);
            return { success: true, message: 'Task cancelled successfully.' };
        }],
        ['POST', /^\/api\/calendar\/events\/([^/]+)\/execute$/, (s, b, m) => {
            setTimeout(() => simulateExecution(m[1]), 0);
            return { success: true, message: 'Task execution started.' };
        }],

        ['GET', /^\/api\/kanban$/, (s) => {
            const board = { backlog: [], in_progress: [], in_review: [], done: [] };
            s.events.filter(e => inWs(s, e)).forEach(e => {
                const col = s.kanbanOverrides[e.id] ||
                    (e.status === 'in_progress' ? 'in_progress' : e.status === 'completed' ? 'done' : 'backlog');
                (board[col] = board[col] || []).push({ ...e, kanbanColumn: col });
            });
            return board;
        }],
        ['POST', /^\/api\/kanban\/move$/, (s, b) => {
            s.kanbanOverrides[b.taskId] = b.targetColumn;
            const ev = s.events.find(e => e.id === b.taskId);
            if (ev) ev.status = { backlog: 'scheduled', in_progress: 'in_progress', done: 'completed' }[b.targetColumn] || ev.status;
            return { taskId: b.taskId, targetColumn: b.targetColumn };
        }],

        ['GET', /^\/api\/retros$/, (s) => s.retros.filter(r => inWs(s, r))],
        ['POST', /^\/api\/retros$/, (s, b) => {
            const retro = { id: uid('retro-'), workspaceId: activeWorkspace(s).id, sprintName: b.sprintName || 'New Sprint Retro', createdAt: now(),
                aiSummary: 'No AI retro analysis run yet. Click "AI Retro Insights" to generate sprint health analysis.',
                columns: { wentWell: [], didNotGoWell: [], actionItems: [], ideas: [] } };
            s.retros.unshift(retro);
            return retro;
        }],
        ['GET', /^\/api\/retros\/([^/]+)$/, (s, b, m) => s.retros.find(r => r.id === m[1]) || { __status: 404, error: 'Retro not found' }],
        ['POST', /^\/api\/retros\/([^/]+)\/cards$/, (s, b, m) => {
            const retro = s.retros.find(r => r.id === m[1]);
            retro.columns[b.columnKey].push({ id: uid('card-'), text: String(b.text || '').trim(), author: b.author || 'Anonymous', votes: 0, convertedToTaskId: null, createdAt: now() });
            return retro;
        }],
        ['POST', /^\/api\/retros\/([^/]+)\/cards\/([^/]+)\/vote$/, (s, b, m) => {
            const retro = s.retros.find(r => r.id === m[1]);
            const card = (retro.columns[b.columnKey] || []).find(c => c.id === m[2]);
            if (card) card.votes = (card.votes || 0) + 1;
            return retro;
        }],
        ['DELETE', /^\/api\/retros\/([^/]+)\/cards\/([^/]+)$/, (s, b, m) => {
            const retro = s.retros.find(r => r.id === m[1]);
            if (retro.columns[b.columnKey]) retro.columns[b.columnKey] = retro.columns[b.columnKey].filter(c => c.id !== m[2]);
            return retro;
        }],
        ['POST', /^\/api\/retros\/([^/]+)\/ai-analyze$/, (s, b, m) => {
            const retro = s.retros.find(r => r.id === m[1]);
            const v = velocity(s.events.filter(e => inWs(s, e)));
            retro.aiSummary = `Sprint closed ${v.completedTasksCount} of ${v.totalTasksCount} tasks (${v.completionRatePercentage}% completion). ` +
                `Urgent bugfixes are queued late in the week, which puts the release date at risk. (Demo analysis, no AI model was called.)`;
            retro.columns.actionItems.push({ id: uid('card-ai-'), text: '[AI Suggestion] Pull urgent bugfixes to the start of the sprint.', author: 'SprintOps AI', votes: 1, convertedToTaskId: null, createdAt: now() });
            return retro;
        }],
        ['POST', /^\/api\/retros\/([^/]+)\/convert-action$/, (s, b) => {
            const t = createEvent(s, { title: b.cardText, taskType: 'feature', priority: 'high', projectPath: activeWorkspace(s).projectPath,
                description: `Converted directly from Sprint Retro Action Item: "${b.cardText}"`, requirements: ['Execute action item from retrospective'] });
            return { success: true, task: t };
        }],

        ['GET', /^\/api\/docs$/, (s) => s.docs.filter(d => inWs(s, d))],
        ['POST', /^\/api\/docs$/, (s, b) => {
            const doc = { id: uid('doc-'), workspaceId: activeWorkspace(s).id, title: b.title || 'Untitled Document', type: b.type || 'markdown',
                diagramType: b.diagramType || 'sequence', content: b.content || '', author: b.author || 'Collaborator', createdAt: now(), updatedAt: now() };
            s.docs.unshift(doc);
            return doc;
        }],
        ['DELETE', /^\/api\/docs\/([^/]+)$/, (s, b, m) => { s.docs = s.docs.filter(d => d.id !== m[1]); return { docs: s.docs }; }],
        ['POST', /^\/api\/docs\/generate-mermaid$/, (s, b) => {
            const type = b.diagramType || 'sequence';
            const prompt = String(b.prompt || 'System');
            const content = type === 'flowchart'
                ? `flowchart TD\n    A[${prompt.slice(0, 30).replace(/[[\]]/g, '')}] --> B[API Gateway]\n    B --> C[Service]\n    C --> D[(Database)]`
                : 'sequenceDiagram\n    actor Client\n    participant API\n    participant DB\n    Client->>API: Request\n    API->>DB: Query\n    DB-->>API: Rows\n    API-->>Client: Response';
            const doc = { id: uid('doc-'), workspaceId: activeWorkspace(s).id, title: `AI ${type.toUpperCase()} Diagram: ${prompt.slice(0, 30)}`,
                type: 'mermaid', diagramType: type, content, author: 'SprintOps Architecture AI', createdAt: now(), updatedAt: now() };
            s.docs.unshift(doc);
            return doc;
        }],

        ['POST', /^\/api\/security\/scan$/, (s) => ({
            projectPath: activeWorkspace(s).projectPath, scannedFilesCount: 42, securityScore: 70, scannedAt: now(),
            vulnerabilities: [
                { file: 'src/executor/TaskExecutor.js', vulnerability: 'Unsanitized Command Exec', severity: 'HIGH', matchCount: 2, recommendation: 'Remediate Unsanitized Command Exec in src/executor/TaskExecutor.js' },
                { file: 'src/utils/FileUtils.js', vulnerability: 'Empty Catch Exception Block', severity: 'LOW', matchCount: 3, recommendation: 'Remediate Empty Catch Exception Block in src/utils/FileUtils.js' },
                { file: 'src/integrations/JiraIntegration.js', vulnerability: 'Empty Catch Exception Block', severity: 'LOW', matchCount: 1, recommendation: 'Remediate Empty Catch Exception Block in src/integrations/JiraIntegration.js' }
            ]
        })],
        ['GET', /^\/api\/analytics\/velocity$/, (s) => velocity(s.events.filter(e => inWs(s, e)))],

        ['GET', /^\/api\/integrations\/status$/, () => ({
            github: { configured: true, status: 'ready' }, jira: { configured: true, status: 'ready' }, teams: { configured: true, status: 'ready' }
        })],
        ['POST', /^\/api\/integrations\/test$/, () => ({
            github: { success: true, error: null }, jira: { success: true, error: null }, teams: { success: true, error: null }
        })],
        ['GET', /^\/api\/config$/, (s) => s.config],
        ['POST', /^\/api\/config$/, () => ({ success: true, message: 'Demo mode: settings are not saved.' })],

        ['POST', /^\/api\/speech\/transcribe$/, () => ({ text: 'Schedule an urgent bugfix for the login page tomorrow at 10 AM' })],
        ['POST', /^\/api\/speech\/parse-command$/, (s, b) => {
            const text = String(b.text || '');
            const lower = text.toLowerCase();
            return {
                title: text.length > 50 ? text.slice(0, 50) + '...' : text,
                taskType: lower.includes('bug') || lower.includes('fix') ? 'bugfix' : lower.includes('doc') ? 'documentation' : 'feature',
                priority: lower.includes('urgent') ? 'urgent' : lower.includes('high') ? 'high' : 'medium',
                scheduledTime: new Date(Date.now() + 3600000).toISOString(),
                projectPath: './', description: text, requirements: []
            };
        }]
    ];

    function jsonResponse(body, status) {
        return new Response(JSON.stringify(body), { status: status || 200, headers: { 'Content-Type': 'application/json' } });
    }

    const realFetch = window.fetch.bind(window);
    window.fetch = async function (input, init) {
        const url = new URL(typeof input === 'string' ? input : input.url, location.href);
        const apiIndex = url.pathname.indexOf('/api/');
        if (apiIndex === -1) return realFetch(input, init);

        const path = url.pathname.slice(apiIndex);
        const method = ((init && init.method) || (input && input.method) || 'GET').toUpperCase();
        let body = {};
        if (init && typeof init.body === 'string') { try { body = JSON.parse(init.body); } catch (e) { /* not JSON */ } }

        for (const [m, re, handler] of routes) {
            const match = method === m && path.match(re);
            if (!match) continue;
            const state = load();
            try {
                const result = handler(state, body, match);
                save(state);
                await new Promise(r => setTimeout(r, 120)); // feel like a network call
                if (result && result.__status) return jsonResponse({ error: result.error }, result.__status);
                return jsonResponse(result === undefined ? {} : result);
            } catch (err) {
                return jsonResponse({ error: err.message }, 500);
            }
        }
        return jsonResponse({ error: `Not available in demo mode: ${method} ${path}` }, 404);
    };

    // A small badge so visitors know the data is sample data (top-level page only).
    if (window.parent === window) {
        document.addEventListener('DOMContentLoaded', () => {
            const badge = document.createElement('div');
            badge.textContent = 'Demo mode: sample data, nothing is saved';
            badge.style.cssText = 'position:fixed;bottom:12px;left:50%;transform:translateX(-50%);z-index:9999;' +
                'background:rgba(88,166,255,0.15);color:#58a6ff;border:1px solid rgba(88,166,255,0.4);' +
                'padding:6px 12px;border-radius:999px;font:12px system-ui,sans-serif;pointer-events:none;';
            document.body.appendChild(badge);
        });
    }
})();
