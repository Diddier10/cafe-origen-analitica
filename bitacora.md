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

# Comportamiento con arreglo vacío

## Regla de venta válida
Una venta es válida si su `cantidad` es distinta de 0.

## Valores devueltos

| Función | Arreglo vacío `[]` | Solo ventas con cantidad 0 | Justificación |
|---|---|---|---|
| `valorVenta(venta)` | No aplica (recibe una venta, no un arreglo) | `0` | Cantidad × precio |
| `totalVendido(ventas)` | `0` | `0` | Suma de nada; valor inicial del acumulador |
| `unidadesVendidas(ventas)` | `0` | `0` | Igual que el total |
| `ventaMayor(ventas)` | `null` | `null` | No existe una venta mayor; no se inventa un registro. Quien la use debe comprobar si es `null` antes de leer `.id` o `.producto` |
| `ticketPromedio(ventas)` | `0` | `0` | Evita dividir entre 0 (daría `NaN`); en el tablero se lee como "sin ventas" |
| `ventasPorCiudad(ventas, ciudad)` | `0` | `0` | No hay ventas en esa ciudad |

## 1. `totalVendido`: patrón acumulador (datos corregidos)
Inicio: `total = 0`. Regla: si `cantidad === 0`, se salta la venta.

| Iter. | ID | Cantidad | Precio | ¿Se salta? | `valorVenta` | `total` antes | `total` después |
|---|---|---|---|---|---|---|---|
| 1 | 1 | 2 | 42.000 | No | 84.000 | 0 | 84.000 |
| 2 | 2 | 1 | 26.000 | No | 26.000 | 84.000 | 110.000 |
| 3 | 3 | 1 | 95.000 | No | 95.000 | 110.000 | 205.000 |
| 4 | 4 | 1 | 42.000 | No | 42.000 | 205.000 | 247.000 |
| 5 | 5 | 3 | 45.000 | No | 135.000 | 247.000 | 382.000 |
| 6 | 6 | 2 | 26.000 | No | 52.000 | 382.000 | 434.000 |
| 7 | 7 | 1 | 120.000 | No | 120.000 | 434.000 | 554.000 |
| 8 | 8 | 0 | 42.000 | **Sí** | (no se calcula) | 554.000 | 554.000 |
| 9 | 9 | 2 | 45.000 | No | 90.000 | 554.000 | 644.000 |
| 10 | 10 | 4 | 42.000 | No | 168.000 | 644.000 | 812.000 |
| 11 | 11 | 1 | 95.000 | No | 95.000 | 812.000 | 907.000 |
| 12 | 12 | 3 | 26.000 | No | 78.000 | 907.000 | 985.000 |

**Resultado a mano: 985.000. Programa: 985.000. Coincide.**

## 2. `ventaMayor`: patrón máximo (datos corregidos)
Inicio: `ventaMaxValor = -1`, `ventaMaxRegistro = null`. Se actualiza solo si `valor > ventaMaxValor`.

| Iter. | ID | `valorVenta` | ¿Se salta? | ¿Valor > máximo actual? | Máximo después | Registro guardado |
|---|---|---|---|---|---|---|
| 1 | 1 | 84.000 | No | Sí (84.000 > -1) | 84.000 | ID 1 |
| 2 | 2 | 26.000 | No | No | 84.000 | ID 1 |
| 3 | 3 | 95.000 | No | Sí | 95.000 | ID 3 |
| 4 | 4 | 42.000 | No | No | 95.000 | ID 3 |
| 5 | 5 | 135.000 | No | Sí | 135.000 | ID 5 |
| 6 | 6 | 52.000 | No | No | 135.000 | ID 5 |
| 7 | 7 | 120.000 | No | No | 135.000 | ID 5 |
| 8 | 8 | (no se calcula) | **Sí** | n/a | 135.000 | ID 5 |
| 9 | 9 | 90.000 | No | No | 135.000 | ID 5 |
| 10 | 10 | 168.000 | No | Sí | 168.000 | ID 10 |
| 11 | 11 | 95.000 | No | No | 168.000 | ID 10 |
| 12 | 12 | 78.000 | No | No | 168.000 | ID 10 |

**Resultado a mano: registro ID 10, valor 168.000. Programa: ID 10, 168.000. Coincide.**

## 3. `ticketPromedio`: patrón contador + acumulador (datos corregidos)
Inicio: `contadorValidas = 0`. El contador sube con cada venta de `cantidad !== 0`. La traza del contador no cambia (11 ventas válidas, el ID 8 se excluye).

Ticket = 985.000 ÷ 11 = **89.545,4545…**

**Resultado a mano: 89.545,4545… Programa: 89.545,45454545454. Coincide.**

## 4. `ventasPorCiudad(ventas, "Medellín")`: acumulador con normalización
Inicio: `total = 0`. Buscada normalizada: `"medellín"`.

| ID | Ciudad en los datos | Normalizada | ¿Coincide? | `valorVenta` | `total` después |
|---|---|---|---|---|---|
| 1 | `"Medellín"` | `"medellín"` | Sí | 84.000 | 84.000 |
| 4 | `"Medellín"` | `"medellín"` | Sí | 42.000 | 126.000 |
| 5 | `"medellín "` | `"medellín"` | Sí | 135.000 | 261.000 |
| 11 | `"Medellín"` | `"medellín"` | Sí | 95.000 | 356.000 |

Las demás ventas son de Bogotá, Cali o Pereira y no suman.

**Resultado a mano: 356.000. Programa: 356.000. Coincide.**
#  qué pregunta responde cada función

Las cinco preguntas de la sesión: ¿qué recorro?, ¿qué filtro?, ¿qué transformo?, ¿qué acumulo?, ¿cómo agrupo?

Regla de venta válida: `cantidad !== 0`. Las ventas con cantidad 0 se filtran en todas las funciones.

## 1. Versiones con ciclo (`for...of`)

| Función | ¿Qué recorro? | ¿Qué filtro? | ¿Qué transformo? | ¿Qué acumulo? | ¿Cómo agrupo? |
|---|---|---|---|---|---|
| `valorVenta(venta)` | Nada: recibe una sola venta | Nada | La venta en su valor: `cantidad × precio` | Nada | No agrupo |
| `totalVendido(ventas)` | Cada venta de `ventas` | Salto las de `cantidad === 0` | Cada venta en su valor con `valorVenta` | `total`, inicia en 0; sumo cada valor | No agrupo |
| `unidadesVendidas(ventas)` | Cada venta de `ventas` | Salto las de `cantidad === 0` | Nada: uso `venta.cantidad` directo | `totalUnidades`, inicia en 0; sumo cada cantidad | No agrupo |
| `ventaMayor(ventas)` | Cada venta de `ventas` | Salto las de `cantidad === 0` | Cada venta en su valor con `valorVenta` | No sumo: guardo el máximo. `ventaMaxValor` inicia en -1 y `ventaMaxRegistro` en `null`; actualizo solo si el valor es estrictamente mayor (en empate gana la primera). Devuelve el registro completo | No agrupo |
| `ticketPromedio(ventas)` | Cada venta de `ventas`, para contar | Cuento solo las de `cantidad !== 0` | Nada propio: el total lo calcula `totalVendido` | `contadorValidas`, inicia en 0. Resultado: total ÷ contador; si el contador es 0, devuelve 0 | No agrupo |
| `ventasPorCiudad(ventas, ciudad)` | Cada venta de `ventas` | Salto cantidad 0, ciudad que no es texto y ciudad distinta de la buscada | La ciudad buscada y la de cada venta a `trim().toLowerCase()`; cada venta que pasa, a su valor | `total`, inicia en 0 | No agrupo: una sola ciudad, elegida por filtro |

## 2. Versiones con métodos de arreglo (sufijo M)

| Función | ¿Qué recorro? | ¿Qué filtro? (`filter`) | ¿Qué transformo? (`map`) | ¿Qué acumulo? (`reduce`) | ¿Cómo agrupo? |
|---|---|---|---|---|---|
| `totalVendidoM(ventas)` | `ventas` completo, de forma implícita (sin `for`) | `cantidad !== 0` | Cada venta en su valor con `valorVenta` | Suma, valor inicial 0 | No agrupo |
| `unidadesVendidasM(ventas)` | `ventas` completo, de forma implícita | `cantidad !== 0` | Cada venta en su `cantidad` | Suma, valor inicial 0 | No agrupo |
| `ventasPorCiudadM(ventas, ciudad)` | `ventas` completo, de forma implícita | `cantidad !== 0`, ciudad de la venta en texto y ciudad normalizada igual a la buscada | Cada venta en su valor con `valorVenta` | Suma, valor inicial 0 | No agrupo: una sola ciudad, elegida por filtro |

## 3. Agrupaciones y ranking (objeto como diccionario)

| Función | ¿Qué recorro? | ¿Qué filtro? | ¿Qué transformo? | ¿Qué acumulo? | ¿Cómo agrupo? |
|---|---|---|---|---|---|
| `totalPorCiudad(ventas)` | Cada venta de `ventas` | Salto cantidad 0 y ciudad que no es texto | La ciudad en clave con `trim().toLowerCase()`; la venta en su valor | `totales[ciudad]`, cada clave inicia en 0 la primera vez que aparece; sumo el valor | Por ciudad normalizada: `"Bogotá"` y `"Bogotá "` quedan en la clave `bogotá` |
| `unidadesPorProducto(ventas)` | Cada venta de `ventas` | Salto cantidad 0 y producto que no es texto | El producto en clave con `trim()` | `unidades[producto]`, cada clave inicia en 0; sumo `venta.cantidad` | Por producto con nombre completo (con gramaje) |
| `topProductosPorValor(ventas, k)` | Dos recorridos: las ventas, para acumular, y las claves del diccionario, para armar el ranking | Salto cantidad 0 y producto que no es texto. Si `k` no es un entero mayor o igual a 0, devuelve `[]` | La venta en su valor; cada clave en un objeto `{ producto, valor }` | `valores[producto]`, cada clave inicia en 0; sumo el valor | Por producto con nombre completo. Después ordeno un arreglo nuevo de mayor a menor valor (empate: por nombre) y tomo los primeros `k` con `slice(0, k)`. No modifico `ventas` |

## 4. Correspondencia ciclo → método

| En el ciclo | En los métodos |
|---|---|
| `if (venta.cantidad === 0) continue;` | `filter((venta) => venta.cantidad !== 0)` |
| `valorVenta(venta)` o `venta.cantidad` | `map(...)` |
| `total += valor;` con `total` iniciando en 0 | `reduce((acumulado, valor) => acumulado + valor, 0)` |
| Arreglo vacío: el ciclo no entra y devuelve 0 | El valor inicial 0 evita que `reduce` falle |

# Depuración de los errores reportados por la gerente

**Aviso de método:** no se tuvo el código de la versión preliminar del compañero. Las versiones
defectuosas de `src/reproducir_errores.js` son reconstrucciones mínimas hechas a partir de cada
síntoma: demuestran qué causa puede producirlo, no que esa fuera la causa real de su versión.
Reproducción: `node src/reproducir_errores.js`

---

## Error 1: "Bogotá aparecía dos veces"

**Síntoma:** en el reporte, una misma ciudad aparece como dos filas distintas, cada una con una parte del total.

**Entrada que lo produce:** ventas cuya ciudad se escribe distinto para la misma ciudad. Con los datos
reales ocurre con `"Medellín"` (IDs 1, 4 y 11) y `"medellín "` (ID 5), que dan 5 grupos en vez de 4.
Para Bogotá, una entrada equivalente es `["Bogotá", "Bogotá "]`.

**Hipótesis y prueba realizada** (versión defectuosa: agrupa por la ciudad tal cual viene):

| Hipótesis | Entrada | Defectuosa | Versión actual | Estado |
|---|---|---|---|---|
| H1: espacio al final | `"Bogotá"`, `"Bogotá "` | 2 grupos | 1 grupo | Corregido |
| H1: otra capitalización | `"Bogotá"`, `"BOGOTÁ"` | 2 grupos | 1 grupo | Corregido |
| H1: espacio no separable | `"Bogotá"`, `"Bogotá\u00A0"` | 2 grupos | 1 grupo | Corregido |
| H2: tilde como carácter combinado | `"Bogotá"`, `"Bogota\u0301"` | 2 grupos | **2 grupos** | **Persiste** |
| H3: sin tilde | `"Bogotá"`, `"Bogota"` | 2 grupos | **2 grupos** | **Persiste** |
| Datos reales (`datos.js`) | `"Medellín"`, `"medellín "` | 5 grupos | 4 grupos | Corregido |

**Causa:** la clave del grupo era el texto crudo de la ciudad, así que cualquier diferencia de escritura
creaba un grupo nuevo. En H2, "Bogotá" tiene 6 caracteres y la otra variante 7 (la tilde es un carácter
aparte), pero se ven idénticas en pantalla, lo que la hace la más difícil de detectar a simple vista.

**Corrección aplicada (H1 y datos reales):** la clave sale de `formatearCiudad` (`trim()`, minúsculas e
inicial de cada palabra en mayúscula) en `totalPorCiudad`, y `ventasPorCiudad` compara con `trim()` y
`toLowerCase()`. Cubierto por aserciones en `reproducir_errores.js`.

**Pendiente (H2 y H3):** la normalización actual no unifica la tilde combinada ni la ausencia de tilde.
Requiere decidir entre: A) normalizar la forma Unicode (`normalize('NFC')`) y mantener la tilde, o
B) además ignorar las tildes al agrupar. No está corregido.

---

## Error 2: ticket promedio `NaN` al filtrar un día sin ventas

**Síntoma:** el ticket promedio mostraba `NaN` en lugar de un valor.

**Entrada que lo produce:** un día sin ventas (`ventasDelDia(ventas, "2026-09-07")` devuelve `[]`),
o un día en que solo hay ventas de cantidad 0.

**Hipótesis y prueba realizada:**

| Hipótesis | Entrada | Defectuosa | Versión actual | Estado |
|---|---|---|---|---|
| H1: división 0 ÷ 0 sin guarda | día sin ventas `[]` | `NaN` | `0` (ciclo y métodos) | Corregido |
| H1: división 0 ÷ 0 sin guarda | solo cantidad 0 | `NaN` | `0` (ciclo y métodos) | Corregido |
| H2: dato inválido (cantidad sin definir) | un registro sin `cantidad` | `NaN` | **`NaN`** | **Persiste** |

La H2 no es el síntoma reportado (un día sin ventas), pero es otra ruta hacia el mismo `NaN`.

**Causa (H1):** la versión defectuosa divide el total (0) entre el número de ventas válidas (0) sin
revisar que sea cero, y 0 ÷ 0 da `NaN` en JavaScript.

**Corrección aplicada:** `ticketPromedio` y `ticketPromedioM` devuelven 0 cuando no hay ventas válidas,
antes de dividir. Demostración: con el día sin ventas, las 15 funciones que reciben ese resultado
devuelven 0, `null`, `{}` o `[]`, sin `NaN`, y el reporte muestra "Ticket promedio por compra: $ 0".
Verificado también con una mutación: al quitar la guarda, el script falla.

**Pendiente (H2):** la validación de datos de entrada (cantidad o precio no numéricos) no está implementada.