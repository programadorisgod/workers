# Workers Practice (Web Workers, Service Workers & Mini Thermal Printing)

Laboratorio de pruebas con **Web Workers** y **Service Workers** para experimentación antes de migrar a PWA completa, incluyendo integración de impresión de mini facturas térmicas / estampitas.

---

## 🖨️ Funcionalidad de Impresión Térmica (Mini Facturas / Estampitas)

Esta aplicación web incluye una sección para emitir e imprimir mini facturas tanto en **papel de estampitas / stickers (TSPL)** como en **papel continuo tradicional (ESC/POS)** directamente hacia una impresora térmica portátil (como la **Goojprt PT-210** de 58mm).

> [!IMPORTANT]
> Para utilizar la funcionalidad de impresión, **debes descargar y ejecutar el agente de impresión en la PC donde tengas conectada la impresora**:
> 👉 Repositorio del agente: **[programadorisgod/printer-agent](https://github.com/programadorisgod/printer-agent)**

### ¿Cómo funciona la conexión?
1. Descarga y ejecuta el **[printer-agent](https://github.com/programadorisgod/printer-agent)** en tu computadora.
2. Abre esta web desde la PC (`http://localhost:3000`) o desde tu teléfono móvil conectado al mismo Wi-Fi (`http://<IP_DE_TU_PC>:3000`).
3. En la sección **Mini Factura**, ingresa la URL del agente (ej. `http://<IP_DE_TU_PC>:3333`) y presiona **🖨️ Imprimir Mini Factura**.
4. La web enviará la petición HTTP por la red local al agente, y este la transmitirá por Bluetooth o USB a la impresora.

---

## 🚀 Cómo ejecutar esta Web

Puedes usar cualquier servidor estático local. Por ejemplo, con `browser-sync`:

```bash
npx browser-sync start --server . --files "*.html, *.css, *.js"
```

O con Python:
```bash
python3 -m http.server 3000
```

---

## 📂 Estructura del Proyecto

* `index.html`: Interfaz de usuario con paneles de Web Workers, galería con Service Worker y sección de Mini Factura.
* `index.js`: Lógica principal, registro de Service Worker y cliente HTTP hacia el Printer Agent.
* `web-worker.js`: Web Worker dedicado a tareas pesadas en segundo plano.
* `sw.js`: Service Worker para caché y manejo offline de recursos.
* `gallery/`: Recursos multimedia cacheados por el Service Worker.
