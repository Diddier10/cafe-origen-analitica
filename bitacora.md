# Bitácora del Proyecto: Café Origen Analítica
Microreto 1
## Diccionario de datos

El siguiente diccionario describe la estructura base del conjunto de datos crudos (`src/datos.js`), especificando el tipo de dato técnico, su significado comercial/analítico y las observaciones sobre anomalías o casos borde identificados durante la fase de exploración.

| Propiedad | Tipo de Dato | Significado / Descripción | Observaciones y Casos Borde |
| :--- | :--- | :--- | :--- |
| **`id`** | `Number` (Integer) | Identificador único y secuencial de la transacción de venta. | Secuencia limpia del 1 al 12. No presenta duplicados. |
| **`fecha`** | `String` (Formato `YYYY-MM-DD`) | Fecha exacta en que se registró la transacción comercial. | Rango comprendido entre el 2026-09-01 y el 2026-09-06. Formato string ideal para conversiones futuras a objetos `Date`. |
| **`cliente`** | `String` | Código identificador único del cliente (ej. `C01`, `C02`). | Permite rastrear la frecuencia de compra y lealtad por cliente. |
| **`producto`** | `String` | Nombre comercial, tipo y presentación del ítem vendido. | Contiene una mezcla de café empacado (grano de 500g y 250g) y accesorios de cafetería (prensa francesa, molino manual). Requiere segmentación analítica posterior. |
| **`ciudad`** | `String` | Ciudad de destino donde se despacha o ejecuta la venta. | **Caso borde detectado:** Inconsistencia tipográfica. La venta 5 registra `"medellín"` en minúscula, mientras que las demás usan Title Case (`"Medellín"`). Requiere normalización. |
| **`cantidad`** | `Number` (Integer) | Número de unidades adquiridas del producto en la transacción. | **Caso borde detectado:** La venta 8 tiene `cantidad: 0`. Esto representa una anomalía de negocio (transacción nula o error de captura) que debe tratarse analíticamente (exclusión o imputación). |
| **`precio`** | `Number` (Integer) | Precio unitario del producto en moneda local (Pesos Colombianos - COP). | Valores expresados como enteros (sin decimales). Útil para calcular el valor total de la transacción (`cantidad * precio`). |

---
## Casos borde detectados y decisiones analíticas

Durante la auditoría del conjunto de datos crudos (`src/datos.js`), se identificaron tres problemas críticos de calidad de datos que afectan la integridad y los futuros cálculos analíticos. A continuación, se detallan los hallazgos y la decisión técnica tomada para cada uno:

### 1. Inconsistencia tipográfica en la propiedad `ciudad`
* **Problema:** La venta con `id: 5` tiene registrada la ciudad como `"medellín"` (en minúscula), mientras que las demás entradas de Medellín utilizan el formato Title Case (`"Medellín"`). 
* **Riesgo analítico:** Los lenguajes de programación y motores de bases de datos son estrictamente sensibles a mayúsculas y minúsculas (`case-sensitive`). Si agrupamos las ventas por ciudad sin limpiar este campo, JavaScript creará dos categorías separadas ("Medellín" y "medellín"), fragmentando las métricas de venta de la región.
* **Decisión técnica:** Implementar una función de normalización programática en JavaScript que limpie y estandarice el texto (forzando la primera letra en mayúscula o usando un diccionario de corrección) antes de realizar cualquier agrupación analítica.

### 2. Anomalía operativa en la propiedad `cantidad` (Valor Cero)
* **Problema:** La venta con `id: 8` (cliente `C06`) registra una `cantidad: 0` de unidades vendidas, a pesar de tener un precio unitario asignado (`42000`).
* **Riesgo analítico:** Incluir este registro en los cálculos de unidades totales vendidas distorsionará los indicadores de volumen. Asimismo, si calculamos el ingreso monetario multiplicando `cantidad * precio`, aportará un valor de 0, lo cual falsea el ticket promedio si se divide entre el número total de transacciones.
* **Decisión técnica:** Tratamiento condicional. Los datos crudos (`datos.js`) se respetan tal como llegaron, pero en los scripts de análisis (`analitica.js`) se aplicará un filtro para excluir o marcar las transacciones con `cantidad <= 0` como "anomalías operativas/ventas anuladas" al calcular métricas de volumen.

### 3. Comportamiento atípico en la propiedad `cliente` (Asociación con transacciones nulas)
* **Problema:** El cliente `C06` (asociado a la venta con id: 8) aparece en el historial únicamente con una transacción inválida o nula (`cantidad: 0`).
* **Riesgo analítico:** Si calculamos métricas de frecuencia de compra o valor del cliente (Customer Value), este ID aparecerá como un cliente activo que en realidad no generó flujo de caja ni salida de inventario.
* **Decisión técnica:** En los reportes de rendimiento por cliente, se excluirá a aquellos clientes cuyas transacciones efectivas sumen 0 unidades, evitando sesgar el ranking de mejores compradores con registros fantasmas.

---

# Paso 2 
## Plan en pseudocódigo para el tablero mínimo

Antes de implementar los cálculos analíticos en el script de JavaScript, se define el diseño algorítmico basado en ciclos manuales (`for`) y patrones de acumulación, conteo y máximo, incorporando explícitamente el manejo de casos borde (ventas con cantidad cero).

### 1. Inicialización de Variables de Control (Estado Global del Ciclo)
* **`totalVendido`**: Inicia en `0` (Acumulador de ingresos monetarios en COP).
* **`unidadesTotales`**: Inicia en `0` (Acumulador de volumen físico de productos).
* **`ventaMaxima`**: Inicia en `0` (Patrón máximo para rastrear la transacción más alta).
* **`transaccionesValidas`**: Inicia en `0` (Contador de transacciones efectivas procesadas).

---

### 2. Diseño Algorítmico por Indicador

#### A. Venta Total Acumulada y Unidades Totales
* **Qué recorres:** El arreglo `ventas` desde el índice `i = 0` hasta `i < ventas.length`.
* **Condición aplicada (Caso borde):** 
  ```text
  SI venta.cantidad ES IGUAL A 0 ENTONCES
      Registrar alerta de caso borde
      IGNORAR esta iteración (saltar con continue)
  FIN SI

#### B. Venta Más Grande (Patrón Máximo)
* **Qué recorres**: El mismo flujo de transacciones válidas dentro del ciclo.
* **Condición aplicada**:
    SI valorTransaccion ES MAYOR QUE ventaMaxima ENTONCES
        ventaMaxima = valorTransaccion
    FIN SI

#### C. Ticket Promedio (Cálculo Post-Ciclo)
* **Cuándo se ejecuta**: Una vez finalizado el ciclo for completo.

* **Condición de seguridad**:
    SI transaccionesValidas ES MAYOR QUE 0 ENTONCES
        ticketPromedio = totalVendido / transaccionesValidas
    SINO
        ticketPromedio = 0 (Evita error por división entre cero)
    FIN SI