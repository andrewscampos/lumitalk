/**
 * DeviceDetector - UI Module
 * Componente de interface: confirmação do modelo detectado + seletor pesquisável.
 */

(function (global) {
  'use strict';

  let modelsDb = {};
  let selectedDevice = null;

  /**
   * Carrega models.json
   */
  async function loadModels() {
    if (Object.keys(modelsDb).length > 0) return modelsDb;
    try {
      const res = await fetch('device-detector/models.json');
      modelsDb = await res.json();
      return modelsDb;
    } catch (e) {
      console.warn('[DeviceDetector UI] models.json não carregado');
      return {};
    }
  }

  /**
   * Cria lista flat de todos os modelos para busca
   */
  function buildModelList(db) {
    const list = [];
    for (const [code, info] of Object.entries(db)) {
      list.push({
        code,
        brand: info.brand,
        model: info.model,
        searchKey: `${info.brand} ${info.model} ${code}`.toLowerCase(),
      });
    }
    return list;
  }

  /**
   * Modal de confirmação do modelo detectado
   */
  function createConfirmModal(device, onConfirm, onChooseOther) {
    const modal = document.createElement('div');
    modal.className = 'dd-modal dd-modal-confirm';
    modal.innerHTML = `
      <div class="dd-modal-backdrop"></div>
      <div class="dd-modal-content">
        <h3 class="dd-modal-title">Detectamos que seu celular pode ser:</h3>
        <p class="dd-modal-device">${device.brand} ${device.model}</p>
        <div class="dd-modal-actions">
          <button type="button" class="dd-btn dd-btn-primary" data-action="confirm">
            ✓ Confirmar modelo
          </button>
          <button type="button" class="dd-btn dd-btn-secondary" data-action="choose">
            ✏ Escolher outro modelo
          </button>
        </div>
      </div>
    `;

    modal.querySelector('[data-action="confirm"]').addEventListener('click', () => {
      onConfirm(device);
      modal.remove();
    });

    modal.querySelector('[data-action="choose"]').addEventListener('click', () => {
      modal.remove();
      onChooseOther();
    });

    modal.querySelector('.dd-modal-backdrop').addEventListener('click', () => {
      modal.remove();
    });

    return modal;
  }

  /**
   * Seletor pesquisável de modelos
   */
  function createModelSelector(db, onSelect) {
    const list = buildModelList(db);
    const brands = [...new Set(list.map((m) => m.brand))].sort();

    const modal = document.createElement('div');
    modal.className = 'dd-modal dd-modal-selector';
    modal.innerHTML = `
      <div class="dd-modal-backdrop"></div>
      <div class="dd-modal-content dd-modal-content--large">
        <h3 class="dd-modal-title">Escolha o modelo do seu celular</h3>
        <div class="dd-search-row">
          <input type="text" class="dd-search-input" placeholder="Buscar por marca ou modelo..." autocomplete="off">
          <select class="dd-filter-brand">
            <option value="">Todas as marcas</option>
            ${brands.map((b) => `<option value="${b}">${b}</option>`).join('')}
          </select>
        </div>
        <div class="dd-model-list-container">
          <ul class="dd-model-list"></ul>
        </div>
      </div>
    `;

    const searchInput = modal.querySelector('.dd-search-input');
    const brandFilter = modal.querySelector('.dd-filter-brand');
    const listEl = modal.querySelector('.dd-model-list');

    function renderModels(filtered) {
      listEl.innerHTML = filtered
        .slice(0, 200)
        .map(
          (m) =>
            `<li class="dd-model-item" data-code="${m.code}">
              <strong>${m.brand}</strong> ${m.model}
              <span class="dd-model-code">${m.code}</span>
            </li>`
        )
        .join('');

      listEl.querySelectorAll('.dd-model-item').forEach((el) => {
        el.addEventListener('click', () => {
          const code = el.dataset.code;
          const item = list.find((x) => x.code === code);
          if (item) {
            onSelect({ brand: item.brand, model: item.model, model_code: code });
            modal.remove();
          }
        });
      });
    }

    function filter() {
      const q = searchInput.value.trim().toLowerCase();
      const brand = brandFilter.value;

      let filtered = list;
      if (brand) filtered = filtered.filter((m) => m.brand === brand);
      if (q) filtered = filtered.filter((m) => m.searchKey.includes(q));
      renderModels(filtered);
    }

    searchInput.addEventListener('input', filter);
    searchInput.addEventListener('keyup', (e) => {
      if (e.key === 'Enter') filter();
    });
    brandFilter.addEventListener('change', filter);

    renderModels(list);

    modal.querySelector('.dd-modal-backdrop').addEventListener('click', () => modal.remove());

    return modal;
  }

  /**
   * Inicializa o fluxo: detecta -> confirma -> ou escolhe
   * @param {HTMLElement} container - Elemento onde inserir os modais
   * @param {Function} onDeviceSelected - callback(device)
   */
  async function init(container, onDeviceSelected) {
    const target = container || document.body;

    const db = await loadModels();
    const device = await DeviceDetector.detect({ modelsUrl: 'device-detector/models.json' });

    if (device.confidence >= 0.5 && device.model && device.model !== 'Modelo não detectado') {
      const confirmModal = createConfirmModal(
        device,
        (d) => {
          selectedDevice = d;
          if (onDeviceSelected) onDeviceSelected(d);
        },
        () => {
          const selector = createModelSelector(db, (d) => {
            selectedDevice = d;
            if (onDeviceSelected) onDeviceSelected(d);
          });
          target.appendChild(selector);
        }
      );
      target.appendChild(confirmModal);
    } else {
      const selector = createModelSelector(db, (d) => {
        selectedDevice = d;
        if (onDeviceSelected) onDeviceSelected(d);
      });
      target.appendChild(selector);
    }
  }

  /**
   * Abre apenas o seletor (sem detecção)
   */
  async function openSelector(container, onDeviceSelected) {
    const target = container || document.body;
    const db = await loadModels();
    const selector = createModelSelector(db, (d) => {
      selectedDevice = d;
      if (onDeviceSelected) onDeviceSelected(d);
    });
    target.appendChild(selector);
  }

  const DeviceDetectorUI = {
    init,
    openSelector,
    createConfirmModal,
    createModelSelector,
    loadModels,
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = DeviceDetectorUI;
  } else {
    global.DeviceDetectorUI = DeviceDetectorUI;
  }
})(typeof window !== 'undefined' ? window : globalThis);
