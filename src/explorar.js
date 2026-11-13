const {ventas} = require("./datos.js");

console.log("====================================");
console.log("        EXPLORACION DE DATOS        ");
console.log("====================================");

console.log(`Cantidad total de registros : ${ventas.length}`);

console.log("Primer registro del historial: ");
console.log(ventas[0]);

console.log("Ultimo registro del historial: ");
console.log(ventas[ventas.length - 1]);

console.log(`Producto en la posicion 4 (indice 4): ${ventas[4].producto}`);

console.log("Tabla completa de ventas: ");
console.table(ventas);