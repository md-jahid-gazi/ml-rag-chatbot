<?php
$isAdminLoggedIn = !empty($_SESSION['admin_user']);
$adminUsername = $_SESSION['admin_user'] ?? '';
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Console - Knowledge Ingestion & Vector Pipeline</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        body {
            font-family: 'Inter', sans-serif;
            background: linear-gradient(135deg, #f0fdf4 0%, #e0f2fe 50%, #f8fafc 100%);
        }
        /* Custom Scrollbars */
        ::-webkit-scrollbar {
            width: 5px;
            height: 5px;
        }
        ::-webkit-scrollbar-track {
            background: #f1f5f9;
        }
        ::-webkit-scrollbar-thumb {
            background: #cbd5e1;
            border-radius: 9999px;
        }
        ::-webkit-scrollbar-thumb:hover {
            background: #94a3b8;
        }
    </style>
</head>
<body class="min-h-screen text-slate-800 p-4 sm:p-6 md:p-10 flex flex-col justify-between">

    <!-- Top Header & Switcher Bar -->
    <div class="max-w-6xl mx-auto mb-8 flex items-center justify-between flex-wrap gap-4">
        <div class="flex items-center space-x-3">
            <div class="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-md">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            </div>
            <div>
                <h1 class="text-2xl font-bold tracking-tight text-slate-900">Admin Console</h1>
                <p class="text-xs text-slate-500">Document Ingestion, Embedding Generation, and Vector Knowledge Index</p>
            </div>
        </div>

        <div class="flex items-center space-x-3">
            <div class="flex items-center space-x-2 bg-white px-4 py-2 rounded-full shadow-sm border border-slate-200">
                <span class="text-xs font-semibold text-slate-600">UI Mode:</span>
                <a href="/" class="text-xs font-medium px-3 py-1 text-slate-600 hover:text-slate-900 transition">
                    📱 Chat Widget
                </a>
                <a href="/admin" class="text-xs font-medium px-3 py-1 bg-teal-600 text-white rounded-full shadow-sm">
                    💻 Admin Console
                </a>
            </div>

            <?php if ($isAdminLoggedIn): ?>
                <div class="flex items-center space-x-2 bg-teal-50 border border-teal-200 text-teal-900 px-3 py-1.5 rounded-xl text-xs">
                    <span class="w-2 h-2 rounded-full bg-teal-500"></span>
                    <span class="font-bold"><?= htmlspecialchars($adminUsername) ?></span>
                    <span class="text-[10px] bg-teal-200/80 px-1 py-0.5 rounded font-mono">Admin</span>
                    <button onclick="handleLogout()" class="text-slate-400 hover:text-rose-600 ml-1 font-medium">
                        Sign Out
                    </button>
                </div>
            <?php endif; ?>
        </div>
    </div>

    <!-- ========================================================= -->
    <!-- 1. IF NOT LOGGED IN AS ADMIN: DISPLAY LOGIN FORM -->
    <!-- ========================================================= -->
    <?php if (!$isAdminLoggedIn): ?>
        <div class="max-w-md mx-auto my-12">
            <div class="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl shadow-slate-200/50">
                <div class="text-center mb-6">
                    <div class="w-14 h-14 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600 mx-auto mb-3 shadow-xs">
                        <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke-width="2"/>
                            <path d="M7 11V7a5 5 0 0110 0v4" stroke-width="2"/>
                        </svg>
                    </div>
                    <h2 class="text-xl font-bold text-slate-900">Admin Console Sign In</h2>
                    <p class="text-xs text-slate-500 mt-1">
                        Please enter your administrator username and password to manage knowledge documents.
                    </p>
                </div>

                <div id="loginError" class="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs hidden"></div>

                <form id="adminLoginForm" class="space-y-4">
                    <div>
                        <label class="text-xs font-semibold text-slate-700 block mb-1">Username</label>
                        <input 
                            type="text" 
                            id="loginUsername" 
                            value=""
                            placeholder="Enter username"
                            class="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-teal-500 outline-none"
                            required
                        >
                    </div>

                    <div>
                        <label class="text-xs font-semibold text-slate-700 block mb-1">Password</label>
                        <input 
                            type="password" 
                            id="loginPassword" 
                            placeholder="Enter password" 
                            class="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-teal-500 outline-none"
                            required
                        >
                    </div>

                    <button 
                        type="submit" 
                        id="loginBtn"
                        class="w-full bg-teal-600 hover:bg-teal-500 text-white font-medium py-2.5 rounded-xl text-xs shadow-md shadow-teal-600/20 transition"
                    >
                        Sign In as Admin
                    </button>
                </form>
            </div>
        </div>

        <script>
            document.getElementById('adminLoginForm').addEventListener('submit', async (e) => {
                e.preventDefault();
                const errDiv = document.getElementById('loginError');
                const btn = document.getElementById('loginBtn');
                btn.disabled = true;
                btn.innerText = 'Authenticating...';
                errDiv.classList.add('hidden');

                const payload = {
                    username: document.getElementById('loginUsername').value.trim(),
                    password: document.getElementById('loginPassword').value.trim()
                };

                try {
                    const res = await fetch('/api/admin/login', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    });
                    const data = await res.json();
                    if (!res.ok || !data.success) {
                        throw new Error(data.error || 'Authentication failed');
                    }
                    window.location.reload();
                } catch (err) {
                    errDiv.innerText = err.message;
                    errDiv.classList.remove('hidden');
                } finally {
                    btn.disabled = false;
                    btn.innerText = 'Sign In as Admin';
                }
            });
        </script>

    <!-- ========================================================= -->
    <!-- 2. IF LOGGED IN AS ADMIN: DISPLAY FULL ADMIN CONSOLE -->
    <!-- ========================================================= -->
    <?php else: ?>

        <!-- MAIN PIPELINE VISUALIZATION -->
        <div class="max-w-6xl mx-auto bg-white/90 backdrop-blur-md border border-slate-200/80 rounded-3xl p-6 md:p-8 shadow-xl shadow-slate-200/50 mb-8">
            <h2 class="text-sm font-bold text-slate-700 uppercase tracking-wider mb-6 flex items-center space-x-2">
                <span class="w-2.5 h-2.5 rounded-full bg-teal-500"></span>
                <span>RAG Ingestion Architecture (As Illustrated in Project Schema)</span>
            </h2>

            <div class="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
                <!-- Step 1: Upload Document -->
                <div class="bg-gradient-to-b from-teal-50 to-emerald-50 border border-teal-200 rounded-2xl p-5 text-center shadow-sm">
                    <div class="w-12 h-12 bg-white rounded-xl shadow-md border border-teal-100 flex items-center justify-center mx-auto mb-3">
                        <svg class="w-7 h-7 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                        </svg>
                    </div>
                    <h3 class="font-bold text-xs text-slate-800">1. Upload Document</h3>
                    <span class="text-[11px] text-teal-700 font-mono block mt-1">Account_Security.pdf</span>
                    <p class="text-[10px] text-slate-500 mt-2">Raw PDF / Markdown text extracted & split into chunks</p>
                </div>

                <!-- Step 2: Embedding Model -->
                <div class="bg-gradient-to-b from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-5 text-center shadow-sm relative">
                    <div class="w-12 h-12 bg-white rounded-xl shadow-md border border-blue-100 flex items-center justify-center mx-auto mb-3">
                        <svg class="w-7 h-7 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="9" stroke-width="2"/>
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3.6 9h16.8M3.6 15h16.8"/>
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 3a15 15 0 010 18M12 3a15 15 0 000 18"/>
                        </svg>
                    </div>
                    <h3 class="font-bold text-xs text-slate-800">2. Embedding Model</h3>
                    <span class="text-[10px] text-indigo-700 font-medium block mt-1">all-MiniLM-L6-v2</span>
                    <p class="text-[10px] text-slate-500 mt-2">Generates dense 384D semantic vector representations</p>
                </div>

                <!-- Step 3: Vector Database -->
                <div class="bg-gradient-to-b from-slate-50 to-slate-100 border border-slate-300 rounded-2xl p-5 text-center shadow-sm">
                    <div class="w-12 h-12 bg-white rounded-xl shadow-md border border-slate-200 flex items-center justify-center mx-auto mb-3">
                        <svg class="w-7 h-7 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2 1.5 3 3.5 3h9c2 0 3.5-1 3.5-3V7M4 7c0-2 1.5-3 3.5-3h9c2 0 3.5 1 3.5 3M4 7c0 2 1.5 3 3.5 3h9c2 0 3.5-1 3.5-3m0 5c0 2-1.5 3-3.5 3h-9c-2 0-3.5-1-3.5-3"/>
                        </svg>
                    </div>
                    <h3 class="font-bold text-xs text-slate-800">3. Vector Database</h3>
                    <span class="text-[10px] text-slate-600 font-medium block mt-1">MySQL + In-Memory</span>
                    <p class="text-[10px] text-slate-500 mt-2">Stores chunk embeddings for dot product / cosine similarity</p>
                </div>

                <!-- Step 4: Knowledge Base Index -->
                <div class="bg-gradient-to-b from-emerald-50 to-teal-50 border border-emerald-300 rounded-2xl p-5 text-center shadow-sm">
                    <div class="w-12 h-12 bg-white rounded-xl shadow-md border border-emerald-200 flex items-center justify-center mx-auto mb-3">
                        <svg class="w-7 h-7 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01"/>
                        </svg>
                    </div>
                    <h3 class="font-bold text-xs text-slate-800">4. Knowledge Base Index</h3>
                    <span class="text-[11px] text-emerald-700 font-medium block mt-1">Ready for Retrieval</span>
                    <p class="text-[10px] text-slate-500 mt-2">Real-time matching with strict threshold filtering</p>
                </div>
            </div>
        </div>

        <!-- INGESTION & DOCUMENTS MANAGEMENT -->
        <div class="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
            <!-- Left: Document Ingestion Box -->
            <div class="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col">
                <h2 class="text-sm font-bold text-slate-900 mb-1 flex items-center space-x-2">
                    <svg class="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
                    <span>Knowledge Ingestion Pipeline</span>
                </h2>
                <p class="text-xs text-slate-500 mb-4">Ingest PDF, text, web files, or URLs without retraining</p>

                <!-- Ingestion Mode Tabs -->
                <div class="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl mb-4 text-xs font-semibold">
                    <button type="button" onclick="switchIngestTab('file')" id="tabFile" class="flex-1 py-1.5 px-2 rounded-lg bg-white text-teal-700 shadow-xs transition text-center">
                        📁 File Upload
                    </button>
                    <button type="button" onclick="switchIngestTab('url')" id="tabUrl" class="flex-1 py-1.5 px-2 rounded-lg text-slate-600 hover:text-slate-900 transition text-center">
                        🌐 Web URL
                    </button>
                    <button type="button" onclick="switchIngestTab('text')" id="tabText" class="flex-1 py-1.5 px-2 rounded-lg text-slate-600 hover:text-slate-900 transition text-center">
                        ✍️ Manual Text
                    </button>
                </div>

                <!-- 1. FILE UPLOAD FORM (PDF, TXT, MD, HTML, CSV, JSON) -->
                <form id="fileUploadForm" class="space-y-4">
                    <div>
                        <label class="text-xs font-semibold text-slate-700 block mb-1">Select File (PDF, TXT, MD, HTML, CSV, JSON)</label>
                        <div class="border-2 border-dashed border-slate-200 hover:border-teal-400 rounded-2xl p-4 text-center cursor-pointer bg-slate-50/50 transition" onclick="document.getElementById('fileInput').click()">
                            <svg class="w-7 h-7 text-teal-600 mx-auto mb-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/></svg>
                            <span id="fileLabel" class="text-xs text-slate-600 block font-medium">Click to choose file or drag & drop</span>
                            <span class="text-[10px] text-slate-400 block mt-0.5">Supports PDF, Text (.txt, .md), Web (.html), CSV, JSON</span>
                        </div>
                        <input type="file" id="fileInput" class="hidden" accept=".pdf,.txt,.md,.markdown,.html,.htm,.csv,.json" onchange="handleFilePicked(this)" required>
                    </div>

                    <div>
                        <label class="text-xs font-semibold text-slate-700 block mb-1">Document Title (Optional)</label>
                        <input 
                            type="text" 
                            id="fileTitle" 
                            placeholder="Auto-generated from filename if empty" 
                            class="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-teal-500 outline-none"
                        >
                    </div>

                    <button 
                        type="submit" 
                        id="fileUploadBtn"
                        class="w-full bg-teal-600 hover:bg-teal-500 text-white font-medium py-2.5 rounded-xl text-xs shadow-md shadow-teal-600/20 transition flex items-center justify-center space-x-2"
                    >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
                        <span>Ingest & Index File</span>
                    </button>
                </form>

                <!-- 2. WEB URL INGESTION FORM -->
                <form id="urlScrapeForm" class="space-y-4 hidden">
                    <div>
                        <label class="text-xs font-semibold text-slate-700 block mb-1">Web Page URL</label>
                        <input 
                            type="url" 
                            id="scrapeUrlInput" 
                            placeholder="https://en.wikipedia.org/wiki/Machine_learning" 
                            class="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-teal-500 outline-none" 
                            required
                        >
                        <span class="text-[10px] text-slate-400 block mt-1">Live web scraper extracts clean article text, removes boilerplate, and indexes chunks</span>
                    </div>

                    <button 
                        type="submit" 
                        id="scrapeBtn" 
                        class="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2.5 rounded-xl text-xs shadow-md shadow-indigo-600/20 transition flex items-center justify-center space-x-2"
                    >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"/></svg>
                        <span>Scrape & Index Web Page</span>
                    </button>
                </form>

                <!-- 3. MANUAL TEXT PASTE FORM -->
                <form id="uploadForm" class="space-y-4 hidden">
                    <div>
                        <label class="text-xs font-semibold text-slate-700 block mb-1">Document Title</label>
                        <input 
                            type="text" 
                            id="docTitle" 
                            placeholder="e.g. Account Security Policy" 
                            class="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-teal-500 outline-none"
                            required
                        >
                    </div>

                    <div>
                        <label class="text-xs font-semibold text-slate-700 block mb-1">Document Filename</label>
                        <input 
                            type="text" 
                            id="docFilename" 
                            placeholder="Account_Security.txt" 
                            class="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-teal-500 outline-none"
                            required
                        >
                    </div>

                    <div>
                        <label class="text-xs font-semibold text-slate-700 block mb-1">Text Content</label>
                        <textarea 
                            id="docContent" 
                            rows="5" 
                            placeholder="Paste document text here..." 
                            class="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-teal-500 outline-none"
                            required
                        ></textarea>
                    </div>

                    <button 
                        type="submit" 
                        id="uploadBtn"
                        class="w-full bg-teal-600 hover:bg-teal-500 text-white font-medium py-2.5 rounded-xl text-xs shadow-md shadow-teal-600/20 transition flex items-center justify-center space-x-2"
                    >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
                        <span>Index into Vector Database</span>
                    </button>
                </form>
                <div id="uploadMsg" class="mt-3 text-xs hidden"></div>
            </div>

            <!-- Right: Stored Documents in MySQL -->
            <div class="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col">
                <div class="flex items-center justify-between mb-4">
                    <div>
                        <h2 class="text-sm font-bold text-slate-900">Current Knowledge Base in MySQL</h2>
                        <p class="text-xs text-slate-500">Live indexed documents serving KnowledgeBot</p>
                    </div>
                    <button onclick="loadAdminStats()" class="text-xs text-teal-600 hover:text-teal-700 font-medium">
                        Refresh List
                    </button>
                </div>

                <div class="overflow-x-auto flex-1">
                    <table class="w-full text-left text-xs text-slate-600">
                        <thead class="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-200">
                            <tr>
                                <th class="py-2.5 px-3">Title</th>
                                <th class="py-2.5 px-3">Filename</th>
                                <th class="py-2.5 px-3">Chunks</th>
                                <th class="py-2.5 px-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody id="docsTableBody" class="divide-y divide-slate-100">
                            <tr>
                                <td colspan="4" class="text-center py-6 text-slate-400">Loading documents from MySQL...</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div class="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span>Database: <strong class="text-slate-700">knowledge_chatbot (MySQL)</strong></span>
                    <span id="statSummary">0 Documents • 0 Chunks</span>
                </div>
            </div>
        </div>

        <!-- Footer -->
        <footer class="mt-12 py-6 text-center text-xs text-slate-400 border-t border-slate-200">
            © MD. JAHID GAZI - 2026
        </footer>

        <script>
            async function handleLogout() {
                await fetch('/api/admin/logout', { method: 'POST' });
                window.location.reload();
            }

            async function loadAdminStats() {
                try {
                    const res = await fetch('/api/admin/stats');
                    const data = await res.json();
                    document.getElementById('statSummary').innerText = `${data.total_documents} Documents • ${data.total_chunks} Vector Chunks`;

                    const tbody = document.getElementById('docsTableBody');
                    if (data.documents.length === 0) {
                        tbody.innerHTML = `<tr><td colspan="4" class="text-center py-6 text-slate-400">No documents indexed in MySQL yet.</td></tr>`;
                        return;
                    }

                    tbody.innerHTML = data.documents.map(d => `
                        <tr class="hover:bg-slate-50 transition">
                            <td class="py-3 px-3 font-semibold text-slate-800">${escapeHtml(d.title)}</td>
                            <td class="py-3 px-3 font-mono text-[11px] text-teal-700">${escapeHtml(d.filename)}</td>
                            <td class="py-3 px-3 font-mono font-medium">${d.num_chunks}</td>
                            <td class="py-3 px-3 text-right">
                                <button onclick="deleteDoc(${d.id})" class="text-rose-600 hover:text-rose-700 font-medium">Delete</button>
                            </td>
                        </tr>
                    `).join('');
                } catch (err) {
                    console.error(err);
                }
            }

            async function deleteDoc(id) {
                if (confirm("Delete document from MySQL? Chunks will be pruned.")) {
                    await fetch('/api/admin/delete?id=' + id, { method: 'POST' });
                    await loadAdminStats();
                }
            }

            function switchIngestTab(tab) {
                const forms = {
                    file: document.getElementById('fileUploadForm'),
                    url: document.getElementById('urlScrapeForm'),
                    text: document.getElementById('uploadForm')
                };
                const tabs = {
                    file: document.getElementById('tabFile'),
                    url: document.getElementById('tabUrl'),
                    text: document.getElementById('tabText')
                };

                Object.keys(forms).forEach(k => {
                    if (k === tab) {
                        forms[k].classList.remove('hidden');
                        tabs[k].className = 'flex-1 py-1.5 px-2 rounded-lg bg-white text-teal-700 shadow-xs transition text-center font-bold';
                    } else {
                        forms[k].classList.add('hidden');
                        tabs[k].className = 'flex-1 py-1.5 px-2 rounded-lg text-slate-600 hover:text-slate-900 transition text-center font-medium';
                    }
                });
                document.getElementById('uploadMsg').classList.add('hidden');
            }

            function handleFilePicked(input) {
                if (input.files && input.files[0]) {
                    const file = input.files[0];
                    document.getElementById('fileLabel').innerText = file.name + ' (' + (file.size / 1024).toFixed(1) + ' KB)';
                    if (!document.getElementById('fileTitle').value) {
                        document.getElementById('fileTitle').value = file.name.replace(/\.[^/.]+$/, "");
                    }
                }
            }

            // 1. Handle File Upload (PDF, TXT, MD, HTML, CSV, JSON)
            document.getElementById('fileUploadForm').addEventListener('submit', async (e) => {
                e.preventDefault();
                const fileInput = document.getElementById('fileInput');
                if (!fileInput.files || !fileInput.files[0]) {
                    alert('Please select a file to upload');
                    return;
                }
                const btn = document.getElementById('fileUploadBtn');
                const msg = document.getElementById('uploadMsg');
                btn.disabled = true;
                btn.innerText = 'Extracting, Chunking & Indexing...';

                const formData = new FormData();
                formData.append('file', fileInput.files[0]);
                formData.append('title', document.getElementById('fileTitle').value.trim());

                try {
                    const res = await fetch('/api/admin/upload-file', {
                        method: 'POST',
                        body: formData
                    });
                    const data = await res.json();
                    if (!res.ok) throw new Error(data.error || 'Upload failed');
                    msg.className = 'mt-3 text-xs p-2.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 block';
                    msg.innerText = `Success! Ingested ${data.file_type.toUpperCase()} '${data.title}' with ${data.chunks_indexed} vector chunks.`;
                    document.getElementById('fileUploadForm').reset();
                    document.getElementById('fileLabel').innerText = 'Click to choose file or drag & drop';
                    await loadAdminStats();
                } catch (err) {
                    msg.className = 'mt-3 text-xs p-2.5 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 block';
                    msg.innerText = err.message;
                } finally {
                    btn.disabled = false;
                    btn.innerText = 'Ingest & Index File';
                }
            });

            // 2. Handle URL Web Scraping
            document.getElementById('urlScrapeForm').addEventListener('submit', async (e) => {
                e.preventDefault();
                const url = document.getElementById('scrapeUrlInput').value.trim();
                const btn = document.getElementById('scrapeBtn');
                const msg = document.getElementById('uploadMsg');
                btn.disabled = true;
                btn.innerText = 'Scraping Web Page & Indexing...';

                try {
                    const res = await fetch('/api/admin/scrape-url', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ url: url })
                    });
                    const data = await res.json();
                    if (!res.ok) throw new Error(data.error || 'Scraping failed');
                    msg.className = 'mt-3 text-xs p-2.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 block';
                    msg.innerText = `Success! Scraped & indexed '${data.title}' with ${data.chunks_indexed} chunks.`;
                    document.getElementById('urlScrapeForm').reset();
                    await loadAdminStats();
                } catch (err) {
                    msg.className = 'mt-3 text-xs p-2.5 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 block';
                    msg.innerText = err.message;
                } finally {
                    btn.disabled = false;
                    btn.innerText = 'Scrape & Index Web Page';
                }
            });

            // 3. Handle Manual Text Upload
            document.getElementById('uploadForm').addEventListener('submit', async (e) => {
                e.preventDefault();
                const btn = document.getElementById('uploadBtn');
                const msg = document.getElementById('uploadMsg');
                btn.disabled = true;
                btn.innerText = 'Vectorizing & Saving...';

                const payload = {
                    title: document.getElementById('docTitle').value.trim(),
                    filename: document.getElementById('docFilename').value.trim(),
                    content: document.getElementById('docContent').value.trim()
                };

                try {
                    const res = await fetch('/api/admin/upload', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    });
                    const data = await res.json();
                    if (!res.ok) throw new Error(data.error || 'Upload failed');
                    msg.className = 'mt-3 text-xs p-2.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 block';
                    msg.innerText = `Success! Added document #${data.document_id} with ${data.chunks_indexed} chunks.`;
                    document.getElementById('uploadForm').reset();
                    await loadAdminStats();
                } catch (err) {
                    msg.className = 'mt-3 text-xs p-2.5 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 block';
                    msg.innerText = err.message;
                } finally {
                    btn.disabled = false;
                    btn.innerText = 'Index into Vector Database';
                }
            });

            function escapeHtml(str) {
                return str.replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[m]);
            }

            loadAdminStats();
        </script>
    <?php endif; ?>

</body>
</html>
