/**
 * DeviceDetector - Detecção por UserAgent + GPU + resolução + pixel ratio
 * Maior precisão: combina sinais como em sistemas de antifraude/analytics.
 */

(function (global) {
  'use strict';

  let modelsDb = null;

  function loadModelsDb(url) {
    if (modelsDb) return Promise.resolve(modelsDb);
    const path = url || 'device-detector/models.json';
    return fetch(path)
      .then((res) => res.json())
      .then((db) => {
        modelsDb = db;
        return db;
      })
      .catch((e) => {
        console.warn('[DeviceDetector] models.json não carregado:', e);
        return {};
      });
  }

  /**
   * Extrai modelo Android do User-Agent.
   * Samsung: "Android 13; SM-G991B)"
   * Xiaomi/Redmi: "Android 12; 23077RABDC Build/..." ou "Android 11; Redmi 10 Build/..."
   */
  function getAndroidModel(ua) {
    const str = (ua || navigator.userAgent || '');

    // Padrão principal: Android X; MODEL) ou MODEL Build/
    let match = str.match(/Android[^;]*;\s*([^)]+)\)/);
    if (match) {
      let model = match[1].trim();
      // Remove sufixo " Build/..." (comum em Xiaomi, Motorola, etc.)
      model = model.replace(/\s+Build\/.*$/i, '').trim();
      if (model.length > 0) return model;
    }

    // Fallback Xiaomi/Redmi: "Xiaomi/Redmi; MODEL_CODE; device_name" (alguns apps)
    match = str.match(/Xiaomi\/Redmi[^;]*;\s*([^;]+)/i);
    if (match) return match[1].trim();

    // Fallback: qualquer "Redmi X", "Mi X", "POCO X" no UA
    match = str.match(/(?:Redmi|Mi|POCO)\s+[A-Za-z0-9\s]+?(?=\s+Build\/|\s*\)|$)/i);
    if (match) return match[0].trim();

    return null;
  }

  /**
   * GPU via WebGL – ajuda a distinguir chipsets (ex: Adreno 660 = Snapdragon 888).
   */
  function getGPU() {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) return 'unknown';
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      if (!debugInfo) return 'unknown';
      return gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || 'unknown';
    } catch (e) {
      return 'unknown';
    }
  }

  /**
   * Estima iPhone pelo tamanho da tela + pixel ratio (Apple não envia modelo no UA).
   */
  function getiPhoneModel() {
    const ratio = window.devicePixelRatio || 1;
    const width = screen.width;
    const height = screen.height;

    const iphoneMap = [
      { w: 430, h: 932, r: 3, model: 'iPhone 15 Pro Max' },
      { w: 393, h: 852, r: 3, model: 'iPhone 15 Pro' },
      { w: 390, h: 844, r: 3, model: 'iPhone 15 / 14' },
      { w: 428, h: 926, r: 3, model: 'iPhone 14 Plus / 13 Pro Max' },
      { w: 393, h: 852, r: 3, model: 'iPhone 14 Pro' },
      { w: 390, h: 844, r: 3, model: 'iPhone 13 / 14' },
      { w: 428, h: 926, r: 3, model: 'iPhone 13 Pro Max / 14 Plus' },
      { w: 414, h: 896, r: 3, model: 'iPhone 11 Pro Max / XS Max' },
      { w: 390, h: 844, r: 3, model: 'iPhone 12 / 13' },
      { w: 414, h: 896, r: 2, model: 'iPhone 11 / XR' },
      { w: 375, h: 812, r: 3, model: 'iPhone X / XS' },
      { w: 414, h: 736, r: 3, model: 'iPhone 8 Plus / 7 Plus' },
      { w: 375, h: 667, r: 2, model: 'iPhone 8 / 7 / SE (2ª)' },
      { w: 320, h: 568, r: 2, model: 'iPhone SE (1ª)' },
    ];

    for (const entry of iphoneMap) {
      const dw = Math.abs(entry.w - width);
      const dh = Math.abs(entry.h - height);
      const dr = Math.abs(entry.r - ratio);
      if (dw <= 5 && dh <= 5 && dr <= 0.5) {
        return entry.model;
      }
    }

    if (ratio === 3 && height >= 900) return 'iPhone Pro Max (estimado)';
    if (ratio === 3 && height >= 800) return 'iPhone Pro / Standard (estimado)';
    return 'iPhone (modelo não identificado)';
  }

  /**
   * Converte código técnico em nome amigável (mapa + JSON).
   */
  function getFriendlyName(modelCode, db) {
    if (!modelCode) return null;
    const code = (modelCode + '').trim();
    if (db[code]) return db[code].brand + ' ' + db[code].model;
    return null;
  }

  /**
   * Coleta todas as informações do dispositivo (UA + GPU + tela + hardware).
   */
  function getDeviceInfo() {
    const ua = navigator.userAgent || '';

    return {
      userAgent: ua,
      platform: navigator.platform || '',
      language: navigator.language || '',
      screen: {
        width: screen.width,
        height: screen.height,
        pixelRatio: window.devicePixelRatio || 1,
      },
      hardware: {
        memory: navigator.deviceMemory != null ? navigator.deviceMemory : 'unknown',
        cores: navigator.hardwareConcurrency != null ? navigator.hardwareConcurrency : 'unknown',
      },
      gpu: getGPU(),
      androidModel: getAndroidModel(ua),
    };
  }

  /**
   * Detecta marca a partir do modelo bruto (Android) ou do UA quando modelo vem vazio.
   */
  function getBrandFromModel(rawModel, ua) {
    if (rawModel) {
      const m = rawModel.toUpperCase();
      if (m.includes('SM-')) return 'Samsung';
      if (m.includes('MI ') || m.includes('REDMI') || m.includes('POCO') || /^\d{8,}[A-Z0-9]*$/i.test(rawModel.trim())) return 'Xiaomi';
      if (m.includes('MOTO') || m.includes('XT')) return 'Motorola';
      if (m.includes('PIXEL')) return 'Google';
      if (m.includes('CPH')) return 'Oppo';
      if (m.includes('VIVO') || /^V\d{4}/.test(rawModel)) return 'Vivo';
      if (m.includes('RMX')) return 'Realme';
      if (m.includes('HUAWEI') || /^[A-Z]{3}-[A-Z0-9]+/.test(rawModel)) return 'Huawei';
    }
    if (ua) {
      const u = ua.toLowerCase();
      if (u.includes('xiaomi') || u.includes('redmi') || u.includes(' mi ') || u.includes('poco')) return 'Xiaomi';
    }
    return null;
  }

  /**
   * API principal: detecta dispositivo e retorna modelo amigável + dados extras.
   * @param {Object} options
   * @param {string} options.modelsUrl - URL do models.json
   * @returns {Promise<Object>}
   */
  async function detect(options = {}) {
    const modelsUrl = options.modelsUrl || 'device-detector/models.json';
    const db = await loadModelsDb(modelsUrl);

    const info = getDeviceInfo();
    const ua = info.userAgent;

    let model = null;
    let model_code = null;
    let brand = null;
    let os = 'unknown';
    let confidence = 0.5;

    // Chrome no Android: userAgentData.getHighEntropyValues("model") às vezes traz o código (ex: Xiaomi)
    if (ua.includes('Android') && navigator.userAgentData && navigator.userAgentData.getHighEntropyValues) {
      try {
        const he = await navigator.userAgentData.getHighEntropyValues(['model', 'platform']);
        if (he.model && he.model.trim()) {
          model_code = he.model.trim();
          model = model_code;
          brand = getBrandFromModel(model_code, ua);
          const friendly = getFriendlyName(model_code, db);
          if (friendly) {
            model = friendly;
            confidence = 0.9;
          } else {
            confidence = 0.85;
          }
          if (he.platform) os = he.platform === 'Android' ? 'Android' : he.platform;

          return {
            brand: brand || null,
            model: model || model_code || 'Modelo não detectado',
            model_code: model_code || model,
            os,
            confidence,
            screen: info.screen,
            gpu: info.gpu,
            memory: info.hardware.memory,
            cores: info.hardware.cores,
            raw: info.userAgent,
          };
        }
      } catch (e) {}
    }

    // --- Android: modelo extraído do UA (Samsung, Xiaomi, etc.) ---
    if (ua.includes('Android')) {
      os = 'Android';
      model_code = info.androidModel || null;
      model = model_code;
      brand = getBrandFromModel(model_code, ua);

      // Xiaomi: se UA tem marca mas não extraiu modelo, tenta pelo menos mostrar a marca
      if (!model_code && (ua.includes('Xiaomi') || ua.includes('Redmi') || ua.includes(' POCO ') || ua.match(/\sMi\s/))) {
        brand = 'Xiaomi';
        model_code = 'Xiaomi';
        model = 'Xiaomi (modelo não identificado no navegador)';
        confidence = 0.4;
      } else if (model_code) {
        const friendly = getFriendlyName(model_code, db);
        if (friendly) {
          model = friendly;
          confidence = 0.9;
        } else {
          confidence = 0.75;
          if (!brand) brand = getBrandFromModel(model_code, ua);
        }
      }
    }

    // --- iPhone / iPad: estimativa por tela ---
    if (ua.includes('iPhone')) {
      os = 'iOS';
      brand = 'Apple';
      model = getiPhoneModel();
      model_code = 'iPhone';
      confidence = model.indexOf('não identificado') >= 0 ? 0.5 : 0.8;
    }

    if (ua.includes('iPad')) {
      os = 'iOS';
      brand = 'Apple';
      model = 'iPad';
      model_code = 'iPad';
      confidence = 0.6;
    }

    // Se não achou nome amigável, retorna o model_code (código técnico) para o usuário ver
    const finalModel = model || model_code || 'Modelo não detectado';

    return {
      brand: brand || null,
      model: finalModel,
      model_code: model_code || model,
      os,
      confidence,
      screen: info.screen,
      gpu: info.gpu,
      memory: info.hardware.memory,
      cores: info.hardware.cores,
      raw: info.userAgent,
    };
  }

  const DeviceDetector = {
    detect,
    loadModelsDb,
    getDeviceInfo,
    getGPU,
    getAndroidModel,
    getiPhoneModel,
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = DeviceDetector;
  } else {
    global.DeviceDetector = DeviceDetector;
  }
})(typeof window !== 'undefined' ? window : globalThis);
