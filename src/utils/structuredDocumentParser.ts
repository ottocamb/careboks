/**
 * Parser for Structured JSON Document Output
 * 
 * Converts the structured JSON from the v2 single-stage pipeline
 * into the section format expected by ClinicianApproval component.
 */

export interface StructuredDocument {
  section_1_what_i_have: string;
  section_2_how_to_live: string;
  section_3_timeline: string;
  section_4_life_impact: string;
  section_5_medications: string;
  section_6_warnings: string;
  section_7_contacts: string;
}

export interface Section {
  title: string;
  content: string;
}

export const parseStructuredDocument = (doc: StructuredDocument, language: string = 'english'): Section[] => {
  // Define section titles based on language
  const sectionTitles = {
    estonian: [
      "MIS MUL ON",
      "KUIDAS PEAKSIN EDASI ELAMA",
      "KUIDAS JÄRGMISED 6 KUUD VÄLJA NÄEVAD",
      "MIDA SEE TÄHENDAB MINU ELULE",
      "MINU RAVIMID",
      "HOIATAVAD MÄRGID",
      "MINU KONTAKTID"
    ],
    russian: [
      "ЧТО У МЕНЯ ЕСТЬ",
      "КАК МНЕ ЖИТЬ ДАЛЬШЕ",
      "КАК БУДУТ ВЫГЛЯДЕТЬ СЛЕДУЮЩИЕ 6 МЕСЯЦЕВ",
      "ЧТО ЭТО ЗНАЧИТ ДЛЯ МОЕЙ ЖИЗНИ",
      "МОИ ЛЕКАРСТВА",
      "ПРЕДУПРЕЖДАЮЩИЕ ПРИЗНАКИ",
      "МОИ КОНТАКТЫ"
    ],
    english: [
      "WHAT DO I HAVE",
      "HOW SHOULD I LIVE NEXT",
      "HOW THE NEXT 6 MONTHS OF MY LIFE WILL LOOK LIKE",
      "WHAT DOES IT MEAN FOR MY LIFE",
      "MY MEDICATIONS",
      "WARNING SIGNS",
      "MY CONTACTS"
    ]
  };

  const titles = sectionTitles[language as keyof typeof sectionTitles] || sectionTitles.english;

  return [
    {
      title: titles[0],
      content: doc.section_1_what_i_have || ''
    },
    {
      title: titles[1],
      content: doc.section_2_how_to_live || ''
    },
    {
      title: titles[2],
      content: doc.section_3_timeline || ''
    },
    {
      title: titles[3],
      content: doc.section_4_life_impact || ''
    },
    {
      title: titles[4],
      content: doc.section_5_medications || ''
    },
    {
      title: titles[5],
      content: doc.section_6_warnings || ''
    },
    {
      title: titles[6],
      content: doc.section_7_contacts || ''
    }
  ];
};

/**
 * Convert structured document back to formatted text
 * for saving and printing
 */
export const structuredDocumentToText = (sections: Section[]): string => {
  const separator = "═".repeat(47);
  
  return sections.map(section => 
    `${separator}\n${section.title}\n${separator}\n${section.content}`
  ).join('\n\n');
};
