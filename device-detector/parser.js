/**
 * DeviceDetector - Parser Module
 * Extrai informações de dispositivo a partir de User-Agent e outras fontes.
 * Compatível com Apple (iPhone/iPad), Android (Samsung, Xiaomi, etc.)
 */

const Parser = (function () {
  'use strict';

  // Regex para extrair model codes de diferentes fabricantes
  const UA_PATTERNS = {
    // Samsung: SM-G991B, SM-A515F, etc.
    samsung: /Samsung[^\d]*|SM-[A-Z0-9]+|samsung[\s-]?(SM-[A-Z0-9]+)/i,

    // Xiaomi/Redmi/POCO: M2007J3SG, 22021211RG, etc.
    xiaomi: /(?:Mi|Redmi|POCO|Xiaomi)[\s-]?(?:[A-Za-z0-9\s]+)?[\(\[]?([A-Z0-9]{10,14})[\)\]]?|MI\s+(\d+)|Redmi\s+(\w+)|POCO\s+(\w+)/i,

    // Motorola: moto g84, XT2341-1, etc.
    motorola: /(?:Moto|MOTOROLA)[\s-]?(?:g|G|edge|Edge|razr|Razr)?[\s-]?(\d+|[A-Za-z0-9-]+)|(XT\d+-\d+)/i,

    // Google Pixel
    google: /Pixel\s+(\d+(?:\s+Pro)?)| Pixel (\d+)/i,

    // Oppo: CPH2481, CPH2239, etc.
    oppo: /(?:OPPO|Oppo)[\s-]?[A-Za-z0-9\s]*?(?:\(|\s)?(CPH\d+)(?:\)|\s|$)/i,

    // Vivo: V2250, V2230, etc.
    vivo: /(?:VIVO|Vivo)[\s-]?[A-Za-z0-9\s]*?(?:\(|\s)?(V\d{4})(?:\)|\s|$)/i,

    // Realme: RMX3630, RMX3085, etc.
    realme: /(?:Realme|realme)[\s-]?[A-Za-z0-9\s]*?(?:\(|\s)?(RMX\d+)(?:\)|\s|$)/i,

    // Huawei: ANE-LX3, ELE-L29, etc.
    huawei: /(?:HUAWEI|Huawei)[\s-]?[A-Za-z0-9\s]*?(?:\(|\s)?([A-Z]{3}-[A-Z0-9]+)(?:\)|\s|$)/i,

    // Apple: iPhone14,2 ou iPhone9,3 (formato no UA quando presente em apps)
    apple: /iPhone(\d+),(\d+)|iPad(\d+),(\d+)|iPod(\d+),(\d+)/i,
  };

  /**
   * Normaliza User-Agent removendo espaços extras e caracteres problemáticos
   */
  function normalizeUA(ua) {
    return (ua || navigator.userAgent || '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Extrai model code Samsung (SM-XXXXX)
   */
  function extractSamsungModel(ua) {
    const match = ua.match(/SM-[A-Z]\d{3}[A-Z]?/);
    return match ? match[0].toUpperCase() : null;
  }

  /**
   * Extrai model code Xiaomi/Redmi/POCO (códigos alfanuméricos longos)
   */
  function extractXiaomiModel(ua) {
    const codeMatch = ua.match(/[2-3][0-9]{9}[A-Z]{0,3}/);
    if (codeMatch) return codeMatch[0];
    const miMatch = ua.match(/MI\s+(\d+)/i);
    if (miMatch) return 'MI' + miMatch[1];
    return null;
  }

  /**
   * Extrai model code Motorola (XT2341-1 ou "moto g84")
   */
  function extractMotorolaModel(ua) {
    const xtMatch = ua.match(/XT\d+-\d+/);
    if (xtMatch) return xtMatch[0];
    const motoMatch = ua.match(/moto\s+(\w+[\s-]?\w*)/i);
    if (motoMatch) return ('moto ' + motoMatch[1].trim()).toLowerCase();
    return null;
  }

  /**
   * Extrai modelo Google Pixel
   */
  function extractGoogleModel(ua) {
    const match = ua.match(/Pixel\s+(\d+(?:\s+Pro)?)/i);
    return match ? 'Pixel ' + match[1].trim() : null;
  }

  /**
   * Extrai model code Oppo (CPHXXXX)
   */
  function extractOppoModel(ua) {
    const match = ua.match(/CPH\d+/);
    return match ? match[0] : null;
  }

  /**
   * Extrai model code Vivo (VXXXX)
   */
  function extractVivoModel(ua) {
    const match = ua.match(/V\d{4}/);
    return match ? match[0] : null;
  }

  /**
   * Extrai model code Realme (RMXXXXX)
   */
  function extractRealmeModel(ua) {
    const match = ua.match(/RMX\d+/);
    return match ? match[0] : null;
  }

  /**
   * Extrai model code Huawei (XXX-XXX)
   */
  function extractHuaweiModel(ua) {
    const match = ua.match(/[A-Z]{3}-[A-Z0-9]+/);
    return match ? match[0] : null;
  }

  /**
   * Extrai identificador Apple (iPhone12,3 format)
   * Nota: Apple não expõe isso no UA do Safari - apenas em WebView de apps
   */
  function extractAppleModel(ua) {
    const iphoneMatch = ua.match(/iPhone(\d+),(\d+)/);
    if (iphoneMatch) return 'iPhone' + iphoneMatch[1] + ',' + iphoneMatch[2];
    const ipadMatch = ua.match(/iPad(\d+),(\d+)/);
    if (ipadMatch) return 'iPad' + ipadMatch[1] + ',' + ipadMatch[2];
    return null;
  }

  /**
   * Detecta marca a partir do UA
   */
  function detectBrand(ua) {
    const u = ua.toLowerCase();
    if (u.includes('samsung') || u.includes('sm-')) return 'Samsung';
    if (u.includes('iphone') || u.includes('ipad') || u.includes('ipod')) return 'Apple';
    if (u.includes('xiaomi') || u.includes('redmi') || u.includes('mi ') || u.includes('poco')) return 'Xiaomi';
    if (u.includes('moto') || u.includes('motorola') || u.includes('xt')) return 'Motorola';
    if (u.includes('pixel')) return 'Google';
    if (u.includes('oppo')) return 'Oppo';
    if (u.includes('vivo')) return 'Vivo';
    if (u.includes('realme')) return 'Realme';
    if (u.includes('huawei') || u.includes('honor')) return 'Huawei';
    return null;
  }

  /**
   * Detecta OS a partir do UA
   */
  function detectOS(ua) {
    if (/iPhone|iPad|iPod/.test(ua)) return 'iOS';
    if (/Android/.test(ua)) return 'Android';
    return 'unknown';
  }

  /**
   * Extrai model code baseado na marca detectada
   */
  function extractModelCode(ua, brand) {
    const u = normalizeUA(ua);
    switch (brand) {
      case 'Samsung':
        return extractSamsungModel(u);
      case 'Xiaomi':
        return extractXiaomiModel(u);
      case 'Motorola':
        return extractMotorolaModel(u);
      case 'Google':
        return extractGoogleModel(u);
      case 'Oppo':
        return extractOppoModel(u);
      case 'Vivo':
        return extractVivoModel(u);
      case 'Realme':
        return extractRealmeModel(u);
      case 'Huawei':
        return extractHuaweiModel(u);
      case 'Apple':
        return extractAppleModel(u);
      default:
        return null;
    }
  }

  /**
   * Parse completo do User-Agent
   * @param {string} ua - User-Agent string
   * @returns {{ brand: string|null, model_code: string|null, os: string }}
   */
  function parse(ua) {
    const u = normalizeUA(ua || navigator.userAgent);
    const brand = detectBrand(u) || detectBrand(navigator.userAgent);
    const modelCode = brand ? extractModelCode(u, brand) : null;

    return {
      brand,
      model_code: modelCode,
      os: detectOS(u),
    };
  }

  return {
    parse,
    normalizeUA,
    detectBrand,
    detectOS,
    extractModelCode,
    UA_PATTERNS,
  };
})();

// Export para módulos e browser
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Parser;
} else if (typeof window !== 'undefined') {
  window.Parser = Parser;
}
