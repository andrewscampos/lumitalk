/**
 * DeviceDetector - Main Library
 * Detecta modelo de smartphone para sugerir capa compatível.
 * Usa: navigator.userAgent, userAgentData (high entropy), screen, devicePixelRatio, platform.
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
   * Obtém dados de high entropy via userAgentData (Chrome 90+)
   * Permite melhor detecção quando disponível
   */
  async function getHighEntropyData() {
    if (!navigator.userAgentData || !navigator.userAgentData.getHighEntropyValues) {
      return null;
    }
    try {
      const values = await navigator.userAgentData.getHighEntropyValues([
        'platform',
        'platformVersion',
        'architecture',
        'model',
        'uaFullVersion',
      ]);
      return values;
    } catch (e) {
      return null;
    }
  }

  /**
   * Mapeia resolução de tela para possíveis modelos Apple (fallback)
   * Apple não expõe model no UA do Safari - usamos dimensões
   */
  const APPLE_SCREEN_MAP = [
    { w: 430, h: 932, model: 'iPhone 15 Pro Max', ratio: 3 },
    { w: 393, h: 852, model: 'iPhone 15 Pro', ratio: 3 },
    { w: 390, h: 844, model: 'iPhone 15', ratio: 3 },
    { w: 414, h: 896, model: 'iPhone 11 Pro Max', ratio: 3 },
    { w: 375, h: 812, model: 'iPhone X', ratio: 3 },
    { w: 414, h: 736, model: 'iPhone 8 Plus', ratio: 3 },
    { w: 375, h: 667, model: 'iPhone 8', ratio: 2 },
    { w: 390, h: 844, model: 'iPhone 13', ratio: 3 },
    { w: 428, h: 926, model: 'iPhone 14 Plus', ratio: 3 },
    { w: 393, h: 852, model: 'iPhone 14 Pro', ratio: 3 },
  ];

  function findAppleByScreen(width, height, ratio) {
    const r = ratio || (typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1);
    const w = Math.round(width);
    const h = Math.round(height);

    for (const entry of APPLE_SCREEN_MAP) {
      const dw = Math.abs(entry.w - w);
      const dh = Math.abs(entry.h - h);
      if (dw <= 20 && dh <= 20 && Math.abs(entry.ratio - r) <= 0.5) {
        return { brand: 'Apple', model: entry.model, confidence: 0.75 };
      }
    }

    // Fallback genérico por tamanho
    if (h >= 900) return { brand: 'Apple', model: 'iPhone Pro Max (última geração)', confidence: 0.5 };
    if (h >= 800) return { brand: 'Apple', model: 'iPhone Pro / Standard', confidence: 0.5 };
    return { brand: 'Apple', model: 'iPhone', confidence: 0.4 };
  }

  /**
   * Busca possíveis modelos por marca e tamanho de tela no banco
   */
  function findPossibleModels(db, brand, screenWidth, screenHeight) {
    if (!db || typeof db !== 'object') return [];

    const results = [];
    const w = screenWidth || 0;
    const h = screenHeight || 0;

    for (const [code, info] of Object.entries(db)) {
      if (info.brand && info.brand.toLowerCase() === (brand || '').toLowerCase()) {
        results.push({
          model_code: code,
          brand: info.brand,
          model: info.model,
          confidence: 0.5,
        });
      }
    }

    // Ordena por popularidade/proximidade (simplificado)
    return results.slice(0, 10);
  }

  /**
   * DeviceDetector principal
   * @param {Object} options
   * @param {string} options.modelsUrl - URL do models.json
   * @returns {Promise<Object>}
   */
  async function detect(options = {}) {
    const modelsUrl = options.modelsUrl || 'device-detector/models.json';
    const db = await loadModelsDb(modelsUrl);

    const screen = {
      width: typeof window !== 'undefined' ? window.screen?.width || 0 : 0,
      height: typeof window !== 'undefined' ? window.screen?.height || 0 : 0,
      ratio: typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1,
    };

    const platform =
      typeof navigator !== 'undefined'
        ? navigator.platform || navigator.userAgentData?.platform || ''
        : '';

    let brand = null;
    let model = null;
    let model_code = null;
    let confidence = 0;

    const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';

    // 1) Tentar userAgentData (high entropy) - Chrome/Edge
    const heData = await getHighEntropyData();
    if (heData?.model) {
      model_code = heData.model.trim();
      const dbEntry = db[model_code];
      if (dbEntry) {
        return {
          brand: dbEntry.brand,
          model: dbEntry.model,
          model_code,
          os: heData.platform?.toLowerCase().includes('android') ? 'Android' : 'iOS',
          confidence: 0.9,
          screen: {
            width: screen.width,
            height: screen.height,
            ratio: screen.ratio,
          },
        };
      }
      // Model vindo do UA mas não está no DB
      brand = ua.includes('iPhone') ? 'Apple' : heData.platform || null;
      model = heData.model;
      confidence = 0.7;
    }

    // 2) Parser do User-Agent (fallback)
    const ParserRef = typeof Parser !== 'undefined' ? Parser : (typeof window !== 'undefined' && window.Parser) ? window.Parser : null;
    if (ParserRef) {
      const parsed = ParserRef.parse(ua);
      if (!brand) brand = parsed.brand;
      if (!model_code) model_code = parsed.model_code;

      if (model_code && db[model_code]) {
        const dbEntry = db[model_code];
        return {
          brand: dbEntry.brand,
          model: dbEntry.model,
          model_code,
          os: parsed.os,
          confidence: 0.85,
          screen: {
            width: screen.width,
            height: screen.height,
            ratio: screen.ratio,
          },
        };
      }
    }

    // 3) Apple: fallback por resolução (Safari não envia model)
    if (brand === 'Apple' || ua.includes('iPhone') || ua.includes('iPad')) {
      const appleResult = findAppleByScreen(screen.width, screen.height, screen.ratio);
      return {
        brand: appleResult.brand,
        model: appleResult.model,
        model_code: model_code || 'unknown',
        os: 'iOS',
        confidence: appleResult.confidence,
        screen: {
          width: screen.width,
          height: screen.height,
          ratio: screen.ratio,
        },
      };
    }

    // 4) Lista de possíveis modelos por marca + tela
    const possible = findPossibleModels(db, brand, screen.width, screen.height);
    if (possible.length > 0) {
      return {
        brand: possible[0].brand,
        model: possible[0].model,
        model_code: possible[0].model_code,
        os: ua.includes('Android') ? 'Android' : 'unknown',
        confidence: 0.6,
        screen: {
          width: screen.width,
          height: screen.height,
          ratio: screen.ratio,
        },
        possible_models: possible,
      };
    }

    // 5) Resposta genérica
    return {
      brand: brand || 'unknown',
      model: model || 'Modelo não detectado',
      model_code: model_code || null,
      os: ua.includes('Android') ? 'Android' : ua.includes('iPhone') ? 'iOS' : 'unknown',
      confidence: 0.3,
      screen: {
        width: screen.width,
        height: screen.height,
        ratio: screen.ratio,
      },
      possible_models: possible,
    };
  }

  // API pública
  const DeviceDetector = {
    detect,
    loadModelsDb,
    getHighEntropyData,
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = DeviceDetector;
  } else {
    global.DeviceDetector = DeviceDetector;
  }
})(typeof window !== 'undefined' ? window : globalThis);
