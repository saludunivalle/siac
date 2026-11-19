import React, { useEffect, useMemo, useState } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { fetchPostGeneral } from "../../service/fetch";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import logoDoc from "../../assets/logoDoc.jpg";

const URL = "https://siac-server.vercel.app";

const cleanKey = (value) =>
  String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");

const readValue = (row, ...names) => {
  const wanted = names.map(cleanKey);
  const key = Object.keys(row || {}).find((item) =>
    wanted.includes(cleanKey(item)),
  );
  return key ? row[key] : "";
};

const periodNumber = (value) => {
  const text = String(value || "")
    .trim()
    .toUpperCase();
  const romans = {
    I: 1,
    II: 2,
    III: 3,
    IV: 4,
    V: 5,
    VI: 6,
    VII: 7,
    VIII: 8,
    IX: 9,
    X: 10,
    XI: 11,
    XII: 12,
    XIII: 13,
    XIV: 14,
    XV: 15,
  };
  if (/^\d+$/.test(text)) return Number(text);
  return romans[text] || Number(text.match(/\d+/)?.[0]) || 0;
};

const toRoman = (value) => {
  const romans = [
    "",
    "I",
    "II",
    "III",
    "IV",
    "V",
    "VI",
    "VII",
    "VIII",
    "IX",
    "X",
    "XI",
    "XII",
    "XIII",
    "XIV",
    "XV",
  ];
  return romans[Number(value)] || String(value || "");
};

const firstValue = (row, ...names) => {
  const value = readValue(row, ...names);
  return value === null || value === undefined ? "" : String(value).trim();
};

export default function ModalRevision({
  open = true,
  programa = {},
  anexoFormData = {},
  practicasData = [],
  escenariosData = [],
  docEscenariosData = [],
  onSeguimientoChange,
  onBack,
  onFinish,
  embedded = false,
}) {
  const [practicas, setPracticas] = useState(practicasData || []);
  const [horarios, setHorarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [error, setError] = useState("");

  const idPrograma = String(
    programa?.id_programa || programa?.idPrograma || programa?.id || "",
  ).trim();

  useEffect(() => {
    if (!open || !idPrograma) return;
    let active = true;
    setLoading(true);
    Promise.all([
      fetchPostGeneral({
        dataSend: {},
        sheetName: "PRACTICAS",
        urlEndPoint: `${URL}/docServ`,
      }),
      fetchPostGeneral({
        dataSend: {},
        sheetName: "HORARIOS",
        urlEndPoint: `${URL}/docServ`,
      }),
    ])
      .then(([practicasResponse, horariosResponse]) => {
        if (!active) return;
        const rows = Array.isArray(practicasResponse?.data)
          ? practicasResponse.data
          : [];
        const filtered = rows.filter(
          (row) =>
            String(
              readValue(row, "id_programa", "ID_PROGRAMA", "id programa"),
            ).trim() === idPrograma,
        );
        const scheduleRows = Array.isArray(horariosResponse?.data)
          ? horariosResponse.data.filter(
              (row) =>
                String(
                  readValue(row, "id_programa", "ID_PROGRAMA", "id programa"),
                ).trim() === idPrograma,
            )
          : [];
        setPracticas(filtered.length > 0 ? filtered : practicasData || []);
        setHorarios(scheduleRows);
      })
      .catch(() => {
        if (active) {
          setPracticas(practicasData || []);
          setHorarios([]);
          setError("No se pudieron cargar nuevamente las prácticas.");
        }
      })
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [open, idPrograma, practicasData]);

  const parseSchedule = (value) => {
    if (!value) return {};
    if (typeof value === "object") return value;
    try {
      return JSON.parse(value);
    } catch {
      return {};
    }
  };

  const formValue = (formData, ...names) =>
    firstValue(formData, ...names) ||
    firstValue(formData?.programaSeleccionado, ...names);

  const REPORT_COLUMNS = {
    map: [
      "PERÍODO ACADÉMICO",
      "NOMBRE DE LA ASIGNATURA A LA QUE PERTENECE LA PRÁCTICA FORMATIVA O ROTACIÓN",
      "NOMBRE DE LA PRÁCTICA FORMATIVA O ROTACIÓN",
      "NOMBRE DEL ESCENARIO DE PRÁCTICA (Para escenarios clínicos incluir, además, nombre de la sede, número de la sede y código del prestador en el REPS)",
      "ESTUDIANTES BENEFICIARIOS POR PRÁCTICA O ROTACIÓN EN EL ESCENARIO",
      "ESTUDIANTES BENEFICIARIOS, AGRUPADOS POR PERÍODO ACADÉMICO",
    ],
    competencies: [
      "PERÍODO ACADÉMICO",
      "NOMBRE DE LA PRÁCTICA FORMATIVA O ROTACIÓN",
      "COMPETENCIAS A DESARROLLAR POR PRÁCTICA FORMATIVA O ROTACIÓN ORIENTADAS AL LOGRO DE LOS RESULTADOS DE APRENDIZAJE ESPERADO",
      "RESULTADOS DE APRENDIZAJE DEL PROGRAMA RELACIONADOS CON LA PRÁCTICA FORMATIVA O ROTACIÓN",
    ],
    clinical: [
      "NOMBRE Y CÓDIGO DEL ESCENARIO DE PRÁCTICA CLÍNICA SEGÚN EL REPS",
      "NOMBRE Y NÚMERO DE LA SEDE DEL ESCENARIO DE PRÁCTICA SEGÚN REPS",
      "UBICACIÓN DE LA SEDE SEGÚN EL REPS (Departamento, municipio o distrito y dirección)",
      "TOTAL DE ESTUDIANTES EN PRÁCTICA SIMULTÁNEA POR SEDE",
    ],
    specific: [
      "PERÍODO ACADÉMICO",
      "NOMBRE DE LA PRÁCTICA FORMATIVA O ROTACIÓN",
      "PARA ESCENARIOS CLÍNICOS, REGISTRE EL NOMBRE DE LOS SERVICIOS HABILITADOS PARA EL DESARROLLO DE LA PRÁCTICA (Incluir número distintivo de habilitación del servicio DHS)",
      "OBSERVA AL PROFESOR (Duración en semanas)",
      "ACTÚA GUIADO/ASESORADO CON ACOMPAÑAMIENTO DIRECTO DEL DOCENTE (Duración en semanas)",
      "ACTÚA OBSERVADO CON ACOMPAÑAMIENTO DIRECTO DEL PROFESOR (Duración en semanas)",
      "NÚMERO MÁXIMO DE ESTUDIANTES EN PRÁCTICA SIMULTÁNEA, DISCRIMINADO POR PRÁCTICA FORMATIVA O ROTACIÓN",
      "NÚMERO DE GRUPOS DE ESTUDIANTES QUE REALIZARÁN LA PRÁCTICA O ROTACIÓN AL DÍA EN EL ESCENARIO",
      "MÁXIMO NÚMERO DE ESTUDIANTES QUE PODRÍAN DESARROLLAR LA PRÁCTICA O ROTACIÓN POR EL ESCENARIO AL DÍA, DISCRIMINADO POR PRÁCTICA",
      "TOTAL DE GRUPOS DE DIFERENTES ESTUDIANTES QUE PODRÍAN DESARROLLAR LA PRÁCTICA O ROTACIÓN EN EL ESCENARIO A LA SEMANA",
      "NÚMERO DE VECES QUE SE PROGRAMARÁ LA PRÁCTICA O ROTACIÓN A LO LARGO DEL PERÍODO ACADÉMICO DEL PROGRAMA",
      "MÁXIMO NÚMERO DE ESTUDIANTES BENEFICIARIOS DEL ESCENARIO, DISCRIMINADO POR PRÁCTICA O ROTACIÓN",
      "MÁXIMO NÚMERO DE ESTUDIANTES BENEFICIARIOS DEL ESCENARIO, AGRUPADOS POR PERÍODO ACADÉMICO",
    ],
    dedication: [
      "PERÍODO ACADÉMICO",
      "NOMBRE DE LA PRÁCTICA FORMATIVA O ROTACIÓN",
      "DURACIÓN DE LA PRÁCTICA FORMATIVA O ROTACIÓN EN SEMANAS",
      "NÚMERO MÁXIMO DE ESTUDIANTES EN PRÁCTICA SIMULTÁNEA, DISCRIMINADO POR PRÁCTICA",
      "RELACIÓN PROFESORESTUDIANTES, POR PRÁCTICA FORMATIVA O ROTACIÓN",
      "HORARIO DE LA PRÁCTICA DISCRIMINADO POR GRUPOS (Discriminar días de la semana, con el horario diurno y nocturno)",
      "TOTAL DE HORAS SEMANALES DE TRABAJO PRESENCIAL EN LA PRÁCTICA",
    ],
  };

  const formatSchedule = (scheduleRows) => {
    const days = [
      "lunes",
      "martes",
      "miércoles",
      "jueves",
      "viernes",
      "sábado",
      "domingo",
    ];
    const parts = [];
    scheduleRows.forEach((row, rowIndex) => {
      const schedule = parseSchedule(
        readValue(row, "horario", "horarios", "schedule"),
      );
      const dayParts = [];
      days.forEach((day) => {
        const scheduleKey = Object.keys(schedule).find(
          (key) => cleanKey(key) === cleanKey(day),
        );
        const values =
          scheduleKey && Array.isArray(schedule[scheduleKey])
            ? schedule[scheduleKey]
            : [];
        if (!values.length) return;
        const ranges = [];
        let start = String(values[0]).split("-")[0].trim();
        let end = "";
        const getStartMinutes = (value) => {
          const match = String(value).match(/(\d{1,2}):(\d{2})/);
          return match ? Number(match[1]) * 60 + Number(match[2]) : 0;
        };
        const getEndLabel = (value) => {
          const match = String(value).match(/-\s*(\d{1,2}:\d{2})/);
          return match ? match[1] : String(value).split("-").pop().trim();
        };
        end = getEndLabel(values[0]);
        values.slice(1).forEach((value) => {
          const nextStart = getStartMinutes(value);
          const endMinutes = getStartMinutes(end);
          if (nextStart === endMinutes) {
            end = getEndLabel(value);
          } else {
            ranges.push(`${start} - ${end}`);
            start = String(value).split("-")[0].trim();
            end = getEndLabel(value);
          }
        });
        ranges.push(`${start} - ${end}`);
        dayParts.push(`${day} ${ranges.join(" / ")}`);
      });
      if (dayParts.length)
        parts.push(`Grupo ${rowIndex + 1} ${dayParts.join(" / ")}`);
    });
    return parts.join(" / ") || "—";
  };

  const totalWeeklyHours = (scheduleRows) =>
    scheduleRows.reduce((total, row) => {
      const schedule = parseSchedule(
        readValue(row, "horario", "horarios", "schedule"),
      );
      return (
        total +
        Object.values(schedule).reduce(
          (dayTotal, values) =>
            dayTotal + (Array.isArray(values) ? values.length : 0),
          0,
        )
      );
    }, 0);

  const schedulesForRow = (row) => {
    const practiceId = row.practiceId;
    const practiceName = row.practice;
    return horarios.filter((scheduleRow) => {
      const schedulePracticeId = firstValue(
        scheduleRow,
        "id_practica",
        "ID Práctica",
        "codigo_practica",
      );
      const schedulePracticeName = firstValue(
        scheduleRow,
        "nombre_practica",
        "nombre de la practica formativa o rotacion",
      );
      const samePractice = practiceId
        ? schedulePracticeId === practiceId
        : schedulePracticeName === practiceName;
      return (
        samePractice &&
        periodNumber(readValue(scheduleRow, "numero_periodo", "periodo")) ===
          row.period
      );
    });
  };

  const formalizationDate = String(anexoFormData.fecha_formalizacion || "");
  const formalizationParts = /^\d{4}-\d{2}-\d{2}$/.test(formalizationDate)
    ? formalizationDate.split("-").reverse()
    : formalizationDate.split(/[/-]/);

  const signatureSections = [
    {
      title:
        "Decano, Director o Coordinador del Programa en la Institución de Educación Superior",
      data: {
        Nombre: formValue(anexoFormData, "director_nombre", "nombre_director"),
        Cargo: formValue(anexoFormData, "director_cargo", "cargo_director"),
        "Teléfono móvil para contacto": formValue(
          anexoFormData,
          "director_telefono",
          "telefono_director",
        ),
        "Dirección electrónica": formValue(
          anexoFormData,
          "director_correo",
          "correo_director",
        ),
      },
    },
    {
      title:
        "Responsable de la relación docencia servicio por parte de la Institución de Educación Superior",
      data: {
        Nombre: formValue(
          anexoFormData,
          "ds_ies_nombre",
          "nombre_ds_ies",
          "responsable_docencia_servicio_nombre",
        ),
        Cargo: formValue(
          anexoFormData,
          "ds_ies_cargo",
          "cargo_ds_ies",
          "responsable_docencia_servicio_cargo",
        ),
        "Teléfono móvil para contacto": formValue(
          anexoFormData,
          "ds_ies_telefono",
          "telefono_ds_ies",
          "responsable_docencia_servicio_telefono",
        ),
        "Dirección electrónica": formValue(
          anexoFormData,
          "ds_ies_correo",
          "correo_ds_ies",
          "responsable_docencia_servicio_correo",
        ),
      },
    },
    {
      title:
        "Responsable de la coordinación de las prácticas formativas en el escenario (No aplica para escenarios no institucionales)",
      data: {
        Nombre: formValue(
          anexoFormData,
          "coordinacion_nombre",
          "nombre_coordinacion",
        ),
        Cargo: formValue(
          anexoFormData,
          "coordinacion_cargo",
          "cargo_coordinacion",
        ),
        "Teléfono móvil para contacto": formValue(
          anexoFormData,
          "coordinacion_telefono",
          "telefono_coordinacion",
        ),
        "Dirección electrónica": formValue(
          anexoFormData,
          "coordinacion_correo",
          "correo_coordinacion",
        ),
      },
    },
  ];

  const scenarioName = (row) => {
    const direct = firstValue(
      row,
      "nombre_escenario",
      "nombre escenario",
      "escenario",
      "institucion",
    );
    if (direct) return direct;
    const scenarioId = firstValue(row, "id_escenario", "id escenario");
    const scenario = (escenariosData || []).find(
      (item) => String(item?.id || "").trim() === scenarioId,
    );
    if (!scenario) return scenarioId;
    const name =
      scenario.nombre ||
      scenario.institucion ||
      scenario.nombre_escenario ||
      "";
    const sede = scenario.nombre_sede || scenario.sede || "";
    const numero = scenario.numero_sede || scenario.numero || "";
    const codigo = scenario.codigo || scenario.nit || "";
    return [
      name,
      sede && `Sede: ${sede}`,
      numero && `N.° sede: ${numero}`,
      codigo && `Código: ${codigo}`,
    ]
      .filter(Boolean)
      .join(" · ");
  };

  const scenarioInfo = (row) => {
    const scenarioId = firstValue(row, "id_escenario", "id escenario");
    const source =
      (escenariosData || []).find(
        (item) => String(item?.id || "").trim() === scenarioId,
      ) || {};
    const documentInfo =
      (docEscenariosData || []).find(
        (item) =>
          String(
            item?.idEscenario || item?.id_escenario || item?.id || "",
          ).trim() === scenarioId,
      ) || {};
    const value = (...names) =>
      firstValue(row, ...names) ||
      firstValue(source, ...names) ||
      firstValue(documentInfo, ...names);
    return {
      id: scenarioId,
      name: value(
        "nombre_escenario",
        "nombre escenario",
        "escenario",
        "institucion",
        "nombre",
      ),
      code: value("codigo_reps", "codigo reps", "codigo", "nit"),
      sedeName: value("nombre_sede", "sede", "nombre sede"),
      sedeNumber: value("numero_sede", "numero sede", "numero"),
      department: value("departamento"),
      municipality: value("municipio", "municipio distrito", "distrito"),
      address: value("direccion", "dirección"),
      type: value("tipologia", "tipo", "tipo escenario", "naturaleza"),
      services: value(
        "servicios_habilitados",
        "servicios habilitados",
        "servicios",
        "servicios_dhs",
      ),
      nit: value("nit", "NIT"),
      responsibleName: value(
        "responsable",
        "contacto",
        "nombre_contacto",
        "nombre responsable",
      ),
      responsibleRole: value("cargo", "cargo responsable", "responsable cargo"),
      phone: value("telefono", "teléfono"),
      email: value("correo", "email", "correo electrónico"),
      expiration: value("fecha_fin", "fecha vencimiento", "vigencia_hasta"),
    };
  };

  const rows = useMemo(() => {
    const seen = new Set();
    return (practicas || [])
      .filter((row) => {
        const rowProgram = firstValue(
          row,
          "id_programa",
          "ID_PROGRAMA",
          "id programa",
        );
        return !idPrograma || rowProgram === idPrograma;
      })
      .map((row) => {
        const period = periodNumber(
          readValue(row, "periodo academico", "numero_periodo", "periodo"),
        );
        const subject = firstValue(
          row,
          "nombre_asignatura",
          "nombre de la asignatura a la que pertenece la practica formativa o rotacion",
        );
        const practice = firstValue(
          row,
          "nombre_practica",
          "nombre de la practica formativa o rotacion",
        );
        const practiceId = firstValue(
          row,
          "id_practica",
          "ID Práctica",
          "codigo_practica",
        );
        const key = [period, subject, practice, scenarioName(row)]
          .join("|")
          .toLowerCase();
        return {
          key,
          period,
          subject,
          practice,
          practiceId,
          durationWeeks: firstValue(row, "numero_semanas", "semanas"),
          relation: firstValue(row, "relacion", "relación"),
          scenario: scenarioName(row),
          scenarioInfo: scenarioInfo(row),
          scenarioKey: scenarioInfo(row).id || scenarioName(row),
          competencies: firstValue(
            row,
            "competencias",
            "competencias a desarrollar",
          ),
          learningResults: firstValue(
            row,
            "resultados_aprendizaje",
            "resultados de aprendizaje",
            "resultados de aprendizaje (ra)",
            "Resultados de Aprendizaje (RA)",
          ),
          simultaneousStudents: firstValue(
            row,
            "max_estudiantes_simultanea",
            "numero_estudiantes",
          ),
          groupsPerDay: firstValue(row, "grupos_estudiantes_dia", "grupo"),
          maxStudentsPerDay: firstValue(
            row,
            "max_estudiantes_escenario_dia",
            "max_estudiantes_simultanea",
            "numero_estudiantes",
          ),
          groupsPerWeek: firstValue(row, "grupos_diferentes_semana", "grupo"),
          timesInPeriod: firstValue(row, "veces_programada_periodo", "grupo"),
          activities: firstValue(
            row,
            "actividades",
            "numero_actividades",
            "numero actividades para ra",
          ),
          beneficiaries: firstValue(
            row,
            "max_beneficiarios_practica",
            "estudiantes_beneficiados",
          ),
          beneficiariesPeriod: firstValue(
            row,
            "max_beneficiarios_periodo",
            "estudiantes_beneficiados",
          ),
        };
      })
      .filter((row) => {
        if (seen.has(row.key)) return false;
        seen.add(row.key);
        return true;
      })
      .sort(
        (a, b) => a.period - b.period || a.subject.localeCompare(b.subject),
      );
  }, [practicas, idPrograma, escenariosData]);

  const competencyRows = useMemo(() => {
    const seen = new Set();
    return rows.filter((row) => {
      const key = `${row.period}|${row.practice}`.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [rows]);

  const clinicalRows = useMemo(() => {
    const grouped = new Map();
    rows.forEach((row) => {
      const info = row.scenarioInfo;
      if (!/cl[ií]nic/.test(String(info.type || "").toLowerCase())) return;
      const key = [info.id || info.name, info.sedeName, info.sedeNumber]
        .join("|")
        .toLowerCase();
      const current = grouped.get(key) || {
        key,
        scenario: [info.name, info.code && `Código: ${info.code}`]
          .filter(Boolean)
          .join(" · "),
        site: [info.sedeName, info.sedeNumber && `N.° ${info.sedeNumber}`]
          .filter(Boolean)
          .join(" · "),
        location: [info.department, info.municipality, info.address]
          .filter(Boolean)
          .join(", "),
        students: 0,
      };
      current.students +=
        Number(String(row.simultaneousStudents).replace(",", ".")) || 0;
      grouped.set(key, current);
    });
    return Array.from(grouped.values());
  }, [rows]);

  const scenarioSections = useMemo(() => {
    const grouped = new Map();
    rows.forEach((row) => {
      const info = row.scenarioInfo;
      const key = info.id || info.name || row.scenario;
      if (!key) return;
      if (!grouped.has(key)) grouped.set(key, { key, info });
    });
    return Array.from(grouped.values());
  }, [rows]);

  const generateReport = async () => {
    setGeneratingPdf(true);
    try {
      const doc = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "letter",
      });
      const margin = 10;
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const programName =
        programa?.["programa académico"] ||
        anexoFormData.programaSeleccionado?.["programa académico"] ||
        "Programa académico";
      const text = (value) => String(value ?? "").trim() || "-";
      const lineHeight = 5;
      let cursorY = 31;
      let logoDataUrl = "";
      try {
        logoDataUrl = await new Promise((resolve, reject) => {
          const image = new Image();
          image.onload = () => {
            const canvas = document.createElement("canvas");
            canvas.width = image.naturalWidth;
            canvas.height = image.naturalHeight;
            canvas.getContext("2d").drawImage(image, 0, 0);
            resolve(canvas.toDataURL("image/jpeg", 0.9));
          };
          image.onerror = reject;
          image.src = logoDoc;
        });
      } catch {
        logoDataUrl = "";
      }

      const sectionTitle = (title) => {
        if (cursorY > pageHeight - 20) {
          doc.addPage();
          cursorY = 32;
        }
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        doc.text(title, margin, cursorY);
        cursorY += 7;
        return cursorY;
      };

      const addTable = (head, body, options = {}) => {
        autoTable(doc, {
          startY: options.startY ?? 24,
          margin: { top: 32, left: margin, right: margin },
          head: [head],
          body: body.length ? body : [["-", ...head.slice(1).map(() => "-")]],
          theme: "grid",
          styles: {
            font: "helvetica",
            fontSize: options.fontSize || 6.5,
            cellPadding: 1.6,
            overflow: "linebreak",
            valign: "middle",
            lineColor: [0, 0, 0],
            lineWidth: 0.15,
          },
          headStyles: {
            fillColor: [255, 255, 255],
            textColor: [0, 0, 0],
            fontStyle: "bold",
            halign: "center",
          },
          columnStyles: options.columnStyles || {},
          rowPageBreak: "avoid",
          ...options.extra,
        });
        cursorY = doc.lastAutoTable.finalY + 8;
      };

      const addParagraphs = (lines, startY = cursorY) => {
        cursorY = startY;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        lines.forEach(([label, value]) => {
          const content = `${label} ${text(value)}`;
          const wrapped = doc.splitTextToSize(content, pageWidth - margin * 2);
          if (cursorY > pageHeight - 12) {
            doc.addPage();
            cursorY = 32;
          }
          doc.text(wrapped, margin, cursorY);
          cursorY += Math.max(lineHeight, wrapped.length * lineHeight) + 2;
        });
      };

      doc.setFont("helvetica", "bold");
      doc.setFontSize(15);
      if (logoDataUrl) doc.addImage(logoDataUrl, "JPEG", margin, 4, 17, 24.2);
      doc.text("ANEXO TÉCNICO", pageWidth / 2, 14, { align: "center" });
      doc.setFontSize(10);
      doc.text(
        `PLAN DE PRÁCTICAS FORMATIVAS DE ${programName}`,
        pageWidth / 2,
        21,
        { align: "center" },
      );

      let y = sectionTitle("I. INFORMACIÓN GENERAL DEL PROGRAMA");
      addParagraphs(
        [
          ["Institución de Educación Superior:", anexoFormData.nombre_IES],
          [
            "Correo electrónico institucional para comunicaciones o notificaciones:",
            anexoFormData.correo,
          ],
          ["Denominación del Programa:", programName],
          ["Nivel de formación del Programa:", anexoFormData.nivel_formacion],
          [
            "Duración de los períodos académicos del Programa:",
            anexoFormData.duracion_semanas
              ? `${anexoFormData.duracion_semanas} semanas`
              : "",
          ],
          ["Duración total del Programa:", anexoFormData.duracion_semestres],
          ["Periodicidad de admisión:", anexoFormData.periodicidad_admision],
          [
            "Número de estudiantes a admitir en el primer periodo:",
            anexoFormData.estudiantes_admitidos,
          ],
          [
            "Períodos académicos del Programa en los que los estudiantes realizan prácticas formativas en escenarios con relación docencia-servicio:",
            Array.isArray(anexoFormData.periodos_pract_formativas)
              ? anexoFormData.periodos_pract_formativas.join(", ")
              : anexoFormData.periodos_pract_formativas,
          ],
        ],
        y,
      );

      y = sectionTitle("II. PLAN GENERAL DE PRÁCTICAS FORMATIVAS DEL PROGRAMA");
      y = sectionTitle("II.a. Mapa de prácticas formativas del programa");
      addTable(
        REPORT_COLUMNS.map,
        rows.map((row) => [
          row.period ? toRoman(row.period) : "-",
          text(row.subject),
          text(row.practice),
          text(row.scenario),
          text(row.beneficiaries),
          text(row.beneficiariesPeriod),
        ]),
        { startY: y },
      );

      y = sectionTitle(
        "II.b. Competencias profesionales y resultados de aprendizaje",
      );
      addTable(
        REPORT_COLUMNS.competencies,
        competencyRows.map((row) => [
          row.period ? toRoman(row.period) : "-",
          text(row.practice),
          text(row.competencies),
          text(row.learningResults),
        ]),
        { startY: y, fontSize: 6 },
      );

      y = sectionTitle(
        "II.c. Consolidado de estudiantes en práctica simultánea por escenario clínico y sede",
      );
      addTable(
        REPORT_COLUMNS.clinical,
        clinicalRows.map((row) => [
          text(row.scenario),
          text(row.site),
          text(row.location),
          text(row.students),
        ]),
        { startY: y },
      );

      y = sectionTitle(
        "II.d. Seguimiento y evaluación de la calidad de las prácticas formativas",
      );
      const followUp = text(anexoFormData.seguimiento_evaluacion);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      const followLines = doc.splitTextToSize(
        followUp,
        pageWidth - margin * 2 - 6,
      );
      doc.text(followLines, margin + 3, y + 4, {
        maxWidth: pageWidth - margin * 2 - 6,
        lineHeightFactor: 1.25,
      });
      cursorY = y + Math.max(12, followLines.length * lineHeight + 5);

      y = sectionTitle(
        "III. INFORMACIÓN ESPECÍFICA DE LAS PRÁCTICAS FORMATIVAS, POR ESCENARIO",
      );
      scenarioSections.forEach(({ key, info }, scenarioIndex) => {
        const scenarioRows = rows.filter((row) => row.scenarioKey === key);
        y = sectionTitle(
          `Escenario de práctica ${scenarioIndex + 1}: ${text(info.name)}`,
        );
        addParagraphs(
          [
            ["Escenario de práctica No.", ""],
            [
              "Fecha de vencimiento del convenio docencia servicio:",
              info.expiration,
            ],
            [
              "Nombre del escenario de práctica:",
              [
                info.name,
                info.code && `Código REPS: ${info.code}`,
                info.sedeNumber && `Sede No. ${info.sedeNumber}`,
              ]
                .filter(Boolean)
                .join(" · "),
            ],
            [
              "Número de Identificación Tributaria NIT del escenario de práctica:",
              info.nit,
            ],
            [
              "Nombre y cargo del responsable de coordinar las prácticas formativas en el escenario:",
              [info.responsibleName, info.responsibleRole]
                .filter(Boolean)
                .join(" · "),
            ],
            [
              "Teléfono y dirección electrónica del escenario:",
              [info.phone, info.email].filter(Boolean).join(" · "),
            ],
            [
              "Dirección, municipio o distrito y departamento:",
              [info.address, info.municipality, info.department]
                .filter(Boolean)
                .join(" · "),
            ],
          ],
          y,
        );

        y = sectionTitle(
          "III.a. Información específica, delegación progresiva y estudiantes beneficiarios",
        );
        addTable(
          REPORT_COLUMNS.specific,
          scenarioRows.map((row) => [
            row.period ? toRoman(row.period) : "-",
            text(row.practice),
            text(info.services),
            "-",
            "-",
            "-",
            text(row.simultaneousStudents),
            text(row.groupsPerDay),
            text(row.maxStudentsPerDay),
            text(row.groupsPerWeek),
            text(row.timesInPeriod),
            text(row.beneficiaries),
            text(row.beneficiariesPeriod),
          ]),
          { startY: y, fontSize: 5.5 },
        );

        y = sectionTitle(
          "III.b. Duración y dedicación a las prácticas formativas",
        );
        addTable(
          REPORT_COLUMNS.dedication,
          scenarioRows.map((row) => {
            const practiceSchedules = schedulesForRow(row);
            return [
              row.period ? toRoman(row.period) : "-",
              text(row.practice),
              text(row.durationWeeks),
              text(row.simultaneousStudents),
              text(row.relation),
              text(formatSchedule(practiceSchedules)),
              text(totalWeeklyHours(practiceSchedules)),
            ];
          }),
          { startY: y, fontSize: 6 },
        );
      });

      y = sectionTitle("Firmas");
      addParagraphs(
        [
          [
            "Fecha de formalización del presente plan de prácticas formativas: Día",
            `${text(formalizationParts[0])}  Mes ${text(formalizationParts[1])}  Año ${text(formalizationParts[2])}`,
          ],
        ],
        y,
      );
      signatureSections.forEach((section) => {
        if (cursorY > pageHeight - 42) {
          doc.addPage();
          cursorY = 32;
        }
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.text(section.title + ":", margin, cursorY);
        cursorY += 7;
        addParagraphs(
          [
            ["Firma:", "______________________________"],
            ["Nombre:", section.data.Nombre],
            ["Cargo:", section.data.Cargo],
            [
              "Teléfono móvil para contacto:",
              section.data["Teléfono móvil para contacto"],
            ],
            ["Dirección electrónica:", section.data["Dirección electrónica"]],
          ],
          cursorY,
        );
        cursorY += 5;
      });

      const pageCount = doc.getNumberOfPages();
      for (let page = 1; page <= pageCount; page += 1) {
        doc.setPage(page);
        if (page > 1 && logoDataUrl)
          doc.addImage(logoDataUrl, "JPEG", margin, 4, 17, 24.2);
        doc.setFontSize(7);
        doc.setTextColor(0, 0, 0);
        doc.text(`Anexo técnico - ${programName}`, margin, pageHeight - 6);
        doc.text(
          `Página ${page} de ${pageCount}`,
          pageWidth - margin,
          pageHeight - 6,
          { align: "right" },
        );
      }
      doc.save(`anexo-tecnico-${cleanKey(programName) || "programa"}.pdf`);
    } catch (generationError) {
      setError(
        `No se pudo generar el informe PDF: ${generationError.message || "error inesperado"}`,
      );
    } finally {
      setGeneratingPdf(false);
    }
  };

  const Wrapper = embedded ? Box : Box;

  return (
    <Wrapper
      sx={{
        width: "100%",
        boxSizing: "border-box",
        border: "1px solid #e0e0e0",
        borderRadius: 2,
        overflow: "hidden",
        "& .MuiAccordion-root": {
          border: "1px solid #b8c4d8",
          borderRadius: "8px !important",
          mb: 1,
          backgroundColor: "#fcfdff",
          "&:before": { display: "none" },
          "& .MuiAccordionSummary-root": {
            backgroundColor: "#f3f6fb",
          },
        },
      }}
    >
      <DialogTitle sx={{ fontWeight: 700 }}>Revisión del convenio</DialogTitle>
      <DialogContent dividers>
        {error && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography sx={{ fontWeight: 700, color: "#1565c0" }}>
              I. INFORMACIÓN GENERAL DEL PROGRAMA
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" },
                gap: 1.5,
              }}
            >
              {[
                ["Institución", anexoFormData.nombre_IES],
                [
                  "Programa académico",
                  programa?.["programa académico"] ||
                    anexoFormData.programaSeleccionado?.["programa académico"],
                ],
                ["Nivel de formación", anexoFormData.nivel_formacion],
                ["Duración", anexoFormData.duracion_semestres],
                ["Periodicidad", anexoFormData.periodicidad_admision],
                ["Estudiantes a admitir", anexoFormData.estudiantes_admitidos],
                [
                  "Periodos con prácticas",
                  Array.isArray(anexoFormData.periodos_pract_formativas)
                    ? anexoFormData.periodos_pract_formativas.join(", ")
                    : anexoFormData.periodos_pract_formativas,
                ],
              ].map(([label, value]) => (
                <Box
                  key={label}
                  sx={{ p: 1.25, backgroundColor: "#f7faf7", borderRadius: 1 }}
                >
                  <Typography variant="caption" color="text.secondary">
                    {label}
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {value || "—"}
                  </Typography>
                </Box>
              ))}
            </Box>
          </AccordionDetails>
        </Accordion>

        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography sx={{ fontWeight: 700, color: "#1565c0" }}>
              II. PLAN GENERAL DE PRÁCTICAS FORMATIVAS DEL PROGRAMA
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Accordion defaultExpanded>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography sx={{ fontWeight: 600 }}>
                  a. Mapa de prácticas formativas del Programa
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                {loading ? (
                  <Typography>Cargando prácticas...</Typography>
                ) : (
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small" sx={{ minWidth: 1050 }}>
                      <TableHead>
                        <TableRow sx={{ backgroundColor: "#e3f2fd" }}>
                          {REPORT_COLUMNS.map.map((column) => (
                            <TableCell key={column}>
                              <b>{column}</b>
                            </TableCell>
                          ))}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {rows.map((row) => (
                          <TableRow key={row.key} hover>
                            <TableCell>
                              {row.period ? toRoman(row.period) : "—"}
                            </TableCell>
                            <TableCell>{row.subject || "—"}</TableCell>
                            <TableCell>{row.practice || "—"}</TableCell>
                            <TableCell>{row.scenario || "—"}</TableCell>
                            <TableCell>{row.beneficiaries || "—"}</TableCell>
                            <TableCell>
                              {row.beneficiariesPeriod || "—"}
                            </TableCell>
                          </TableRow>
                        ))}
                        {!rows.length && (
                          <TableRow>
                            <TableCell colSpan={6} align="center">
                              No hay prácticas para mostrar.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </AccordionDetails>
            </Accordion>
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography sx={{ fontWeight: 600 }}>
                  b. Competencias profesionales y Resultados de aprendizaje
                  esperados en el Programa
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small" sx={{ minWidth: 950 }}>
                    <TableHead>
                      <TableRow sx={{ backgroundColor: "#e3f2fd" }}>
                        {REPORT_COLUMNS.competencies.map((column) => (
                          <TableCell key={column}>
                            <b>{column}</b>
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {competencyRows.map((row) => (
                        <TableRow key={`${row.period}-${row.practice}`} hover>
                          <TableCell>
                            {row.period ? toRoman(row.period) : "—"}
                          </TableCell>
                          <TableCell>{row.practice || "—"}</TableCell>
                          <TableCell
                            sx={{ whiteSpace: "pre-line", minWidth: 260 }}
                          >
                            {row.competencies || "—"}
                          </TableCell>
                          <TableCell
                            sx={{ whiteSpace: "pre-line", minWidth: 260 }}
                          >
                            {row.learningResults || "—"}
                          </TableCell>
                        </TableRow>
                      ))}
                      {!competencyRows.length && (
                        <TableRow>
                          <TableCell colSpan={4} align="center">
                            No hay competencias o resultados para mostrar.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography sx={{ fontWeight: 600 }}>
                  c. Consolidado del número de estudiantes en práctica
                  simultánea por escenario clínico y sede (Solo aplica para
                  escenarios clínicos)
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small" sx={{ minWidth: 950 }}>
                    <TableHead>
                      <TableRow sx={{ backgroundColor: "#e3f2fd" }}>
                        {REPORT_COLUMNS.clinical.map((column) => (
                          <TableCell key={column}>
                            <b>{column}</b>
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {clinicalRows.map((row) => (
                        <TableRow key={row.key} hover>
                          <TableCell>{row.scenario || "—"}</TableCell>
                          <TableCell>{row.site || "—"}</TableCell>
                          <TableCell>{row.location || "—"}</TableCell>
                          <TableCell>{row.students || "—"}</TableCell>
                        </TableRow>
                      ))}
                      {!clinicalRows.length && (
                        <TableRow>
                          <TableCell colSpan={4} align="center">
                            No hay escenarios clínicos para mostrar.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography sx={{ fontWeight: 600 }}>
                  d. Seguimiento y Evaluación de la calidad de las prácticas
                  formativas
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <TextField
                  fullWidth
                  multiline
                  minRows={5}
                  label="Seguimiento y evaluación de la calidad de las prácticas formativas"
                  value={anexoFormData.seguimiento_evaluacion || ""}
                  onChange={(event) =>
                    onSeguimientoChange?.(event.target.value)
                  }
                  placeholder="Escribe aquí el seguimiento y la evaluación de la calidad..."
                />
              </AccordionDetails>
            </Accordion>
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography sx={{ fontWeight: 700, color: "#1565c0" }}>
              III. INFORMACIÓN ESPECÍFICA DE LAS PRÁCTICAS FORMATIVAS, POR
              ESCENARIO
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            {!scenarioSections.length ? (
              <Typography color="text.secondary">
                No hay escenarios asociados a las prácticas.
              </Typography>
            ) : (
              scenarioSections.map(({ key, info }) => (
                <Accordion key={key}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography sx={{ fontWeight: 600 }}>
                      {info.name || "Escenario de práctica"}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: {
                          xs: "1fr",
                          md: "repeat(2, 1fr)",
                        },
                        gap: 1.25,
                        mb: 2,
                      }}
                    >
                      {[
                        ["Escenario de práctica No.", ""],
                        [
                          "Fecha de vencimiento del convenio docencia servicio",
                          "",
                        ],
                        [
                          "Nombre del escenario de práctica",
                          [
                            info.name,
                            info.code && `Código REPS: ${info.code}`,
                            info.sedeNumber && `Sede No. ${info.sedeNumber}`,
                          ]
                            .filter(Boolean)
                            .join(" · "),
                        ],
                        ["NIT del escenario de práctica", info.nit],
                        [
                          "Responsable de coordinar las prácticas",
                          [info.responsibleName, info.responsibleRole]
                            .filter(Boolean)
                            .join(" · "),
                        ],
                        [
                          "Teléfono y correo para comunicaciones",
                          [info.phone, info.email].filter(Boolean).join(" · "),
                        ],
                        [
                          "Dirección, municipio/distrito y departamento",
                          [info.address, info.municipality, info.department]
                            .filter(Boolean)
                            .join(" · "),
                        ],
                      ].map(([label, value]) => (
                        <Box
                          key={label}
                          sx={{
                            p: 1.25,
                            borderRadius: 1,
                            backgroundColor: "#fafafa",
                            border: "1px solid #e0e0e0",
                          }}
                        >
                          <Typography variant="caption" color="text.secondary">
                            {label}
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {value || "—"}
                          </Typography>
                        </Box>
                      ))}
                    </Box>

                    <Accordion>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography sx={{ fontWeight: 600 }}>
                          III.a. Información específica de las prácticas
                          formativas, por escenario
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <TableContainer component={Paper} variant="outlined">
                          <Table size="small" sx={{ minWidth: 1800 }}>
                            <TableHead>
                              <TableRow sx={{ backgroundColor: "#f3e5f5" }}>
                                {REPORT_COLUMNS.specific.map((column) => (
                                  <TableCell key={column}>
                                    <b>{column}</b>
                                  </TableCell>
                                ))}
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {rows
                                .filter((row) => row.scenarioKey === key)
                                .map((row) => (
                                  <TableRow key={`${row.key}-specific`} hover>
                                    <TableCell>
                                      {row.period ? toRoman(row.period) : "—"}
                                    </TableCell>
                                    <TableCell>{row.practice || "—"}</TableCell>
                                    <TableCell>
                                      {info.services || "—"}
                                    </TableCell>
                                    <TableCell>—</TableCell>
                                    <TableCell>—</TableCell>
                                    <TableCell>—</TableCell>
                                    <TableCell>
                                      {row.simultaneousStudents || "—"}
                                    </TableCell>
                                    <TableCell>
                                      {row.groupsPerDay || "—"}
                                    </TableCell>
                                    <TableCell>
                                      {row.maxStudentsPerDay || "—"}
                                    </TableCell>
                                    <TableCell>
                                      {row.groupsPerWeek || "—"}
                                    </TableCell>
                                    <TableCell>
                                      {row.timesInPeriod || "—"}
                                    </TableCell>
                                    <TableCell>
                                      {row.beneficiaries || "—"}
                                    </TableCell>
                                    <TableCell>
                                      {row.beneficiariesPeriod || "—"}
                                    </TableCell>
                                  </TableRow>
                                ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </AccordionDetails>
                    </Accordion>
                    <Accordion>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography sx={{ fontWeight: 600 }}>
                          III.b. Duración y dedicación a las prácticas
                          formativas
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <TableContainer component={Paper} variant="outlined">
                          <Table size="small" sx={{ minWidth: 1500 }}>
                            <TableHead>
                              <TableRow sx={{ backgroundColor: "#f3e5f5" }}>
                                {REPORT_COLUMNS.dedication.map((column) => (
                                  <TableCell key={column}>
                                    <b>{column}</b>
                                  </TableCell>
                                ))}
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {rows
                                .filter((row) => row.scenarioKey === key)
                                .map((row) => {
                                  const practiceSchedules =
                                    schedulesForRow(row);
                                  return (
                                    <TableRow key={`${row.key}-duration`} hover>
                                      <TableCell>
                                        {row.period ? toRoman(row.period) : "—"}
                                      </TableCell>
                                      <TableCell>
                                        {row.practice || "—"}
                                      </TableCell>
                                      <TableCell>
                                        {row.durationWeeks || "—"}
                                      </TableCell>
                                      <TableCell>
                                        {row.simultaneousStudents || "—"}
                                      </TableCell>
                                      <TableCell>
                                        {row.relation || "—"}
                                      </TableCell>
                                      <TableCell sx={{ minWidth: 430 }}>
                                        {formatSchedule(practiceSchedules)}
                                      </TableCell>
                                      <TableCell>
                                        {totalWeeklyHours(practiceSchedules) ||
                                          "—"}
                                      </TableCell>
                                    </TableRow>
                                  );
                                })}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </AccordionDetails>
                    </Accordion>
                  </AccordionDetails>
                </Accordion>
              ))
            )}
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography sx={{ fontWeight: 600 }}>Firmas</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box
                  sx={{
                    p: 2,
                    mb: 2,
                    border: "1px solid #e0e0e0",
                    borderRadius: 1,
                    backgroundColor: "#fafafa",
                  }}
                >
                  <Typography sx={{ fontWeight: 700, mb: 1 }}>
                    Fecha de formalización del presente plan de prácticas
                    formativas
                  </Typography>
                  <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
                    {["Día", "Mes", "Año"].map((label, index) => (
                      <Box key={label} sx={{ minWidth: 90 }}>
                        <Typography variant="caption" color="text.secondary">
                          {label}
                        </Typography>
                        <Typography sx={{ fontWeight: 600 }}>
                          {formalizationParts[index] || "—"}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>

                {signatureSections.map((section) => (
                  <Box
                    key={section.title}
                    sx={{
                      p: 2,
                      mb: 2,
                      border: "1px solid #e0e0e0",
                      borderRadius: 1,
                    }}
                  >
                    <Typography sx={{ fontWeight: 700, mb: 1.5 }}>
                      {section.title}
                    </Typography>
                    <Box sx={{ display: "grid", gap: 1 }}>
                      <Box
                        sx={{
                          minHeight: 42,
                          borderBottom: "1px solid #777",
                          pt: 1,
                        }}
                      >
                        <Typography variant="body2">Firma:</Typography>
                      </Box>
                      {Object.entries(section.data).map(([label, value]) => (
                        <Box
                          key={label}
                          sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}
                        >
                          <Typography sx={{ fontWeight: 600 }}>
                            {label}:
                          </Typography>
                          <Typography>{value || "—"}</Typography>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                ))}
              </AccordionDetails>
            </Accordion>
          </AccordionDetails>
        </Accordion>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onBack}>Atrás</Button>
        <Box sx={{ flexGrow: 1 }} />
        <Button
          variant="outlined"
          onClick={generateReport}
          disabled={generatingPdf || loading}
        >
          {generatingPdf ? "Generando informe..." : "Generar informe"}
        </Button>
        <Button variant="contained" onClick={onFinish}>
          Finalizar revisión
        </Button>
      </DialogActions>
    </Wrapper>
  );
}
