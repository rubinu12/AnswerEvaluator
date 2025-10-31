export const SUBJECTS: string[] = [
    "Polity", "Geo (Ind)", "Geo (World)", "Economics", 
    "A. History", "Med. History", "M. History", "A & C", 
    "Agriculture", "Env. & Eco.", "Sci. & Tech", "Misc."
];

export const TOPICS: Record<string, string[]> = {
    "Polity": [
        "Constitutional Framework", "Fundamental Rights & Duties", "Union Government",
        "State Government", "Local Government", "Centre-State Relations",
        "Constitutional Bodies", "Non-Constitutional Bodies", "Judiciary",
        "Special Provisions", "Misc."
    ],
    "Geo (Ind)": [
        "Physical Features", "River Systems", "Climate", "Natural Vegetation & Wildlife",
        "Soils", "Resources", "Agriculture", "Industries", "Transport & Communication",
        "Population & Demographics", "Misc."
    ],
    "Geo (World)": [
        "Geomorphology", "Climatology", "Oceanography", "Biogeography",
        "Human & Economic Geography", "Mapping & Places in News", "Misc."
    ],
    "Economics": [
        "Growth & Development", "Money & Banking", "Fiscal Policy", "Planning in India",
        "External Sector", "Indian Agriculture", "Industrial Sector & Infrastructure",
        "Poverty, Unemployment & Social Sector", "International Economic Institutions", "Misc."
    ],
    "A. History": [
        "Prehistoric Period", "Indus Valley Civilization", "Vedic Age", "Mahajanapadas",
        "Religious Movements", "Mauryan Empire", "Post-Mauryan Period", "Gupta Period",
        "Harshavardhana Period", "Sangam Age", "Misc."
    ],
    "Med. History": [
        "Early Medieval India", "Delhi Sultanate", "Vijayanagara & Bahmani Kingdoms",
        "Mughal Empire", "Bhakti & Sufi Movements", "Maratha Empire", "Decline of Mughal Empire", "Misc."
    ],
    "M. History": [
        "Advent of Europeans", "British Conquest of India", "Revolt of 1857",
        "Socio-Religious Reform Movements", "Economic Impact of British Rule",
        "Indian National Movement (1885-1905)", "Indian National Movement (1905-1919)",
        "Gandhian Era (1919-1947)", "Revolutionary Nationalism", "Independence & Partition", "Misc."
    ],
    "A & C": [
        "Architecture", "Sculpture", "Paintings", "Performing Arts (Dance)",
        "Performing Arts (Music)", "Performing Arts (Theatre & Puppetry)", "Literature",
        "Religion & Philosophy", "Fairs & Festivals", "UNESCO World Heritage Sites", "Misc."
    ],
    "Agriculture": [
        "Basics of Agriculture", "Soil & Nutrients", "Irrigation & Water Management",
        "Government Schemes & Policies", "Agricultural Economics", "Animal Husbandry", "Misc."
    ],
    "Env. & Eco.": [
        "Ecology & Ecosystem", "Biodiversity", "Climate Change", "Environmental Pollution",
        "Acts, Policies & Conventions", "Environmental Organizations", "Misc."
    ],
    "Sci. & Tech": [
        "Space Technology", "Biotechnology", "Information Technology & Computers",
        "Defence Technology", "Nuclear Technology", "Health & Diseases", "General Science", "Misc."
    ],
    "Misc.": [] // An empty array signifies that any topic is allowed for the "Misc." subject.
};