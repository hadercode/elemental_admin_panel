function saveState() {
    localStorage.setItem('ELEMENTAL_V2_STATE', JSON.stringify({
        isSidebarCollapsed: UI_STATE.isSidebarCollapsed,
        sidebarPosition: UI_STATE.sidebarPosition,
        headerPosition: UI_STATE.headerPosition,
        themeMode: UI_STATE.themeMode,
        accentColor: UI_STATE.accentColor,
        openSubMenus: UI_STATE.openSubMenus,
        isProfileOpen: UI_STATE.isProfileOpen
    }));
}

function loadState() {
    const saved = localStorage.getItem('ELEMENTAL_V2_STATE');
    if (saved) {
        const data = JSON.parse(saved);
        Object.assign(UI_STATE, data);
    }
    applyAllStates();
}

function applyAllStates() {
    setTheme(UI_STATE.themeMode);
    setAccent(UI_STATE.accentColor);
    setPosition(UI_STATE.sidebarPosition);
    setHeaderPosition(UI_STATE.headerPosition);
    if (UI_STATE.isSidebarCollapsed) applySidebarCollapse();
    else {
        document.getElementById('sidebar').style.width = CONFIG.sidebarWidth;
        document.getElementById('app-header').style.left = CONFIG.sidebarWidth;
    }
    updateContextUI();
    renderMenu();
    renderTrendColors();
}

function updateContextUI() {
    const activeItem = CONFIG.menuItems.find(m => m.id === UI_STATE.activeMenu);
    if (activeItem) {
        document.getElementById('breadcrumb-active').innerText = activeItem.label;

        // Simulate sync active on change
        const toolbar = document.getElementById('toolbar-v2');
        toolbar.classList.add('sync-active');
        setTimeout(() => toolbar.classList.remove('sync-active'), 1500);

        const primaryActionExpand = document.getElementById('primary-action-expand');
        primaryActionExpand.onclick = () => {
            document.documentElement.requestFullscreen();
        }

        lucide.createIcons();
    }
}

function renderMenu() {
    const container = document.getElementById('nav-container');

    // Definiendo Grupos
    const groups = [
        { label: 'Operaciones', items: ['dashboard', 'ventas', 'compras', 'inventario'] },
        { label: 'Sistema', items: ['usuarios', 'config'] }
    ];

    container.innerHTML = groups.map(group => `
        <div class="mb-6">
            ${!UI_STATE.isSidebarCollapsed ? `<p class="px-4 mb-3 text-[9px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-[0.3em]">-- ${group.label}</p>` : ''}
            <div class="space-y-1.5">
                ${CONFIG.menuItems.filter(i => group.items.includes(i.id)).map(item => `
                    <div class="menu-item-container relative">
                        <button onclick="handleMenuClick('${item.id}')" 
                                class="w-full flex items-center justify-between p-4 rounded-3xl transition-all duration-300 hover:bg-slate-50 dark:hover:bg-slate-800/40 group ${UI_STATE.activeMenu === item.id ? 'nav-item-active' : 'text-slate-500'}">
                            <div class="flex items-center gap-4 relative">
                                <i data-lucide="${item.icon}" class="nav-hover-icon w-5 h-5 ${UI_STATE.activeMenu === item.id ? 'text-accent icon-bounce' : 'text-slate-400 group-hover:text-accent'}"></i>
                                <span class="${UI_STATE.isSidebarCollapsed ? 'hidden' : 'block'} text-[10px] font-bold uppercase tracking-[0.2em] leading-none mt-0.5 transition-all">${item.label}</span>
                                ${item.id === 'ventas' && !UI_STATE.isSidebarCollapsed ? '<span class="absolute -top-1 -right-2 px-1.5 py-0.5 bg-rose-500 text-white text-[8px] font-black rounded-full shadow-sm">3</span>' : ''}
                            </div>
                            ${item.subMenu && !UI_STATE.isSidebarCollapsed ? '<i data-lucide="chevron-right" class="w-3.5 h-3.5 text-slate-300 transition-transform ' + (UI_STATE.openSubMenus.includes(item.id) ? 'rotate-90' : '') + '"></i>' : ''}
                        </button>
                        ${item.subMenu && UI_STATE.openSubMenus.includes(item.id) && !UI_STATE.isSidebarCollapsed ? `
                            <div class="ml-14 mt-2 space-y-1 elastic-submenu relative overflow-hidden active">
                                ${item.subMenu.map(sub => `<a href="${sub.link}" class="block p-2 text-[10px] font-bold text-slate-400/80 hover:text-accent transition-all uppercase tracking-widest pl-4 hover:translate-x-1">${sub.label}</a>`).join('')}
                            </div>
                        ` : ''}
                    </div>
                `).join('')}
            </div>
        </div>
    `).join('');
    lucide.createIcons();
}

function toggleSidebar() {
    UI_STATE.isSidebarCollapsed = !UI_STATE.isSidebarCollapsed;
    applySidebarCollapse();
    saveState();
}

function applySidebarCollapse() {
    const sidebar = document.getElementById('sidebar');
    const header = document.getElementById('app-header');
    const brandName = document.getElementById('brand-name');
    const userInfo = document.getElementById('footer-user-info');
    if (UI_STATE.isSidebarCollapsed) {
        sidebar.style.width = CONFIG.collapsedWidth;
        header.style.left = CONFIG.collapsedWidth;
        brandName.style.opacity = '0'; brandName.style.width = '0';
        userInfo.style.opacity = '0';
    } else {
        sidebar.style.width = CONFIG.sidebarWidth;
        header.style.left = CONFIG.sidebarWidth;
        brandName.style.opacity = '1'; brandName.style.width = 'auto';
        userInfo.style.opacity = '1';
    }
    renderMenu();
}

function toggleDrawer() {
    const drawer = document.getElementById('notif-drawer');
    const overlay = document.getElementById('drawer-overlay');
    UI_STATE.isNotificationsOpen = !UI_STATE.isNotificationsOpen;
    if (UI_STATE.isNotificationsOpen) {
        drawer.classList.add('drawer-open');
        overlay.classList.remove('hidden');
        setTimeout(() => overlay.classList.add('opacity-100'));
    } else {
        drawer.classList.remove('drawer-open');
        overlay.classList.remove('opacity-100');
        setTimeout(() => overlay.classList.add('hidden'), 300);
    }
}

function toggleDropdown(type) {
    const el = document.getElementById(`${type}-dropdown`);
    const key = `is${type.charAt(0).toUpperCase() + type.slice(1)}Open`;
    UI_STATE[key] = !UI_STATE[key];

    if (UI_STATE[key]) {
        el.classList.remove('hidden');
        if (type === 'settings') renderAccentSelector();
        renderSettingsButtons();
    } else {
        el.classList.add('hidden');
    }
}

function setAccent(color) {
    UI_STATE.accentColor = color;
    const config = CONFIG.accents[color];
    document.documentElement.style.setProperty('--accent-color', config.base);
    document.documentElement.style.setProperty('--accent-soft', config.soft);
    document.documentElement.style.setProperty('--accent-hover', config.hover);
    renderAccentSelector();
    saveState();
}

function setTheme(mode) {
    UI_STATE.themeMode = mode;
    if (mode === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    renderSettingsButtons();
    saveState();
}

function setHeaderPosition(mode) {
    UI_STATE.headerPosition = 'fixed'; // Keep fixed as per user request
    const header = document.getElementById('app-header');
    header.classList.add('fixed', 'top-0');
    header.classList.remove('relative', 'sticky');
    renderSettingsButtons();
    saveState();
}

function setPosition(pos) {
    UI_STATE.sidebarPosition = pos;
    const layout = document.getElementById('app-layout');
    if (pos === 'right') layout.classList.add('flex-row-reverse');
    else layout.classList.remove('flex-row-reverse');
    saveState();
}

function renderTrendColors() {
    document.querySelectorAll('.trend-badge').forEach(el => {
        const val = el.getAttribute('data-value');
        if (val === 'plus') el.className += ' text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50';
        else if (val === 'minus') el.className += ' text-rose-600 bg-rose-50 dark:bg-rose-950/50';
    });
}

function renderAccentSelector() {
    const container = document.getElementById('accent-selector');
    container.innerHTML = Object.keys(CONFIG.accents).map(name => `
        <button onclick="setAccent('${name}')" 
                class="w-8 h-8 rounded-full border-4 ${UI_STATE.accentColor === name ? 'border-accent/20 ring-4 ring-accent' : 'border-white dark:border-slate-800 shadow-xl'} transition-all" 
                style="background-color: ${CONFIG.accents[name].base}"></button>
    `).join('');
}

function renderSettingsButtons() {
    const activeClass = 'bg-white dark:bg-slate-700 shadow-xl border border-slate-200 dark:border-slate-600 text-accent font-black';
    const inactiveClass = 'text-slate-400 dark:text-slate-600';
    document.getElementById('theme-light-btn').className = `py-3 rounded-xl text-[10px] font-bold uppercase transition-all ${UI_STATE.themeMode === 'light' ? activeClass : inactiveClass}`;
    document.getElementById('theme-dark-btn').className = `py-3 rounded-xl text-[10px] font-bold uppercase transition-all ${UI_STATE.themeMode === 'dark' ? activeClass : inactiveClass}`;
    document.getElementById('header-sticky-btn').className = `py-3 rounded-xl text-[10px] font-bold uppercase transition-all ${UI_STATE.headerPosition === 'sticky' ? activeClass : inactiveClass}`;
    document.getElementById('header-rel-btn').className = `py-3 rounded-xl text-[10px] font-bold uppercase transition-all ${UI_STATE.headerPosition === 'relative' ? activeClass : inactiveClass}`;
}

function handleMenuClick(id) {
    const item = CONFIG.menuItems.find(m => m.id === id);
    if (item.subMenu) {
        if (UI_STATE.openSubMenus.includes(id)) UI_STATE.openSubMenus = UI_STATE.openSubMenus.filter(m => m !== id);
        else UI_STATE.openSubMenus.push(id);
    }
    UI_STATE.activeMenu = id;
    updateContextUI();
    renderMenu();
    saveState();
}

window.onload = () => { loadState(); lucide.createIcons(); };

// Hotkey for search
window.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        document.querySelector('#search-container input').focus();
    }
});

window.addEventListener('click', (e) => {
    if (!e.target.closest('.relative') && !e.target.closest('.fixed') && !e.target.closest('button[onclick^="toggle"]')) {
        const types = ['profile', 'settings'];
        types.forEach(t => {
            const el = document.getElementById(`${t}-drawer`) || document.getElementById(`${t}-dropdown`);
            if (el && !e.target.closest(`#${t}-drawer`) && !e.target.closest(`#${t}-dropdown`)) {
                const key = `is${t.charAt(0).toUpperCase() + t.slice(1)}Open`;
                UI_STATE[key] = false;
                el.classList.add('hidden');
            }
        });
    }
});