const pages = [
  { title: 'Introduction', section: 'Overview', href: '/docs/camelot/overview' },
  { title: 'Architecture', section: 'Overview', href: '/docs/camelot/overview/architecture' },
  { title: 'Memory Allocator', section: 'Overview', href: '/docs/camelot/overview/memory' },
  { title: 'Merlin Build Engine', section: 'Core Systems', href: '/docs/camelot/core/merlin' },
  { title: 'I/O Utilities', section: 'Core Systems', href: '/docs/camelot/core/io' }
];

document.addEventListener('DOMContentLoaded', () => {
  const overlay = document.getElementById('search-overlay');
  const searchInput = document.getElementById('search-input');
  const resultsList = document.getElementById('search-results');
  const emptyMsg = document.getElementById('search-empty');
  const trigger = document.getElementById('search-trigger');
  
  let activeIdx = -1;
  let isOpen = false;

  if (overlay && searchInput && resultsList && emptyMsg && trigger) {
    const openSearch = () => {
      isOpen = true;
      overlay.style.display = 'flex';
      searchInput.value = '';
      activeIdx = -1;
      emptyMsg.style.display = 'none';
      renderResults(pages);
      setTimeout(() => { searchInput.focus(); }, 50);
    };

    const closeSearch = () => {
      isOpen = false;
      overlay.style.display = 'none';
      searchInput.blur();
    };

    const renderResults = (items) => {
      resultsList.innerHTML = '';
      if (items.length === 0) {
        emptyMsg.style.display = 'block';
        return;
      }
      emptyMsg.style.display = 'none';
      items.forEach((item, idx) => {
        const li = document.createElement('li');
        li.className = 'search-result-item';
        
        const a = document.createElement('a');
        a.href = item.href;
        
        const titleSpan = document.createElement('span');
        titleSpan.className = 'sr-title';
        titleSpan.textContent = item.title;
        
        const sectionSpan = document.createElement('span');
        sectionSpan.className = 'sr-section';
        sectionSpan.textContent = item.section;
        
        a.appendChild(titleSpan);
        a.appendChild(sectionSpan);
        li.appendChild(a);
        
        li.addEventListener('mouseenter', () => {
          activeIdx = idx;
          highlightResult();
        });
        
        resultsList.appendChild(li);
      });
    };

    const highlightResult = () => {
      const items = resultsList.querySelectorAll('.search-result-item');
      items.forEach((item, idx) => {
        if (idx === activeIdx) {
          item.classList.add('focused');
        } else {
          item.classList.remove('focused');
        }
      });
    };

    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      openSearch();
    });

    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        openSearch();
        return;
      }
      if (!isOpen) return;
      if (e.key === 'Escape') {
        closeSearch();
        return;
      }
      const items = resultsList.querySelectorAll('.search-result-item');
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        activeIdx = Math.min(activeIdx + 1, items.length - 1);
        highlightResult();
        const activeEl = items[activeIdx];
        if (activeEl) activeEl.scrollIntoView({ block: 'nearest' });
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        activeIdx = Math.max(activeIdx - 1, 0);
        highlightResult();
        const activeEl = items[activeIdx];
        if (activeEl) activeEl.scrollIntoView({ block: 'nearest' });
      }
      if (e.key === 'Enter' && activeIdx >= 0 && items[activeIdx]) {
        const link = items[activeIdx].querySelector('a');
        if (link) window.location.href = link.href;
      }
    });

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeSearch();
    });

    searchInput.addEventListener('input', () => {
      const q = searchInput.value.toLowerCase().trim();
      const filtered = pages.filter(page => 
        !q || 
        page.title.toLowerCase().includes(q) || 
        page.section.toLowerCase().includes(q)
      );
      activeIdx = filtered.length > 0 ? 0 : -1;
      renderResults(filtered);
      highlightResult();
    });
  }
});
