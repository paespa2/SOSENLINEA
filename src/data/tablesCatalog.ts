export interface TableColumn {
  name: string;
  type: string;
  nullable: boolean;
  isIdentity?: boolean;
  isPK?: boolean;
}

export interface TableSchemaInfo {
  name: string;
  columnCount: number;
  status: 'mapeada' | 'activa' | 'duplicada' | 'obsoleta';
  module: string;
  pks: string[];
  columns: TableColumn[];
}

export const AZURE_SQL_TABLES: TableSchemaInfo[] = [
  {
    "name": "bien raiz",
    "columnCount": 3,
    "status": "obsoleta",
    "module": "Deprecada / Fase 1",
    "pks": [],
    "columns": [
      {
        "name": "IdContratante",
        "type": "float(53)",
        "nullable": true
      },
      {
        "name": "meses",
        "type": "smallint",
        "nullable": true
      },
      {
        "name": "SSMA_TimeStamp",
        "type": "timestamp",
        "nullable": false
      }
    ]
  },
  {
    "name": "bien_raiz",
    "columnCount": 2,
    "status": "obsoleta",
    "module": "Deprecada / Fase 1",
    "pks": [],
    "columns": [
      {
        "name": "IdContratante",
        "type": "float(53)",
        "nullable": true
      },
      {
        "name": "meses",
        "type": "smallint",
        "nullable": true
      }
    ]
  },
  {
    "name": "Errores al guardar Autocorrección de nombres",
    "columnCount": 4,
    "status": "obsoleta",
    "module": "Deprecada / Fase 1",
    "pks": [],
    "columns": [
      {
        "name": "Nombre de objeto",
        "type": "nvarchar(255)",
        "nullable": true
      },
      {
        "name": "Tipo de objeto",
        "type": "nvarchar(255)",
        "nullable": true
      },
      {
        "name": "Motivo del error",
        "type": "nvarchar(255)",
        "nullable": true
      },
      {
        "name": "Hora",
        "type": "datetime2(0)",
        "nullable": true
      }
    ]
  },
  {
    "name": "Errores de pegado",
    "columnCount": 2,
    "status": "obsoleta",
    "module": "Deprecada / Fase 1",
    "pks": [],
    "columns": [
      {
        "name": "IdRegistro",
        "type": "int",
        "nullable": true
      },
      {
        "name": "strDireccion",
        "type": "nvarchar(255)",
        "nullable": true
      }
    ]
  },
  {
    "name": "Errores_al_guardar_Autocorrección_de_nombres",
    "columnCount": 4,
    "status": "obsoleta",
    "module": "Deprecada / Fase 1",
    "pks": [],
    "columns": [
      {
        "name": "Nombre_de_objeto",
        "type": "nvarchar(255)",
        "nullable": true
      },
      {
        "name": "Tipo_de_objeto",
        "type": "nvarchar(255)",
        "nullable": true
      },
      {
        "name": "Motivo_del_error",
        "type": "nvarchar(255)",
        "nullable": true
      },
      {
        "name": "Hora",
        "type": "datetime",
        "nullable": true
      }
    ]
  },
  {
    "name": "Errores_de_pegado",
    "columnCount": 2,
    "status": "obsoleta",
    "module": "Deprecada / Fase 1",
    "pks": [],
    "columns": [
      {
        "name": "IdRegistro",
        "type": "int",
        "nullable": true
      },
      {
        "name": "strDireccion",
        "type": "nvarchar(255)",
        "nullable": true
      }
    ]
  },
  {
    "name": "liquida",
    "columnCount": 1,
    "status": "obsoleta",
    "module": "Deprecada / Fase 1",
    "pks": [
      "caso"
    ],
    "columns": [
      {
        "name": "caso",
        "type": "int",
        "nullable": false,
        "isPK": true
      }
    ]
  },
  {
    "name": "MOVIMIENTO",
    "columnCount": 14,
    "status": "activa",
    "module": "Sistema General",
    "pks": [],
    "columns": [
      {
        "name": "Cuenta",
        "type": "nvarchar(10)",
        "nullable": true
      },
      {
        "name": "Comprobante",
        "type": "nvarchar(5)",
        "nullable": true
      },
      {
        "name": "Fecha",
        "type": "datetime2(0)",
        "nullable": true
      },
      {
        "name": "Documento",
        "type": "nvarchar(9)",
        "nullable": true
      },
      {
        "name": "Documento referencia",
        "type": "nvarchar(9)",
        "nullable": true
      },
      {
        "name": "Nit",
        "type": "nvarchar(11)",
        "nullable": true
      },
      {
        "name": "Detalle",
        "type": "nvarchar(28)",
        "nullable": true
      },
      {
        "name": "Tipo",
        "type": "nvarchar(1)",
        "nullable": true
      },
      {
        "name": "Valor",
        "type": "real",
        "nullable": true
      },
      {
        "name": "Base",
        "type": "real",
        "nullable": true
      },
      {
        "name": "Centro de costos",
        "type": "nvarchar(6)",
        "nullable": true
      },
      {
        "name": "Transaccion banco",
        "type": "nvarchar(3)",
        "nullable": true
      },
      {
        "name": "PLazo",
        "type": "nvarchar(4)",
        "nullable": true
      },
      {
        "name": "SSMA_TimeStamp",
        "type": "timestamp",
        "nullable": false
      }
    ]
  },
  {
    "name": "NITS",
    "columnCount": 7,
    "status": "activa",
    "module": "Sistema General",
    "pks": [
      "NIT"
    ],
    "columns": [
      {
        "name": "NIT",
        "type": "nvarchar(11)",
        "nullable": false,
        "isPK": true
      },
      {
        "name": "Tipo documento",
        "type": "nvarchar(1)",
        "nullable": true
      },
      {
        "name": "Nombre",
        "type": "nvarchar(30)",
        "nullable": true
      },
      {
        "name": "Direccion",
        "type": "nvarchar(30)",
        "nullable": true
      },
      {
        "name": "Ciudad",
        "type": "nvarchar(15)",
        "nullable": true
      },
      {
        "name": "Telefono",
        "type": "nvarchar(7)",
        "nullable": true
      },
      {
        "name": "Municipio",
        "type": "nvarchar(5)",
        "nullable": true
      }
    ]
  },
  {
    "name": "tabCentroCostos",
    "columnCount": 8,
    "status": "activa",
    "module": "Sistema General",
    "pks": [
      "IdConsecutivo",
      "IdRegistro"
    ],
    "columns": [
      {
        "name": "IdConsecutivo",
        "type": "int",
        "isIdentity": true,
        "nullable": true,
        "isPK": true
      },
      {
        "name": "IdRegistro",
        "type": "int",
        "nullable": false,
        "isPK": true
      },
      {
        "name": "IdCotizacion",
        "type": "int",
        "nullable": true
      },
      {
        "name": "IdCuenta",
        "type": "int",
        "nullable": true
      },
      {
        "name": "IdNit",
        "type": "int",
        "nullable": true
      },
      {
        "name": "datFechaReg",
        "type": "datetime2(0)",
        "nullable": true
      },
      {
        "name": "numValor",
        "type": "float(53)",
        "nullable": true
      },
      {
        "name": "SSMA_TimeStamp",
        "type": "timestamp",
        "nullable": false
      }
    ]
  },
  {
    "name": "tabControl",
    "columnCount": 2,
    "status": "activa",
    "module": "Sistema General",
    "pks": [
      "IdRegistro"
    ],
    "columns": [
      {
        "name": "IdRegistro",
        "type": "int",
        "nullable": false,
        "isPK": true
      },
      {
        "name": "strinf",
        "type": "nvarchar(255)",
        "nullable": true
      }
    ]
  },
  {
    "name": "tabCuentas",
    "columnCount": 3,
    "status": "activa",
    "module": "Sistema General",
    "pks": [
      "Id"
    ],
    "columns": [
      {
        "name": "Id",
        "type": "int",
        "isIdentity": true,
        "nullable": true,
        "isPK": true
      },
      {
        "name": "IdCuenta",
        "type": "int",
        "nullable": true
      },
      {
        "name": "strCuenta",
        "type": "nvarchar(255)",
        "nullable": true
      }
    ]
  },
  {
    "name": "Tabla1",
    "columnCount": 2,
    "status": "obsoleta",
    "module": "Deprecada / Fase 1",
    "pks": [
      "cODIGO"
    ],
    "columns": [
      {
        "name": "cODIGO",
        "type": "int",
        "nullable": false,
        "isPK": true
      },
      {
        "name": "strNombre",
        "type": "int",
        "nullable": true
      }
    ]
  },
  {
    "name": "tblAmbientes",
    "columnCount": 2,
    "status": "activa",
    "module": "Sistema General",
    "pks": [
      "IdAmbiente"
    ],
    "columns": [
      {
        "name": "IdAmbiente",
        "type": "int",
        "nullable": false,
        "isPK": true
      },
      {
        "name": "strAmbiente",
        "type": "nvarchar(255)",
        "nullable": true
      }
    ]
  },
  {
    "name": "tblAsignacionHerramienta",
    "columnCount": 4,
    "status": "activa",
    "module": "Sistema General",
    "pks": [
      "IdConsecutivo",
      "IdHerramienta"
    ],
    "columns": [
      {
        "name": "IdConsecutivo",
        "type": "int",
        "isIdentity": true,
        "nullable": true,
        "isPK": true
      },
      {
        "name": "IdHerramienta",
        "type": "int",
        "nullable": false,
        "isPK": true
      },
      {
        "name": "IdContratista",
        "type": "int",
        "nullable": true
      },
      {
        "name": "datRegistro",
        "type": "datetime2(0)",
        "nullable": true
      }
    ]
  },
  {
    "name": "tblAutorizaciones",
    "columnCount": 8,
    "status": "activa",
    "module": "Sistema General",
    "pks": [
      "IdAutorizacion"
    ],
    "columns": [
      {
        "name": "IdAutorizacion",
        "type": "int",
        "isIdentity": true,
        "nullable": true,
        "isPK": true
      },
      {
        "name": "IdRegistro",
        "type": "int",
        "nullable": true
      },
      {
        "name": "IdCotizacion",
        "type": "int",
        "nullable": true
      },
      {
        "name": "datReporte",
        "type": "datetime2(0)",
        "nullable": true
      },
      {
        "name": "datAutorizado",
        "type": "datetime2(0)",
        "nullable": true
      },
      {
        "name": "memNotas",
        "type": "nvarchar(max)",
        "nullable": true
      },
      {
        "name": "numValor",
        "type": "float(53)",
        "nullable": true
      },
      {
        "name": "SSMA_TimeStamp",
        "type": "timestamp",
        "nullable": false
      }
    ]
  },
  {
    "name": "tblAutorizadosProgramacion",
    "columnCount": 5,
    "status": "activa",
    "module": "Sistema General",
    "pks": [
      "IdProgramacion",
      "IdRegistro",
      "IdContratista"
    ],
    "columns": [
      {
        "name": "IdProgramacion",
        "type": "int",
        "isIdentity": true,
        "nullable": true,
        "isPK": true
      },
      {
        "name": "IdRegistro",
        "type": "int",
        "nullable": false,
        "isPK": true
      },
      {
        "name": "IdContratista",
        "type": "nvarchar(50)",
        "nullable": false,
        "isPK": true
      },
      {
        "name": "datFechaInicio",
        "type": "datetime2(0)",
        "nullable": true
      },
      {
        "name": "datFechaTerminacion",
        "type": "datetime2(0)",
        "nullable": true
      }
    ]
  },
  {
    "name": "tblClase",
    "columnCount": 2,
    "status": "activa",
    "module": "Sistema General",
    "pks": [
      "IdClase"
    ],
    "columns": [
      {
        "name": "IdClase",
        "type": "int",
        "nullable": false,
        "isPK": true
      },
      {
        "name": "strDescripcion",
        "type": "nvarchar(255)",
        "nullable": true
      }
    ]
  },
  {
    "name": "tblClientes",
    "columnCount": 10,
    "status": "mapeada",
    "module": "Maestros - Clientes",
    "pks": [
      "IdContratante"
    ],
    "columns": [
      {
        "name": "IdContratante",
        "type": "float(53)",
        "nullable": false,
        "isPK": true
      },
      {
        "name": "strContratante",
        "type": "nvarchar(50)",
        "nullable": true
      },
      {
        "name": "strContacto",
        "type": "nvarchar(50)",
        "nullable": true
      },
      {
        "name": "strDir",
        "type": "nvarchar(50)",
        "nullable": true
      },
      {
        "name": "swActivo",
        "type": "nvarchar(255)",
        "nullable": true
      },
      {
        "name": "strEmail",
        "type": "nvarchar(255)",
        "nullable": true
      },
      {
        "name": "strCel",
        "type": "nvarchar(255)",
        "nullable": true
      },
      {
        "name": "strWapp",
        "type": "nvarchar(max)",
        "nullable": true
      },
      {
        "name": "strURL",
        "type": "nvarchar(max)",
        "nullable": true
      },
      {
        "name": "SSMA_TimeStamp",
        "type": "timestamp",
        "nullable": false
      }
    ]
  },
  {
    "name": "tblConsolidadoCaso",
    "columnCount": 5,
    "status": "activa",
    "module": "Sistema General",
    "pks": [],
    "columns": [
      {
        "name": "IdCotizacion",
        "type": "int",
        "nullable": true
      },
      {
        "name": "numCan",
        "type": "real",
        "nullable": true
      },
      {
        "name": "numVr",
        "type": "float(53)",
        "nullable": true
      },
      {
        "name": "numTotalItem",
        "type": "float(53)",
        "nullable": true
      },
      {
        "name": "SSMA_TimeStamp",
        "type": "timestamp",
        "nullable": false
      }
    ]
  },
  {
    "name": "tblConsolidadoCotizaciones",
    "columnCount": 4,
    "status": "activa",
    "module": "Sistema General",
    "pks": [],
    "columns": [
      {
        "name": "IdCotizacion",
        "type": "int",
        "nullable": true
      },
      {
        "name": "numCan",
        "type": "real",
        "nullable": true
      },
      {
        "name": "numVr",
        "type": "float(53)",
        "nullable": true
      },
      {
        "name": "SSMA_TimeStamp",
        "type": "timestamp",
        "nullable": false
      }
    ]
  },
  {
    "name": "tblConsolidadoEgresos",
    "columnCount": 4,
    "status": "activa",
    "module": "Sistema General",
    "pks": [],
    "columns": [
      {
        "name": "IdCotizacion",
        "type": "int",
        "nullable": true
      },
      {
        "name": "IdRegistro",
        "type": "int",
        "nullable": true
      },
      {
        "name": "SumaDenumValor",
        "type": "float(53)",
        "nullable": true
      },
      {
        "name": "SSMA_TimeStamp",
        "type": "timestamp",
        "nullable": false
      }
    ]
  },
  {
    "name": "tblConsolidadoLiquidacionTrabajo",
    "columnCount": 8,
    "status": "activa",
    "module": "Sistema General",
    "pks": [],
    "columns": [
      {
        "name": "strDireccion",
        "type": "nvarchar(255)",
        "nullable": true
      },
      {
        "name": "strArrendatario",
        "type": "nvarchar(255)",
        "nullable": true
      },
      {
        "name": "IdCotizacion",
        "type": "int",
        "nullable": true
      },
      {
        "name": "tblReportes_IdRegistro",
        "type": "int",
        "isIdentity": true,
        "nullable": true,
        "isPK": true
      },
      {
        "name": "tblEgresos_Liq_Tecnicos_IdRegistro",
        "type": "int",
        "nullable": true
      },
      {
        "name": "SumaDenumValor",
        "type": "float(53)",
        "nullable": true
      },
      {
        "name": "Nombre",
        "type": "nvarchar(30)",
        "nullable": true
      },
      {
        "name": "SSMA_TimeStamp",
        "type": "timestamp",
        "nullable": false
      }
    ]
  },
  {
    "name": "tblConsolidadoValorCotizacion",
    "columnCount": 4,
    "status": "activa",
    "module": "Sistema General",
    "pks": [],
    "columns": [
      {
        "name": "IdCotizacion",
        "type": "int",
        "isIdentity": true,
        "nullable": true,
        "isPK": true
      },
      {
        "name": "IdRegistro",
        "type": "int",
        "nullable": true
      },
      {
        "name": "numvalorcot",
        "type": "float(53)",
        "nullable": true
      },
      {
        "name": "SSMA_TimeStamp",
        "type": "timestamp",
        "nullable": false
      }
    ]
  },
  {
    "name": "tblConsolidadoValorCotizacionRealPagado",
    "columnCount": 3,
    "status": "activa",
    "module": "Sistema General",
    "pks": [],
    "columns": [
      {
        "name": "IdCotizacion",
        "type": "int",
        "nullable": true
      },
      {
        "name": "SumaDenumValor",
        "type": "float(53)",
        "nullable": true
      },
      {
        "name": "SSMA_TimeStamp",
        "type": "timestamp",
        "nullable": false
      }
    ]
  },
  {
    "name": "tblContratistas",
    "columnCount": 18,
    "status": "mapeada",
    "module": "Maestros - Contratistas",
    "pks": [
      "IdContratista",
      "IdAccesso"
    ],
    "columns": [
      {
        "name": "IdContratista",
        "type": "nvarchar(50)",
        "nullable": false,
        "isPK": true
      },
      {
        "name": "IdAccesso",
        "type": "int",
        "nullable": false,
        "isPK": true
      },
      {
        "name": "strNombre",
        "type": "nvarchar(255)",
        "nullable": true
      },
      {
        "name": "strTel",
        "type": "nvarchar(50)",
        "nullable": true
      },
      {
        "name": "strBeeper",
        "type": "nvarchar(50)",
        "nullable": true
      },
      {
        "name": "strDireccion",
        "type": "nvarchar(255)",
        "nullable": true
      },
      {
        "name": "strTipo",
        "type": "nvarchar(50)",
        "nullable": true
      },
      {
        "name": "strEspecialidad",
        "type": "nvarchar(50)",
        "nullable": true
      },
      {
        "name": "swActivo",
        "type": "bit",
        "nullable": true
      },
      {
        "name": "swTipo",
        "type": "nvarchar(50)",
        "nullable": true
      },
      {
        "name": "strContacto",
        "type": "nvarchar(255)",
        "nullable": true
      },
      {
        "name": "strFax",
        "type": "nvarchar(50)",
        "nullable": true
      },
      {
        "name": "strBanco",
        "type": "nvarchar(50)",
        "nullable": true
      },
      {
        "name": "strTipoCta",
        "type": "nvarchar(50)",
        "nullable": true
      },
      {
        "name": "strNumeroCta",
        "type": "nvarchar(50)",
        "nullable": true
      },
      {
        "name": "strNombreCta",
        "type": "nvarchar(255)",
        "nullable": true
      },
      {
        "name": "datNacimiento",
        "type": "datetime2(0)",
        "nullable": true
      },
      {
        "name": "SSMA_TimeStamp",
        "type": "timestamp",
        "nullable": false
      }
    ]
  },
  {
    "name": "tblCorrespondencia",
    "columnCount": 9,
    "status": "activa",
    "module": "Sistema General",
    "pks": [
      "IdCorrespondencia",
      "IdRegistro"
    ],
    "columns": [
      {
        "name": "IdCorrespondencia",
        "type": "int",
        "isIdentity": true,
        "nullable": true,
        "isPK": true
      },
      {
        "name": "IdRegistro",
        "type": "int",
        "nullable": false,
        "isPK": true
      },
      {
        "name": "strDestinario",
        "type": "nvarchar(50)",
        "nullable": true
      },
      {
        "name": "strCiudad",
        "type": "nvarchar(50)",
        "nullable": true
      },
      {
        "name": "strCargo",
        "type": "nvarchar(50)",
        "nullable": true
      },
      {
        "name": "strCorrespondencia",
        "type": "nvarchar(max)",
        "nullable": true
      },
      {
        "name": "datCorrespondencia",
        "type": "datetime2(0)",
        "nullable": true
      },
      {
        "name": "swCorrespondencia",
        "type": "int",
        "nullable": true
      },
      {
        "name": "SSMA_TimeStamp",
        "type": "timestamp",
        "nullable": false
      }
    ]
  },
  {
    "name": "tblCorte",
    "columnCount": 5,
    "status": "activa",
    "module": "Sistema General",
    "pks": [
      "Id"
    ],
    "columns": [
      {
        "name": "Id",
        "type": "int",
        "isIdentity": true,
        "nullable": true,
        "isPK": true
      },
      {
        "name": "IdRegistro",
        "type": "float(53)",
        "nullable": true
      },
      {
        "name": "strConcepto",
        "type": "nvarchar(255)",
        "nullable": true
      },
      {
        "name": "numValor",
        "type": "float(53)",
        "nullable": true
      },
      {
        "name": "SSMA_TimeStamp",
        "type": "timestamp",
        "nullable": false
      }
    ]
  },
  {
    "name": "tblCotizacion",
    "columnCount": 42,
    "status": "mapeada",
    "module": "Cotizaciones & Presupuestos",
    "pks": [],
    "columns": [
      {
        "name": "IdCotizacion",
        "type": "int",
        "isIdentity": true,
        "nullable": true,
        "isPK": true
      },
      {
        "name": "IdRegistro",
        "type": "int",
        "nullable": true
      },
      {
        "name": "datCotizacion",
        "type": "nvarchar(50)",
        "nullable": true
      },
      {
        "name": "memDescripcion",
        "type": "nvarchar(max)",
        "nullable": true
      },
      {
        "name": "numMaterial",
        "type": "float(53)",
        "nullable": true
      },
      {
        "name": "numManoObra",
        "type": "float(53)",
        "nullable": true
      },
      {
        "name": "strOtros",
        "type": "nvarchar(max)",
        "nullable": true
      },
      {
        "name": "num%Materiales",
        "type": "real",
        "nullable": true
      },
      {
        "name": "numManoObraContratista",
        "type": "real",
        "nullable": true
      },
      {
        "name": "numManoObraContratistaAut",
        "type": "real",
        "nullable": true
      },
      {
        "name": "numMaterialesContratista",
        "type": "float(53)",
        "nullable": true
      },
      {
        "name": "numTodoCosto",
        "type": "float(53)",
        "nullable": true
      },
      {
        "name": "IdContratistaEla",
        "type": "nvarchar(50)",
        "nullable": true
      },
      {
        "name": "numTodoCostoWDSCO",
        "type": "float(53)",
        "nullable": true
      },
      {
        "name": "SW",
        "type": "nvarchar(50)",
        "nullable": true
      },
      {
        "name": "IdContratista",
        "type": "nvarchar(50)",
        "nullable": true
      },
      {
        "name": "IdTiempoEje",
        "type": "nvarchar(50)",
        "nullable": true
      },
      {
        "name": "IdGarantia",
        "type": "nvarchar(50)",
        "nullable": true
      },
      {
        "name": "IdTransporteMat",
        "type": "nvarchar(50)",
        "nullable": true
      },
      {
        "name": "IdBotadaEscombros",
        "type": "nvarchar(50)",
        "nullable": true
      },
      {
        "name": "IdAlquilerEscaleraEquipo",
        "type": "nvarchar(50)",
        "nullable": true
      },
      {
        "name": "numCot",
        "type": "int",
        "nullable": true
      },
      {
        "name": "memGarantia",
        "type": "nvarchar(max)",
        "nullable": true
      },
      {
        "name": "HipAutorizacionCotizacion",
        "type": "nvarchar(max)",
        "nullable": true
      },
      {
        "name": "oleCotizacionesxTecnicos",
        "type": "varbinary(max)",
        "nullable": true
      },
      {
        "name": "datAutorizacionCotizacion",
        "type": "datetime2(0)",
        "nullable": true
      },
      {
        "name": "memCotizacionInfFinal",
        "type": "nvarchar(max)",
        "nullable": true
      },
      {
        "name": "numBotadaEscombros",
        "type": "float(53)",
        "nullable": true
      },
      {
        "name": "numAlquilerEquipo",
        "type": "float(53)",
        "nullable": true
      },
      {
        "name": "numMaterialGarantia",
        "type": "float(53)",
        "nullable": true
      },
      {
        "name": "numManoObraGarantia",
        "type": "float(53)",
        "nullable": true
      },
      {
        "name": "numTransporteGarantia",
        "type": "int",
        "nullable": true
      },
      {
        "name": "numBotadaEscombrosGarantia",
        "type": "float(53)",
        "nullable": true
      },
      {
        "name": "numAlquilerEquipoGarantia",
        "type": "float(53)",
        "nullable": true
      },
      {
        "name": "numAseo",
        "type": "int",
        "nullable": true
      },
      {
        "name": "numVrCotizacion",
        "type": "int",
        "nullable": true
      },
      {
        "name": "numVrComision",
        "type": "int",
        "nullable": true
      },
      {
        "name": "numBaseFactorCotizacion",
        "type": "real",
        "nullable": true
      },
      {
        "name": "numUtilidadNeta",
        "type": "int",
        "nullable": true
      },
      {
        "name": "numPorcentaje",
        "type": "float(53)",
        "nullable": true
      },
      {
        "name": "numTransporte",
        "type": "int",
        "nullable": true
      },
      {
        "name": "SSMA_TimeStamp",
        "type": "timestamp",
        "nullable": false
      }
    ]
  },
  {
    "name": "tblCotizacion1",
    "columnCount": 16,
    "status": "duplicada",
    "module": "Fusión / Fase 2",
    "pks": [
      "IdRegistro"
    ],
    "columns": [
      {
        "name": "IdCotizacion",
        "type": "int",
        "nullable": true
      },
      {
        "name": "IdRegistro",
        "type": "int",
        "nullable": false,
        "isPK": true
      },
      {
        "name": "datCotizacion",
        "type": "nvarchar(50)",
        "nullable": true
      },
      {
        "name": "memDescripcion",
        "type": "nvarchar(max)",
        "nullable": true
      },
      {
        "name": "numMaterial",
        "type": "float(53)",
        "nullable": true
      },
      {
        "name": "numManoObra",
        "type": "float(53)",
        "nullable": true
      },
      {
        "name": "numTransporte",
        "type": "int",
        "nullable": true
      },
      {
        "name": "strOtros",
        "type": "nvarchar(max)",
        "nullable": true
      },
      {
        "name": "num%Materiales",
        "type": "real",
        "nullable": true
      },
      {
        "name": "numManoObraContratista",
        "type": "real",
        "nullable": true
      },
      {
        "name": "numMaterialesContratista",
        "type": "float(53)",
        "nullable": true
      },
      {
        "name": "numTodoCosto",
        "type": "float(53)",
        "nullable": true
      },
      {
        "name": "IdContratistaEla",
        "type": "nvarchar(50)",
        "nullable": true
      },
      {
        "name": "numTodoCostoWDSCO",
        "type": "float(53)",
        "nullable": true
      },
      {
        "name": "SW",
        "type": "nvarchar(50)",
        "nullable": true
      },
      {
        "name": "SSMA_TimeStamp",
        "type": "timestamp",
        "nullable": false
      }
    ]
  },
  {
    "name": "tblCotizacionCopia",
    "columnCount": 23,
    "status": "duplicada",
    "module": "Fusión / Fase 2",
    "pks": [
      "IdCotizacion",
      "IdRegistro"
    ],
    "columns": [
      {
        "name": "IdCotizacion",
        "type": "int",
        "isIdentity": true,
        "nullable": true,
        "isPK": true
      },
      {
        "name": "IdRegistro",
        "type": "int",
        "nullable": false,
        "isPK": true
      },
      {
        "name": "datCotizacion",
        "type": "nvarchar(50)",
        "nullable": true
      },
      {
        "name": "memDescripcion",
        "type": "nvarchar(max)",
        "nullable": true
      },
      {
        "name": "numMaterial",
        "type": "float(53)",
        "nullable": true
      },
      {
        "name": "numManoObra",
        "type": "float(53)",
        "nullable": true
      },
      {
        "name": "numTransporte",
        "type": "int",
        "nullable": true
      },
      {
        "name": "strOtros",
        "type": "nvarchar(max)",
        "nullable": true
      },
      {
        "name": "num%Materiales",
        "type": "real",
        "nullable": true
      },
      {
        "name": "numManoObraContratista",
        "type": "real",
        "nullable": true
      },
      {
        "name": "numManoObraContratistaAut",
        "type": "real",
        "nullable": true
      },
      {
        "name": "numMaterialesContratista",
        "type": "float(53)",
        "nullable": true
      },
      {
        "name": "numTodoCosto",
        "type": "float(53)",
        "nullable": true
      },
      {
        "name": "IdContratistaEla",
        "type": "nvarchar(50)",
        "nullable": true
      },
      {
        "name": "numTodoCostoWDSCO",
        "type": "float(53)",
        "nullable": true
      },
      {
        "name": "SW",
        "type": "nvarchar(50)",
        "nullable": true
      },
      {
        "name": "IdContratista",
        "type": "nvarchar(50)",
        "nullable": true
      },
      {
        "name": "IdTiempoEje",
        "type": "nvarchar(50)",
        "nullable": true
      },
      {
        "name": "IdGarantia",
        "type": "nvarchar(50)",
        "nullable": true
      },
      {
        "name": "IdTransporteMat",
        "type": "nvarchar(50)",
        "nullable": true
      },
      {
        "name": "IdBotadaEscombros",
        "type": "nvarchar(50)",
        "nullable": true
      },
      {
        "name": "IdAlquilerEscaleraEquipo",
        "type": "nvarchar(50)",
        "nullable": true
      },
      {
        "name": "SSMA_TimeStamp",
        "type": "timestamp",
        "nullable": false
      }
    ]
  },
  {
    "name": "tblCotizacionUno",
    "columnCount": 23,
    "status": "duplicada",
    "module": "Fusión / Fase 2",
    "pks": [
      "IdCotizacion",
      "IdRegistro"
    ],
    "columns": [
      {
        "name": "IdCotizacion",
        "type": "int",
        "isIdentity": true,
        "nullable": true,
        "isPK": true
      },
      {
        "name": "IdRegistro",
        "type": "int",
        "nullable": false,
        "isPK": true
      },
      {
        "name": "datCotizacion",
        "type": "nvarchar(50)",
        "nullable": true
      },
      {
        "name": "memDescripcion",
        "type": "nvarchar(max)",
        "nullable": true
      },
      {
        "name": "numMaterial",
        "type": "float(53)",
        "nullable": true
      },
      {
        "name": "numManoObra",
        "type": "float(53)",
        "nullable": true
      },
      {
        "name": "numTransporte",
        "type": "int",
        "nullable": true
      },
      {
        "name": "strOtros",
        "type": "nvarchar(max)",
        "nullable": true
      },
      {
        "name": "num%Materiales",
        "type": "real",
        "nullable": true
      },
      {
        "name": "numManoObraContratista",
        "type": "real",
        "nullable": true
      },
      {
        "name": "numManoObraContratistaAut",
        "type": "real",
        "nullable": true
      },
      {
        "name": "numMaterialesContratista",
        "type": "float(53)",
        "nullable": true
      },
      {
        "name": "numTodoCosto",
        "type": "float(53)",
        "nullable": true
      },
      {
        "name": "IdContratistaEla",
        "type": "nvarchar(50)",
        "nullable": true
      },
      {
        "name": "numTodoCostoWDSCO",
        "type": "float(53)",
        "nullable": true
      },
      {
        "name": "SW",
        "type": "nvarchar(50)",
        "nullable": true
      },
      {
        "name": "IdContratista",
        "type": "nvarchar(50)",
        "nullable": true
      },
      {
        "name": "IdTiempoEje",
        "type": "nvarchar(50)",
        "nullable": true
      },
      {
        "name": "IdGarantia",
        "type": "nvarchar(50)",
        "nullable": true
      },
      {
        "name": "IdTransporteMat",
        "type": "nvarchar(50)",
        "nullable": true
      },
      {
        "name": "IdBotadaEscombros",
        "type": "nvarchar(50)",
        "nullable": true
      },
      {
        "name": "IdAlquilerEscaleraEquipo",
        "type": "nvarchar(50)",
        "nullable": true
      },
      {
        "name": "SSMA_TimeStamp",
        "type": "timestamp",
        "nullable": false
      }
    ]
  },
  {
    "name": "tblCtasCobro",
    "columnCount": 10,
    "status": "duplicada",
    "module": "Fusión / Fase 2",
    "pks": [],
    "columns": [
      {
        "name": "IdRegistro",
        "type": "int",
        "nullable": true
      },
      {
        "name": "IdCotizacion",
        "type": "int",
        "nullable": true
      },
      {
        "name": "IdFactura",
        "type": "int",
        "nullable": true
      },
      {
        "name": "NumTotal",
        "type": "float(53)",
        "nullable": true
      },
      {
        "name": "IdCta",
        "type": "float(53)",
        "nullable": true
      },
      {
        "name": "IdCrDe",
        "type": "float(53)",
        "nullable": true
      },
      {
        "name": "numPorcentaje",
        "type": "real",
        "nullable": true
      },
      {
        "name": "IdCtaSer",
        "type": "float(53)",
        "nullable": true
      },
      {
        "name": "IdCrDeSer",
        "type": "float(53)",
        "nullable": true
      },
      {
        "name": "SSMA_TimeStamp",
        "type": "timestamp",
        "nullable": false
      }
    ]
  },
  {
    "name": "tblCuentasCobro",
    "columnCount": 11,
    "status": "mapeada",
    "module": "Contable - Cuentas de Cobro",
    "pks": [
      "IdCtaCobro",
      "IdRegistro",
      "IdCotización"
    ],
    "columns": [
      {
        "name": "strContratante",
        "type": "nvarchar(50)",
        "nullable": true
      },
      {
        "name": "IdCtaCobro",
        "type": "int",
        "isIdentity": true,
        "nullable": true,
        "isPK": true
      },
      {
        "name": "IdRegistro",
        "type": "int",
        "nullable": false,
        "isPK": true
      },
      {
        "name": "IdCotización",
        "type": "int",
        "nullable": false,
        "isPK": true
      },
      {
        "name": "IdFactura",
        "type": "int",
        "nullable": true
      },
      {
        "name": "datCtaCobro",
        "type": "datetime2(0)",
        "nullable": true
      },
      {
        "name": "memDescripcion",
        "type": "nvarchar(max)",
        "nullable": true
      },
      {
        "name": "numPagado",
        "type": "float(53)",
        "nullable": true
      },
      {
        "name": "memRecomendaciones",
        "type": "nvarchar(max)",
        "nullable": true
      },
      {
        "name": "swCargado",
        "type": "nvarchar(50)",
        "nullable": true
      },
      {
        "name": "SSMA_TimeStamp",
        "type": "timestamp",
        "nullable": false
      }
    ]
  },
  {
    "name": "tblCuentasCobro1",
    "columnCount": 8,
    "status": "duplicada",
    "module": "Fusión / Fase 2",
    "pks": [
      "IdCtaCobro",
      "IdRegistro"
    ],
    "columns": [
      {
        "name": "strContratante",
        "type": "nvarchar(50)",
        "nullable": true
      },
      {
        "name": "IdCtaCobro",
        "type": "int",
        "isIdentity": true,
        "nullable": true,
        "isPK": true
      },
      {
        "name": "IdRegistro",
        "type": "int",
        "nullable": false,
        "isPK": true
      },
      {
        "name": "datCtaCobro",
        "type": "datetime2(0)",
        "nullable": true
      },
      {
        "name": "memDescripcion",
        "type": "nvarchar(max)",
        "nullable": true
      },
      {
        "name": "numPagado",
        "type": "float(53)",
        "nullable": true
      },
      {
        "name": "memRecomendaciones",
        "type": "nvarchar(max)",
        "nullable": true
      },
      {
        "name": "SSMA_TimeStamp",
        "type": "timestamp",
        "nullable": false
      }
    ]
  },
  {
    "name": "tblDesCotizacion",
    "columnCount": 14,
    "status": "mapeada",
    "module": "Detalle de Cotizaciones",
    "pks": [
      "IdRegistro",
      "IdCotizacion",
      "IdElemento"
    ],
    "columns": [
      {
        "name": "IdRegistro",
        "type": "int",
        "isIdentity": true,
        "nullable": true,
        "isPK": true
      },
      {
        "name": "IdCotizacion",
        "type": "int",
        "nullable": false,
        "isPK": true
      },
      {
        "name": "IdElemento",
        "type": "int",
        "nullable": false,
        "isPK": true
      },
      {
        "name": "IdCodigoElemento",
        "type": "nvarchar(50)",
        "nullable": true
      },
      {
        "name": "IdAmbiente",
        "type": "int",
        "nullable": true
      },
      {
        "name": "strDescripcion",
        "type": "nvarchar(255)",
        "nullable": true
      },
      {
        "name": "numVr",
        "type": "float(53)",
        "nullable": true
      },
      {
        "name": "numCan",
        "type": "real",
        "nullable": true
      },
      {
        "name": "numCanTec",
        "type": "real",
        "nullable": true
      },
      {
        "name": "swCargado",
        "type": "int",
        "nullable": true
      },
      {
        "name": "strUnidad",
        "type": "nvarchar(50)",
        "nullable": true
      },
      {
        "name": "IdContratista",
        "type": "nvarchar(50)",
        "nullable": true
      },
      {
        "name": "swActualizado",
        "type": "int",
        "nullable": true
      },
      {
        "name": "SSMA_TimeStamp",
        "type": "timestamp",
        "nullable": false
      }
    ]
  },
  {
    "name": "tblDesCotizacionAmbientes",
    "columnCount": 3,
    "status": "activa",
    "module": "Sistema General",
    "pks": [
      "IdRegistro",
      "IdCotizacion",
      "IdAmbiente"
    ],
    "columns": [
      {
        "name": "IdRegistro",
        "type": "int",
        "isIdentity": true,
        "nullable": true,
        "isPK": true
      },
      {
        "name": "IdCotizacion",
        "type": "int",
        "nullable": false,
        "isPK": true
      },
      {
        "name": "IdAmbiente",
        "type": "int",
        "nullable": false,
        "isPK": true
      }
    ]
  },
  {
    "name": "tblDesCotizacionGarantias",
    "columnCount": 3,
    "status": "activa",
    "module": "Sistema General",
    "pks": [
      "IdRegistro",
      "IdCotizacion",
      "IdGarantia"
    ],
    "columns": [
      {
        "name": "IdRegistro",
        "type": "int",
        "isIdentity": true,
        "nullable": true,
        "isPK": true
      },
      {
        "name": "IdCotizacion",
        "type": "int",
        "nullable": false,
        "isPK": true
      },
      {
        "name": "IdGarantia",
        "type": "int",
        "nullable": false,
        "isPK": true
      }
    ]
  },
  {
    "name": "tblEgresos",
    "columnCount": 8,
    "status": "mapeada",
    "module": "Contable - C Egresos",
    "pks": [
      "IdEgreso",
      "IdContratista",
      "IdRegistro"
    ],
    "columns": [
      {
        "name": "IdEgreso",
        "type": "int",
        "isIdentity": true,
        "nullable": true,
        "isPK": true
      },
      {
        "name": "IdContratista",
        "type": "nvarchar(50)",
        "nullable": false,
        "isPK": true
      },
      {
        "name": "IdRegistro",
        "type": "int",
        "nullable": false,
        "isPK": true
      },
      {
        "name": "strConcepto",
        "type": "nvarchar(max)",
        "nullable": true
      },
      {
        "name": "datFecha",
        "type": "datetime2(0)",
        "nullable": true
      },
      {
        "name": "numValor",
        "type": "float(53)",
        "nullable": true
      },
      {
        "name": "IdPago",
        "type": "int",
        "nullable": true
      },
      {
        "name": "SSMA_TimeStamp",
        "type": "timestamp",
        "nullable": false
      }
    ]
  },
  {
    "name": "tblEgresos_Liq_Tecnicos",
    "columnCount": 7,
    "status": "activa",
    "module": "Sistema General",
    "pks": [
      "IdEgresoLiqTec",
      "IdEgreso",
      "IdRegistro"
    ],
    "columns": [
      {
        "name": "IdEgresoLiqTec",
        "type": "int",
        "isIdentity": true,
        "nullable": true,
        "isPK": true
      },
      {
        "name": "IdEgreso",
        "type": "int",
        "nullable": false,
        "isPK": true
      },
      {
        "name": "IdRegistro",
        "type": "int",
        "nullable": false,
        "isPK": true
      },
      {
        "name": "numValor",
        "type": "float(53)",
        "nullable": true
      },
      {
        "name": "swCargar",
        "type": "nvarchar(50)",
        "nullable": true
      },
      {
        "name": "IdCotizacion",
        "type": "int",
        "nullable": true
      },
      {
        "name": "SSMA_TimeStamp",
        "type": "timestamp",
        "nullable": false
      }
    ]
  },
  {
    "name": "tblEjecucionTrabajos",
    "columnCount": 11,
    "status": "activa",
    "module": "Sistema General",
    "pks": [
      "IdConsecutivoEjecutado",
      "IdRegistro",
      "IdContratista"
    ],
    "columns": [
      {
        "name": "IdConsecutivoEjecutado",
        "type": "int",
        "isIdentity": true,
        "nullable": true,
        "isPK": true
      },
      {
        "name": "IdRegistro",
        "type": "int",
        "nullable": false,
        "isPK": true
      },
      {
        "name": "IdContratista",
        "type": "nvarchar(50)",
        "nullable": false,
        "isPK": true
      },
      {
        "name": "datFechaAutorizado",
        "type": "datetime2(0)",
        "nullable": true
      },
      {
        "name": "strAutoriza",
        "type": "nvarchar(50)",
        "nullable": true
      },
      {
        "name": "strNotaFinal",
        "type": "nvarchar(max)",
        "nullable": true
      },
      {
        "name": "strComentario",
        "type": "nvarchar(max)",
        "nullable": true
      },
      {
        "name": "datFechaInicio",
        "type": "datetime2(0)",
        "nullable": true
      },
      {
        "name": "datFechaProgFinaliza",
        "type": "datetime2(0)",
        "nullable": true
      },
      {
        "name": "datFechaFinalizado",
        "type": "datetime2(0)",
        "nullable": true
      },
      {
        "name": "SSMA_TimeStamp",
        "type": "timestamp",
        "nullable": false
      }
    ]
  },
  {
    "name": "tblEntregaMateriales",
    "columnCount": 20,
    "status": "mapeada",
    "module": "Operaciones - Entrega Materiales",
    "pks": [
      "IdOrden",
      "IdRegistro",
      "IdContratista"
    ],
    "columns": [
      {
        "name": "IdOrden",
        "type": "int",
        "isIdentity": true,
        "nullable": true,
        "isPK": true
      },
      {
        "name": "IdRegistro",
        "type": "int",
        "nullable": false,
        "isPK": true
      },
      {
        "name": "IdContratista",
        "type": "nvarchar(50)",
        "nullable": false,
        "isPK": true
      },
      {
        "name": "datFecha",
        "type": "datetime2(0)",
        "nullable": true
      },
      {
        "name": "strDescripcion",
        "type": "nvarchar(255)",
        "nullable": true
      },
      {
        "name": "str1",
        "type": "nvarchar(50)",
        "nullable": true
      },
      {
        "name": "str2",
        "type": "nvarchar(50)",
        "nullable": true
      },
      {
        "name": "str3",
        "type": "nvarchar(50)",
        "nullable": true
      },
      {
        "name": "str4",
        "type": "nvarchar(50)",
        "nullable": true
      },
      {
        "name": "str5",
        "type": "nvarchar(50)",
        "nullable": true
      },
      {
        "name": "str6",
        "type": "nvarchar(50)",
        "nullable": true
      },
      {
        "name": "str7",
        "type": "nvarchar(50)",
        "nullable": true
      },
      {
        "name": "str8",
        "type": "nvarchar(50)",
        "nullable": true
      },
      {
        "name": "str9",
        "type": "nvarchar(50)",
        "nullable": true
      },
      {
        "name": "str10",
        "type": "nvarchar(50)",
        "nullable": true
      },
      {
        "name": "str11",
        "type": "nvarchar(50)",
        "nullable": true
      },
      {
        "name": "str12",
        "type": "nvarchar(50)",
        "nullable": true
      },
      {
        "name": "numTransporte",
        "type": "float(53)",
        "nullable": true
      },
      {
        "name": "numMateriales",
        "type": "float(53)",
        "nullable": true
      },
      {
        "name": "SSMA_TimeStamp",
        "type": "timestamp",
        "nullable": false
      }
    ]
  },
  {
    "name": "tblEstadisticas",
    "columnCount": 6,
    "status": "activa",
    "module": "Sistema General",
    "pks": [],
    "columns": [
      {
        "name": "Años",
        "type": "smallint",
        "nullable": true
      },
      {
        "name": "Meses",
        "type": "smallint",
        "nullable": true
      },
      {
        "name": "IdEventos",
        "type": "float(53)",
        "nullable": true
      },
      {
        "name": "strEventos",
        "type": "nvarchar(50)",
        "nullable": true
      },
      {
        "name": "IdContratante",
        "type": "float(53)",
        "nullable": true
      },
      {
        "name": "SSMA_TimeStamp",
        "type": "timestamp",
        "nullable": false
      }
    ]
  },
  {
    "name": "tblEstado",
    "columnCount": 2,
    "status": "activa",
    "module": "Sistema General",
    "pks": [
      "IdEstado"
    ],
    "columns": [
      {
        "name": "IdEstado",
        "type": "int",
        "isIdentity": true,
        "nullable": true,
        "isPK": true
      },
      {
        "name": "strEstado",
        "type": "nvarchar(50)",
        "nullable": true
      }
    ]
  },
  {
    "name": "tblEventoHerramienta",
    "columnCount": 3,
    "status": "activa",
    "module": "Sistema General",
    "pks": [
      "Id"
    ],
    "columns": [
      {
        "name": "Id",
        "type": "int",
        "isIdentity": true,
        "nullable": true,
        "isPK": true
      },
      {
        "name": "IdEventos",
        "type": "int",
        "nullable": true
      },
      {
        "name": "IdHtaEquipo",
        "type": "int",
        "nullable": true
      }
    ]
  },
  {
    "name": "tblEventos",
    "columnCount": 4,
    "status": "activa",
    "module": "Sistema General",
    "pks": [
      "IdEventos"
    ],
    "columns": [
      {
        "name": "IdEventos",
        "type": "float(53)",
        "nullable": false,
        "isPK": true
      },
      {
        "name": "strEventos",
        "type": "nvarchar(50)",
        "nullable": true
      },
      {
        "name": "datEventos",
        "type": "datetime2(0)",
        "nullable": true
      },
      {
        "name": "SSMA_TimeStamp",
        "type": "timestamp",
        "nullable": false
      }
    ]
  },
  {
    "name": "tblFactorCotizacion",
    "columnCount": 7,
    "status": "activa",
    "module": "Sistema General",
    "pks": [
      "IdIncremento"
    ],
    "columns": [
      {
        "name": "IdIncremento",
        "type": "int",
        "nullable": false,
        "isPK": true
      },
      {
        "name": "IDSectorRef",
        "type": "int",
        "nullable": true
      },
      {
        "name": "strZona",
        "type": "nvarchar(255)",
        "nullable": true
      },
      {
        "name": "numVrTarifaTec",
        "type": "int",
        "nullable": true
      },
      {
        "name": "numVrTarifaTteTec",
        "type": "int",
        "nullable": true
      },
      {
        "name": "numVrBaseTteMat",
        "type": "int",
        "nullable": true
      },
      {
        "name": "numVrTarifaFinal",
        "type": "int",
        "nullable": true
      }
    ]
  },
  {
    "name": "tblFacturasVenta",
    "columnCount": 10,
    "status": "activa",
    "module": "Sistema General",
    "pks": [
      "IdFactura",
      "IdRegistro",
      "IdCotización"
    ],
    "columns": [
      {
        "name": "IdFactura",
        "type": "int",
        "isIdentity": true,
        "nullable": true,
        "isPK": true
      },
      {
        "name": "IdRegistro",
        "type": "int",
        "nullable": false,
        "isPK": true
      },
      {
        "name": "IdCotización",
        "type": "int",
        "nullable": false,
        "isPK": true
      },
      {
        "name": "datFactura",
        "type": "datetime2(0)",
        "nullable": true
      },
      {
        "name": "memDescripcion",
        "type": "nvarchar(max)",
        "nullable": true
      },
      {
        "name": "numFactura",
        "type": "int",
        "nullable": true
      },
      {
        "name": "numMateriales",
        "type": "float(53)",
        "nullable": true
      },
      {
        "name": "numServicioMto",
        "type": "float(53)",
        "nullable": true
      },
      {
        "name": "numManoObra",
        "type": "float(53)",
        "nullable": true
      },
      {
        "name": "SSMA_TimeStamp",
        "type": "timestamp",
        "nullable": false
      }
    ]
  },
  {
    "name": "tblFINConsolidadoEgresos",
    "columnCount": 4,
    "status": "activa",
    "module": "Sistema General",
    "pks": [],
    "columns": [
      {
        "name": "IdCotizacion",
        "type": "int",
        "nullable": true
      },
      {
        "name": "IdRegistro",
        "type": "int",
        "nullable": true
      },
      {
        "name": "SumaDenumValor",
        "type": "float(53)",
        "nullable": true
      },
      {
        "name": "SSMA_TimeStamp",
        "type": "timestamp",
        "nullable": false
      }
    ]
  },
  {
    "name": "tblFINConsolidadoRecibosCaja",
    "columnCount": 3,
    "status": "activa",
    "module": "Sistema General",
    "pks": [],
    "columns": [
      {
        "name": "IdRegistro",
        "type": "int",
        "nullable": true
      },
      {
        "name": "SumaDenumValor",
        "type": "float(53)",
        "nullable": true
      },
      {
        "name": "SSMA_TimeStamp",
        "type": "timestamp",
        "nullable": false
      }
    ]
  },
  {
    "name": "tblFINConsolidadoxCotizacion",
    "columnCount": 7,
    "status": "activa",
    "module": "Sistema General",
    "pks": [],
    "columns": [
      {
        "name": "IdElemento",
        "type": "int",
        "nullable": true
      },
      {
        "name": "IdCotizacion",
        "type": "int",
        "isIdentity": true,
        "nullable": true,
        "isPK": true
      },
      {
        "name": "strDescripcion",
        "type": "nvarchar(255)",
        "nullable": true
      },
      {
        "name": "numVr",
        "type": "float(53)",
        "nullable": true
      },
      {
        "name": "numCan",
        "type": "real",
        "nullable": true
      },
      {
        "name": "numValorCotizacion",
        "type": "float(53)",
        "nullable": true
      },
      {
        "name": "SSMA_TimeStamp",
        "type": "timestamp",
        "nullable": false
      }
    ]
  },
  {
    "name": "tblFINCreacionTblValorxCotizaciones",
    "columnCount": 3,
    "status": "activa",
    "module": "Sistema General",
    "pks": [],
    "columns": [
      {
        "name": "IdCotizacion",
        "type": "int",
        "isIdentity": true,
        "nullable": true,
        "isPK": true
      },
      {
        "name": "SumaDenumValorCotizacion",
        "type": "float(53)",
        "nullable": true
      },
      {
        "name": "SSMA_TimeStamp",
        "type": "timestamp",
        "nullable": false
      }
    ]
  },
  {
    "name": "tblFirmaContrato",
    "columnCount": 20,
    "status": "activa",
    "module": "Sistema General",
    "pks": [],
    "columns": [
      {
        "name": "IdRegistro",
        "type": "int",
        "isIdentity": true,
        "nullable": true,
        "isPK": true
      },
      {
        "name": "tblReportes_strDireccion",
        "type": "nvarchar(255)",
        "nullable": true
      },
      {
        "name": "strPropietario",
        "type": "nvarchar(255)",
        "nullable": true
      },
      {
        "name": "strContratante",
        "type": "nvarchar(50)",
        "nullable": true
      },
      {
        "name": "IdContratista",
        "type": "nvarchar(50)",
        "nullable": true
      },
      {
        "name": "strNombre",
        "type": "nvarchar(255)",
        "nullable": true
      },
      {
        "name": "memDescripcion",
        "type": "nvarchar(max)",
        "nullable": true
      },
      {
        "name": "strReporte",
        "type": "nvarchar(max)",
        "nullable": true
      },
      {
        "name": "numManoObra",
        "type": "float(53)",
        "nullable": true
      },
      {
        "name": "IdGarantia",
        "type": "nvarchar(50)",
        "nullable": true
      },
      {
        "name": "IdTransporteMat",
        "type": "nvarchar(50)",
        "nullable": true
      },
      {
        "name": "IdBotadaEscombros",
        "type": "nvarchar(50)",
        "nullable": true
      },
      {
        "name": "IdTiempoEje",
        "type": "nvarchar(50)",
        "nullable": true
      },
      {
        "name": "numCot",
        "type": "int",
        "nullable": true
      },
      {
        "name": "datFecha",
        "type": "datetime2(0)",
        "nullable": true
      },
      {
        "name": "tblContratistas_strDireccion",
        "type": "nvarchar(255)",
        "nullable": true
      },
      {
        "name": "strTel",
        "type": "nvarchar(50)",
        "nullable": true
      },
      {
        "name": "VrLetras",
        "type": "nvarchar(255)",
        "nullable": true
      },
      {
        "name": "memGarantia",
        "type": "nvarchar(max)",
        "nullable": true
      },
      {
        "name": "SSMA_TimeStamp",
        "type": "timestamp",
        "nullable": false
      }
    ]
  },
  {
    "name": "tblGarantias",
    "columnCount": 5,
    "status": "activa",
    "module": "Sistema General",
    "pks": [
      "IdGarantia"
    ],
    "columns": [
      {
        "name": "IdGarantia",
        "type": "int",
        "isIdentity": true,
        "nullable": true,
        "isPK": true
      },
      {
        "name": "strGarantia",
        "type": "nvarchar(255)",
        "nullable": true
      },
      {
        "name": "memGarantia",
        "type": "nvarchar(max)",
        "nullable": true
      },
      {
        "name": "strTiempoGarantia",
        "type": "nvarchar(50)",
        "nullable": true
      },
      {
        "name": "SSMA_TimeStamp",
        "type": "timestamp",
        "nullable": false
      }
    ]
  },
  {
    "name": "tblGeneralResultadoFinacieroxCotizacion",
    "columnCount": 18,
    "status": "activa",
    "module": "Sistema General",
    "pks": [
      "IdCotizacion"
    ],
    "columns": [
      {
        "name": "IdCotizacion",
        "type": "int",
        "nullable": false,
        "isPK": true
      },
      {
        "name": "numvalorcot",
        "type": "float(53)",
        "nullable": true
      },
      {
        "name": "SumaDenumValor",
        "type": "float(53)",
        "nullable": true
      },
      {
        "name": "numMat",
        "type": "int",
        "nullable": true
      },
      {
        "name": "numTte",
        "type": "int",
        "nullable": true
      },
      {
        "name": "numEsc",
        "type": "int",
        "nullable": true
      },
      {
        "name": "numMO",
        "type": "int",
        "nullable": true
      },
      {
        "name": "numAlqEq",
        "type": "int",
        "nullable": true
      },
      {
        "name": "numGastosReales",
        "type": "int",
        "nullable": true
      },
      {
        "name": "numMat%",
        "type": "real",
        "nullable": true
      },
      {
        "name": "numTte%",
        "type": "real",
        "nullable": true
      },
      {
        "name": "numEsc%",
        "type": "real",
        "nullable": true
      },
      {
        "name": "numAlqEq%",
        "type": "real",
        "nullable": true
      },
      {
        "name": "numCom",
        "type": "real",
        "nullable": true
      },
      {
        "name": "numPyG",
        "type": "int",
        "nullable": true
      },
      {
        "name": "numMO%",
        "type": "real",
        "nullable": true
      },
      {
        "name": "numPyG%",
        "type": "real",
        "nullable": true
      },
      {
        "name": "SSMA_TimeStamp",
        "type": "timestamp",
        "nullable": false
      }
    ]
  },
  {
    "name": "tblGeneralxConceptoxCotizacio",
    "columnCount": 4,
    "status": "activa",
    "module": "Sistema General",
    "pks": [],
    "columns": [
      {
        "name": "IdCotizacion",
        "type": "int",
        "nullable": true
      },
      {
        "name": "SumaDenumValor",
        "type": "float(53)",
        "nullable": true
      },
      {
        "name": "IdRegistro",
        "type": "int",
        "nullable": true
      },
      {
        "name": "SSMA_TimeStamp",
        "type": "timestamp",
        "nullable": false
      }
    ]
  },
  {
    "name": "tblGrupo",
    "columnCount": 3,
    "status": "activa",
    "module": "Sistema General",
    "pks": [
      "IdClase",
      "IdGrupo"
    ],
    "columns": [
      {
        "name": "IdClase",
        "type": "int",
        "nullable": false,
        "isPK": true
      },
      {
        "name": "IdGrupo",
        "type": "int",
        "nullable": false,
        "isPK": true
      },
      {
        "name": "strDescripcion",
        "type": "nvarchar(255)",
        "nullable": true
      }
    ]
  },
  {
    "name": "tblGrupoHerramientas",
    "columnCount": 2,
    "status": "activa",
    "module": "Sistema General",
    "pks": [
      "IdGrupoHta"
    ],
    "columns": [
      {
        "name": "IdGrupoHta",
        "type": "int",
        "isIdentity": true,
        "nullable": true,
        "isPK": true
      },
      {
        "name": "strGrupo",
        "type": "nvarchar(255)",
        "nullable": true
      }
    ]
  },
  {
    "name": "tblHerramientas",
    "columnCount": 10,
    "status": "mapeada",
    "module": "Operaciones - Herramientas",
    "pks": [
      "IdHerramienta"
    ],
    "columns": [
      {
        "name": "IdHerramienta",
        "type": "int",
        "isIdentity": true,
        "nullable": true,
        "isPK": true
      },
      {
        "name": "IdGrupoHta",
        "type": "int",
        "nullable": true
      },
      {
        "name": "strHerramienta",
        "type": "nvarchar(255)",
        "nullable": true
      },
      {
        "name": "strMarca",
        "type": "nvarchar(255)",
        "nullable": true
      },
      {
        "name": "oleHta",
        "type": "varbinary(max)",
        "nullable": true
      },
      {
        "name": "strObservacion",
        "type": "nvarchar(255)",
        "nullable": true
      },
      {
        "name": "numCantidad",
        "type": "int",
        "nullable": true
      },
      {
        "name": "strEstado",
        "type": "nvarchar(255)",
        "nullable": true
      },
      {
        "name": "swVerificado",
        "type": "bit",
        "nullable": true
      },
      {
        "name": "SSMA_TimeStamp",
        "type": "timestamp",
        "nullable": false
      }
    ]
  },
  {
    "name": "tblInforme",
    "columnCount": 5,
    "status": "mapeada",
    "module": "Informes - Informes de Obra",
    "pks": [
      "IdInformeConsecutivo",
      "IdRegistro"
    ],
    "columns": [
      {
        "name": "IdInformeConsecutivo",
        "type": "int",
        "isIdentity": true,
        "nullable": true,
        "isPK": true
      },
      {
        "name": "IdRegistro",
        "type": "int",
        "nullable": false,
        "isPK": true
      },
      {
        "name": "datFecha",
        "type": "datetime2(0)",
        "nullable": true
      },
      {
        "name": "memComentario",
        "type": "nvarchar(max)",
        "nullable": true
      },
      {
        "name": "SSMA_TimeStamp",
        "type": "timestamp",
        "nullable": false
      }
    ]
  },
  {
    "name": "tblInforme1",
    "columnCount": 5,
    "status": "duplicada",
    "module": "Fusión / Fase 2",
    "pks": [
      "IdInformeConsecutivo",
      "IdRegistro"
    ],
    "columns": [
      {
        "name": "IdInformeConsecutivo",
        "type": "int",
        "isIdentity": true,
        "nullable": true,
        "isPK": true
      },
      {
        "name": "IdRegistro",
        "type": "int",
        "nullable": false,
        "isPK": true
      },
      {
        "name": "datFecha",
        "type": "datetime2(0)",
        "nullable": true
      },
      {
        "name": "memComentario",
        "type": "nvarchar(max)",
        "nullable": true
      },
      {
        "name": "SSMA_TimeStamp",
        "type": "timestamp",
        "nullable": false
      }
    ]
  },
  {
    "name": "tblInforme2009",
    "columnCount": 7,
    "status": "duplicada",
    "module": "Fusión / Fase 2",
    "pks": [],
    "columns": [
      {
        "name": "IdContratista",
        "type": "nvarchar(50)",
        "nullable": true
      },
      {
        "name": "strNombre",
        "type": "nvarchar(255)",
        "nullable": true
      },
      {
        "name": "strConcepto",
        "type": "nvarchar(max)",
        "nullable": true
      },
      {
        "name": "datFecha",
        "type": "datetime2(0)",
        "nullable": true
      },
      {
        "name": "SumaDenumValor",
        "type": "float(53)",
        "nullable": true
      },
      {
        "name": "IdRegistro",
        "type": "int",
        "nullable": true
      },
      {
        "name": "SSMA_TimeStamp",
        "type": "timestamp",
        "nullable": false
      }
    ]
  },
  {
    "name": "tblInformeAnual",
    "columnCount": 7,
    "status": "activa",
    "module": "Sistema General",
    "pks": [],
    "columns": [
      {
        "name": "IdContratista",
        "type": "nvarchar(50)",
        "nullable": true
      },
      {
        "name": "strNombre",
        "type": "nvarchar(255)",
        "nullable": true
      },
      {
        "name": "strConcepto",
        "type": "nvarchar(max)",
        "nullable": true
      },
      {
        "name": "datFecha",
        "type": "datetime2(0)",
        "nullable": true
      },
      {
        "name": "SumaDenumValor",
        "type": "float(53)",
        "nullable": true
      },
      {
        "name": "IdRegistro",
        "type": "int",
        "nullable": true
      },
      {
        "name": "SSMA_TimeStamp",
        "type": "timestamp",
        "nullable": false
      }
    ]
  },
  {
    "name": "tblInsumos",
    "columnCount": 8,
    "status": "activa",
    "module": "Sistema General",
    "pks": [
      "IdElemento",
      "IdGrupo"
    ],
    "columns": [
      {
        "name": "IdElemento",
        "type": "int",
        "isIdentity": true,
        "nullable": true,
        "isPK": true
      },
      {
        "name": "IdGrupo",
        "type": "int",
        "nullable": false,
        "isPK": true
      },
      {
        "name": "strRef",
        "type": "nvarchar(50)",
        "nullable": true
      },
      {
        "name": "strDescripcion",
        "type": "nvarchar(50)",
        "nullable": true
      },
      {
        "name": "strUnidad",
        "type": "nvarchar(50)",
        "nullable": true
      },
      {
        "name": "numValorVenta",
        "type": "float(53)",
        "nullable": true
      },
      {
        "name": "numValorCompra",
        "type": "float(53)",
        "nullable": true
      },
      {
        "name": "SSMA_TimeStamp",
        "type": "timestamp",
        "nullable": false
      }
    ]
  },
  {
    "name": "tblLiquidacion",
    "columnCount": 7,
    "status": "activa",
    "module": "Sistema General",
    "pks": [
      "IdConsecutivo",
      "IdCotizacion"
    ],
    "columns": [
      {
        "name": "IdConsecutivo",
        "type": "int",
        "isIdentity": true,
        "nullable": true,
        "isPK": true
      },
      {
        "name": "IdCotizacion",
        "type": "int",
        "nullable": false,
        "isPK": true
      },
      {
        "name": "numMaterial",
        "type": "float(53)",
        "nullable": true
      },
      {
        "name": "numManoObra",
        "type": "float(53)",
        "nullable": true
      },
      {
        "name": "numTransporte",
        "type": "float(53)",
        "nullable": true
      },
      {
        "name": "numImprevistos",
        "type": "float(53)",
        "nullable": true
      },
      {
        "name": "SSMA_TimeStamp",
        "type": "timestamp",
        "nullable": false
      }
    ]
  },
  {
    "name": "tblLlaves",
    "columnCount": 5,
    "status": "mapeada",
    "module": "Operaciones - Control Llaves",
    "pks": [
      "Idllaves",
      "IdRegistro",
      "IdContratista"
    ],
    "columns": [
      {
        "name": "Idllaves",
        "type": "int",
        "isIdentity": true,
        "nullable": true,
        "isPK": true
      },
      {
        "name": "IdRegistro",
        "type": "int",
        "nullable": false,
        "isPK": true
      },
      {
        "name": "IdContratista",
        "type": "nvarchar(50)",
        "nullable": false,
        "isPK": true
      },
      {
        "name": "datReporte",
        "type": "nvarchar(50)",
        "nullable": true
      },
      {
        "name": "strNovedad",
        "type": "nvarchar(50)",
        "nullable": true
      }
    ]
  },
  {
    "name": "tblMaterialeCotizacion",
    "columnCount": 7,
    "status": "activa",
    "module": "Sistema General",
    "pks": [
      "IdMaterial",
      "IdCotizacion"
    ],
    "columns": [
      {
        "name": "IdMaterial",
        "type": "int",
        "isIdentity": true,
        "nullable": true,
        "isPK": true
      },
      {
        "name": "IdCotizacion",
        "type": "int",
        "nullable": false,
        "isPK": true
      },
      {
        "name": "IdAccesso",
        "type": "nvarchar(50)",
        "nullable": true
      },
      {
        "name": "numProveedor",
        "type": "nvarchar(50)",
        "nullable": true
      },
      {
        "name": "numFactura",
        "type": "float(53)",
        "nullable": true
      },
      {
        "name": "numVrReal",
        "type": "float(53)",
        "nullable": true
      },
      {
        "name": "SSMA_TimeStamp",
        "type": "timestamp",
        "nullable": false
      }
    ]
  },
  {
    "name": "tblMaterialeEntregadosContratista",
    "columnCount": 6,
    "status": "activa",
    "module": "Sistema General",
    "pks": [
      "IdMaterialEntregarCta",
      "IdOrden",
      "IdElemento"
    ],
    "columns": [
      {
        "name": "IdMaterialEntregarCta",
        "type": "int",
        "isIdentity": true,
        "nullable": true,
        "isPK": true
      },
      {
        "name": "IdOrden",
        "type": "int",
        "nullable": false,
        "isPK": true
      },
      {
        "name": "IdElemento",
        "type": "int",
        "nullable": false,
        "isPK": true
      },
      {
        "name": "Unidad",
        "type": "nvarchar(50)",
        "nullable": true
      },
      {
        "name": "numCantidad",
        "type": "float(53)",
        "nullable": true
      },
      {
        "name": "SSMA_TimeStamp",
        "type": "timestamp",
        "nullable": false
      }
    ]
  },
  {
    "name": "tblMateriales",
    "columnCount": 9,
    "status": "mapeada",
    "module": "Maestros - Materiales",
    "pks": [
      "IdElemento"
    ],
    "columns": [
      {
        "name": "IdElemento",
        "type": "int",
        "nullable": false,
        "isPK": true
      },
      {
        "name": "IdFabricante",
        "type": "int",
        "nullable": true
      },
      {
        "name": "strDescripcion",
        "type": "nvarchar(255)",
        "nullable": true
      },
      {
        "name": "Unidad",
        "type": "nvarchar(50)",
        "nullable": true
      },
      {
        "name": "Presentacion",
        "type": "int",
        "nullable": true
      },
      {
        "name": "numVr",
        "type": "float(53)",
        "nullable": true
      },
      {
        "name": "swActualizado",
        "type": "bit",
        "nullable": true
      },
      {
        "name": "numCantidad",
        "type": "int",
        "nullable": true
      },
      {
        "name": "SSMA_TimeStamp",
        "type": "timestamp",
        "nullable": false
      }
    ]
  },
  {
    "name": "tblMaterialesInventario",
    "columnCount": 4,
    "status": "activa",
    "module": "Sistema General",
    "pks": [
      "IdConsecutivoInventario",
      "IdElemento"
    ],
    "columns": [
      {
        "name": "IdConsecutivoInventario",
        "type": "int",
        "isIdentity": true,
        "nullable": true,
        "isPK": true
      },
      {
        "name": "IdElemento",
        "type": "int",
        "nullable": false,
        "isPK": true
      },
      {
        "name": "numCantidad",
        "type": "float(53)",
        "nullable": true
      },
      {
        "name": "SSMA_TimeStamp",
        "type": "timestamp",
        "nullable": false
      }
    ]
  },
  {
    "name": "tblMaterialesInventarioAlm",
    "columnCount": 4,
    "status": "activa",
    "module": "Sistema General",
    "pks": [
      "IdRegElemento",
      "IdElemento"
    ],
    "columns": [
      {
        "name": "IdRegElemento",
        "type": "int",
        "isIdentity": true,
        "nullable": true,
        "isPK": true
      },
      {
        "name": "IdElemento",
        "type": "int",
        "nullable": false,
        "isPK": true
      },
      {
        "name": "numCantidad",
        "type": "float(53)",
        "nullable": true
      },
      {
        "name": "SSMA_TimeStamp",
        "type": "timestamp",
        "nullable": false
      }
    ]
  },
  {
    "name": "tblMaterialesOriginal",
    "columnCount": 7,
    "status": "obsoleta",
    "module": "Deprecada / Fase 1",
    "pks": [
      "IdElemento"
    ],
    "columns": [
      {
        "name": "IdElemento",
        "type": "int",
        "nullable": false,
        "isPK": true
      },
      {
        "name": "strDescripcion",
        "type": "nvarchar(255)",
        "nullable": true
      },
      {
        "name": "Unidad",
        "type": "nvarchar(50)",
        "nullable": true
      },
      {
        "name": "Presentacion",
        "type": "int",
        "nullable": true
      },
      {
        "name": "numVr",
        "type": "float(53)",
        "nullable": true
      },
      {
        "name": "swActualizado",
        "type": "bit",
        "nullable": true
      },
      {
        "name": "SSMA_TimeStamp",
        "type": "timestamp",
        "nullable": false
      }
    ]
  },
  {
    "name": "tblMundoAlianza",
    "columnCount": 6,
    "status": "activa",
    "module": "Sistema General",
    "pks": [
      "IdCoidigo"
    ],
    "columns": [
      {
        "name": "IdCoidigo",
        "type": "int",
        "nullable": false,
        "isPK": true
      },
      {
        "name": "strDescripcion",
        "type": "nvarchar(255)",
        "nullable": true
      },
      {
        "name": "Unidad",
        "type": "nvarchar(50)",
        "nullable": true
      },
      {
        "name": "Cantidad",
        "type": "float(53)",
        "nullable": true
      },
      {
        "name": "valor",
        "type": "float(53)",
        "nullable": true
      },
      {
        "name": "SSMA_TimeStamp",
        "type": "timestamp",
        "nullable": false
      }
    ]
  },
  {
    "name": "tblNIT",
    "columnCount": 2,
    "status": "activa",
    "module": "Sistema General",
    "pks": [
      "nit"
    ],
    "columns": [
      {
        "name": "nit",
        "type": "nvarchar(50)",
        "nullable": false,
        "isPK": true
      },
      {
        "name": "strContratante",
        "type": "nvarchar(50)",
        "nullable": true
      }
    ]
  },
  {
    "name": "tblNovedades",
    "columnCount": 2,
    "status": "mapeada",
    "module": "Informes - Novedades",
    "pks": [
      "IdNovedad"
    ],
    "columns": [
      {
        "name": "IdNovedad",
        "type": "int",
        "nullable": false,
        "isPK": true
      },
      {
        "name": "strNombre",
        "type": "nvarchar(255)",
        "nullable": true
      }
    ]
  },
  {
    "name": "tblOrigen",
    "columnCount": 2,
    "status": "activa",
    "module": "Sistema General",
    "pks": [
      "IdOrigen"
    ],
    "columns": [
      {
        "name": "IdOrigen",
        "type": "int",
        "isIdentity": true,
        "nullable": true,
        "isPK": true
      },
      {
        "name": "strOrigen",
        "type": "nvarchar(50)",
        "nullable": true
      }
    ]
  },
  {
    "name": "tblPlanCuentas",
    "columnCount": 17,
    "status": "activa",
    "module": "Sistema General",
    "pks": [],
    "columns": [
      {
        "name": "Cuenta",
        "type": "float(53)",
        "nullable": true
      },
      {
        "name": "Nombre",
        "type": "nvarchar(30)",
        "nullable": true
      },
      {
        "name": "Nit referencia",
        "type": "nvarchar(11)",
        "nullable": true
      },
      {
        "name": "Cod Triburtario",
        "type": "nvarchar(3)",
        "nullable": true
      },
      {
        "name": "Tipo cuenta",
        "type": "nvarchar(1)",
        "nullable": true
      },
      {
        "name": "Debito del mes",
        "type": "real",
        "nullable": true
      },
      {
        "name": "Creditos del mes",
        "type": "int",
        "nullable": true
      },
      {
        "name": "Debitos mes anterior",
        "type": "int",
        "nullable": true
      },
      {
        "name": "Creditos mes anterior",
        "type": "int",
        "nullable": true
      },
      {
        "name": "Saldo anterior",
        "type": "int",
        "nullable": true
      },
      {
        "name": "Id recibe moovto",
        "type": "nvarchar(1)",
        "nullable": true
      },
      {
        "name": "Id ce costos",
        "type": "nvarchar(1)",
        "nullable": true
      },
      {
        "name": "Id cierre",
        "type": "nvarchar(1)",
        "nullable": true
      },
      {
        "name": "Id ajuste",
        "type": "nvarchar(1)",
        "nullable": true
      },
      {
        "name": "Porcentaje base",
        "type": "nvarchar(6)",
        "nullable": true
      },
      {
        "name": "Tio plazo",
        "type": "nvarchar(1)",
        "nullable": true
      },
      {
        "name": "SSMA_TimeStamp",
        "type": "timestamp",
        "nullable": false
      }
    ]
  },
  {
    "name": "tblPreguntasEncuesta",
    "columnCount": 2,
    "status": "activa",
    "module": "Sistema General",
    "pks": [
      "IdCodPregunta"
    ],
    "columns": [
      {
        "name": "IdCodPregunta",
        "type": "int",
        "isIdentity": true,
        "nullable": true,
        "isPK": true
      },
      {
        "name": "strPregunta",
        "type": "nvarchar(255)",
        "nullable": true
      }
    ]
  },
  {
    "name": "tblProgramacion",
    "columnCount": 14,
    "status": "activa",
    "module": "Sistema General",
    "pks": [],
    "columns": [
      {
        "name": "IdConsecutivoProgramacion",
        "type": "int",
        "isIdentity": true,
        "nullable": true,
        "isPK": true
      },
      {
        "name": "IdRegistro",
        "type": "int",
        "nullable": true
      },
      {
        "name": "IdContratista",
        "type": "nvarchar(50)",
        "nullable": true
      },
      {
        "name": "IdCotizacion",
        "type": "int",
        "nullable": true
      },
      {
        "name": "IdContratista1",
        "type": "int",
        "nullable": true
      },
      {
        "name": "datProgramacion",
        "type": "datetime2(0)",
        "nullable": true
      },
      {
        "name": "datHora",
        "type": "datetime2(0)",
        "nullable": true
      },
      {
        "name": "strConcepto",
        "type": "nvarchar(50)",
        "nullable": true
      },
      {
        "name": "swControl",
        "type": "nvarchar(50)",
        "nullable": true
      },
      {
        "name": "datActualizacion",
        "type": "datetime2(0)",
        "nullable": true
      },
      {
        "name": "swDocumento",
        "type": "nvarchar(50)",
        "nullable": true
      },
      {
        "name": "strComparendo",
        "type": "nvarchar(255)",
        "nullable": true
      },
      {
        "name": "numRecursoFinanciero",
        "type": "float(53)",
        "nullable": true
      },
      {
        "name": "SSMA_TimeStamp",
        "type": "timestamp",
        "nullable": false
      }
    ]
  },
  {
    "name": "tblRecibosCaja",
    "columnCount": 8,
    "status": "mapeada",
    "module": "Contable - Recibos de Caja",
    "pks": [
      "IdRecibos",
      "IdContratista",
      "IdRegistro"
    ],
    "columns": [
      {
        "name": "IdRecibos",
        "type": "int",
        "isIdentity": true,
        "nullable": true,
        "isPK": true
      },
      {
        "name": "IdContratista",
        "type": "nvarchar(50)",
        "nullable": false,
        "isPK": true
      },
      {
        "name": "IdRegistro",
        "type": "int",
        "nullable": false,
        "isPK": true
      },
      {
        "name": "strConcepto",
        "type": "nvarchar(max)",
        "nullable": true
      },
      {
        "name": "datFecha",
        "type": "datetime2(0)",
        "nullable": true
      },
      {
        "name": "numValor",
        "type": "float(53)",
        "nullable": true
      },
      {
        "name": "numDocRef",
        "type": "real",
        "nullable": true
      },
      {
        "name": "SSMA_TimeStamp",
        "type": "timestamp",
        "nullable": false
      }
    ]
  },
  {
    "name": "tblRecibosCajaCasosPagados",
    "columnCount": 6,
    "status": "activa",
    "module": "Sistema General",
    "pks": [
      "IdTransaccion",
      "IdRecibos",
      "IdRegistro"
    ],
    "columns": [
      {
        "name": "IdTransaccion",
        "type": "int",
        "isIdentity": true,
        "nullable": true,
        "isPK": true
      },
      {
        "name": "IdRecibos",
        "type": "int",
        "nullable": false,
        "isPK": true
      },
      {
        "name": "IdRegistro",
        "type": "int",
        "nullable": false,
        "isPK": true
      },
      {
        "name": "IdFactura",
        "type": "int",
        "nullable": false
      },
      {
        "name": "numValor",
        "type": "float(53)",
        "nullable": true
      },
      {
        "name": "SSMA_TimeStamp",
        "type": "timestamp",
        "nullable": false
      }
    ]
  },
  {
    "name": "tblReportes",
    "columnCount": 51,
    "status": "mapeada",
    "module": "Reportes & Órdenes de Trabajo",
    "pks": [],
    "columns": [
      {
        "name": "IdRegistro",
        "type": "int",
        "isIdentity": true,
        "nullable": true,
        "isPK": true
      },
      {
        "name": "IdContratante",
        "type": "float(53)",
        "nullable": true
      },
      {
        "name": "IdEventos",
        "type": "float(53)",
        "nullable": true
      },
      {
        "name": "IdInmueble",
        "type": "int",
        "nullable": true
      },
      {
        "name": "strArrendatario",
        "type": "nvarchar(255)",
        "nullable": true
      },
      {
        "name": "strPropietario",
        "type": "nvarchar(255)",
        "nullable": true
      },
      {
        "name": "strContactos",
        "type": "nvarchar(255)",
        "nullable": true
      },
      {
        "name": "strTelContacto",
        "type": "nvarchar(255)",
        "nullable": true
      },
      {
        "name": "strCelContacto",
        "type": "nvarchar(255)",
        "nullable": true
      },
      {
        "name": "strDireccion",
        "type": "nvarchar(255)",
        "nullable": true
      },
      {
        "name": "strDP1",
        "type": "nvarchar(50)",
        "nullable": true
      },
      {
        "name": "strDP2",
        "type": "int",
        "nullable": true
      },
      {
        "name": "strDP3",
        "type": "nvarchar(50)",
        "nullable": true
      },
      {
        "name": "strDP4",
        "type": "int",
        "nullable": true
      },
      {
        "name": "strDP5",
        "type": "nvarchar(50)",
        "nullable": true
      },
      {
        "name": "strCiudad",
        "type": "nvarchar(50)",
        "nullable": true
      },
      {
        "name": "strUnidad",
        "type": "nvarchar(255)",
        "nullable": true
      },
      {
        "name": "datFecha",
        "type": "datetime2(0)",
        "nullable": true
      },
      {
        "name": "strTel",
        "type": "nvarchar(50)",
        "nullable": true
      },
      {
        "name": "strCel",
        "type": "nvarchar(50)",
        "nullable": true
      },
      {
        "name": "strReporte",
        "type": "nvarchar(max)",
        "nullable": true
      },
      {
        "name": "swReporte",
        "type": "nvarchar(50)",
        "nullable": true
      },
      {
        "name": "IdEstado",
        "type": "int",
        "nullable": true
      },
      {
        "name": "IdContratista",
        "type": "nvarchar(50)",
        "nullable": true
      },
      {
        "name": "strNotaFinal",
        "type": "nvarchar(max)",
        "nullable": true
      },
      {
        "name": "datCotizacionProgramada",
        "type": "datetime2(0)",
        "nullable": true
      },
      {
        "name": "datInspeccion",
        "type": "datetime2(0)",
        "nullable": true
      },
      {
        "name": "datAprobada",
        "type": "datetime2(0)",
        "nullable": true
      },
      {
        "name": "datProgramada",
        "type": "datetime2(0)",
        "nullable": true
      },
      {
        "name": "datTerminado",
        "type": "datetime2(0)",
        "nullable": true
      },
      {
        "name": "datDescartados",
        "type": "datetime2(0)",
        "nullable": true
      },
      {
        "name": "memAprobación",
        "type": "nvarchar(max)",
        "nullable": true
      },
      {
        "name": "swCotizado",
        "type": "nvarchar(50)",
        "nullable": true
      },
      {
        "name": "swActualizado",
        "type": "nvarchar(50)",
        "nullable": true
      },
      {
        "name": "swEjecutado",
        "type": "nvarchar(50)",
        "nullable": true
      },
      {
        "name": "swControlDiario",
        "type": "nvarchar(50)",
        "nullable": true
      },
      {
        "name": "swAprobados",
        "type": "nvarchar(50)",
        "nullable": true
      },
      {
        "name": "swCobrado",
        "type": "nvarchar(50)",
        "nullable": true
      },
      {
        "name": "IDSector",
        "type": "int",
        "nullable": true
      },
      {
        "name": "strRuta",
        "type": "nvarchar(max)",
        "nullable": true
      },
      {
        "name": "strReferencia",
        "type": "nvarchar(max)",
        "nullable": true
      },
      {
        "name": "strLlaves",
        "type": "nvarchar(50)",
        "nullable": true
      },
      {
        "name": "strCedProp",
        "type": "nvarchar(50)",
        "nullable": true
      },
      {
        "name": "strRefCliente",
        "type": "nvarchar(50)",
        "nullable": true
      },
      {
        "name": "email",
        "type": "nvarchar(max)",
        "nullable": true
      },
      {
        "name": "strContrato",
        "type": "nvarchar(255)",
        "nullable": true
      },
      {
        "name": "strReparacion",
        "type": "nvarchar(255)",
        "nullable": true
      },
      {
        "name": "strDetalleRep",
        "type": "nvarchar(255)",
        "nullable": true
      },
      {
        "name": "swActulizacionBD",
        "type": "nvarchar(255)",
        "nullable": true
      },
      {
        "name": "swControlTareas",
        "type": "real",
        "nullable": true
      },
      {
        "name": "SSMA_TimeStamp",
        "type": "timestamp",
        "nullable": false
      }
    ]
  },
  {
    "name": "tblRespuestasEncuesta",
    "columnCount": 8,
    "status": "activa",
    "module": "Sistema General",
    "pks": [
      "IdConsecutivoRegistroPreguntas"
    ],
    "columns": [
      {
        "name": "IdConsecutivoRegistroPreguntas",
        "type": "int",
        "isIdentity": true,
        "nullable": true,
        "isPK": true
      },
      {
        "name": "IdCotizacion",
        "type": "int",
        "nullable": true
      },
      {
        "name": "IdCodPregunta",
        "type": "int",
        "nullable": true
      },
      {
        "name": "strRta",
        "type": "nvarchar(255)",
        "nullable": true
      },
      {
        "name": "strObservacion",
        "type": "nvarchar(255)",
        "nullable": true
      },
      {
        "name": "datEncuesta",
        "type": "datetime2(0)",
        "nullable": true
      },
      {
        "name": "IdRealizaEncuesta",
        "type": "nvarchar(255)",
        "nullable": true
      },
      {
        "name": "strEncuestado",
        "type": "nvarchar(255)",
        "nullable": true
      }
    ]
  },
  {
    "name": "tblRespuestasEncuestaValores",
    "columnCount": 1,
    "status": "activa",
    "module": "Sistema General",
    "pks": [],
    "columns": [
      {
        "name": "strRta",
        "type": "nvarchar(255)",
        "nullable": true
      }
    ]
  },
  {
    "name": "tblresumen",
    "columnCount": 4,
    "status": "activa",
    "module": "Sistema General",
    "pks": [],
    "columns": [
      {
        "name": "IdContratante",
        "type": "float(53)",
        "nullable": true
      },
      {
        "name": "datFecha",
        "type": "datetime2(0)",
        "nullable": true
      },
      {
        "name": "strEventos",
        "type": "nvarchar(50)",
        "nullable": true
      },
      {
        "name": "SSMA_TimeStamp",
        "type": "timestamp",
        "nullable": false
      }
    ]
  },
  {
    "name": "tblResumenAnualValores",
    "columnCount": 6,
    "status": "activa",
    "module": "Sistema General",
    "pks": [],
    "columns": [
      {
        "name": "datCtaCobro",
        "type": "datetime2(0)",
        "nullable": true
      },
      {
        "name": "IdContratante",
        "type": "float(53)",
        "nullable": true
      },
      {
        "name": "NumTotal",
        "type": "float(53)",
        "nullable": true
      },
      {
        "name": "strEventos",
        "type": "nvarchar(50)",
        "nullable": true
      },
      {
        "name": "Meses",
        "type": "smallint",
        "nullable": true
      },
      {
        "name": "SSMA_TimeStamp",
        "type": "timestamp",
        "nullable": false
      }
    ]
  },
  {
    "name": "tblResumenEst",
    "columnCount": 6,
    "status": "activa",
    "module": "Sistema General",
    "pks": [],
    "columns": [
      {
        "name": "IdContratante",
        "type": "float(53)",
        "nullable": true
      },
      {
        "name": "strContratante",
        "type": "nvarchar(50)",
        "nullable": true
      },
      {
        "name": "strArrendatario",
        "type": "nvarchar(255)",
        "nullable": true
      },
      {
        "name": "IdEstado",
        "type": "int",
        "nullable": true
      },
      {
        "name": "strEstado",
        "type": "nvarchar(50)",
        "nullable": true
      },
      {
        "name": "SSMA_TimeStamp",
        "type": "timestamp",
        "nullable": false
      }
    ]
  },
  {
    "name": "tblSectores",
    "columnCount": 4,
    "status": "mapeada",
    "module": "Maestros - Sectores",
    "pks": [
      "IDSector"
    ],
    "columns": [
      {
        "name": "IDSector",
        "type": "int",
        "isIdentity": true,
        "nullable": true,
        "isPK": true
      },
      {
        "name": "IDSectorRef",
        "type": "int",
        "nullable": true
      },
      {
        "name": "strSector",
        "type": "nvarchar(255)",
        "nullable": true
      },
      {
        "name": "strRuta",
        "type": "nvarchar(50)",
        "nullable": true
      }
    ]
  },
  {
    "name": "tblTareas",
    "columnCount": 8,
    "status": "activa",
    "module": "Sistema General",
    "pks": [
      "IdTarea",
      "IdRegistro",
      "IdNovedad"
    ],
    "columns": [
      {
        "name": "IdTarea",
        "type": "int",
        "isIdentity": true,
        "nullable": true,
        "isPK": true
      },
      {
        "name": "IdRegistro",
        "type": "int",
        "nullable": false,
        "isPK": true
      },
      {
        "name": "IdNovedad",
        "type": "int",
        "nullable": false,
        "isPK": true
      },
      {
        "name": "strTarea",
        "type": "nvarchar(max)",
        "nullable": true
      },
      {
        "name": "datTarea",
        "type": "datetime2(0)",
        "nullable": true
      },
      {
        "name": "datTareaNue",
        "type": "datetime2(0)",
        "nullable": true
      },
      {
        "name": "datFechaControl",
        "type": "datetime2(0)",
        "nullable": true
      },
      {
        "name": "SSMA_TimeStamp",
        "type": "timestamp",
        "nullable": false
      }
    ]
  },
  {
    "name": "tblTarifas",
    "columnCount": 9,
    "status": "activa",
    "module": "Sistema General",
    "pks": [
      "IdTarifa"
    ],
    "columns": [
      {
        "name": "IdTarifa",
        "type": "int",
        "isIdentity": true,
        "nullable": true,
        "isPK": true
      },
      {
        "name": "strDescripcion",
        "type": "nvarchar(50)",
        "nullable": true
      },
      {
        "name": "swTipoTarifaComponente1",
        "type": "nvarchar(50)",
        "nullable": true
      },
      {
        "name": "numTarifa1",
        "type": "real",
        "nullable": true
      },
      {
        "name": "swTipoTarifaComponente2",
        "type": "nvarchar(50)",
        "nullable": true
      },
      {
        "name": "numTarifa2",
        "type": "real",
        "nullable": true
      },
      {
        "name": "swTipoTarifaComponente3",
        "type": "nvarchar(50)",
        "nullable": true
      },
      {
        "name": "numTarifa3",
        "type": "real",
        "nullable": true
      },
      {
        "name": "SSMA_TimeStamp",
        "type": "timestamp",
        "nullable": false
      }
    ]
  },
  {
    "name": "tblTotalCotizacion",
    "columnCount": 3,
    "status": "activa",
    "module": "Sistema General",
    "pks": [],
    "columns": [
      {
        "name": "IdCotizacion",
        "type": "int",
        "nullable": true
      },
      {
        "name": "SumaDenumTotalItem",
        "type": "float(53)",
        "nullable": true
      },
      {
        "name": "SSMA_TimeStamp",
        "type": "timestamp",
        "nullable": false
      }
    ]
  },
  {
    "name": "XtblReportesConTareas",
    "columnCount": 1,
    "status": "activa",
    "module": "Sistema General",
    "pks": [],
    "columns": [
      {
        "name": "IdRegistro",
        "type": "int",
        "nullable": true
      }
    ]
  },
  {
    "name": "XtblReportesExistentes",
    "columnCount": 2,
    "status": "activa",
    "module": "Sistema General",
    "pks": [],
    "columns": [
      {
        "name": "IdRegistro",
        "type": "int",
        "isIdentity": true,
        "nullable": true,
        "isPK": true
      },
      {
        "name": "sw",
        "type": "int",
        "nullable": true
      }
    ]
  },
  {
    "name": "XtblUltimaNovedad",
    "columnCount": 3,
    "status": "activa",
    "module": "Sistema General",
    "pks": [],
    "columns": [
      {
        "name": "IdRegistro",
        "type": "int",
        "nullable": true
      },
      {
        "name": "MáxDedatTarea",
        "type": "datetime2(0)",
        "nullable": true
      },
      {
        "name": "datFecha",
        "type": "datetime2(0)",
        "nullable": true
      }
    ]
  }
];
