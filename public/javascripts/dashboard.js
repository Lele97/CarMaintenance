/**
 * CarMaintenance - Dashboard Controller
 * Gestione interattiva di grafici, statistiche, filtri, ricerca, board interventi e storage browser.
 */
'use strict';

document.addEventListener('DOMContentLoaded', async () => {
  let expenseChart = null;
  let categoryChart = null;
  let mileageChart = null;

  // Riferimenti DOM
  const searchInput = document.getElementById('search-input');
  const categorySelect = document.getElementById('category-filter');
  const sortSelect = document.getElementById('sort-filter');
  const resetFiltersBtn = document.getElementById('reset-filters-btn');
  const tableBody = document.getElementById('interventions-table-body');
  const cardsContainer = document.getElementById('interventions-cards-container');
  const emptyStateEl = document.getElementById('empty-state');
  const itemsCountBadge = document.getElementById('items-count-badge');

  // KPI elements
  const totalCostEl = document.getElementById('kpi-total-cost');
  const maxKmEl = document.getElementById('kpi-max-km');
  const totalCountEl = document.getElementById('kpi-total-count');
  const avgCostEl = document.getElementById('kpi-avg-cost');
  const healthBadgeEl = document.getElementById('kpi-health-badge');
  const upcomingContainer = document.getElementById('upcoming-reminders-container');

  // Modali
  const interventionModalEl = document.getElementById('interventionModal');
  const interventionModal = interventionModalEl ? new bootstrap.Modal(interventionModalEl) : null;
  const interventionForm = document.getElementById('modal-intervention-form');

  const deleteModalEl = document.getElementById('deleteModal');
  const deleteModal = deleteModalEl ? new bootstrap.Modal(deleteModalEl) : null;
  const deleteConfirmBtn = document.getElementById('confirm-delete-btn');
  let itemToDeleteId = null;

  const exportImportModalEl = document.getElementById('exportImportModal');
  const exportImportModal = exportImportModalEl ? new bootstrap.Modal(exportImportModalEl) : null;
  const clearBrowserDataBtn = document.getElementById('clear-browser-data-btn');

  const activeMode = document.body.dataset.storageMode || 'mongodb';

  if (activeMode === 'browser') {
    await CarStorage.init();
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register(`/service-worker.js?v=${encodeURIComponent(document.body.dataset.appVersion || 'dev')}`)
        .catch((error) => {
          console.error('Registrazione modalità offline non riuscita:', error);
          showToast('La modalità offline non è stata attivata.', 'warning');
        });
    }
  }

  // Carica i dati
  await refreshDashboard();

  // Listener per ricerca e filtri
  if (searchInput) {
    let timeout;
    searchInput.addEventListener('input', () => {
      clearTimeout(timeout);
      timeout = setTimeout(refreshDashboard, 250);
    });
  }

  if (categorySelect) categorySelect.addEventListener('change', refreshDashboard);
  if (sortSelect) sortSelect.addEventListener('change', refreshDashboard);

  if (resetFiltersBtn) {
    resetFiltersBtn.addEventListener('click', () => {
      if (searchInput) searchInput.value = '';
      if (categorySelect) categorySelect.value = 'Tutte';
      if (sortSelect) sortSelect.value = 'date_desc';
      refreshDashboard();
    });
  }

  // Funzione principale di refresh
  async function refreshDashboard() {
    const search = searchInput ? searchInput.value : '';
    const categoria = categorySelect ? categorySelect.value : '';
    const sortVal = sortSelect ? sortSelect.value : 'date_desc';

    let sortBy = 'date';
    let sortOrder = 'desc';
    if (sortVal === 'date_asc') { sortBy = 'date'; sortOrder = 'asc'; }
    else if (sortVal === 'cost_desc') { sortBy = 'costo'; sortOrder = 'desc'; }
    else if (sortVal === 'cost_asc') { sortBy = 'costo'; sortOrder = 'asc'; }
    else if (sortVal === 'km_desc') { sortBy = 'kilometri'; sortOrder = 'desc'; }
    else if (sortVal === 'km_asc') { sortBy = 'kilometri'; sortOrder = 'asc'; }

    let items = [];

    if (activeMode === 'browser') {
      items = await CarStorage.getAll({ search, categoria, sortBy, sortOrder });
    } else {
      try {
        const queryParams = new URLSearchParams({
          search,
          categoria: categoria === 'Tutte' ? '' : categoria,
          sortBy,
          sortOrder
        });
        const res = await fetch(`/data?${queryParams.toString()}`);
        if (!res.ok) throw new Error(`Richiesta interventi non riuscita (${res.status})`);
        items = await res.json();
      } catch (error) {
        showToast(`Impossibile caricare gli interventi: ${error.message}`, 'danger');
        return;
      }
    }

    renderTableAndCards(items);

    const stats = CarStorage.calculateStats(items);
    renderKPIs(stats);
    renderReminders(stats.upcoming);
    renderCharts(stats, items);
  }

  // Rendering Tabella e Cards
  function renderTableAndCards(items) {
    if (itemsCountBadge) itemsCountBadge.textContent = `${items.length} interventi`;

    if (!items || items.length === 0) {
      if (emptyStateEl) emptyStateEl.classList.remove('d-none');
      if (tableBody) tableBody.innerHTML = '';
      if (cardsContainer) cardsContainer.innerHTML = '';
      return;
    }

    if (emptyStateEl) emptyStateEl.classList.add('d-none');

    // Desktop Table
    if (tableBody) {
      tableBody.innerHTML = items.map(item => {
        const id = item.id || item._id;
        const dateStr = formatDate(item.date);
        const costoFormatted = formatCurrency(item.costo);
        const kmFormatted = Number(item.kilometri).toLocaleString('it-IT');
        const badgeClass = getCategoryBadgeClass(item.categoria);

        return `
          <tr class="align-middle hover-row">
            <td class="fw-semibold text-slate-800">${dateStr}</td>
            <td>
              <span class="badge ${badgeClass} rounded-pill px-3 py-1 fw-medium">
                ${escapeHtml(item.categoria || 'Altro')}
              </span>
            </td>
            <td>
              <div class="fw-bold text-slate-900">${escapeHtml(item.intervento)}</div>
              ${item.note ? `<div class="small text-muted text-truncate" style="max-width: 320px;">${escapeHtml(item.note)}</div>` : ''}
            </td>
            <td class="text-nowrap fw-medium text-slate-700">${kmFormatted} km</td>
            <td class="text-nowrap fw-bold text-primary">${costoFormatted}</td>
            <td class="text-end text-nowrap">
              <button class="btn btn-sm btn-icon btn-outline-primary me-1 edit-item-btn" data-id="${id}" title="Modifica">
                <i class="bi bi-pencil"></i>
              </button>
              <button class="btn btn-sm btn-icon btn-outline-danger delete-item-btn" data-id="${id}" title="Elimina">
                <i class="bi bi-trash3"></i>
              </button>
            </td>
          </tr>
        `;
      }).join('');
    }

    // Mobile Cards
    if (cardsContainer) {
      cardsContainer.innerHTML = items.map(item => {
        const id = item.id || item._id;
        const dateStr = formatDate(item.date);
        const costoFormatted = formatCurrency(item.costo);
        const kmFormatted = Number(item.kilometri).toLocaleString('it-IT');
        const badgeClass = getCategoryBadgeClass(item.categoria);

        return `
          <div class="card modern-card mb-3 p-3 shadow-sm border-0">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <span class="badge ${badgeClass} rounded-pill px-2.5 py-1 small">${escapeHtml(item.categoria || 'Altro')}</span>
              <span class="text-muted small fw-medium"><i class="bi bi-calendar3 me-1"></i>${dateStr}</span>
            </div>
            <h6 class="fw-bold text-slate-900 mb-1">${escapeHtml(item.intervento)}</h6>
            ${item.note ? `<p class="small text-muted mb-2">${escapeHtml(item.note)}</p>` : ''}
            <div class="d-flex justify-content-between align-items-center mt-2 pt-2 border-top">
              <span class="text-slate-600 small"><i class="bi bi-speedometer2 me-1"></i><strong>${kmFormatted}</strong> km</span>
              <span class="fw-bold text-primary fs-6">${costoFormatted}</span>
            </div>
            <div class="d-flex justify-content-end gap-2 mt-3">
              <button class="btn btn-sm btn-outline-primary rounded-pill px-3 edit-item-btn" data-id="${id}">
                <i class="bi bi-pencil me-1"></i> Modifica
              </button>
              <button class="btn btn-sm btn-outline-danger rounded-pill px-3 delete-item-btn" data-id="${id}">
                <i class="bi bi-trash3 me-1"></i> Elimina
              </button>
            </div>
          </div>
        `;
      }).join('');
    }

    // Attach Action Listeners
    document.querySelectorAll('.edit-item-btn').forEach(btn => {
      btn.addEventListener('click', () => openEditModal(btn.dataset.id));
    });
    document.querySelectorAll('.delete-item-btn').forEach(btn => {
      btn.addEventListener('click', () => openDeleteModal(btn.dataset.id));
    });
  }

  // KPIs
  function renderKPIs(stats) {
    if (totalCostEl) totalCostEl.textContent = formatCurrency(stats.totalCost);
    if (maxKmEl) maxKmEl.textContent = `${stats.maxKm.toLocaleString('it-IT')} km`;
    if (totalCountEl) totalCountEl.textContent = stats.totalCount;
    if (avgCostEl) avgCostEl.textContent = formatCurrency(stats.avgCost);

    if (healthBadgeEl) {
      const hasExpired = stats.upcoming.some(u => u.status === 'scaduto');
      const hasImminent = stats.upcoming.some(u => u.status === 'imminente');

      if (hasExpired) {
        healthBadgeEl.innerHTML = '<span class="badge bg-danger rounded-pill"><i class="bi bi-exclamation-octagon-fill me-1"></i> Manutenzione Scaduta</span>';
      } else if (hasImminent) {
        healthBadgeEl.innerHTML = '<span class="badge bg-warning text-dark rounded-pill"><i class="bi bi-exclamation-triangle-fill me-1"></i> Scadenza Imminente</span>';
      } else {
        healthBadgeEl.innerHTML = '<span class="badge bg-success rounded-pill"><i class="bi bi-shield-check me-1"></i> In Perfetto Ordine</span>';
      }
    }
  }

  // Reminders Board
  function renderReminders(reminders = []) {
    if (!upcomingContainer) return;

    if (reminders.length === 0) {
      upcomingContainer.innerHTML = `
        <div class="text-center py-4 text-muted small">
          <i class="bi bi-check2-circle fs-3 text-success d-block mb-1"></i>
          Nessuna scadenza imminente registrata.
        </div>
      `;
      return;
    }

    upcomingContainer.innerHTML = reminders.map(r => {
      let icon = 'bi-wrench-adjustable';
      let borderClass = 'border-success';
      let badgeHtml = '<span class="badge bg-success rounded-pill">Regolare</span>';

      if (r.status === 'scaduto') {
        borderClass = 'border-danger reminder-alert-danger';
        badgeHtml = '<span class="badge bg-danger rounded-pill">Scaduto</span>';
        icon = 'bi-exclamation-circle-fill text-danger';
      } else if (r.status === 'imminente') {
        borderClass = 'border-warning reminder-alert-warning';
        badgeHtml = '<span class="badge bg-warning text-dark rounded-pill">Imminente</span>';
        icon = 'bi-clock-history text-warning';
      }

      return `
        <div class="reminder-card p-3 rounded-3 mb-2 border ${borderClass} bg-white shadow-sm">
          <div class="d-flex justify-content-between align-items-center mb-1">
            <div class="fw-bold text-slate-900 small d-flex align-items-center">
              <i class="bi ${icon} me-2 fs-5"></i>
              ${escapeHtml(r.titolo)}
            </div>
            ${badgeHtml}
          </div>
          <div class="text-muted small ps-4">${escapeHtml(r.descrizione)}</div>
        </div>
      `;
    }).join('');
  }

  // Charts
  function renderCharts(stats, items) {
    if (typeof Chart === 'undefined') return;

    // 1. Andamento Spese nel Tempo (Bar & Line Combo)
    const expenseCtx = document.getElementById('expenseChart');
    if (expenseCtx) {
      const labels = Object.keys(stats.monthlyMap || {});
      const dataValues = Object.values(stats.monthlyMap || {});

      if (expenseChart) expenseChart.destroy();

      expenseChart = new Chart(expenseCtx, {
        type: 'bar',
        data: {
          labels: labels.length ? labels : ['Nessun dato'],
          datasets: [
            {
              type: 'bar',
              label: 'Spesa (€)',
              data: dataValues.length ? dataValues : [0],
              backgroundColor: 'rgba(255, 107, 0, 0.85)', // Arancione
              borderColor: '#FF6B00',
              borderWidth: 1.5,
              borderRadius: 6
            },
            {
              type: 'line',
              label: 'Trend Spesa',
              data: dataValues.length ? dataValues : [0],
              borderColor: '#0F172A',
              backgroundColor: 'rgba(15, 23, 42, 0.08)',
              tension: 0.35,
              borderWidth: 2.5,
              fill: true,
              pointBackgroundColor: '#0F172A',
              pointRadius: 4
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'top', labels: { boxWidth: 12, font: { family: 'inherit', weight: '600' } } },
            tooltip: {
              callbacks: {
                label: (ctx) => ` ${ctx.dataset.label}: ${formatCurrency(ctx.parsed.y)}`
              }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: { callback: (v) => '€' + v }
            }
          }
        }
      });
    }

    // 2. Distribuzione Spese per Categoria (Doughnut)
    const categoryCtx = document.getElementById('categoryChart');
    if (categoryCtx) {
      const catLabels = Object.keys(stats.categoriesMap || {});
      const catValues = Object.values(stats.categoriesMap || {});

      const modernPalette = ['#FF6B00', '#0F172A', '#EA580C', '#475569', '#FDBA74', '#1E293B', '#C2410C', '#94A3B8'];

      if (categoryChart) categoryChart.destroy();

      categoryChart = new Chart(categoryCtx, {
        type: 'doughnut',
        data: {
          labels: catLabels.length ? catLabels : ['Nessuna categoria'],
          datasets: [{
            data: catValues.length ? catValues : [1],
            backgroundColor: modernPalette.slice(0, Math.max(1, catLabels.length)),
            borderWidth: 2,
            borderColor: '#FFFFFF'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '72%',
          plugins: {
            legend: { position: 'bottom', labels: { boxWidth: 10, padding: 12, font: { size: 11 } } },
            tooltip: {
              callbacks: {
                label: (ctx) => ` ${ctx.label}: ${formatCurrency(ctx.parsed)}`
              }
            }
          }
        }
      });
    }

    // 3. Progressione Chilometrica (Line)
    const mileageCtx = document.getElementById('mileageChart');
    if (mileageCtx) {
      const sortedByDate = [...items].sort((a, b) => new Date(a.date) - new Date(b.date));
      const kmLabels = sortedByDate.map(i => formatDate(i.date));
      const kmValues = sortedByDate.map(i => i.kilometri);

      if (mileageChart) mileageChart.destroy();

      mileageChart = new Chart(mileageCtx, {
        type: 'line',
        data: {
          labels: kmLabels.length ? kmLabels : ['Nessun dato'],
          datasets: [{
            label: 'Odometro (km)',
            data: kmValues.length ? kmValues : [0],
            borderColor: '#0F172A',
            backgroundColor: 'rgba(15, 23, 42, 0.08)',
            fill: true,
            tension: 0.3,
            borderWidth: 2.5,
            pointBackgroundColor: '#FF6B00',
            pointBorderColor: '#FFFFFF',
            pointRadius: 5
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: (ctx) => ` Lettura: ${ctx.parsed.y.toLocaleString('it-IT')} km`
              }
            }
          },
          scales: {
            y: {
              ticks: { callback: (v) => v.toLocaleString('it-IT') + ' km' }
            }
          }
        }
      });
    }
  }

  // Modale Nuovo / Modifica Intervento
  window.openNewModal = () => {
    if (!interventionForm) return;
    interventionForm.reset();
    document.getElementById('modal-item-id').value = '';
    document.getElementById('modal-title').textContent = 'Nuovo Intervento';
    document.getElementById('modal-date').value = new Date().toISOString().slice(0, 10);
    interventionModal.show();
  };

  async function openEditModal(id) {
    let item;
    if (activeMode === 'browser') {
      item = await CarStorage.getById(id);
    } else {
      try {
        const res = await fetch(`/api/interventions/${id}`);
        if (!res.ok) throw new Error(`Richiesta intervento non riuscita (${res.status})`);
        item = await res.json();
      } catch (error) {
        showToast(`Impossibile caricare l'intervento: ${error.message}`, 'danger');
        return;
      }
    }

    if (!item) {
      showToast('Intervento non trovato', 'danger');
      return;
    }

    document.getElementById('modal-item-id').value = item.id || item._id;
    document.getElementById('modal-title').textContent = 'Modifica Intervento';
    document.getElementById('modal-date').value = item.date ? item.date.slice(0, 10) : '';
    document.getElementById('modal-categoria').value = item.categoria || 'Tagliando';
    document.getElementById('modal-kilometri').value = item.kilometri || '';
    document.getElementById('modal-costo').value = item.costo || '';
    document.getElementById('modal-intervento').value = item.intervento || '';
    document.getElementById('modal-note').value = item.note || '';
    document.getElementById('modal-veicolo').value = item.veicolo || 'Veicolo Principale';

    interventionModal.show();
  }

  // Gestione salvataggio Form Modale
  if (interventionForm) {
    interventionForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const id = document.getElementById('modal-item-id').value;
      const payload = {
        date: document.getElementById('modal-date').value,
        categoria: document.getElementById('modal-categoria').value,
        kilometri: Number(document.getElementById('modal-kilometri').value),
        costo: Number(document.getElementById('modal-costo').value),
        intervento: document.getElementById('modal-intervento').value.trim(),
        note: document.getElementById('modal-note').value.trim(),
        veicolo: document.getElementById('modal-veicolo').value.trim() || 'Veicolo Principale'
      };

      if (!payload.date || !payload.intervento || isNaN(payload.kilometri) || isNaN(payload.costo)) {
        showToast('Compila tutti i campi obbligatori con valori validi', 'warning');
        return;
      }

      try {
        if (activeMode === 'browser') {
          if (id) {
            await CarStorage.update(id, payload);
            showToast('Intervento aggiornato nel browser storage!');
          } else {
            await CarStorage.add(payload);
            showToast('Nuovo intervento registrato nel browser storage!');
          }
        } else {
          // Modalità MongoDB
          const url = id ? `/update/${id}` : '/add/insert';
          const method = id ? 'PUT' : 'POST';
          const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify(payload)
          });
          if (!res.ok) throw new Error('Errore server');
          showToast('Intervento salvato su MongoDB!');
        }

        interventionModal.hide();
        await refreshDashboard();
      } catch (err) {
        showToast(`Errore durante il salvataggio: ${err.message}`, 'danger');
      }
    });
  }

  // Gestione Cancellazione
  function openDeleteModal(id) {
    itemToDeleteId = id;
    if (deleteModal) deleteModal.show();
  }

  if (deleteConfirmBtn) {
    deleteConfirmBtn.addEventListener('click', async () => {
      if (!itemToDeleteId) return;

      try {
        if (activeMode === 'browser') {
          await CarStorage.remove(itemToDeleteId);
          showToast('Intervento eliminato dal browser storage');
        } else {
          const res = await fetch(`/delete/${itemToDeleteId}`, {
            method: 'DELETE',
            headers: { 'Accept': 'application/json' }
          });
          if (!res.ok) throw new Error(`Eliminazione non riuscita (${res.status})`);
          showToast('Intervento eliminato dal database');
        }

        if (deleteModal) deleteModal.hide();
        itemToDeleteId = null;
        await refreshDashboard();
      } catch (err) {
        showToast(`Errore eliminazione: ${err.message}`, 'danger');
      }
    });
  }

  // Export & Import listeners
  const exportJsonBtn = document.getElementById('export-json-btn');
  if (exportJsonBtn) {
    exportJsonBtn.addEventListener('click', async () => {
      if (activeMode === 'browser') {
        await CarStorage.exportJSON();
        showToast('Dossier scaricato in formato JSON');
      } else {
        window.location.assign('/data/export?format=json');
      }
    });
  }

  const exportCsvBtn = document.getElementById('export-csv-btn');
  if (exportCsvBtn) {
    exportCsvBtn.addEventListener('click', async () => {
      if (activeMode === 'browser') {
        await CarStorage.exportCSV();
        showToast('Dossier scaricato in formato CSV');
      } else {
        window.location.assign('/data/export?format=csv');
      }
    });
  }

  const importFileInput = document.getElementById('import-file-input');
  const importSubmitBtn = document.getElementById('import-submit-btn');

  if (importSubmitBtn && importFileInput) {
    importSubmitBtn.addEventListener('click', () => {
      const file = importFileInput.files[0];
      if (!file) {
        showToast('Seleziona un file JSON da importare', 'warning');
        return;
      }
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          if (activeMode === 'browser') {
            const result = await CarStorage.importJSON(e.target.result);
            if (!result.success) throw new Error(result.error);
            showToast(`Importati ${result.count} interventi con successo!`);
          } else {
            const parsed = JSON.parse(e.target.result);
            const items = Array.isArray(parsed) ? parsed : parsed.data;
            if (!Array.isArray(items)) throw new Error('Struttura file non valida');

            let importedCount = 0;
            for (const item of items) {
              const response = await fetch('/api/interventions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify(item)
              });
              if (!response.ok) {
                const result = await response.json();
                throw new Error(`${result.error || 'Importazione non riuscita'} (${importedCount} record importati)`);
              }
              importedCount++;
            }
            showToast(`Importati ${importedCount} interventi con successo!`);
          }

          if (clearBrowserDataBtn) {
            clearBrowserDataBtn.classList.toggle('d-none', activeMode !== 'browser');
            clearBrowserDataBtn.addEventListener('click', async () => {
              const confirmed = window.confirm('Eliminare definitivamente tutti gli interventi salvati in questo browser? Esporta prima una copia, se ti serve.');
              if (!confirmed) return;

              try {
                await CarStorage.clearAll();
                showToast('Dati locali eliminati. Il dataset dimostrativo non verrà ripristinato.');
                if (exportImportModal) exportImportModal.hide();
                await refreshDashboard();
              } catch (error) {
                showToast(`Eliminazione non riuscita: ${error.message}`, 'danger');
              }
            });
          }

          if (exportImportModal) exportImportModal.hide();
          await refreshDashboard();
        } catch (error) {
          showToast(`Errore durante l'importazione: ${error.message}`, 'danger');
        }
      };
      reader.readAsText(file);
    });
  }

  // Utility Toast
  function showToast(message, variant = 'primary') {
    let toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
      toastContainer = document.createElement('div');
      toastContainer.id = 'toast-container';
      toastContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3';
      document.body.appendChild(toastContainer);
    }

    const toastEl = document.createElement('div');
    toastEl.className = `toast align-items-center text-bg-${variant} border-0 shadow-lg`;
    toastEl.setAttribute('role', 'alert');
    toastEl.setAttribute('aria-live', 'assertive');
    toastEl.setAttribute('aria-atomic', 'true');
    toastEl.innerHTML = `
      <div class="d-flex">
        <div class="toast-body fw-medium">${escapeHtml(message)}</div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Chiudi"></button>
      </div>
    `;

    toastContainer.appendChild(toastEl);
    const bsToast = new bootstrap.Toast(toastEl, { delay: 3500 });
    bsToast.show();
    toastEl.addEventListener('hidden.bs.toast', () => toastEl.remove());
  }

  function formatCurrency(val) {
    return Number(val || 0).toLocaleString('it-IT', { style: 'currency', currency: 'EUR' });
  }

  function formatDate(d) {
    if (!d) return '-';
    try {
      const parsed = new Date(d);
      return parsed.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch {
      return String(d).slice(0, 10);
    }
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function getCategoryBadgeClass(category) {
    switch (category) {
      case 'Tagliando': return 'badge-cat-tagliando';
      case 'Olio e Filtri': return 'badge-cat-olio';
      case 'Freni': return 'badge-cat-freni';
      case 'Pneumatici': return 'badge-cat-pneumatici';
      case 'Batteria': return 'badge-cat-batteria';
      case 'Revisione': return 'badge-cat-revisione';
      default: return 'badge-cat-altro';
    }
  }
});
