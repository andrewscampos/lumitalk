/**
 * DeviceDetector - Main Library
 * Detecta modelo de smartphone via userAgentData (Chrome) + userAgent fallback.
 */

(function (global) {
  'use strict';

  let modelsDb = null;

  /**
   * Carrega o banco de modelos (JSON) de forma assíncrona
   */
  async function loadModelsDb(url) {
    if (modelsDb) return modelsDb;
    try {
      const res = await fetch(url || 'device-detector/models.json');
      modelsDb = await res.json();
      return modelsDb;
    } catch (e) {
      console.warn('[DeviceDetector] models.json não carregado:', e);
      return {};
    }
  }

  /**
   * Mapa de modelos comuns (inline) – usado antes ou junto do JSON
   */
  const modelMap = {
    'SM-G991B': 'Samsung Galaxy S21',
    'SM-G996B': 'Samsung Galaxy S21+',
    'SM-G998B': 'Samsung Galaxy S21 Ultra',
    'SM-A515F': 'Samsung Galaxy A51',
    'SM-A525F': 'Samsung Galaxy A52',
    'SM-A536B': 'Samsung Galaxy A53',
    'M2007J3SG': 'Xiaomi Mi 10T',
    '2201117TG': 'Xiaomi Redmi Note 11',
    'MOTO G(9)': 'Motorola Moto G9',
    'MOTO G(8)': 'Motorola Moto G8',
    'Pixel 6': 'Google Pixel 6',
    'Pixel 7': 'Google Pixel 7',
  };

  /**
   * Detecta dispositivo: userAgentData (Chrome) + userAgent + extração Android + mapa de modelos.
   * @param {Object} options
   * @param {string} options.modelsUrl - URL do models.json
   * @returns {Promise<Object>} { brand, model, model_code, os, confidence, screen, raw }
   */
  async function detect(options = {}) {
    const device = {
      brand: null,
      model: null,
      model_code: null,
      os: null,
      raw: null,
      confidence: 0.5,
    };

    // =========================
    // USER AGENT DATA (Chrome moderno)
    // =========================
    if (typeof navigator !== 'undefined' && navigator.userAgentData) {
      try {
        const data = await navigator.userAgentData.getHighEntropyValues([
          'model',
          'platform',
          'platformVersion',
        ]);

        if (data.model) {
          device.model = data.model.trim();
          device.model_code = device.model;
          device.confidence = 0.9;
        }

        if (data.platform) {
          device.os = data.platform === 'Android' ? 'Android' : data.platform;
        }
      } catch (e) {}
    }

    // =========================
    // USER AGENT FALLBACK
    // =========================
    const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
    device.raw = ua;

    if (ua.includes('Android')) {
      device.os = 'Android';
    }

    if (ua.includes('iPhone')) {
      device.brand = 'Apple';
      if (!device.model) device.model = 'iPhone';
      device.os = 'iOS';
    }

    if (ua.includes('iPad')) {
      device.brand = 'Apple';
      if (!device.model) device.model = 'iPad';
      device.os = 'iOS';
    }

    // =========================
    // EXTRAIR MODELO ANDROID DO UA
    // =========================
    if (device.os === 'Android') {
      const match = ua.match(/Android[^;]*;\s*([^)]+)\)/);
      if (match) {
        const rawModel = match[1].trim();
        if (!device.model) device.model = rawModel;
        device.model_code = device.model_code || rawModel;

        if (rawModel.includes('SM-')) device.brand = 'Samsung';
        else if (rawModel.includes('Mi') || rawModel.includes('Redmi')) device.brand = 'Xiaomi';
        else if (rawModel.includes('MOTO') || rawModel.includes('moto')) device.brand = 'Motorola';
        else if (rawModel.includes('Pixel')) device.brand = 'Google';
        else if (rawModel.includes('CPH')) device.brand = 'Oppo';
        else if (rawModel.includes('Vivo') || rawModel.match(/V\d{4}/)) device.brand = 'Vivo';
        else if (rawModel.includes('RMX')) device.brand = 'Realme';
        else if (!device.brand) device.brand = 'Android';
      }
    }

    // =========================
    // MAPA DE MODELOS (inline + JSON)
    // =========================
    const modelsUrl = options.modelsUrl || 'device-detector/models.json';
    const db = await loadModelsDb(modelsUrl);

    const mergedMap = { ...modelMap };
    for (const [code, info] of Object.entries(db)) {
      if (info && info.model) mergedMap[code] = info.brand + ' ' + info.model;
    }

    const rawModelForMap = device.model_code || device.model;
    if (rawModelForMap && mergedMap[rawModelForMap]) {
      device.model = mergedMap[rawModelForMap];
      device.confidence = Math.max(device.confidence, 0.85);
    } else if (rawModelForMap && db[rawModelForMap]) {
      device.model = db[rawModelForMap].model;
      device.brand = device.brand || db[rawModelForMap].brand;
      device.confidence = Math.max(device.confidence, 0.85);
    }

    // =========================
    // INFO DE TELA
    // =========================
    device.screen = {
      width: typeof window !== 'undefined' ? window.screen.width : 0,
      height: typeof window !== 'undefined' ? window.screen.height : 0,
      ratio: typeof window !== 'undefined' ? window.devicePixelRatio : 1,
    };

    return {
      brand: device.brand,
      model: device.model || 'Modelo não detectado',
      model_code: device.model_code || device.model,
      os: device.os || 'unknown',
      confidence: device.confidence,
      screen: device.screen,
      raw: device.raw,
    };
  }

  const DeviceDetector = {
    detect,
    loadModelsDb,
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = DeviceDetector;
  } else {
    global.DeviceDetector = DeviceDetector;
  }
})(typeof window !== 'undefined' ? window : globalThis);
