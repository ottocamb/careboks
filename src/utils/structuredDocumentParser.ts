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
      "Mis mul on",
      "Kuidas peaksin edasi elama",
      "Kuidas järgmised 6 kuud välja näevad",
      "Mida see tähendab minu elule",
      "Minu ravimid",
      "Hoiatavad märgid",
      "Minu kontaktid"
    ],
    russian: [
      "Что у меня есть",
      "Как мне жить дальше",
      "Как будут выглядеть следующие 6 месяцев",
      "Что это значит для моей жизни",
      "Мои лекарства",
      "Предупреждающие признаки",
      "Мои контакты"
    ],
    english: [
      "What do I have",
      "How should I live next",
      "How the next 6 months of my life will look like",
      "What does it mean for my life",
      "My medications",
      "Warning signs",
      "My contacts"
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
