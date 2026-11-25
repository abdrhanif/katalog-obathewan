/**
 * Panduan Penggunaan Antimikroba pada Anjing dan Kucing
 * Berdasarkan Pedoman Ilmiah "Guide for Antimicrobial Use in Dogs and Cats"
 * (The University of Melbourne, NCAS, APCAH, Agriculture Victoria - Kampanye "Not All Bugs Need Drugs")
 * Dikombinasikan dengan sistem ASTAG (Antimicrobial Importance Rating System).
 */

export const ANTIMICROBIAL_STEWARDSHIP_DATA = {
  metadata: {
  "title": "Guide for Antimicrobial Use in Dogs and Cats",
  "version": "Version 1",
  "Target_Species": [
    "Dogs",
    "Cats"
  ],
  "organizations": [
    "The University of Melbourne",
    "National Centre for Antimicrobial Stewardship (NCAS)",
    "Asia-Pacific Centre for Animal Health (APCAH)",
    "Agriculture Victoria (AgVic)"
  ],
  "campaign": "Not All Bugs Need Drugs",
  "strategy_reference": "National Antimicrobial Resistance Strategy 2015-2019",
  "websites": [
    "www.fvas.unimelb.edu.au/vetantibiotics",
    "agriculture.vic.gov.au/amr"
  ],
  "contact_email": "animal.biosecurity@agriculture.vic.gov.au",
  "free_resources_available": [
    "A5 antibiotic category cards for cattle, horses, sheep, chickens and pigs",
    "Pocket guide for antimicrobial use in horses",
    "A3 waiting room posters",
    "A5 prescribing tearaway pads",
    "A4 fact sheet on MRSP",
    "A6 sticker sheets",
    "DL Double-sided prescribing leaflets",
    "A4 S4 medicated feed order posters",
    "A2 Australian Prescribing Guidelines for horses",
    "Antibiotic Guardian lapel pins"
  ],
  "disclaimers_and_notes": [
    "Traffic-light system is based on the ASTAG antimicrobial importance rating system.",
    "Black shading represents high importance rated antibiotics not registered for use in animals that should be avoided or ONLY used in exceptional circumstances.",
    "Exceptional circumstances defined as use in an animal based on culture and susceptibility, where there is no effective alternative therapy and a reasonable chance of survival.",
    "Many recommendations in this guide represent off-label use of antimicrobials. Compliance with legal requirements in your jurisdiction is your responsibility.",
    "Recommendations only apply to dogs and cats and cannot be safely extrapolated to other small animal species."
  ]
},
  
  pkPdPrinciples: {
  "bacteriostatic_vs_bactericidal": {
    "bacteriostatic": {
      "mnemonic": "ECSTATIC for bacteriostatic",
      "drugs": [
        "Erythromycin (macrolides)",
        "Clindamycin",
        "Sulphonamides",
        "Trimethoprim",
        "Tetracyclines",
        "Chloramphenicol"
      ]
    },
    "bactericidal": {
      "mnemonic": "Very Proficient For Complete Cell Murder",
      "drugs": [
        "Vancomycin",
        "Penicillin",
        "Fluoroquinolones",
        "Cephalosporins",
        "Carbapenems",
        "Metronidazole"
      ]
    }
  },
  "resistance_types": {
    "intrinsic_resistance": "All members of a bacterial genus or species have properties that make them naturally resistant to certain antimicrobials.",
    "acquired_resistance": "Previously susceptible bacteria acquire new genes or a mutation occurs conferring resistance."
  },
  "dosing_dependencies": {
    "time_dependent": {
      "mechanism": "Optimise killing by maximising time above MIC.",
      "dosing_strategy": "More frequent administration or extended infusion increases efficacy by extending T>MIC.",
      "goal": "Exceed MIC by 1-5 times for 50-80% of dosage interval.",
      "examples": [
        "Penicillin",
        "Cephalexin",
        "TMS",
        "Tetracyclines",
        "Clindamycin"
      ]
    },
    "concentration_dependent": {
      "mechanism": "Optimise killing by maximising peak concentration.",
      "dosing_strategy": "Higher doses at less frequent intervals (ie. once daily) increases efficacy by maximising Cmax/MIC ratio.",
      "goal": "Cmax:MIC >8.",
      "examples": [
        "Aminoglycosides",
        "Fluoroquinolones",
        "Metronidazole"
      ]
    }
  }
},

  spectrumOfActivity: {
  "description": "A guide to empirical therapy while awaiting susceptibility results.",
  "legend": {
    "✓": "Drug of choice",
    "+": "Good susceptibility",
    "±": "Variable susceptibility",
    "IR": "Intrinsically resistant",
    "CoP": "Coagulase positive",
    "CoN": "Coagulase negative",
    "§": "Susceptibility poorly predictable, multidrug resistance increasing in frequency, culture and susceptibility testing is strongly recommended.",
    "‡": "Multidrug resistant Staphylococcus aureus likely to be of human origin. Review aseptic technique.",
    "*": "Klebsiella aerogenes intrinsically resistant.",
    "**": "Proteus vulgaris intrinsically resistant."
  },
  "drugs_evaluated": [
    {
      "name": "Penicillin",
      "importance_rating": "Low"
    },
    {
      "name": "Ampicillin / amoxycillin",
      "importance_rating": "Low"
    },
    {
      "name": "Doxycycline",
      "importance_rating": "Low"
    },
    {
      "name": "Trimethoprim sulpha",
      "importance_rating": "Low"
    },
    {
      "name": "Chloramphenicol",
      "importance_rating": "Low"
    },
    {
      "name": "Amoxycillin clavulanate",
      "importance_rating": "Medium"
    },
    {
      "name": "Cefazolin / cephalexin",
      "importance_rating": "Medium"
    },
    {
      "name": "Gentamicin",
      "importance_rating": "Medium"
    },
    {
      "name": "Metronidazole",
      "importance_rating": "Medium"
    },
    {
      "name": "Clindamycin",
      "importance_rating": "Medium"
    },
    {
      "name": "Cefovecin",
      "importance_rating": "High"
    },
    {
      "name": "Enrofloxacin",
      "importance_rating": "High"
    }
  ],
  "bacteria_susceptibility": [
    {
      "category": "Gram +ve",
      "organism": "Staphylococcus pseudintermedius (CoP) §",
      "activity": {
        "Penicillin": null,
        "Ampicillin / amoxycillin": null,
        "Doxycycline": "±",
        "Trimethoprim sulpha": "±",
        "Chloramphenicol": "+",
        "Amoxycillin clavulanate": "±",
        "Cefazolin / cephalexin": "±",
        "Gentamicin": "+",
        "Metronidazole": null,
        "Clindamycin": "±",
        "Cefovecin": null,
        "Enrofloxacin": "±"
      }
    },
    {
      "category": "Gram +ve",
      "organism": "Staphylococcus aureus (CoP) ‡",
      "activity": {
        "Penicillin": null,
        "Ampicillin / amoxycillin": null,
        "Doxycycline": "+",
        "Trimethoprim sulpha": "+",
        "Chloramphenicol": "+",
        "Amoxycillin clavulanate": "±",
        "Cefazolin / cephalexin": "+",
        "Gentamicin": null,
        "Metronidazole": null,
        "Clindamycin": "+",
        "Cefovecin": "+",
        "Enrofloxacin": "+"
      }
    },
    {
      "category": "Gram +ve",
      "organism": "Staphylococcus felis (CoN)",
      "activity": {
        "Penicillin": "+",
        "Ampicillin / amoxycillin": "+",
        "Doxycycline": "+",
        "Trimethoprim sulpha": "+",
        "Chloramphenicol": "+",
        "Amoxycillin clavulanate": "+",
        "Cefazolin / cephalexin": "+",
        "Gentamicin": "+",
        "Metronidazole": null,
        "Clindamycin": "+",
        "Cefovecin": "+",
        "Enrofloxacin": "+"
      }
    },
    {
      "category": "Gram +ve",
      "organism": "β-haemolytic Streptococci (eg S. canis)",
      "activity": {
        "Penicillin": "✓",
        "Ampicillin / amoxycillin": "✓",
        "Doxycycline": "±",
        "Trimethoprim sulpha": "+",
        "Chloramphenicol": null,
        "Amoxycillin clavulanate": "+",
        "Cefazolin / cephalexin": "+",
        "Gentamicin": "IR",
        "Metronidazole": null,
        "Clindamycin": "+",
        "Cefovecin": "+",
        "Enrofloxacin": "±"
      }
    },
    {
      "category": "Gram +ve",
      "organism": "Enterococcus faecalis §",
      "activity": {
        "Penicillin": null,
        "Ampicillin / amoxycillin": "✓",
        "Doxycycline": "±",
        "Trimethoprim sulpha": "IR",
        "Chloramphenicol": null,
        "Amoxycillin clavulanate": "+",
        "Cefazolin / cephalexin": "IR",
        "Gentamicin": "IR",
        "Metronidazole": null,
        "Clindamycin": "IR",
        "Cefovecin": "IR",
        "Enrofloxacin": "±"
      }
    },
    {
      "category": "Gram +ve",
      "organism": "Enterococcus faecium §",
      "activity": {
        "Penicillin": null,
        "Ampicillin / amoxycillin": null,
        "Doxycycline": "±",
        "Trimethoprim sulpha": "IR",
        "Chloramphenicol": null,
        "Amoxycillin clavulanate": null,
        "Cefazolin / cephalexin": "IR",
        "Gentamicin": "IR",
        "Metronidazole": null,
        "Clindamycin": "IR",
        "Cefovecin": "IR",
        "Enrofloxacin": null
      }
    },
    {
      "category": "Gram +ve",
      "organism": "Actinomyces spp.",
      "activity": {
        "Penicillin": "✓",
        "Ampicillin / amoxycillin": "✓",
        "Doxycycline": "+",
        "Trimethoprim sulpha": null,
        "Chloramphenicol": null,
        "Amoxycillin clavulanate": null,
        "Cefazolin / cephalexin": null,
        "Gentamicin": null,
        "Metronidazole": null,
        "Clindamycin": "+",
        "Cefovecin": null,
        "Enrofloxacin": null
      }
    },
    {
      "category": "Gram -ve",
      "organism": "Escherichia coli",
      "activity": {
        "Penicillin": "IR",
        "Ampicillin / amoxycillin": "±",
        "Doxycycline": "+",
        "Trimethoprim sulpha": "±",
        "Chloramphenicol": null,
        "Amoxycillin clavulanate": "+",
        "Cefazolin / cephalexin": "+",
        "Gentamicin": "+",
        "Metronidazole": null,
        "Clindamycin": "IR",
        "Cefovecin": "+",
        "Enrofloxacin": "+"
      }
    },
    {
      "category": "Gram -ve",
      "organism": "Enterobacter spp. §",
      "activity": {
        "Penicillin": "IR",
        "Ampicillin / amoxycillin": "IR",
        "Doxycycline": "+",
        "Trimethoprim sulpha": "±",
        "Chloramphenicol": null,
        "Amoxycillin clavulanate": "IR",
        "Cefazolin / cephalexin": "IR",
        "Gentamicin": null,
        "Metronidazole": null,
        "Clindamycin": "IR",
        "Cefovecin": null,
        "Enrofloxacin": "+"
      }
    },
    {
      "category": "Gram -ve",
      "organism": "Klebsiella spp. §",
      "activity": {
        "Penicillin": "IR",
        "Ampicillin / amoxycillin": "IR",
        "Doxycycline": "+",
        "Trimethoprim sulpha": "±",
        "Chloramphenicol": null,
        "Amoxycillin clavulanate": "+*",
        "Cefazolin / cephalexin": "+*",
        "Gentamicin": null,
        "Metronidazole": null,
        "Clindamycin": "IR",
        "Cefovecin": "+",
        "Enrofloxacin": "+"
      }
    },
    {
      "category": "Gram -ve",
      "organism": "Proteus spp.",
      "activity": {
        "Penicillin": "IR",
        "Ampicillin / amoxycillin": "+**",
        "Doxycycline": "IR",
        "Trimethoprim sulpha": null,
        "Chloramphenicol": null,
        "Amoxycillin clavulanate": "+",
        "Cefazolin / cephalexin": "+",
        "Gentamicin": "+",
        "Metronidazole": null,
        "Clindamycin": "IR",
        "Cefovecin": "+",
        "Enrofloxacin": "+"
      }
    },
    {
      "category": "Gram -ve",
      "organism": "Pseudomonas spp. §",
      "activity": {
        "Penicillin": "IR",
        "Ampicillin / amoxycillin": "IR",
        "Doxycycline": "IR",
        "Trimethoprim sulpha": "IR",
        "Chloramphenicol": "IR",
        "Amoxycillin clavulanate": "IR",
        "Cefazolin / cephalexin": "IR",
        "Gentamicin": "✓",
        "Metronidazole": null,
        "Clindamycin": "IR",
        "Cefovecin": "IR",
        "Enrofloxacin": "±"
      }
    },
    {
      "category": "Gram -ve",
      "organism": "Pasteurella spp.",
      "activity": {
        "Penicillin": null,
        "Ampicillin / amoxycillin": "✓",
        "Doxycycline": "+",
        "Trimethoprim sulpha": "+",
        "Chloramphenicol": null,
        "Amoxycillin clavulanate": "+",
        "Cefazolin / cephalexin": "+",
        "Gentamicin": null,
        "Metronidazole": null,
        "Clindamycin": null,
        "Cefovecin": "+",
        "Enrofloxacin": "+"
      }
    },
    {
      "category": "Gram -ve",
      "organism": "Bordetella bronchiseptica",
      "activity": {
        "Penicillin": null,
        "Ampicillin / amoxycillin": "±",
        "Doxycycline": "✓",
        "Trimethoprim sulpha": "+",
        "Chloramphenicol": null,
        "Amoxycillin clavulanate": "+",
        "Cefazolin / cephalexin": null,
        "Gentamicin": null,
        "Metronidazole": null,
        "Clindamycin": null,
        "Cefovecin": null,
        "Enrofloxacin": "+"
      }
    },
    {
      "category": "Other",
      "organism": "Mycoplasma spp.",
      "activity": {
        "Penicillin": "IR",
        "Ampicillin / amoxycillin": "IR",
        "Doxycycline": "✓",
        "Trimethoprim sulpha": "IR",
        "Chloramphenicol": null,
        "Amoxycillin clavulanate": "IR",
        "Cefazolin / cephalexin": "IR",
        "Gentamicin": null,
        "Metronidazole": null,
        "Clindamycin": null,
        "Cefovecin": "IR",
        "Enrofloxacin": "±"
      }
    },
    {
      "category": "Other",
      "organism": "Anaerobes",
      "activity": {
        "Penicillin": "+",
        "Ampicillin / amoxycillin": "+",
        "Doxycycline": "±",
        "Trimethoprim sulpha": null,
        "Chloramphenicol": "+",
        "Amoxycillin clavulanate": "+",
        "Cefazolin / cephalexin": null,
        "Gentamicin": "IR",
        "Metronidazole": "✓",
        "Clindamycin": "+",
        "Cefovecin": "±",
        "Enrofloxacin": null
      }
    },
    {
      "category": "Urinary isolates",
      "organism": "Staphylococcus pseudintermedius",
      "activity": {
        "Penicillin": null,
        "Ampicillin / amoxycillin": "✓",
        "Doxycycline": "±",
        "Trimethoprim sulpha": "✓",
        "Chloramphenicol": null,
        "Amoxycillin clavulanate": "+",
        "Cefazolin / cephalexin": "+",
        "Gentamicin": "+",
        "Metronidazole": null,
        "Clindamycin": null,
        "Cefovecin": "+",
        "Enrofloxacin": "+"
      }
    },
    {
      "category": "Urinary isolates",
      "organism": "Enterococcus faecalis",
      "activity": {
        "Penicillin": null,
        "Ampicillin / amoxycillin": "✓",
        "Doxycycline": "+",
        "Trimethoprim sulpha": "IR",
        "Chloramphenicol": null,
        "Amoxycillin clavulanate": "+",
        "Cefazolin / cephalexin": "IR",
        "Gentamicin": "IR",
        "Metronidazole": null,
        "Clindamycin": "IR",
        "Cefovecin": "IR",
        "Enrofloxacin": null
      }
    },
    {
      "category": "Urinary isolates",
      "organism": "Escherichia coli",
      "activity": {
        "Penicillin": null,
        "Ampicillin / amoxycillin": "✓",
        "Doxycycline": "+",
        "Trimethoprim sulpha": "✓",
        "Chloramphenicol": null,
        "Amoxycillin clavulanate": "+",
        "Cefazolin / cephalexin": "+",
        "Gentamicin": "+",
        "Metronidazole": null,
        "Clindamycin": null,
        "Cefovecin": "+",
        "Enrofloxacin": "+"
      }
    },
    {
      "category": "Urinary isolates",
      "organism": "Proteus mirabilis",
      "activity": {
        "Penicillin": "IR",
        "Ampicillin / amoxycillin": "+",
        "Doxycycline": "IR",
        "Trimethoprim sulpha": "+",
        "Chloramphenicol": null,
        "Amoxycillin clavulanate": "+",
        "Cefazolin / cephalexin": "+",
        "Gentamicin": null,
        "Metronidazole": null,
        "Clindamycin": null,
        "Cefovecin": "+",
        "Enrofloxacin": "+"
      }
    },
    {
      "category": "Urinary isolates",
      "organism": "Proteus spp. (excluding P. mirabilis)",
      "activity": {
        "Penicillin": "IR",
        "Ampicillin / amoxycillin": "IR",
        "Doxycycline": "IR",
        "Trimethoprim sulpha": "+",
        "Chloramphenicol": null,
        "Amoxycillin clavulanate": "+",
        "Cefazolin / cephalexin": "+",
        "Gentamicin": null,
        "Metronidazole": null,
        "Clindamycin": null,
        "Cefovecin": "+",
        "Enrofloxacin": "+"
      }
    }
  ]
},

  classes: [
  {
    "drug_class": "Beta-lactams",
    "importance_rating": "Low",
    "antibiotic": "Amoxycillin",
    "registered_for_animals": true,
    "routes": [
      "IV",
      "IM",
      "PO"
    ],
    "drug_dose": "11-22 mg/kg q8-12h",
    "adverse_reactions": [
      "Anaphylaxis rare, other mild hypersensitivity reactions more common (urticaria, fever, angioneurotic oedema).",
      "Anorexia, vomiting, diarrhoea."
    ],
    "clinical_pearls": [
      "Anaerobic activity useful for cat-bite infections, periodontal disease, tooth abscesses, wound infections.",
      "Drug of choice for streptococci, clostridia, actinomycosis and Pasteurella multocida.",
      "Greater activity against Gram-negative bacteria than penicillin, including E. coli and Proteus mirabilis.",
      "Very high urinary concentrations, useful for UTIs, even penicillinase-producing S. aureus.",
      "Not recommended for pyelonephritis or prostatitis.",
      "Excreted in bile, therefore good for cholestatic infections."
    ],
    "aliases": [
      "amoxicillin",
      "amoxycillin",
      "amox"
    ],
    "pkPdType": "Time-dependent (T > MIC)",
    "pkPdGuidance": "Optimasi efikasi bakterisid dengan mempertahankan kadar obat di atas MIC selama 50-80% interval pemberian. Berikan sesuai jadwal frekuensi rutin (q8h - q12h).",
    "stewardshipLabel": "Lini Pertama (Low Importance - ASTAG)",
    "stewardshipColor": "green",
    "stewardshipBadge": "ASTAG Low (Lini 1)",
    "interactions": [
      "Sinergis dengan aminoglikosida (Gentamicin). Efek bakterisid dapat dihambat bila dikombinasikan dengan antibiotik bakteriostatik (Tetracycline, Chloramphenicol)."
    ]
  },
  {
    "drug_class": "Beta-lactams",
    "importance_rating": "Low",
    "antibiotic": "Ampicillin",
    "registered_for_animals": true,
    "routes": [
      "IV",
      "IM",
      "SC"
    ],
    "drug_dose": "10-20 mg/kg q6-8h",
    "adverse_reactions": [
      "Hypersensitivity reactions and gastrointestinal disturbance possible."
    ],
    "clinical_pearls": [
      "Slow IV (over 3 mins).",
      "Spectrum of activity equivalent to amoxycillin."
    ],
    "aliases": [
      "ampicillin",
      "ampi"
    ],
    "pkPdType": "Time-dependent (T > MIC)",
    "pkPdGuidance": "Optimasi efikasi bakterisid dengan mempertahankan kadar obat di atas MIC selama 50-80% interval pemberian. Berikan sesuai jadwal frekuensi rutin (q8h - q12h).",
    "stewardshipLabel": "Lini Pertama (Low Importance - ASTAG)",
    "stewardshipColor": "green",
    "stewardshipBadge": "ASTAG Low (Lini 1)",
    "interactions": [
      "Sinergis dengan aminoglikosida (Gentamicin). Efek bakterisid dapat dihambat bila dikombinasikan dengan antibiotik bakteriostatik (Tetracycline, Chloramphenicol)."
    ]
  },
  {
    "drug_class": "Beta-lactams",
    "importance_rating": "Low",
    "antibiotic": "Penicillin",
    "registered_for_animals": true,
    "routes": [
      "IM"
    ],
    "drug_dose": "20-40,000 IU/kg q12h",
    "adverse_reactions": [
      "Hypersensitivity reactions."
    ],
    "clinical_pearls": [
      "Indicated for Gram-positive aerobic and anaerobic bacteria (streptococci, clostridia) and for infections caused by susceptible Gram-negative bacteria eg. P. multocida."
    ],
    "aliases": [
      "penicillin",
      "penicillin-g",
      "procaine penicillin",
      "penicillin g"
    ],
    "pkPdType": "Time-dependent (T > MIC)",
    "pkPdGuidance": "Optimasi efikasi bakterisid dengan mempertahankan kadar obat di atas MIC selama 50-80% interval pemberian. Berikan sesuai jadwal frekuensi rutin (q8h - q12h).",
    "stewardshipLabel": "Lini Pertama (Low Importance - ASTAG)",
    "stewardshipColor": "green",
    "stewardshipBadge": "ASTAG Low (Lini 1)",
    "interactions": [
      "Sinergis dengan aminoglikosida (Gentamicin). Efek bakterisid dapat dihambat bila dikombinasikan dengan antibiotik bakteriostatik (Tetracycline, Chloramphenicol)."
    ]
  },
  {
    "drug_class": "Beta-lactams",
    "importance_rating": "Medium",
    "antibiotic": "Amoxycillin clavulanic acid",
    "registered_for_animals": true,
    "routes": [
      "PO",
      "IM",
      "SC",
      "IV"
    ],
    "drug_dose": "12.5-25 mg/kg q8-12h",
    "adverse_reactions": [
      "Pain on injection.",
      "Anorexia, vomiting, diarrhoea.",
      "Hypersensitivity reactions.",
      "Anaphylaxis after intravenous administration during general anaesthesia."
    ],
    "clinical_pearls": [
      "Clavulanic acid extends the range of amoxycillin against β-lactamase producing pathogens, such as methicillin-susceptible staphylococci.",
      "Higher dose recommended for Gram-negative infections."
    ],
    "aliases": [
      "amoxicillin-clavulanate",
      "co-amoxiclav",
      "amoxycillin clavulanate",
      "clavulanic",
      "clavulanate",
      "augmentin",
      "clavamox"
    ],
    "pkPdType": "Time-dependent (T > MIC)",
    "pkPdGuidance": "Optimasi efikasi bakterisid dengan mempertahankan kadar obat di atas MIC selama 50-80% interval pemberian. Berikan sesuai jadwal frekuensi rutin (q8h - q12h).",
    "stewardshipLabel": "Lini Kedua / Terbatas (Medium Importance - ASTAG)",
    "stewardshipColor": "amber",
    "stewardshipBadge": "ASTAG Medium (Lini 2)",
    "interactions": [
      "Sinergis dengan aminoglikosida (Gentamicin). Efek bakterisid dapat dihambat bila dikombinasikan dengan antibiotik bakteriostatik (Tetracycline, Chloramphenicol)."
    ]
  },
  {
    "drug_class": "Beta-lactams",
    "importance_rating": "Medium",
    "antibiotic": "Cefazolin",
    "registered_for_animals": true,
    "routes": [
      "IV",
      "IM"
    ],
    "drug_dose": "20-35 mg/kg q8h for therapy, 22 mg/kg surgical prophylaxis",
    "adverse_reactions": [
      "Hypersensitivity reactions, pain on IM injection."
    ],
    "clinical_pearls": [
      "1st generation cephalosporin active against methicillin-susceptible staphylococci, streptococci, some Gram-negative aerobes, unpredictable against anaerobes.",
      "Greater Gram-negative activity than cephalexin and cephalothin.",
      "Good bone penetration.",
      "For surgical prophylaxis administer IV 30-60 mins before first incision.",
      "Repeat intra-operative dosing interval q4hrs for common skin flora (staphylococci, streptococci), q2hrs for E. coli."
    ],
    "aliases": [
      "cefazolin",
      "cephazolin",
      "cefalotin"
    ],
    "pkPdType": "Time-dependent (T > MIC)",
    "pkPdGuidance": "Optimasi efikasi bakterisid dengan mempertahankan kadar obat di atas MIC selama 50-80% interval pemberian. Berikan sesuai jadwal frekuensi rutin (q8h - q12h).",
    "stewardshipLabel": "Lini Kedua / Terbatas (Medium Importance - ASTAG)",
    "stewardshipColor": "amber",
    "stewardshipBadge": "ASTAG Medium (Lini 2)",
    "interactions": [
      "Sinergis dengan aminoglikosida. Potensi nefrotoksisitas meningkat bila dikombinasikan dengan obat nefrotoksik atau diuretik kuat (Furosemide)."
    ]
  },
  {
    "drug_class": "Beta-lactams",
    "importance_rating": "Medium",
    "antibiotic": "Cephalexin",
    "registered_for_animals": true,
    "routes": [
      "PO"
    ],
    "drug_dose": "22-30 mg/kg q12h",
    "adverse_reactions": [
      "Vomiting and diarrhoea common when administered without food.",
      "Hypersensitivity reactions possible."
    ],
    "clinical_pearls": [
      "1st generation cephalosporin, similar activity to cefazolin except less Gram-negative activity.",
      "Give with food to reduce GIT side effects, can also lower dose if side effects occur.",
      "Only use for skin disease when topical therapy insufficient to control pyoderma."
    ],
    "aliases": [
      "cephalexin",
      "cefalexin",
      "keflex",
      "cephaseptin"
    ],
    "pkPdType": "Time-dependent (T > MIC)",
    "pkPdGuidance": "Optimasi efikasi bakterisid dengan mempertahankan kadar obat di atas MIC selama 50-80% interval pemberian. Berikan sesuai jadwal frekuensi rutin (q8h - q12h).",
    "stewardshipLabel": "Lini Kedua / Terbatas (Medium Importance - ASTAG)",
    "stewardshipColor": "amber",
    "stewardshipBadge": "ASTAG Medium (Lini 2)",
    "interactions": [
      "Sinergis dengan aminoglikosida. Potensi nefrotoksisitas meningkat bila dikombinasikan dengan obat nefrotoksik atau diuretik kuat (Furosemide)."
    ]
  },
  {
    "drug_class": "Beta-lactams",
    "importance_rating": "High",
    "antibiotic": "Cefovecin",
    "registered_for_animals": true,
    "routes": [
      "SC"
    ],
    "drug_dose": "8 mg/kg",
    "adverse_reactions": [
      "Vomiting, diarrhoea, hypersensitivity."
    ],
    "clinical_pearls": [
      "3rd generation cephalosporin.",
      "Similar spectrum of activity to amoxycillin clavulanate.",
      "Reserve** for infections where no effective alternative.",
      "Label restraint FOR USE ONLY in dogs and cats where indicated by antibiotic sensitivity testing according to principles of prudent use."
    ],
    "aliases": [
      "cefovecin",
      "convenia"
    ],
    "pkPdType": "Time-dependent (T > MIC)",
    "pkPdGuidance": "Optimasi efikasi bakterisid dengan mempertahankan kadar obat di atas MIC selama 50-80% interval pemberian. Berikan sesuai jadwal frekuensi rutin (q8h - q12h).",
    "stewardshipLabel": "Kritis / Cadangan (High Importance - ASTAG: Hanya Kasus Luar Biasa Berdasarkan C&S)",
    "stewardshipColor": "red",
    "stewardshipBadge": "ASTAG High (Kritis - C&S Only)",
    "interactions": [
      "Sinergis dengan aminoglikosida. Potensi nefrotoksisitas meningkat bila dikombinasikan dengan obat nefrotoksik atau diuretik kuat (Furosemide)."
    ]
  },
  {
    "drug_class": "Beta-lactams",
    "importance_rating": "High",
    "antibiotic": "Ceftazidime",
    "registered_for_animals": false,
    "note": "Black shading - high importance rated antibiotic not registered for use in animals; avoid or ONLY use in exceptional circumstances.",
    "routes": [
      "IV",
      "IM"
    ],
    "drug_dose": "25-50 mg/kg q8-12h. To exceed P. aeruginosa MIC: 30 mg/kg q4h or constant IV infusion of 4.1 mg/kg/h",
    "adverse_reactions": [
      "Gastrointestinal disturbance."
    ],
    "clinical_pearls": [
      "3rd generation cephalosporin with 10 times greater activity against P. aeruginosa.",
      "Slightly less active against all other organisms than other cephalosporins.",
      "Reserve** for P. aeruginosa infections with confirmed susceptibility."
    ],
    "aliases": [
      "ceftazidime",
      "fortum"
    ],
    "pkPdType": "Time-dependent (T > MIC)",
    "pkPdGuidance": "Optimasi efikasi bakterisid dengan mempertahankan kadar obat di atas MIC selama 50-80% interval pemberian. Berikan sesuai jadwal frekuensi rutin (q8h - q12h).",
    "stewardshipLabel": "Kritis / Cadangan (High Importance - ASTAG: Hanya Kasus Luar Biasa Berdasarkan C&S)",
    "stewardshipColor": "red",
    "stewardshipBadge": "ASTAG High (Kritis - C&S Only)",
    "interactions": [
      "Sinergis dengan aminoglikosida. Potensi nefrotoksisitas meningkat bila dikombinasikan dengan obat nefrotoksik atau diuretik kuat (Furosemide)."
    ]
  },
  {
    "drug_class": "Beta-lactams",
    "importance_rating": "High",
    "antibiotic": "Cefotaxime",
    "registered_for_animals": false,
    "note": "Black shading - high importance rated antibiotic not registered for use in animals; avoid or ONLY use in exceptional circumstances.",
    "routes": [
      "IV",
      "IM"
    ],
    "drug_dose": "20-40 mg/kg q8h",
    "adverse_reactions": [
      "Pain on IM injection, gastrointestinal disturbances common due to broad antibacterial action.",
      "Superinfection with resistant microorganisms, including yeasts, may be anticipated."
    ],
    "clinical_pearls": [
      "3rd generation cephalosporin.",
      "Due to expense and potential to select for resistant infections, these drugs should be reserved** for life-threatening infections, such as bacterial meningitis caused by Gram-negative bacteria (especially Enterobacteriaceae).",
      "May be used in combination with an aminoglycoside for MDR infections in compromised animals (neutropaenic)."
    ],
    "aliases": [
      "cefotaxime",
      "claforan"
    ],
    "pkPdType": "Time-dependent (T > MIC)",
    "pkPdGuidance": "Optimasi efikasi bakterisid dengan mempertahankan kadar obat di atas MIC selama 50-80% interval pemberian. Berikan sesuai jadwal frekuensi rutin (q8h - q12h).",
    "stewardshipLabel": "Kritis / Cadangan (High Importance - ASTAG: Hanya Kasus Luar Biasa Berdasarkan C&S)",
    "stewardshipColor": "red",
    "stewardshipBadge": "ASTAG High (Kritis - C&S Only)",
    "interactions": [
      "Sinergis dengan aminoglikosida. Potensi nefrotoksisitas meningkat bila dikombinasikan dengan obat nefrotoksik atau diuretik kuat (Furosemide)."
    ]
  },
  {
    "drug_class": "Tetracyclines",
    "importance_rating": "Low",
    "antibiotic": "Doxycycline",
    "registered_for_animals": true,
    "routes": [
      "PO"
    ],
    "drug_dose": "5 mg/kg q12h or 10 mg/kg q24h",
    "adverse_reactions": [
      "Administration to growing puppies and pregnant bitches results in yellow discolouration of teeth."
    ],
    "clinical_pearls": [
      "Excellent penetration into most tissues (including prostate).",
      "Broad spectrum activity, including many intracellular pathogens such as Chlamydia, Coxiella, Nocardia and some Mycoplasma species."
    ],
    "aliases": [
      "doxycycline",
      "doxy"
    ],
    "pkPdType": "Time-dependent (T > MIC)",
    "pkPdGuidance": "Optimasi efikasi bakterisid dengan mempertahankan kadar obat di atas MIC selama 50-80% interval pemberian. Berikan sesuai jadwal frekuensi rutin (q8h - q12h).",
    "stewardshipLabel": "Lini Pertama (Low Importance - ASTAG)",
    "stewardshipColor": "green",
    "stewardshipBadge": "ASTAG Low (Lini 1)",
    "interactions": [
      "Kation divalen/trivalen (kalsium, susu, zat besi, antasida) mengkelasi doksisiklin dan menurunkan absorpsi oral.",
      "Phenobarbital dan Phenytoin dapat memperpendek waktu paruh eliminasi doksisiklin."
    ]
  },
  {
    "drug_class": "Sulphonamides",
    "importance_rating": "Low",
    "antibiotic": "Trimethoprim sulphonamide",
    "registered_for_animals": true,
    "routes": [
      "PO",
      "IV"
    ],
    "drug_dose": "15-30 mg/kg q12h",
    "adverse_reactions": [
      "Chronic use (>2 weeks) can lead to crystalluria, haematuria, urinary obstruction, haematopoietic disorders (anaemia, leukopaenia, thrombocytopaenia) and dermatological reactions.",
      "Do not use in Doberman Pinschers.",
      "~0.25% of dogs may suffer idiosyncratic drug reactions 10-21 days after exposure, including fever, arthropathy, blood dyscrasia, epistaxis, hepatopathy, skin eruptions, uveitis, KCS.",
      "In dogs <12kg, 1 week TMS decreases tear production by 15%, overdose can lead to KCS.",
      "Can cause hypothyroidism and/or lowered T4 in dogs.",
      "Cats salivate if tablet protective coating broken."
    ],
    "clinical_pearls": [
      "Broad spectrum activity, including Nocardia spp., Toxoplasma spp. and other protozoa.",
      "Well absorbed from gastrointestinal tract, excellent penetration into many tissues including meninges, prostate and urinary tract.",
      "ISCAID recommended first line empirical treatment option for sporadic bacterial cystitis (simple uncomplicated UTI) for 3-5 days (low risk of adverse effects with short course).",
      "For therapy >7 days baseline Schirmer's tear testing recommended with periodic re-evaluation."
    ],
    "aliases": [
      "trimethoprim-sulphonamide",
      "trimethoprim",
      "sulfamethoxazole",
      "co-trimoxazole",
      "tms",
      "bactrim"
    ],
    "pkPdType": "Time-dependent (T > MIC)",
    "pkPdGuidance": "Optimasi efikasi bakterisid dengan mempertahankan kadar obat di atas MIC selama 50-80% interval pemberian. Berikan sesuai jadwal frekuensi rutin (q8h - q12h).",
    "stewardshipLabel": "Lini Pertama (Low Importance - ASTAG)",
    "stewardshipColor": "green",
    "stewardshipBadge": "ASTAG Low (Lini 1)",
    "interactions": [
      "Efek sinergis potensiasi antara Trimethoprim dan Sulfonamide menghambat sintesis asam folat berturutan."
    ]
  },
  {
    "drug_class": "Aminoglycosides",
    "importance_rating": "Medium",
    "antibiotic": "Gentamicin",
    "registered_for_animals": true,
    "routes": [
      "IV",
      "IM"
    ],
    "drug_dose": "Dogs: 9-14 mg/kg q24h; Cats: 5-8 mg/kg q24h",
    "adverse_reactions": [
      "Ototoxicity possible.",
      "Nephrotoxic especially if hypovolaemia, hypokalaemia, hyponatraemia, elevated trough concentrations, pre-existing renal disease, concurrent nephrotoxic drug administration, prolonged therapy (>7-10 days), age (neonates, geriatrics).",
      "Pain on IM injection."
    ],
    "clinical_pearls": [
      "Excellent activity against Gram-negative bacteria and some staphylococci.",
      "No anaerobic activity.",
      "Synergistic in combination with β-lactam.",
      "Inactivated by purulent debris.",
      "Ensure adequate fluid and electrolyte balance during treatment.",
      "Clinical monitoring for toxicosis may include monitoring trough levels, daily monitoring of urine for epithelial casts and daily serum creatinine."
    ],
    "aliases": [
      "gentamicin",
      "gentamycin"
    ],
    "pkPdType": "Concentration-dependent (Cmax : MIC > 8)",
    "pkPdGuidance": "Optimasi pembunuhan bakteri dengan memaksimalkan konsentrasi puncak (Cmax/MIC > 8). Dosis tinggi interval panjang (sekali sehari / q24h) meningkatkan efikasi dan efek pasca-antibiotik (PAE).",
    "stewardshipLabel": "Lini Kedua / Terbatas (Medium Importance - ASTAG)",
    "stewardshipColor": "amber",
    "stewardshipBadge": "ASTAG Medium (Lini 2)",
    "interactions": [
      "Sinergis kuat dengan beta-laktam. DILARANG dicampur dalam spuit atau botol infus yang sama dengan beta-laktam karena memicu inaktivasi kimia langsung.",
      "Risiko nefrotoksisitas melonjak jika diberikan bersama NSAID (Meloxicam, Ketoprofen) atau Furosemide."
    ]
  },
  {
    "drug_class": "Nitroimidazoles",
    "importance_rating": "Medium",
    "antibiotic": "Metronidazole",
    "registered_for_animals": true,
    "routes": [
      "PO",
      "IV"
    ],
    "drug_dose": "Dogs: 10-15 mg/kg PO q12h (10 mg/kg SLOW IV); Cats: 10-15 mg/kg q24h",
    "adverse_reactions": [
      "Care in liver disease, can predispose to CNS toxicity - reduce dose to 7.5 mg/kg.",
      "Gastrointestinal disturbance, hepatotoxicity, CNS signs, haematuria, neutropenia.",
      "Potentially teratogenic in first third of pregnancy.",
      "Can impact faecal microbiome long-term."
    ],
    "clinical_pearls": [
      "Not indicated in acute gastrointestinal disease unless evidence of sepsis.",
      "Excellent anaerobic activity.",
      "Critical drug for managing human Clostridium difficile infections.",
      "Drug interactions: phenobarbital may enhance metabolism; cimetidine may decrease metabolism and increase dose related adverse effects."
    ],
    "aliases": [
      "metronidazole",
      "flagyl"
    ],
    "pkPdType": "Concentration-dependent (Cmax : MIC > 8)",
    "pkPdGuidance": "Optimasi pembunuhan bakteri dengan memaksimalkan konsentrasi puncak (Cmax/MIC > 8). Dosis tinggi interval panjang (sekali sehari / q24h) meningkatkan efikasi dan efek pasca-antibiotik (PAE).",
    "stewardshipLabel": "Lini Kedua / Terbatas (Medium Importance - ASTAG)",
    "stewardshipColor": "amber",
    "stewardshipBadge": "ASTAG Medium (Lini 2)",
    "interactions": [
      "Phenobarbital mempercepat metabolisme metronidazole. Cimetidine memperlambat metabolisme metronidazole dan meningkatkan risiko efek samping SSP."
    ]
  },
  {
    "drug_class": "Nitrofurans",
    "importance_rating": "High",
    "antibiotic": "Nitrofurantoin",
    "registered_for_animals": false,
    "note": "Black shading - high importance rated antibiotic not registered for use in animals; avoid or ONLY use in exceptional circumstances.",
    "routes": [
      "PO"
    ],
    "drug_dose": "4.4-5 mg/kg q8h",
    "adverse_reactions": [
      "Gastrointestinal disturbances, hepatopathy, male infertility in dogs."
    ],
    "clinical_pearls": [
      "Lower urinary tract infections only.",
      "Reserve** for exceptional cases.",
      "Do not use for pyelonephritis or other conditions where tissue (vs. urine) levels are needed.",
      "Avoid in cases with renal impairment.",
      "No activity against Pseudomonas, Proteus, Serratia, Acinetobacter spp.",
      "Probenecid inhibits renal excretion.",
      "Antagonistic to fluoroquinolones."
    ],
    "aliases": [
      "nitrofurantoin",
      "furadantin"
    ],
    "pkPdType": "Time-dependent (T > MIC)",
    "pkPdGuidance": "Optimasi efikasi bakterisid dengan mempertahankan kadar obat di atas MIC selama 50-80% interval pemberian. Berikan sesuai jadwal frekuensi rutin (q8h - q12h).",
    "stewardshipLabel": "Kritis / Cadangan (High Importance - ASTAG: Hanya Kasus Luar Biasa Berdasarkan C&S)",
    "stewardshipColor": "red",
    "stewardshipBadge": "ASTAG High (Kritis - C&S Only)",
    "interactions": [
      "Antagonis dengan fluoroquinolones (Enrofloxacin, Marbofloxacin). Probenecid menghambat ekskresi ginjal nitrofurantoin."
    ]
  },
  {
    "drug_class": "Lincosamides",
    "importance_rating": "Medium",
    "antibiotic": "Clindamycin",
    "registered_for_animals": true,
    "routes": [
      "IV",
      "IM",
      "PO"
    ],
    "drug_dose": "IV/IM: 11 mg/kg q12h (For IV: dilute 1:10 in 0.9% saline, administer over 60 mins); PO: 11 mg/kg q12-24h; Toxoplasmosis: 25 mg/kg q12h",
    "adverse_reactions": [
      "Oesophagitis and oesophageal stricture have been reported in cats associated with use of generic capsules - follow capsules with water or food.",
      "Diarrhoea, neuromuscular blockade.",
      "Oral suspension may be unpalatable for cats.",
      "Pain on IM injection."
    ],
    "clinical_pearls": [
      "Active against staphylococci, streptococci, Actinomyces, Nocardia, and Mycoplasma spp. plus anaerobes (Bacteroides spp., Fusobacterium spp., Clostridium perfringens).",
      "Only use for skin disease when topical therapy insufficient to control pyoderma.",
      "Cross-resistance to lincosamides in bacteria resistant to macrolides.",
      "High concentration in prostate.",
      "Use for toxoplasmosis controversial as may help clinical signs but not clear infection from CNS or eye.",
      "Erythromycin and chloramphenicol are antagonistic."
    ],
    "aliases": [
      "clindamycin",
      "antirobe"
    ],
    "pkPdType": "Time-dependent (T > MIC)",
    "pkPdGuidance": "Optimasi efikasi bakterisid dengan mempertahankan kadar obat di atas MIC selama 50-80% interval pemberian. Berikan sesuai jadwal frekuensi rutin (q8h - q12h).",
    "stewardshipLabel": "Lini Kedua / Terbatas (Medium Importance - ASTAG)",
    "stewardshipColor": "amber",
    "stewardshipBadge": "ASTAG Medium (Lini 2)",
    "interactions": [
      "Antagonis kompetitif dengan Erythromycin dan Chloramphenicol (berikatan pada subunit ribosom 50S yang sama).",
      "Memperkuat efek blokade neuromuskular dari obat anestesi."
    ]
  },
  {
    "drug_class": "Phenicols",
    "importance_rating": "Low",
    "antibiotic": "Chloramphenicol",
    "registered_for_animals": true,
    "routes": [
      "PO",
      "IV",
      "IM",
      "Topical"
    ],
    "drug_dose": "Dogs: 40-50 mg/kg q6-8h; Cats: 12.5-20 mg/kg q12h",
    "adverse_reactions": [
      "Anorexia, hypersalivation, vomiting with systemic use.",
      "Dose related reversible bone marrow suppression may develop with prolonged treatment - usually resolves within days. Cats more susceptible - within 2 weeks of treatment.",
      "Wear gloves and mask when handling medication as idiosyncratic aplastic anaemia can develop in people handling this drug."
    ],
    "clinical_pearls": [
      "Mostly used topically.",
      "May be used systemically for multidrug resistant organisms.",
      "Broad spectrum.",
      "Avoid systemic use in cases with hepatic failure, renal failure, pre-existing haematologic abnormalities, pregnancy, lactation and in young animals.",
      "Eliminated by glucuronidation mechanisms, cats excrete higher proportion unchanged in urine than dogs.",
      "Potent inhibitor of P450 enzymes - reduced hepatic clearance of phenobarbital, pentobarbital."
    ],
    "aliases": [
      "chloramphenicol"
    ],
    "pkPdType": "Time-dependent (T > MIC)",
    "pkPdGuidance": "Optimasi efikasi bakterisid dengan mempertahankan kadar obat di atas MIC selama 50-80% interval pemberian. Berikan sesuai jadwal frekuensi rutin (q8h - q12h).",
    "stewardshipLabel": "Lini Pertama (Low Importance - ASTAG)",
    "stewardshipColor": "green",
    "stewardshipBadge": "ASTAG Low (Lini 1)",
    "interactions": [
      "Inhibitor poten enzim sitokrom P450 hepar: Menurunkan klirens metabolik Phenobarbital dan Pentobarbital (risiko depresi SSP berat dan toksisitas).",
      "Antagonis dengan penisilin, sefalosporin, dan fluoroquinolon."
    ]
  },
  {
    "drug_class": "Polypeptides",
    "importance_rating": "High",
    "antibiotic": "Polymyxin B",
    "registered_for_animals": true,
    "routes": [
      "Topical"
    ],
    "drug_dose": "Topical application",
    "adverse_reactions": [
      "Nephrotoxic if administered systemically.",
      "Potentially ototoxic.",
      "Ophthalmic formulations associated with anaphylaxis in cats."
    ],
    "clinical_pearls": [
      "Used topically for treatment of bacterial keratitis, otitis externa and skin infections.",
      "Active topically against Pseudomonas spp. and other Gram negatives (except Proteus, Morganella and Serratia spp.).",
      "Inhibited by the presence of purulent exudate."
    ],
    "aliases": [
      "polymyxin-b",
      "polymyxin b",
      "surolan"
    ],
    "pkPdType": "Time-dependent (T > MIC)",
    "pkPdGuidance": "Optimasi efikasi bakterisid dengan mempertahankan kadar obat di atas MIC selama 50-80% interval pemberian. Berikan sesuai jadwal frekuensi rutin (q8h - q12h).",
    "stewardshipLabel": "Kritis / Cadangan (High Importance - ASTAG: Hanya Kasus Luar Biasa Berdasarkan C&S)",
    "stewardshipColor": "red",
    "stewardshipBadge": "ASTAG High (Kritis - C&S Only)",
    "interactions": []
  },
  {
    "drug_class": "Fluoroquinolones",
    "importance_rating": "High",
    "antibiotic": "Enrofloxacin",
    "registered_for_animals": true,
    "routes": [
      "PO",
      "IV"
    ],
    "drug_dose": "Dogs: 5-20 mg/kg q24h; Cats: 5 mg/kg q24h, SLOW IV",
    "adverse_reactions": [
      "Blindness, due to retinal detachment, and neurological signs in cats. Not always associated with dose or route of administration, however greater risk with advancing age.",
      "Anorexia, vomiting, diarrhoea.",
      "CNS effects with high doses or rapid IV.",
      "Caution in animals prone to seizures.",
      "Canine toxic shock syndrome and necrotizing fasciitis caused by fluoroquinolone use in Streptococcus canis infections.",
      "Arthropathy in dogs during growth, small dogs <8 months old, or large breeds less than 12-18 months.",
      "Avoid use in cats - especially those with renal disease."
    ],
    "clinical_pearls": [
      "2nd generation fluoroquinolone active against Pasteurella spp., Gram-negative enteric bacilli, staphylococci (higher MIC).",
      "Variable activity against Pseudomonas aeruginosa (highest MIC).",
      "Poor activity against streptococci, enterococci and anaerobes.",
      "Not indicated in superficial pyoderma.",
      "Reserve** for infections where culture and susceptibility indicate no effective alternative.",
      "Use is a known risk factor for selection of methicillin-resistant staphylococci.",
      "If organism resistant to one fluoroquinolone, typically resistant to all (cross-resistance).",
      "Good distribution to bone, prostate and skin. Concentrated in urine, bile and within phagocytic cells.",
      "Enrofloxacin is partially (~20%) de-ethylated to ciprofloxacin.",
      "Oral absorption inhibited by antacids, sucralfate, supplements containing aluminium, calcium, iron and zinc.",
      "Chelation/precipitation in IV fluids with calcium or magnesium.",
      "Reduced hepatic clearance of theophylline.",
      "Antagonism with chloramphenicol, rifampicin."
    ],
    "aliases": [
      "enrofloxacin",
      "baytril"
    ],
    "pkPdType": "Concentration-dependent (Cmax : MIC > 8)",
    "pkPdGuidance": "Optimasi pembunuhan bakteri dengan memaksimalkan konsentrasi puncak (Cmax/MIC > 8). Dosis tinggi interval panjang (sekali sehari / q24h) meningkatkan efikasi dan efek pasca-antibiotik (PAE).",
    "stewardshipLabel": "Kritis / Cadangan (High Importance - ASTAG: Hanya Kasus Luar Biasa Berdasarkan C&S)",
    "stewardshipColor": "red",
    "stewardshipBadge": "ASTAG High (Kritis - C&S Only)",
    "interactions": [
      "Absorpsi oral terhambat drastis (>50%) oleh antasida, sucralfate, atau suplemen Kalsium, Magnesium, Besi, dan Zinc (kelasi kation).",
      "Injeksi IV: Mengalami presipitasi/kelasi bila dicampur dengan cairan infus mengandung Kalsium (misal Ringer Laktat) atau Magnesium.",
      "Menghambat metabolisme hepatik teofilin (Theophylline), meningkatkan risiko toksisitas teofilin.",
      "Antagonis dengan Chloramphenicol dan Rifampisin."
    ]
  },
  {
    "drug_class": "Fluoroquinolones",
    "importance_rating": "High",
    "antibiotic": "Marbofloxacin",
    "registered_for_animals": true,
    "routes": [
      "PO"
    ],
    "drug_dose": "2.75-5.5 mg/kg q24h",
    "adverse_reactions": [
      "Anorexia, vomiting, diarrhoea.",
      "CNS effects with high doses or rapid IV.",
      "Caution in animals prone to seizures.",
      "Arthropathy in immature animals."
    ],
    "clinical_pearls": [
      "2nd generation fluoroquinolone.",
      "Reserve** for infections where culture and susceptibility indicate no effective alternative.",
      "Similar activity, tissue distribution, drug interactions to enrofloxacin.",
      "Concentrated in urine, may be used for confirmed pyelonephritis in cats based on susceptibility testing."
    ],
    "aliases": [
      "marbofloxacin",
      "marbocyl",
      "zeniquin"
    ],
    "pkPdType": "Concentration-dependent (Cmax : MIC > 8)",
    "pkPdGuidance": "Optimasi pembunuhan bakteri dengan memaksimalkan konsentrasi puncak (Cmax/MIC > 8). Dosis tinggi interval panjang (sekali sehari / q24h) meningkatkan efikasi dan efek pasca-antibiotik (PAE).",
    "stewardshipLabel": "Kritis / Cadangan (High Importance - ASTAG: Hanya Kasus Luar Biasa Berdasarkan C&S)",
    "stewardshipColor": "red",
    "stewardshipBadge": "ASTAG High (Kritis - C&S Only)",
    "interactions": [
      "Absorpsi oral terhambat drastis (>50%) oleh antasida, sucralfate, atau suplemen Kalsium, Magnesium, Besi, dan Zinc (kelasi kation).",
      "Injeksi IV: Mengalami presipitasi/kelasi bila dicampur dengan cairan infus mengandung Kalsium (misal Ringer Laktat) atau Magnesium.",
      "Menghambat metabolisme hepatik teofilin (Theophylline), meningkatkan risiko toksisitas teofilin.",
      "Antagonis dengan Chloramphenicol dan Rifampisin."
    ]
  },
  {
    "drug_class": "Fluoroquinolones",
    "importance_rating": "High",
    "antibiotic": "Pradofloxacin",
    "registered_for_animals": true,
    "routes": [
      "PO"
    ],
    "drug_dose": "Dogs: 3-5 mg/kg q24h; Cats: 5-10 mg/kg q24h",
    "adverse_reactions": [
      "Higher doses in dogs associated with myelosuppression.",
      "Do not use in dogs less than 1 year of age, or in pregnant or lactating animals.",
      "Gastrointestinal disturbances.",
      "Caution in animals prone to seizures."
    ],
    "clinical_pearls": [
      "3rd generation fluoroquinolone.",
      "Reserve** for infections where culture and susceptibility indicate no effective alternative.",
      "Greater activity against Gram-positive cocci and anaerobes than other fluoroquinolones.",
      "Similar drug interactions to enrofloxacin."
    ],
    "aliases": [
      "pradofloxacin",
      "veraflox"
    ],
    "pkPdType": "Concentration-dependent (Cmax : MIC > 8)",
    "pkPdGuidance": "Optimasi pembunuhan bakteri dengan memaksimalkan konsentrasi puncak (Cmax/MIC > 8). Dosis tinggi interval panjang (sekali sehari / q24h) meningkatkan efikasi dan efek pasca-antibiotik (PAE).",
    "stewardshipLabel": "Kritis / Cadangan (High Importance - ASTAG: Hanya Kasus Luar Biasa Berdasarkan C&S)",
    "stewardshipColor": "red",
    "stewardshipBadge": "ASTAG High (Kritis - C&S Only)",
    "interactions": [
      "Absorpsi oral terhambat drastis (>50%) oleh antasida, sucralfate, atau suplemen Kalsium, Magnesium, Besi, dan Zinc (kelasi kation).",
      "Injeksi IV: Mengalami presipitasi/kelasi bila dicampur dengan cairan infus mengandung Kalsium (misal Ringer Laktat) atau Magnesium.",
      "Menghambat metabolisme hepatik teofilin (Theophylline), meningkatkan risiko toksisitas teofilin.",
      "Antagonis dengan Chloramphenicol dan Rifampisin."
    ]
  },
  {
    "drug_class": "Fluoroquinolones",
    "importance_rating": "High",
    "antibiotic": "Ciprofloxacin",
    "registered_for_animals": false,
    "note": "Black shading - high importance rated antibiotic not registered for use in animals; avoid or ONLY use in exceptional circumstances.",
    "routes": [
      "PO"
    ],
    "drug_dose": "25 mg/kg",
    "adverse_reactions": [],
    "clinical_pearls": [
      "Avoid. Oral absorption in dogs highly variable (~50%), lower than humans.",
      "Only reaches therapeutic targets for bacteria with MIC <= 0.06 ug/ml (vs <= 1 ug/ml in humans).",
      "Generally not effective for staphylococci or P. aeruginosa in dogs and cats."
    ],
    "aliases": [
      "ciprofloxacin",
      "cipro"
    ],
    "pkPdType": "Concentration-dependent (Cmax : MIC > 8)",
    "pkPdGuidance": "Optimasi pembunuhan bakteri dengan memaksimalkan konsentrasi puncak (Cmax/MIC > 8). Dosis tinggi interval panjang (sekali sehari / q24h) meningkatkan efikasi dan efek pasca-antibiotik (PAE).",
    "stewardshipLabel": "Kritis / Cadangan (High Importance - ASTAG: Hanya Kasus Luar Biasa Berdasarkan C&S)",
    "stewardshipColor": "red",
    "stewardshipBadge": "ASTAG High (Kritis - C&S Only)",
    "interactions": [
      "Absorpsi oral terhambat drastis (>50%) oleh antasida, sucralfate, atau suplemen Kalsium, Magnesium, Besi, dan Zinc (kelasi kation).",
      "Injeksi IV: Mengalami presipitasi/kelasi bila dicampur dengan cairan infus mengandung Kalsium (misal Ringer Laktat) atau Magnesium.",
      "Menghambat metabolisme hepatik teofilin (Theophylline), meningkatkan risiko toksisitas teofilin.",
      "Antagonis dengan Chloramphenicol dan Rifampisin."
    ]
  }
],

  mrspFactSheet: {
  "title": "Methicillin-resistant Staphylococcus pseudintermedius (MRSP)",
  "key_facts": [
    "Staphylococcus pseudintermedius (SP) are normal skin/mucosal flora found on dogs and cats.",
    "Methicillin resistance = resistance to all β-lactam antimicrobials (including β-lactamase inhibitor combinations).",
    "Emerging opportunistic pathogen in Australia - 12% clinical SP infections MRSP, 8% healthy urban dogs MRSP carriers.",
    "MRSP vs Methicillin-susceptible SP: No more pathogenic; No difference in clinical disease.",
    "Many MRSP carry other resistance genes, sometimes extensive drug resistance."
  ],
  "treatment_options": {
    "general_principles": [
      "Critical to identify & address underlying cause.",
      "Try topical! MRSP is not resistant to antiseptics (eg. chlorhexidine, bleach).",
      "If needed, systemic therapy based on C&S (Culture and Susceptibility).",
      "No dominant susceptibility pattern, often MDR (multidrug resistant)."
    ],
    "ineffective_beta_lactams": {
      "note": "Resistant to all β-lactams except a few anti-MRSA cephalosporins",
      "excluded_drugs": [
        "Penicillin",
        "Amoxycillin",
        "Cephalosporins* (*Except a few anti-MRSA cephalosporins)",
        "Carbapenems",
        "Amoxy/clav"
      ]
    }
  },
  "biosecurity": {
    "personal": [
      "Routinely wash hands before & after each patient.",
      "Use liquid soap or alcohol-based hand sanitiser.",
      "Wear gloves when handling patients."
    ],
    "patient": [
      "Isolate MRSP patients.",
      "Consider in-contact pets carriers.",
      "Pets may carry MRSP after clinical resolution."
    ],
    "hospital": [
      "Clean gross contamination/biofilm with detergent first then disinfect.",
      "Routine cleaning and disinfection all that is required.",
      "MRSP readily inactivated by commonly used disinfectants."
    ]
  },
  "zoonotic_risk": [
    "Dogs are the natural SP host.",
    "Infection in people is rare, but possible.",
    "Minimise contact between infected dogs, other animals and people.",
    "Exposed bedding and surfaces will also be contaminated.",
    "Avoid contact with skin, nose, mouth, perineum and faeces of infected dogs.",
    "Warn owners of zoonotic potential, particularly those with breaches in their skin barrier or poor skin integrity (ie. wounds, elderly people).",
    "Wash or alcohol-sanitise hands after handling infected dog."
  ]
}
};

/**
 * Mencari profil antimikroba dari database berdasarkan nama obat, id, atau zat aktif
 */
export function findAntimicrobialProfile(drugQuery = "") {
  if (!drugQuery) return null;
  const q = drugQuery.toLowerCase().trim();

  return ANTIMICROBIAL_STEWARDSHIP_DATA.classes.find(item => {
    if (item.antibiotic.toLowerCase() === q) return true;
    if (item.aliases && item.aliases.some(a => q.includes(a) || a.includes(q))) return true;
    return false;
  }) || null;
}

/**
 * Memeriksa peringatan resiko klinis antimikroba spesifik (Dynamic Risk Alerts)
 */
export function checkAntimicrobialClinicalWarnings({
  species = "canine",
  drugQuery = "",
  doseRate = 0,
  formulation = "",
  weight = 0,
  breed = "",
  ageMonths = 24,
  isPregnant = false
} = {}) {
  const alerts = [];
  const s = (species || "").toLowerCase();
  const q = (drugQuery || "").toLowerCase();
  const form = (formulation || "").toLowerCase();
  const b = (breed || "").toLowerCase();
  const rate = parseFloat(doseRate) || 0;

  const profile = findAntimicrobialProfile(q);

  // 1. Enrofloxacin pada Kucing (Retinotoksisitas / Kebutaan)
  if ((s.includes("cat") || s.includes("kucing") || s.includes("feline")) && (q.includes("enrofloxacin") || q.includes("baytril"))) {
    if (rate > 5) {
      alerts.push({
        level: "fatal",
        title: "⛔ KONTRAINDIKASI FATAL (KUCING): RISIKO KEBUTAAN",
        badge: "Retinal Detachment",
        message: "Dosis Enrofloxacin > 5 mg/kg pada kucing memicu degenerasi retina akut, pelepasan retina (retinal detachment), dan kebutaan total permanen! Maksimal dosis adalah 5 mg/kg q24h slow IV, atau ganti dengan antimikroba lain."
      });
    } else {
      alerts.push({
        level: "warning",
        title: "⚠️ PERINGATAN RETINOTOKSISITAS KUCING (ENROFLOXACIN)",
        badge: "Feline Retinopathy",
        message: "Enrofloxacin memiliki risiko pelepasan retina pada kucing. Risiko melonjak pada kucing tua (geriatri) atau yang menderita gangguan ginjal. Jangan melebihi 5 mg/kg/hari dan pantau respon pupil."
      });
    }
  }

  // 2. Fluoroquinolone pada Anjing Sedang Tumbuh (Artropati / Kerusakan Kartilago)
  if ((s.includes("dog") || s.includes("anjing") || s.includes("canine")) && 
      (q.includes("enrofloxacin") || q.includes("marbofloxacin") || q.includes("pradofloxacin") || q.includes("ciprofloxacin"))) {
    alerts.push({
      level: "warning",
      title: "⚠️ RISIKO ARTHROPATHY & KARTILAGO (ANJING MUDA)",
      badge: "Cartilage Toxicity",
      message: "Fluoroquinolone merusak kartilago artikular sendi pada anjing dalam masa pertumbuhan (<8 bulan pada ras kecil, <12-18 bulan pada ras besar). Kontraindikasi untuk anakan sedang tumbuh."
    });
    alerts.push({
      level: "warning",
      title: "⚠️ BAHAYA TOXIC SHOCK & FASITIS (STREPTOCOCCUS CANIS)",
      badge: "S. canis Alert",
      message: "Penggunaan fluoroquinolone pada infeksi Streptococcus canis memicu Canine Toxic Shock Syndrome dan necrotizing fasciitis yang berakibat fatal. Selalu konfirmasi patogen."
    });
  }

  // 3. Ciprofloxacin Oral pada Anjing (Inkompetensi Farmakokinetik)
  if ((s.includes("dog") || s.includes("anjing") || s.includes("canine")) && q.includes("ciprofloxacin") && (form.includes("tab") || form.includes("oral") || form.includes("caps"))) {
    alerts.push({
      level: "warning",
      title: "⛔ HINDARI CIPROFLOXACIN ORAL PADA ANJING",
      badge: "Poor Bioavailability",
      message: "Bioavailabilitas oral Ciprofloxacin pada anjing sangat rendah dan tidak menentu (~50%). Umumnya gagal mencapai target terapetik untuk Staphylococcus dan Pseudomonas aeruginosa. Gunakan Enrofloxacin atau Marbofloxacin resmi veteriner."
    });
  }

  // 4. Trimethoprim Sulphonamide (TMS)
  if (q.includes("trimethoprim") || q.includes("sulphonamide") || q.includes("tms") || q.includes("bactrim")) {
    if (b.includes("doberman") || b.includes("pinscher")) {
      alerts.push({
        level: "fatal",
        title: "⛔ KONTRAINDIKASI MUTLAK: RAS DOBERMAN PINSCHER",
        badge: "Breed Idiosyncrasy",
        message: "Dilarang keras pada anjing ras Doberman Pinschers! Berisiko sangat tinggi mengalami reaksi hipersensitivitas imun idiosinkratik fatal, poliartritis, anemia aplastik, dan nekrosis hati."
      });
    }
    if (s.includes("dog") || s.includes("anjing")) {
      alerts.push({
        level: "warning",
        title: "⚠️ RISIKO KCS / DRY EYE & HIPOTIROIDISME (TMS)",
        badge: "Keratoconjunctivitis Sicca",
        message: "Pada anjing < 12 kg, terapi 1 minggu TMS menurunkan produksi air mata 15%. Dosis berlebih memicu KCS permanen. Jika terapi > 7 hari, wajib lakukan baseline & evaluasi berkala Schirmer Tear Test (STT)."
      });
    }
    if (s.includes("cat") || s.includes("kucing")) {
      alerts.push({
        level: "info",
        title: "ℹ️ HIPERSALIVASI KUCING (TABLET TMS)",
        badge: "Feline Salivation",
        message: "Kucing akan mengalami hipersalivasi parah (mulut berbusa) jika pelindung tablet TMS dipecah/digerus karena rasa obat sangat pahit. Berikan dalam cangkang kapsul utuh."
      });
    }
  }

  // 5. Clindamycin pada Kucing (Esophagitis / Striktur Esofagus)
  if ((s.includes("cat") || s.includes("kucing") || s.includes("feline")) && q.includes("clindamycin")) {
    if (form.includes("caps") || form.includes("kapsul") || form.includes("tab")) {
      alerts.push({
        level: "warning",
        title: "⚠️ RISIKO STRIKTUR ESOFAGUS (KUCING)",
        badge: "Esophageal Stricture",
        message: "Kapsul clindamycin generik yang tersangkut di esofagus kucing memicu esophagitis nekrotik dan striktur esofagus permanen. WAJIB disusul dorongan air minum 3-5 mL via spuit atau sedikit pakan basah."
      });
    }
  }

  // 6. Doxycycline pada Kucing & Pediatrik
  if (q.includes("doxycycline") || q.includes("doksisiklin")) {
    if (s.includes("cat") || s.includes("kucing") || s.includes("feline")) {
      alerts.push({
        level: "warning",
        title: "⚠️ RISIKO STRIKTUR ESOFAGUS KUCING (DOXYCYCLINE)",
        badge: "Esophageal Ulceration",
        message: "Tablet doksisiklin yang tersangkut di mukosa esofagus kucing memicu ulkus dan striktur esofagus fatal. Selalu berikan dorongan air minum (5-10 mL) sesudah tablet ditelan."
      });
    }
    if (ageMonths < 6 || isPregnant) {
      alerts.push({
        level: "warning",
        title: "⚠️ PEWARNAAN GIGI KUNING & GANGGUAN TULANG",
        badge: "Teeth Discolouration",
        message: "Doksisiklin mengikat kalsium pada gigi yang sedang tumbuh dan fetus, menyebabkan pewarnaan kuning kecokelatan permanen pada gigi dan displasia email."
      });
    }
  }

  // 7. Gentamicin (Aminoglikosida)
  if (q.includes("gentamicin") || q.includes("gentamisin")) {
    alerts.push({
      level: "warning",
      title: "⚠️ NEFROTOKSISITAS & OTOTOKSISITAS (GENTAMICIN)",
      badge: "Renal & Ear Safety",
      message: "Gentamicin bersifat nefrotoksik dan ototoksik. Pastikan hidrasi cairan dan elektrolit optimal. DILARANG bersamaan dengan NSAID (Meloxicam) atau Furosemide. Inaktif bila ada debris nanah/purulen."
    });
  }

  // 8. Metronidazole (SSP & Hepatotoksisitas)
  if (q.includes("metronidazole") || q.includes("flagyl")) {
    alerts.push({
      level: "warning",
      title: "⚠️ NEUROTOKSISITAS SSP & PERINGATAN HEPAR",
      badge: "CNS Toxicity",
      message: "Pada pasien gangguan fungsi hepar, turunkan dosis ke 7.5 mg/kg untuk mencegah akumulasi toksisitas SSP (ataksia, nistagmus, kejang). Kontraindikasi pada trimester 1 kebuntingan. Tidak diindikasikan pada diare akut tanpa bukti sepsis."
    });
  }

  // 9. Nitrofurantoin (Lower UTI Only)
  if (q.includes("nitrofurantoin")) {
    alerts.push({
      level: "warning",
      title: "⚠️ HANYA UNTUK ISK BAWAH (LOWER UTI)",
      badge: "No Tissue Levels",
      message: "Hanya mencapai konsentrasi terapetik di urine (bukan jaringan). Dilarang untuk pyelonephritis atau prostatitis. Antagonis dengan fluoroquinolones. Hindari pada gangguan ginjal."
    });
  }

  // 10. Chloramphenicol (Depresi Sumsum Tulang & Keamanan Operator)
  if (q.includes("chloramphenicol") || q.includes("kloramfenikol")) {
    alerts.push({
      level: "warning",
      title: "⚠️ DEPRESI SUMSUM TULANG & KEAMANAN OPERATOR",
      badge: "Aplastic Anemia Risk",
      message: "Kucing sangat sensitif terhadap depresi sumsum tulang reversibel (muncul dalam 2 minggu). Operator/dokter WAJIB memakai sarung tangan dan masker karena kontak manusia dapat memicu anemia aplastik idiosinkratik fatal."
    });
  }

  // 11. High Importance ASTAG Stewardship Badge
  if (profile && profile.importance_rating === "High") {
    alerts.push({
      level: "info",
      title: "🔴 ANTIMICROBIAL STEWARDSHIP: KATEGORI TINGGI (ASTAG HIGH)",
      badge: "Culture & Susceptibility Only",
      message: "Obat ini termasuk kategori High Importance (kritis). Menurut pedoman University of Melbourne & AgVic, obat ini HANYA boleh diresepkan untuk keadaan luar biasa berdasarkan hasil uji Kultur & Sensitivitas (C&S) ketika tidak ada alternatif lain yang memadai."
    });
  }

  return alerts;
}

/**
 * Menghasilkan ringkasan interaksi dan pedoman stewardship untuk UI
 */
export function getAntimicrobialSummaryCard(drugQuery = "") {
  const profile = findAntimicrobialProfile(drugQuery);
  if (!profile) return null;

  return {
    name: profile.antibiotic,
    drugClass: profile.drug_class,
    importanceRating: profile.importance_rating,
    stewardshipLabel: profile.stewardshipLabel,
    stewardshipBadge: profile.stewardshipBadge,
    stewardshipColor: profile.stewardshipColor,
    registeredForAnimals: profile.registered_for_animals,
    routes: profile.routes,
    recommendedDose: profile.drug_dose,
    pkPdType: profile.pkPdType,
    pkPdGuidance: profile.pkPdGuidance,
    adverseReactions: profile.adverse_reactions,
    clinicalPearls: profile.clinical_pearls,
    interactions: profile.interactions
  };
}
