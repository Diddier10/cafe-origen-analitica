# cafe-origen-analitica
# Café Origen · Analítica de ventas

## Qué es

Un pequeño motor de análisis de ventas para Café Origen, escrito en JavaScript y ejecutado con Node.js.
Lee un registro de ventas y lo convierte en un **reporte por consola** con los indicadores que necesita
la gerente: cuánto se vendió, cuántas unidades salieron, qué ciudades y productos rinden más y cómo
fue un día concreto. No necesita abrir ni modificar el código para ver el reporte.

- Sin dependencias externas: no hay que instalar nada, solo tener Node.js.
- Los datos viven en `src/datos.js` (12 ventas de ejemplo, del 1 al 6 de septiembre de 2026).
- Versión: **v0.1**.

## Requisitos

- **Node.js** (probado con la versión 22). Para comprobar que lo tienes, escribe `node --version` en la terminal.

## Cómo ejecutarlo

1. Abre una terminal **en la carpeta del proyecto**, la que contiene la carpeta `src`.
   (Si la ruta tiene espacios, escríbela entre comillas al usar `cd`.)
2. Ejecuta:

```bash
node src/reporte.js
```

Esto imprime el reporte completo. Con los datos de ejemplo se ve así:

```
CAFÉ ORIGEN - REPORTE DE VENTAS
================================

RESUMEN GENERAL
Total vendido: $ 985.000
Unidades vendidas: 21
Ticket promedio por compra: $ 89.545
Venta más grande: $ 168.000 (ID 10, Origen Nariño 500 g, Pereira)

VENTAS POR CIUDAD
Medellín: $ 356.000
Bogotá: $ 276.000
Cali: $ 185.000
Pereira: $ 168.000

UNIDADES POR PRODUCTO
Origen Huila 500 g: 3
Origen Nariño 500 g: 5
Prensa francesa: 2
Origen Sierra 500 g: 5
Origen Nariño 250 g: 2
Molino manual: 4

TOP 3 DE PRODUCTOS POR VALOR
1. Origen Sierra 500 g: $ 225.000
2. Molino manual: $ 198.000
3. Origen Nariño 500 g: $ 194.000

RESUMEN DEL DÍA 2026-09-03
Total vendido: $ 187.000
Unidades vendidas: 5
Ticket promedio por compra: $ 93.500
Venta más grande: $ 135.000 (ID 5, Origen Sierra 500 g, medellín )

RESUMEN DEL DÍA 2026-09-07
Total vendido: $ 0
Unidades vendidas: 0
Ticket promedio por compra: $ 0
Venta más grande: sin ventas registradas
```

El último bloque muestra cómo se comporta el reporte con un día sin ventas: todo en cero y
"sin ventas registradas", nunca `NaN`.

### Otros comandos (para quien mantiene el código)

| Comando | Para qué sirve | Resultado esperado |
|---|---|---|
| `node src/verificar.js` | Compara cada indicador calculado con ciclos contra su versión con métodos de arreglo | Cada par muestra `OK` |
| `node src/pruebas.js` | Pruebas de las funciones con el arreglo completo, un elemento y un arreglo vacío | Todas aprobadas |
| `node src/reproducir_errores.js` | Reproduce los dos errores reportados por la gerente y comprueba que siguen corregidos | `Sin regresiones` |

### Cambiar los días del resumen

El reporte muestra el resumen de dos días fijos. Para cambiarlos, edita las dos constantes del
inicio de `src/reporte.js` (formato `AAAA-MM-DD`):

```javascript
const DIA_CON_VENTAS = '2026-09-03';
const DIA_SIN_VENTAS = '2026-09-07';
```

## Qué preguntas responde

| Pregunta del negocio | Función (`src/analitica.js`) | Dónde aparece en el reporte |
|---|---|---|
| ¿Cuánto se vendió en total? | `totalVendido` | Resumen general |
| ¿Cuántas unidades salieron? | `unidadesVendidas` | Resumen general |
| ¿Cuál fue la venta más grande? | `ventaMayor` | Resumen general |
| ¿Cuánto gasta en promedio un cliente por compra? | `ticketPromedio` | Resumen general |
| ¿Cuánto se vendió en cada ciudad? | `totalPorCiudad` | Ventas por ciudad |
| ¿Cuánto se vendió en una ciudad concreta? | `ventasPorCiudad` | No aparece; se usa desde el código |
| ¿Cuántas unidades se vendieron de cada producto? | `unidadesPorProducto` | Unidades por producto |
| ¿Qué tres productos generaron más dinero? | `topProductosPorValor` | Top 3 de productos por valor |
| ¿Cómo fue un día concreto? | `ventasDelDia` (más las funciones de arriba) | Resumen del día |

Las funciones de `totalVendido`, `unidadesVendidas`, `ventaMayor`, `ticketPromedio` y `ventasPorCiudad`
tienen dos versiones que deben dar siempre el mismo resultado: una con ciclos `for...of` (la de
referencia) y otra con métodos de arreglo, cuyo nombre termina en `M`. `verificar.js` lo comprueba.

## Reglas de cálculo

- **Venta válida:** una venta con `cantidad` distinta de 0. Las ventas con cantidad 0 no cuentan en
  ningún indicador.
- **Valor de una venta:** `cantidad × precio`.
- **Ticket promedio por compra:** total vendido ÷ número de ventas válidas. Es por registro de venta,
  no por cliente distinto. Sin ventas válidas, vale 0.
- **Ciudades:** se normalizan al agrupar (se ignoran espacios sobrantes y mayúsculas), así `"Bogotá"`,
  `"Bogotá "` y `"BOGOTÁ"` cuentan como una sola ciudad, que se muestra como `Bogotá`.
- **Productos:** se agrupan por nombre completo, incluido el gramaje: `Origen Nariño 250 g` y
  `Origen Nariño 500 g` son productos distintos. Solo se ignoran los espacios sobrantes.
- **Top de productos:** de mayor a menor valor generado. En un empate, orden alfabético por nombre.
- **Día sin ventas:** todos los indicadores valen 0 y la venta más grande se informa como
  "sin ventas registradas".
- **Las funciones no modifican los datos originales.**

## Estructura del proyecto

```
src/
├── datos.js              Registro de ventas (los datos de ejemplo)
├── analitica.js          Funciones de cálculo (la lógica del proyecto)
├── reporte.js            Reporte por consola
├── verificar.js          Compara la versión con ciclo y la versión con métodos
├── pruebas.js            Pruebas de las funciones
└── reproducir_errores.js Reproducción de los errores reportados por la gerente
```

## Datos

Cada venta en `src/datos.js` tiene esta forma:

```javascript
{ id: 1, fecha: "2026-09-01", cliente: "C01", producto: "Origen Huila 500 g",
  ciudad: "Medellín", cantidad: 2, precio: 42000 }
```

Los datos de ejemplo incluyen casos límite a propósito: el ID 8 tiene cantidad 0 y el ID 5 trae la
ciudad escrita como `"medellín "` (minúscula y con un espacio al final).

## Limitaciones conocidas (v0.1)

- **No existe el ranking de productos por unidades.** El reporte lista las unidades por producto en el
  orden en que aparecen en los datos, sin ordenarlas.
- **La normalización de ciudades es parcial.** Unifica mayúsculas y espacios, pero no unifica
  `"Bogota"` sin tilde con `"Bogotá"`, ni la tilde escrita como carácter combinado.
- **No se validan los datos.** Una venta con `cantidad` o `precio` que no sean números produce `NaN`.
- **Fechas:** se comparan como texto exacto en formato `AAAA-MM-DD`. Una fecha mal escrita se comporta
  como un día sin ventas.
- **Los días del resumen son fijos** y se cambian editando `reporte.js`; no se pasan por la terminal.
- **La venta más grande muestra la ciudad tal como viene en los datos** (por ejemplo `medellín `).
- **Precios por revisar en los datos:** el mismo producto aparece con precios distintos (por ejemplo
  `Origen Nariño 500 g` a 26.000 en el ID 2 y a 42.000 en el ID 10, y `Molino manual` a 120.000 en el ID 7
  y a 26.000 en el ID 12). No se han modificado porque falta confirmar si son errores de captura.