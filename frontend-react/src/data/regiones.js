// Regiones y comunas de Chile (migrado desde js/regiones.js).
// Se usa en los formularios de clientes y empleados.

export const REGIONES = [
  {
    nombre: "Arica y Parinacota",
    comunas: ["Arica", "Camarones", "Putre", "General Lagos"],
  },
  {
    nombre: "Tarapacá",
    comunas: ["Iquique", "Alto Hospicio", "Pozo Almonte", "Pica"],
  },
  {
    nombre: "Antofagasta",
    comunas: ["Antofagasta", "Calama", "Tocopilla", "Mejillones"],
  },
  {
    nombre: "Atacama",
    comunas: ["Copiapó", "Vallenar", "Chañaral", "Caldera"],
  },
  {
    nombre: "Coquimbo",
    comunas: ["La Serena", "Coquimbo", "Ovalle", "Illapel"],
  },
  {
    nombre: "Valparaíso",
    comunas: [
      "Valparaíso",
      "Viña del Mar",
      "Villa Alemana",
      "Quilpué",
      "Concón",
      "San Antonio",
      "Los Andes",
    ],
  },
  {
    nombre: "Metropolitana de Santiago",
    comunas: [
      "Santiago",
      "Providencia",
      "Las Condes",
      "Maipú",
      "Puente Alto",
      "La Florida",
      "Ñuñoa",
    ],
  },
  {
    nombre: "O'Higgins",
    comunas: ["Rancagua", "San Fernando", "Rengo", "Machalí"],
  },
  {
    nombre: "Maule",
    comunas: ["Talca", "Curicó", "Linares", "Constitución"],
  },
  {
    nombre: "Ñuble",
    comunas: ["Chillán", "Chillán Viejo", "San Carlos", "Bulnes"],
  },
  {
    nombre: "Biobío",
    comunas: ["Concepción", "Talcahuano", "Los Ángeles", "Chiguayante"],
  },
  {
    nombre: "La Araucanía",
    comunas: ["Temuco", "Padre Las Casas", "Villarrica", "Angol"],
  },
  {
    nombre: "Los Ríos",
    comunas: ["Valdivia", "La Unión", "Río Bueno", "Paillaco"],
  },
  {
    nombre: "Los Lagos",
    comunas: ["Puerto Montt", "Osorno", "Puerto Varas", "Castro"],
  },
  {
    nombre: "Aysén",
    comunas: ["Coyhaique", "Puerto Aysén", "Chile Chico"],
  },
  {
    nombre: "Magallanes",
    comunas: ["Punta Arenas", "Puerto Natales", "Porvenir"],
  },
];

export function obtenerComunas(nombreRegion) {
  const region = REGIONES.find((r) => r.nombre === nombreRegion);

  return region ? region.comunas : [];
}
