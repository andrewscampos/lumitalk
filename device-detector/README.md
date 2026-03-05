# DeviceDetector

Sistema modular de detecção de dispositivos móveis para e-commerce de capas personalizadas.

## Estrutura

```
device-detector/
├── detector.js    # Biblioteca principal - detecta dispositivo
├── parser.js      # Parser de User-Agent - extrai model codes
├── models.json    # Banco de mapeamento código → nome comercial
├── ui.js          # Componentes de interface (modal, seletor)
├── device-detector.css
└── README.md
```

## Uso

```html
<!-- Carregamento assíncrono -->
<script src="device-detector/parser.js"></script>
<script src="device-detector/detector.js"></script>
<script src="device-detector/ui.js"></script>
<link rel="stylesheet" href="device-detector/device-detector.css">

<script>
  // Detecção pura (sem UI)
  const device = await DeviceDetector.detect();
  console.log(device);
  // { brand, model, model_code, os, confidence, screen }

  // Com UI (confirmação + seletor)
  DeviceDetectorUI.init(document.body, (device) => {
    console.log('Selecionado:', device.brand, device.model);
  });

  // Apenas abrir seletor
  DeviceDetectorUI.openSelector(document.body, (device) => {
    console.log('Selecionado:', device);
  });
</script>
```

## API DeviceDetector

| Método | Retorno | Descrição |
|--------|----------|-----------|
| `detect(options)` | `Promise<Object>` | Detecta dispositivo. `options.modelsUrl` para URL do JSON. |
| `loadModelsDb(url)` | `Promise<Object>` | Carrega banco de modelos. |

### Objeto retornado por `detect()`

```js
{
  brand: string,      // Samsung, Apple, Xiaomi, etc.
  model: string,      // Nome comercial (ex: Galaxy S21)
  model_code: string, // Código técnico (ex: SM-G991B)
  os: string,        // iOS ou Android
  confidence: number, // 0-1
  screen: {
    width: number,
    height: number,
    ratio: number
  },
  possible_models?: Array  // Quando confidence < 0.7
}
```

## Marcas suportadas

- Apple
- Samsung
- Xiaomi (Redmi, POCO)
- Motorola
- Google Pixel
- Oppo
- Vivo
- Realme
- Huawei

## Adicionando modelos

Edite `models.json`:

```json
{
  "CODIGO-MODELO": {
    "brand": "Marca",
    "model": "Nome Comercial"
  }
}
```

## Compatibilidade

- Chrome 90+ (userAgentData high entropy)
- Safari, Firefox (fallback via userAgent + screen)
- Fallback para seleção manual quando detecção falha
