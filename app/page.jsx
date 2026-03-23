"use client";
import { useState, useEffect, useRef, useCallback } from "react";

// ─── DATA ─────────────────────────────────────────────────────────────────────
const OCCUPATIONS = [
  { title: "Chief Executives", soc: "11-1011", soc6:"111011", projectedGrowth:    0, automationRisk:  15, category: "Management", emp:   197400, seedWage:  213020 },
  { title: "General & Operations Managers", soc: "11-1021", soc6:"111021", projectedGrowth:    4, automationRisk:  18, category: "Management", emp:  3534300, seedWage:   98100 },
  { title: "Advertising & Promotions Managers", soc: "11-2011", soc6:"112011", projectedGrowth:    4, automationRisk:  25, category: "Management", emp:    24200, seedWage:  133460 },
  { title: "Marketing Managers", soc: "11-2021", soc6:"112021", projectedGrowth:    5, automationRisk:  22, category: "Management", emp:   317400, seedWage:  156580 },
  { title: "Sales Managers", soc: "11-2022", soc6:"112022", projectedGrowth:    4, automationRisk:  20, category: "Management", emp:   388200, seedWage:  130600 },
  { title: "Public Relations Managers", soc: "11-2031", soc6:"112031", projectedGrowth:    5, automationRisk:  28, category: "Management", emp:    77900, seedWage:  125780 },
  { title: "Administrative Services Managers", soc: "11-3012", soc6:"113012", projectedGrowth:    5, automationRisk:  20, category: "Management", emp:   293700, seedWage:   99290 },
  { title: "Computer & IS Managers", soc: "11-3021", soc6:"113021", projectedGrowth:   15, automationRisk:  12, category: "Management", emp:   488900, seedWage:  164070 },
  { title: "Financial Managers", soc: "11-3031", soc6:"113031", projectedGrowth:    7, automationRisk:  18, category: "Finance", emp:   681700, seedWage:  139790 },
  { title: "Industrial Production Managers", soc: "11-3051", soc6:"113051", projectedGrowth:    1, automationRisk:  22, category: "Management", emp:   173900, seedWage:  108540 },
  { title: "Purchasing Managers", soc: "11-3061", soc6:"113061", projectedGrowth:    1, automationRisk:  30, category: "Management", emp:    74200, seedWage:  131350 },
  { title: "Transportation Managers", soc: "11-3071", soc6:"113071", projectedGrowth:    5, automationRisk:  18, category: "Management", emp:   249500, seedWage:  100840 },
  { title: "Construction Managers", soc: "11-9021", soc6:"119021", projectedGrowth:    8, automationRisk:  12, category: "Management", emp:   469800, seedWage:   98890 },
  { title: "Education Administrators (Postsec)", soc: "11-9033", soc6:"119033", projectedGrowth:    5, automationRisk:  14, category: "Education", emp:   200600, seedWage:   99940 },
  { title: "Education Administrators (K-12)", soc: "11-9032", soc6:"119032", projectedGrowth:    3, automationRisk:  12, category: "Education", emp:   275800, seedWage:   99490 },
  { title: "Food Service Managers", soc: "11-9051", soc6:"119051", projectedGrowth:    9, automationRisk:  15, category: "Hospitality", emp:   307500, seedWage:   59440 },
  { title: "Medical & Health Services Managers", soc: "11-9111", soc6:"119111", projectedGrowth:   28, automationRisk:  10, category: "Healthcare", emp:   429800, seedWage:  104830 },
  { title: "Natural Sciences Managers", soc: "11-9121", soc6:"119121", projectedGrowth:    5, automationRisk:  14, category: "Science", emp:    72400, seedWage:  156110 },
  { title: "Property Managers", soc: "11-9141", soc6:"119141", projectedGrowth:    5, automationRisk:  22, category: "Management", emp:   365500, seedWage:   62600 },
  { title: "Social & Community Service Managers", soc: "11-9151", soc6:"119151", projectedGrowth:    9, automationRisk:  14, category: "Social Services", emp:   176400, seedWage:   74000 },
  { title: "Emergency Management Directors", soc: "11-9161", soc6:"119161", projectedGrowth:    3, automationRisk:  15, category: "Management", emp:    10600, seedWage:   79180 },
  { title: "Human Resources Managers", soc: "11-3121", soc6:"113121", projectedGrowth:    5, automationRisk:  18, category: "Business", emp:   165400, seedWage:  130000 },
  { title: "Training & Development Managers", soc: "11-3131", soc6:"113131", projectedGrowth:    6, automationRisk:  18, category: "Business", emp:    38800, seedWage:  120000 },
  { title: "Compensation & Benefits Managers", soc: "11-3111", soc6:"113111", projectedGrowth:    2, automationRisk:  25, category: "Business", emp:    16600, seedWage:  127530 },
  { title: "Buyers & Purchasing Agents", soc: "13-1020", soc6:"131020", projectedGrowth:   -4, automationRisk:  42, category: "Business", emp:   482900, seedWage:   67620 },
  { title: "Claims Adjusters", soc: "13-1031", soc6:"131031", projectedGrowth:   -2, automationRisk:  55, category: "Business", emp:   284200, seedWage:   67680 },
  { title: "Compliance Officers", soc: "13-1041", soc6:"131041", projectedGrowth:    5, automationRisk:  28, category: "Business", emp:   372800, seedWage:   76940 },
  { title: "Cost Estimators", soc: "13-1051", soc6:"131051", projectedGrowth:    1, automationRisk:  32, category: "Business", emp:   213800, seedWage:   66570 },
  { title: "Human Resources Specialists", soc: "13-1071", soc6:"131071", projectedGrowth:    6, automationRisk:  35, category: "Business", emp:   870000, seedWage:   64240 },
  { title: "Labor Relations Specialists", soc: "13-1075", soc6:"131075", projectedGrowth:    3, automationRisk:  30, category: "Business", emp:    73400, seedWage:   80650 },
  { title: "Logisticians", soc: "13-1081", soc6:"131081", projectedGrowth:    5, automationRisk:  28, category: "Business", emp:   196500, seedWage:   77030 },
  { title: "Management Analysts", soc: "13-1111", soc6:"131111", projectedGrowth:   10, automationRisk:  22, category: "Business", emp:   876300, seedWage:   95290 },
  { title: "Meeting & Event Planners", soc: "13-1121", soc6:"131121", projectedGrowth:   11, automationRisk:  20, category: "Business", emp:   130200, seedWage:   52560 },
  { title: "Market Research Analysts", soc: "13-1161", soc6:"131161", projectedGrowth:   13, automationRisk:  42, category: "Business", emp:   792000, seedWage:   68230 },
  { title: "Training & Development Specialists", soc: "13-1151", soc6:"131151", projectedGrowth:    6, automationRisk:  28, category: "Business", emp:   344700, seedWage:   62700 },
  { title: "Compensation & Job Analysis Spec.", soc: "13-1141", soc6:"131141", projectedGrowth:    4, automationRisk:  35, category: "Business", emp:    82800, seedWage:   70080 },
  { title: "Financial Analysts", soc: "13-2051", soc6:"132051", projectedGrowth:    8, automationRisk:  38, category: "Finance", emp:   371800, seedWage:   96220 },
  { title: "Personal Financial Advisors", soc: "13-2052", soc6:"132052", projectedGrowth:   13, automationRisk:  18, category: "Finance", emp:   312500, seedWage:   94170 },
  { title: "Financial Examiners", soc: "13-2061", soc6:"132061", projectedGrowth:    6, automationRisk:  30, category: "Finance", emp:    62200, seedWage:   82820 },
  { title: "Credit Analysts", soc: "13-2041", soc6:"132041", projectedGrowth:   -3, automationRisk:  52, category: "Finance", emp:    71700, seedWage:   78070 },
  { title: "Accountants & Auditors", soc: "13-2011", soc6:"132011", projectedGrowth:   -4, automationRisk:  60, category: "Finance", emp:  1371000, seedWage:   78000 },
  { title: "Budget Analysts", soc: "13-2031", soc6:"132031", projectedGrowth:    0, automationRisk:  35, category: "Finance", emp:    57200, seedWage:   82260 },
  { title: "Tax Examiners & Collectors", soc: "13-2081", soc6:"132081", projectedGrowth:   -4, automationRisk:  58, category: "Finance", emp:    68100, seedWage:   57060 },
  { title: "Tax Preparers", soc: "13-2082", soc6:"132082", projectedGrowth:   -7, automationRisk:  72, category: "Finance", emp:    60400, seedWage:   49550 },
  { title: "Insurance Underwriters", soc: "13-2053", soc6:"132053", projectedGrowth:  -10, automationRisk:  68, category: "Finance", emp:    92400, seedWage:   76390 },
  { title: "Loan Officers", soc: "13-2072", soc6:"132072", projectedGrowth:    2, automationRisk:  42, category: "Finance", emp:   318300, seedWage:   65740 },
  { title: "Fundraisers", soc: "13-1131", soc6:"131131", projectedGrowth:    9, automationRisk:  20, category: "Business", emp:   100400, seedWage:   60460 },
  { title: "Software Developers", soc: "15-1252", soc6:"151252", projectedGrowth:   25, automationRisk:   8, category: "Technology", emp:  1795900, seedWage:  124200 },
  { title: "Software Quality Assurance Analysts", soc: "15-1253", soc6:"151253", projectedGrowth:   25, automationRisk:  20, category: "Technology", emp:   219900, seedWage:   99620 },
  { title: "Web Developers", soc: "15-1254", soc6:"151254", projectedGrowth:   16, automationRisk:  22, category: "Technology", emp:   199400, seedWage:   78300 },
  { title: "Web & Digital Interface Designers", soc: "15-1255", soc6:"151255", projectedGrowth:   16, automationRisk:  28, category: "Technology", emp:   229100, seedWage:   79890 },
  { title: "Data Scientists", soc: "15-2051", soc6:"152051", projectedGrowth:   35, automationRisk:  12, category: "Technology", emp:   168900, seedWage:  103500 },
  { title: "Database Administrators", soc: "15-1242", soc6:"151242", projectedGrowth:    9, automationRisk:  30, category: "Technology", emp:   111200, seedWage:   99890 },
  { title: "Database Architects", soc: "15-1243", soc6:"151243", projectedGrowth:    9, automationRisk:  22, category: "Technology", emp:   143300, seedWage:  114750 },
  { title: "Network Architects", soc: "15-1241", soc6:"151241", projectedGrowth:    4, automationRisk:  18, category: "Technology", emp:   165800, seedWage:  120520 },
  { title: "Information Security Analysts", soc: "15-1212", soc6:"151212", projectedGrowth:   32, automationRisk:  15, category: "Technology", emp:   168900, seedWage:  112000 },
  { title: "IT Project Managers", soc: "15-1299", soc6:"151299", projectedGrowth:   10, automationRisk:  20, category: "Technology", emp:   698800, seedWage:  101000 },
  { title: "Computer Systems Analysts", soc: "15-1211", soc6:"151211", projectedGrowth:    9, automationRisk:  25, category: "Technology", emp:   609600, seedWage:   99270 },
  { title: "Computer Network Support Specialists", soc: "15-1231", soc6:"151231", projectedGrowth:    5, automationRisk:  32, category: "Technology", emp:   180100, seedWage:   62340 },
  { title: "Computer User Support Specialists", soc: "15-1232", soc6:"151232", projectedGrowth:    6, automationRisk:  38, category: "Technology", emp:   644700, seedWage:   57910 },
  { title: "AI & ML Engineers", soc: "15-2099", soc6:"152099", projectedGrowth:   40, automationRisk:   9, category: "Technology", emp:    62000, seedWage:  136620 },
  { title: "Cloud Computing Specialists", soc: "15-1251", soc6:"151251", projectedGrowth:   15, automationRisk:  14, category: "Technology", emp:   298000, seedWage:  118650 },
  { title: "Operations Research Analysts", soc: "15-2031", soc6:"152031", projectedGrowth:   23, automationRisk:  28, category: "Technology", emp:   104300, seedWage:   84810 },
  { title: "Statisticians", soc: "15-2041", soc6:"152041", projectedGrowth:   32, automationRisk:  18, category: "Technology", emp:    39000, seedWage:   98960 },
  { title: "Mathematicians", soc: "15-2021", soc6:"152021", projectedGrowth:   28, automationRisk:  16, category: "Technology", emp:    11600, seedWage:  112110 },
  { title: "Actuaries", soc: "15-2011", soc6:"152011", projectedGrowth:   23, automationRisk:  22, category: "Finance", emp:    28000, seedWage:  113990 },
  { title: "Computer & Information Scientists", soc: "15-1221", soc6:"151221", projectedGrowth:   23, automationRisk:  12, category: "Technology", emp:    34700, seedWage:  136620 },
  { title: "Aerospace Engineers", soc: "17-2011", soc6:"172011", projectedGrowth:    6, automationRisk:  18, category: "Engineering", emp:    65400, seedWage:  122270 },
  { title: "Bioengineers & Biomedical Engineers", soc: "17-2031", soc6:"172031", projectedGrowth:   10, automationRisk:  14, category: "Engineering", emp:    20400, seedWage:   99550 },
  { title: "Chemical Engineers", soc: "17-2041", soc6:"172041", projectedGrowth:    8, automationRisk:  20, category: "Engineering", emp:    25600, seedWage:  106260 },
  { title: "Civil Engineers", soc: "17-2051", soc6:"172051", projectedGrowth:    5, automationRisk:  18, category: "Engineering", emp:   321100, seedWage:   88050 },
  { title: "Computer Hardware Engineers", soc: "17-2061", soc6:"172061", projectedGrowth:    5, automationRisk:  18, category: "Engineering", emp:    67200, seedWage:  128170 },
  { title: "Electrical Engineers", soc: "17-2071", soc6:"172071", projectedGrowth:    5, automationRisk:  18, category: "Engineering", emp:   191300, seedWage:  101780 },
  { title: "Electronics Engineers", soc: "17-2072", soc6:"172072", projectedGrowth:    1, automationRisk:  22, category: "Engineering", emp:   139200, seedWage:  105570 },
  { title: "Environmental Engineers", soc: "17-2081", soc6:"172081", projectedGrowth:    4, automationRisk:  18, category: "Engineering", emp:    59200, seedWage:   96440 },
  { title: "Industrial Engineers", soc: "17-2112", soc6:"172112", projectedGrowth:   10, automationRisk:  25, category: "Engineering", emp:   296700, seedWage:   96350 },
  { title: "Materials Engineers", soc: "17-2131", soc6:"172131", projectedGrowth:    7, automationRisk:  20, category: "Engineering", emp:    27400, seedWage:   98300 },
  { title: "Mechanical Engineers", soc: "17-2141", soc6:"172141", projectedGrowth:   10, automationRisk:  20, category: "Engineering", emp:   299000, seedWage:   96310 },
  { title: "Nuclear Engineers", soc: "17-2161", soc6:"172161", projectedGrowth:    1, automationRisk:  18, category: "Engineering", emp:    16900, seedWage:  120380 },
  { title: "Petroleum Engineers", soc: "17-2171", soc6:"172171", projectedGrowth:   12, automationRisk:  18, category: "Engineering", emp:    33600, seedWage:  131800 },
  { title: "Structural Engineers", soc: "17-2051", soc6:"172051", projectedGrowth:    6, automationRisk:  18, category: "Engineering", emp:    77000, seedWage:   90000 },
  { title: "Architects", soc: "17-1011", soc6:"171011", projectedGrowth:    3, automationRisk:  22, category: "Architecture", emp:   126400, seedWage:   82840 },
  { title: "Landscape Architects", soc: "17-1012", soc6:"171012", projectedGrowth:    5, automationRisk:  18, category: "Architecture", emp:    24000, seedWage:   73180 },
  { title: "Surveyors", soc: "17-1022", soc6:"171022", projectedGrowth:    3, automationRisk:  28, category: "Engineering", emp:    44700, seedWage:   68270 },
  { title: "Drafters", soc: "17-3010", soc6:"173010", projectedGrowth:   -4, automationRisk:  52, category: "Engineering", emp:   196600, seedWage:   57960 },
  { title: "Engineering Technologists & Techs", soc: "17-3020", soc6:"173020", projectedGrowth:    2, automationRisk:  32, category: "Engineering", emp:   443700, seedWage:   60590 },
  { title: "Solar Energy Systems Engineers", soc: "17-2199", soc6:"172199", projectedGrowth:   30, automationRisk:  14, category: "Green Energy", emp:    14000, seedWage:  103920 },
  { title: "Agricultural Scientists", soc: "19-1010", soc6:"191010", projectedGrowth:    7, automationRisk:  14, category: "Science", emp:    22700, seedWage:   72650 },
  { title: "Biological Scientists", soc: "19-1020", soc6:"191020", projectedGrowth:    5, automationRisk:  14, category: "Science", emp:    39200, seedWage:   82220 },
  { title: "Conservation Scientists", soc: "19-1031", soc6:"191031", projectedGrowth:    4, automationRisk:  16, category: "Science", emp:    25000, seedWage:   65100 },
  { title: "Epidemiologists", soc: "19-1041", soc6:"191041", projectedGrowth:   26, automationRisk:  14, category: "Healthcare", emp:     7400, seedWage:   78830 },
  { title: "Medical Scientists", soc: "19-1042", soc6:"191042", projectedGrowth:   10, automationRisk:  14, category: "Science", emp:   136900, seedWage:   99930 },
  { title: "Life Scientists (Other)", soc: "19-1099", soc6:"191099", projectedGrowth:    7, automationRisk:  16, category: "Science", emp:    23700, seedWage:   78540 },
  { title: "Astronomers & Physicists", soc: "19-2010", soc6:"192010", projectedGrowth:    5, automationRisk:  12, category: "Science", emp:    22500, seedWage:  133800 },
  { title: "Atmospheric Scientists", soc: "19-2021", soc6:"192021", projectedGrowth:    8, automationRisk:  14, category: "Science", emp:    10700, seedWage:   94470 },
  { title: "Chemists & Materials Scientists", soc: "19-2030", soc6:"192030", projectedGrowth:    5, automationRisk:  18, category: "Science", emp:    98800, seedWage:   80290 },
  { title: "Environmental Scientists", soc: "19-2041", soc6:"192041", projectedGrowth:    6, automationRisk:  16, category: "Science", emp:    91700, seedWage:   76480 },
  { title: "Geoscientists", soc: "19-2042", soc6:"192042", projectedGrowth:    5, automationRisk:  16, category: "Science", emp:    31600, seedWage:   93580 },
  { title: "Economists", soc: "19-3011", soc6:"193011", projectedGrowth:    6, automationRisk:  18, category: "Business", emp:    21800, seedWage:  113940 },
  { title: "Survey Researchers", soc: "19-3022", soc6:"193022", projectedGrowth:   -5, automationRisk:  42, category: "Business", emp:    11000, seedWage:   59170 },
  { title: "Clinical Psychologists", soc: "19-3031", soc6:"193031", projectedGrowth:    6, automationRisk:   8, category: "Healthcare", emp:   181100, seedWage:   82180 },
  { title: "School Psychologists", soc: "19-3034", soc6:"193034", projectedGrowth:    7, automationRisk:   8, category: "Education", emp:    46600, seedWage:   81500 },
  { title: "Sociologists", soc: "19-3041", soc6:"193041", projectedGrowth:    5, automationRisk:  16, category: "Science", emp:     4100, seedWage:   92910 },
  { title: "Urban & Regional Planners", soc: "19-3051", soc6:"193051", projectedGrowth:    4, automationRisk:  18, category: "Management", emp:    41300, seedWage:   78500 },
  { title: "Social Scientists (Other)", soc: "19-3090", soc6:"193090", projectedGrowth:    5, automationRisk:  20, category: "Science", emp:    45400, seedWage:   78150 },
  { title: "Political Scientists", soc: "19-3094", soc6:"193094", projectedGrowth:    5, automationRisk:  14, category: "Science", emp:     8500, seedWage:  122220 },
  { title: "Forensic Science Technicians", soc: "19-4092", soc6:"194092", projectedGrowth:    9, automationRisk:  18, category: "Legal", emp:    17200, seedWage:   62090 },
  { title: "Substance Abuse Counselors", soc: "21-1011", soc6:"211011", projectedGrowth:   18, automationRisk:   5, category: "Social Services", emp:   322000, seedWage:   48520 },
  { title: "Marriage & Family Therapists", soc: "21-1013", soc6:"211013", projectedGrowth:   14, automationRisk:   5, category: "Social Services", emp:    45700, seedWage:   56570 },
  { title: "Mental Health Counselors", soc: "21-1014", soc6:"211014", projectedGrowth:   22, automationRisk:   5, category: "Social Services", emp:   386400, seedWage:   49710 },
  { title: "Rehabilitation Counselors", soc: "21-1015", soc6:"211015", projectedGrowth:    7, automationRisk:   6, category: "Social Services", emp:    96600, seedWage:   40850 },
  { title: "Child & Family Social Workers", soc: "21-1021", soc6:"211021", projectedGrowth:    7, automationRisk:   5, category: "Social Services", emp:   330700, seedWage:   50820 },
  { title: "Healthcare Social Workers", soc: "21-1022", soc6:"211022", projectedGrowth:   11, automationRisk:   5, category: "Social Services", emp:   192800, seedWage:   60280 },
  { title: "Mental Health Social Workers", soc: "21-1023", soc6:"211023", projectedGrowth:   11, automationRisk:   5, category: "Social Services", emp:   137700, seedWage:   55600 },
  { title: "Community Health Workers", soc: "21-1094", soc6:"211094", projectedGrowth:   14, automationRisk:  12, category: "Social Services", emp:   124800, seedWage:   46190 },
  { title: "Probation Officers", soc: "21-1092", soc6:"211092", projectedGrowth:    2, automationRisk:   8, category: "Legal", emp:    95000, seedWage:   59860 },
  { title: "Clergy", soc: "21-2011", soc6:"212011", projectedGrowth:    1, automationRisk:   8, category: "Social Services", emp:    51300, seedWage:   57230 },
  { title: "Lawyers", soc: "23-1011", soc6:"231011", projectedGrowth:    8, automationRisk:  20, category: "Legal", emp:   813900, seedWage:  135740 },
  { title: "Judicial Law Clerks", soc: "23-1012", soc6:"231012", projectedGrowth:    3, automationRisk:  22, category: "Legal", emp:    28600, seedWage:   55970 },
  { title: "Judges & Magistrates", soc: "23-1023", soc6:"231023", projectedGrowth:    2, automationRisk:  12, category: "Legal", emp:    28300, seedWage:  148190 },
  { title: "Paralegals & Legal Assistants", soc: "23-2011", soc6:"232011", projectedGrowth:    4, automationRisk:  38, category: "Legal", emp:   333000, seedWage:   59200 },
  { title: "Legal Secretaries", soc: "43-6012", soc6:"436012", projectedGrowth:  -18, automationRisk:  68, category: "Legal", emp:   182000, seedWage:   49870 },
  { title: "Title Examiners & Searchers", soc: "23-2093", soc6:"232093", projectedGrowth:   -4, automationRisk:  60, category: "Legal", emp:    55700, seedWage:   49890 },
  { title: "Preschool Teachers", soc: "25-2011", soc6:"252011", projectedGrowth:    7, automationRisk:   6, category: "Education", emp:   553000, seedWage:   36520 },
  { title: "Kindergarten Teachers", soc: "25-2012", soc6:"252012", projectedGrowth:    1, automationRisk:   6, category: "Education", emp:   145700, seedWage:   62290 },
  { title: "Elementary School Teachers", soc: "25-2021", soc6:"252021", projectedGrowth:    1, automationRisk:   6, category: "Education", emp:  1425200, seedWage:   61350 },
  { title: "Middle School Teachers", soc: "25-2022", soc6:"252022", projectedGrowth:    4, automationRisk:   6, category: "Education", emp:   620600, seedWage:   61320 },
  { title: "High School Teachers", soc: "25-2031", soc6:"252031", projectedGrowth:    1, automationRisk:   6, category: "Education", emp:  1058100, seedWage:   62360 },
  { title: "Special Education Teachers", soc: "25-2050", soc6:"252050", projectedGrowth:    3, automationRisk:   5, category: "Education", emp:   470000, seedWage:   62390 },
  { title: "Postsecondary Teachers", soc: "25-1099", soc6:"251099", projectedGrowth:    8, automationRisk:  12, category: "Education", emp:  1260000, seedWage:   80840 },
  { title: "Adult Literacy Instructors", soc: "25-3011", soc6:"253011", projectedGrowth:    8, automationRisk:   8, category: "Education", emp:   143600, seedWage:   57590 },
  { title: "Instructional Coordinators", soc: "25-9031", soc6:"259031", projectedGrowth:    2, automationRisk:  25, category: "Education", emp:   176600, seedWage:   66490 },
  { title: "Tutors", soc: "25-3041", soc6:"253041", projectedGrowth:   11, automationRisk:  10, category: "Education", emp:   194100, seedWage:   36650 },
  { title: "Librarians", soc: "25-4022", soc6:"254022", projectedGrowth:   -5, automationRisk:  22, category: "Education", emp:   130500, seedWage:   61190 },
  { title: "Library Technicians", soc: "25-4031", soc6:"254031", projectedGrowth:   -5, automationRisk:  35, category: "Education", emp:   102800, seedWage:   37500 },
  { title: "Teacher Assistants", soc: "25-9045", soc6:"259045", projectedGrowth:    2, automationRisk:  18, category: "Education", emp:  1337000, seedWage:   30920 },
  { title: "School & Career Counselors", soc: "21-1012", soc6:"211012", projectedGrowth:    5, automationRisk:   8, category: "Education", emp:   348400, seedWage:   61190 },
  { title: "Art Directors", soc: "27-1011", soc6:"271011", projectedGrowth:    5, automationRisk:  22, category: "Creative", emp:    86600, seedWage:  100890 },
  { title: "Craft & Fine Artists", soc: "27-1012", soc6:"271012", projectedGrowth:    8, automationRisk:  30, category: "Creative", emp:    49000, seedWage:   50120 },
  { title: "Graphic Designers", soc: "27-1024", soc6:"271024", projectedGrowth:    3, automationRisk:  45, category: "Creative", emp:   300000, seedWage:   57990 },
  { title: "Industrial Designers", soc: "27-1021", soc6:"271021", projectedGrowth:    2, automationRisk:  28, category: "Creative", emp:    44200, seedWage:   71640 },
  { title: "Interior Designers", soc: "27-1025", soc6:"271025", projectedGrowth:    4, automationRisk:  30, category: "Creative", emp:    82100, seedWage:   61590 },
  { title: "Fashion Designers", soc: "27-1022", soc6:"271022", projectedGrowth:   -3, automationRisk:  32, category: "Creative", emp:    21600, seedWage:   77560 },
  { title: "Floral Designers", soc: "27-1023", soc6:"271023", projectedGrowth:  -10, automationRisk:  40, category: "Creative", emp:    55600, seedWage:   33740 },
  { title: "Multimedia Artists & Animators", soc: "27-1014", soc6:"271014", projectedGrowth:    5, automationRisk:  25, category: "Creative", emp:    76800, seedWage:   98950 },
  { title: "Photographers", soc: "27-4021", soc6:"274021", projectedGrowth:    6, automationRisk:  30, category: "Creative", emp:   134600, seedWage:   42770 },
  { title: "Film & Video Editors", soc: "27-4032", soc6:"274032", projectedGrowth:    7, automationRisk:  20, category: "Creative", emp:    66800, seedWage:   62360 },
  { title: "Broadcast Announcers", soc: "27-3011", soc6:"273011", projectedGrowth:  -10, automationRisk:  38, category: "Creative", emp:    35200, seedWage:   46340 },
  { title: "Reporters & Correspondents", soc: "27-3022", soc6:"273022", projectedGrowth:   -9, automationRisk:  32, category: "Creative", emp:    44200, seedWage:   55960 },
  { title: "Technical Writers", soc: "27-3042", soc6:"273042", projectedGrowth:    4, automationRisk:  28, category: "Creative", emp:    58400, seedWage:   78060 },
  { title: "Writers & Authors", soc: "27-3043", soc6:"273043", projectedGrowth:    4, automationRisk:  28, category: "Creative", emp:   161400, seedWage:   73690 },
  { title: "Editors", soc: "27-3041", soc6:"273041", projectedGrowth:   -5, automationRisk:  32, category: "Creative", emp:   125600, seedWage:   73080 },
  { title: "Interpreters & Translators", soc: "27-3091", soc6:"273091", projectedGrowth:   14, automationRisk:  25, category: "Creative", emp:    71000, seedWage:   57090 },
  { title: "Actors", soc: "27-2011", soc6:"272011", projectedGrowth:    8, automationRisk:  18, category: "Creative", emp:    43700, seedWage:   23760 },
  { title: "Musicians & Singers", soc: "27-2042", soc6:"272042", projectedGrowth:    3, automationRisk:  15, category: "Creative", emp:   181100, seedWage:   39500 },
  { title: "Producers & Directors", soc: "27-2012", soc6:"272012", projectedGrowth:    7, automationRisk:  18, category: "Creative", emp:   177600, seedWage:   85320 },
  { title: "Audiologists", soc: "29-1181", soc6:"291181", projectedGrowth:   10, automationRisk:   4, category: "Healthcare", emp:    16600, seedWage:   82680 },
  { title: "Chiropractors", soc: "29-1011", soc6:"291011", projectedGrowth:    9, automationRisk:   5, category: "Healthcare", emp:    43800, seedWage:   75380 },
  { title: "Dentists", soc: "29-1020", soc6:"291020", projectedGrowth:    4, automationRisk:   5, category: "Healthcare", emp:   156700, seedWage:  163220 },
  { title: "Dietitians & Nutritionists", soc: "29-1031", soc6:"291031", projectedGrowth:    7, automationRisk:   8, category: "Healthcare", emp:    70300, seedWage:   66450 },
  { title: "EMTs & Paramedics", soc: "29-2040", soc6:"292040", projectedGrowth:    6, automationRisk:  10, category: "Healthcare", emp:   262100, seedWage:   38930 },
  { title: "Occupational Therapists", soc: "29-1122", soc6:"291122", projectedGrowth:   12, automationRisk:   5, category: "Healthcare", emp:   145100, seedWage:   93180 },
  { title: "Optometrists", soc: "29-1041", soc6:"291041", projectedGrowth:    9, automationRisk:   5, category: "Healthcare", emp:    45600, seedWage:  124300 },
  { title: "Pharmacists", soc: "29-1051", soc6:"291051", projectedGrowth:   -2, automationRisk:  22, category: "Healthcare", emp:   314300, seedWage:  132750 },
  { title: "Pharmacy Technicians", soc: "29-2052", soc6:"292052", projectedGrowth:    5, automationRisk:  45, category: "Healthcare", emp:   432700, seedWage:   37790 },
  { title: "Physical Therapists", soc: "29-1123", soc6:"291123", projectedGrowth:   15, automationRisk:   6, category: "Healthcare", emp:   239200, seedWage:   95620 },
  { title: "Physician Assistants", soc: "29-1071", soc6:"291071", projectedGrowth:   27, automationRisk:   5, category: "Healthcare", emp:   153800, seedWage:  126010 },
  { title: "Physicians & Surgeons", soc: "29-1210", soc6:"291210", projectedGrowth:    3, automationRisk:   6, category: "Healthcare", emp:   706900, seedWage:  229300 },
  { title: "Podiatrists", soc: "29-1081", soc6:"291081", projectedGrowth:    2, automationRisk:   6, category: "Healthcare", emp:    10800, seedWage:  148720 },
  { title: "Psychologists", soc: "19-3030", soc6:"193030", projectedGrowth:    6, automationRisk:   7, category: "Healthcare", emp:   181100, seedWage:   82180 },
  { title: "Radiation Therapists", soc: "29-1124", soc6:"291124", projectedGrowth:    1, automationRisk:  18, category: "Healthcare", emp:    18400, seedWage:   98560 },
  { title: "Radiologic Technologists", soc: "29-2034", soc6:"292034", projectedGrowth:    6, automationRisk:  30, category: "Healthcare", emp:   220700, seedWage:   65140 },
  { title: "Recreational Therapists", soc: "29-1125", soc6:"291125", projectedGrowth:    4, automationRisk:   6, category: "Healthcare", emp:    19800, seedWage:   51870 },
  { title: "Registered Nurses", soc: "29-1141", soc6:"291141", projectedGrowth:    6, automationRisk:   5, category: "Healthcare", emp:  3177400, seedWage:   81220 },
  { title: "Nurse Practitioners", soc: "29-1171", soc6:"291171", projectedGrowth:   40, automationRisk:   5, category: "Healthcare", emp:   246200, seedWage:  121610 },
  { title: "Nurse Anesthetists", soc: "29-1151", soc6:"291151", projectedGrowth:   12, automationRisk:   5, category: "Healthcare", emp:    42600, seedWage:  203090 },
  { title: "Nurse Midwives", soc: "29-1161", soc6:"291161", projectedGrowth:   13, automationRisk:   5, category: "Healthcare", emp:     7800, seedWage:  115540 },
  { title: "Respiratory Therapists", soc: "29-1126", soc6:"291126", projectedGrowth:   13, automationRisk:  12, category: "Healthcare", emp:   134000, seedWage:   62150 },
  { title: "Speech-Language Pathologists", soc: "29-1127", soc6:"291127", projectedGrowth:   19, automationRisk:   5, category: "Healthcare", emp:   165700, seedWage:   84140 },
  { title: "Veterinarians", soc: "29-1131", soc6:"291131", projectedGrowth:   19, automationRisk:   5, category: "Healthcare", emp:    93800, seedWage:  119100 },
  { title: "Dental Hygienists", soc: "29-2021", soc6:"292021", projectedGrowth:    9, automationRisk:  15, category: "Healthcare", emp:   216700, seedWage:   81400 },
  { title: "Medical Records Specialists", soc: "29-2072", soc6:"292072", projectedGrowth:   -4, automationRisk:  65, category: "Healthcare", emp:   233000, seedWage:   47180 },
  { title: "Medical Sonographers", soc: "29-2032", soc6:"292032", projectedGrowth:    8, automationRisk:  14, category: "Healthcare", emp:    77100, seedWage:   77790 },
  { title: "Nuclear Medicine Technologists", soc: "29-2033", soc6:"292033", projectedGrowth:    3, automationRisk:  18, category: "Healthcare", emp:    21600, seedWage:   91410 },
  { title: "Surgical Technologists", soc: "29-2055", soc6:"292055", projectedGrowth:    5, automationRisk:   8, category: "Healthcare", emp:   117100, seedWage:   51510 },
  { title: "Genetic Counselors", soc: "29-9092", soc6:"299092", projectedGrowth:   15, automationRisk:   8, category: "Healthcare", emp:     3600, seedWage:   85700 },
  { title: "Home Health & Personal Care Aides", soc: "31-1120", soc6:"311120", projectedGrowth:   22, automationRisk:  11, category: "Healthcare", emp:  3624000, seedWage:   30180 },
  { title: "Nursing Assistants", soc: "31-1131", soc6:"311131", projectedGrowth:    5, automationRisk:   8, category: "Healthcare", emp:  1408400, seedWage:   35740 },
  { title: "Orderlies", soc: "31-1132", soc6:"311132", projectedGrowth:    5, automationRisk:   8, category: "Healthcare", emp:    56200, seedWage:   34630 },
  { title: "Dental Assistants", soc: "31-9091", soc6:"319091", projectedGrowth:    7, automationRisk:  18, category: "Healthcare", emp:   354200, seedWage:   42260 },
  { title: "Medical Assistants", soc: "31-9092", soc6:"319092", projectedGrowth:   14, automationRisk:  20, category: "Healthcare", emp:   743100, seedWage:   37190 },
  { title: "Phlebotomists", soc: "31-9097", soc6:"319097", projectedGrowth:   10, automationRisk:  20, category: "Healthcare", emp:   151900, seedWage:   38530 },
  { title: "Physical Therapy Assistants", soc: "31-2021", soc6:"312021", projectedGrowth:   24, automationRisk:   8, category: "Healthcare", emp:   100200, seedWage:   61180 },
  { title: "Physical Therapy Aides", soc: "31-2022", soc6:"312022", projectedGrowth:   10, automationRisk:  18, category: "Healthcare", emp:    51500, seedWage:   29910 },
  { title: "Occupational Therapy Assistants", soc: "31-2011", soc6:"312011", projectedGrowth:   24, automationRisk:   8, category: "Healthcare", emp:    47400, seedWage:   65710 },
  { title: "Massage Therapists", soc: "31-9011", soc6:"319011", projectedGrowth:   18, automationRisk:   5, category: "Healthcare", emp:   176400, seedWage:   46910 },
  { title: "Medical Equipment Preparers", soc: "31-9093", soc6:"319093", projectedGrowth:    5, automationRisk:  25, category: "Healthcare", emp:    49600, seedWage:   40050 },
  { title: "First-Line Police Supervisors", soc: "33-1012", soc6:"331012", projectedGrowth:    4, automationRisk:   5, category: "Public Safety", emp:   118400, seedWage:   97840 },
  { title: "Police Officers & Detectives", soc: "33-3050", soc6:"333050", projectedGrowth:    3, automationRisk:   5, category: "Public Safety", emp:   715500, seedWage:   67290 },
  { title: "Firefighters", soc: "33-2011", soc6:"332011", projectedGrowth:    4, automationRisk:   5, category: "Public Safety", emp:   326100, seedWage:   52500 },
  { title: "Fire Inspectors", soc: "33-2021", soc6:"332021", projectedGrowth:    6, automationRisk:   8, category: "Public Safety", emp:    26400, seedWage:   66400 },
  { title: "Security Guards", soc: "33-9032", soc6:"339032", projectedGrowth:    3, automationRisk:  22, category: "Public Safety", emp:  1094000, seedWage:   33930 },
  { title: "Correctional Officers", soc: "33-1011", soc6:"331011", projectedGrowth:   -7, automationRisk:   8, category: "Public Safety", emp:   411000, seedWage:   49610 },
  { title: "Private Detectives", soc: "33-9021", soc6:"339021", projectedGrowth:    8, automationRisk:  18, category: "Public Safety", emp:    33000, seedWage:   59380 },
  { title: "Chefs & Head Cooks", soc: "35-1011", soc6:"351011", projectedGrowth:    9, automationRisk:   8, category: "Hospitality", emp:   147000, seedWage:   58920 },
  { title: "Cooks (Restaurant)", soc: "35-2014", soc6:"352014", projectedGrowth:   14, automationRisk:   8, category: "Hospitality", emp:  1506400, seedWage:   32970 },
  { title: "Cooks (Fast Food)", soc: "35-2011", soc6:"352011", projectedGrowth:   11, automationRisk:  18, category: "Hospitality", emp:   551400, seedWage:   28040 },
  { title: "Food Preparation Workers", soc: "35-2021", soc6:"352021", projectedGrowth:    6, automationRisk:  25, category: "Hospitality", emp:   895600, seedWage:   30150 },
  { title: "Bartenders", soc: "35-3011", soc6:"353011", projectedGrowth:    4, automationRisk:  18, category: "Hospitality", emp:   627900, seedWage:   29740 },
  { title: "Waiters & Waitresses", soc: "35-3031", soc6:"353031", projectedGrowth:    5, automationRisk:  18, category: "Hospitality", emp:  2049400, seedWage:   27470 },
  { title: "Food Servers (Non-Restaurant)", soc: "35-3041", soc6:"353041", projectedGrowth:   -2, automationRisk:  22, category: "Hospitality", emp:   174900, seedWage:   29820 },
  { title: "Dishwashers", soc: "35-9021", soc6:"359021", projectedGrowth:    7, automationRisk:  18, category: "Hospitality", emp:   513300, seedWage:   28080 },
  { title: "Janitors & Cleaners", soc: "37-2011", soc6:"372011", projectedGrowth:    3, automationRisk:  20, category: "Service", emp:  2337000, seedWage:   33360 },
  { title: "Maids & Housekeeping Cleaners", soc: "37-2012", soc6:"372012", projectedGrowth:    5, automationRisk:  28, category: "Service", emp:  1363000, seedWage:   30760 },
  { title: "Landscaping Workers", soc: "37-3011", soc6:"373011", projectedGrowth:    4, automationRisk:  14, category: "Service", emp:  1134000, seedWage:   35270 },
  { title: "Pest Control Workers", soc: "37-2021", soc6:"372021", projectedGrowth:    3, automationRisk:  18, category: "Service", emp:    82600, seedWage:   40050 },
  { title: "Tree Trimmers & Pruners", soc: "37-3013", soc6:"373013", projectedGrowth:    7, automationRisk:  10, category: "Service", emp:    55500, seedWage:   47440 },
  { title: "Childcare Workers", soc: "39-9011", soc6:"399011", projectedGrowth:   -3, automationRisk:  12, category: "Service", emp:   543000, seedWage:   30050 },
  { title: "Fitness Trainers & Instructors", soc: "39-9031", soc6:"399031", projectedGrowth:   14, automationRisk:   8, category: "Service", emp:   388600, seedWage:   46480 },
  { title: "Hairdressers & Cosmetologists", soc: "39-5012", soc6:"395012", projectedGrowth:    5, automationRisk:  18, category: "Service", emp:   647200, seedWage:   33400 },
  { title: "Manicurists & Pedicurists", soc: "39-5092", soc6:"395092", projectedGrowth:    3, automationRisk:  15, category: "Service", emp:   151800, seedWage:   29160 },
  { title: "Recreation Workers", soc: "39-9032", soc6:"399032", projectedGrowth:   14, automationRisk:   8, category: "Service", emp:   411000, seedWage:   31990 },
  { title: "Tour Guides", soc: "39-7011", soc6:"397011", projectedGrowth:    8, automationRisk:  12, category: "Service", emp:    34500, seedWage:   35390 },
  { title: "Animal Trainers", soc: "39-2011", soc6:"392011", projectedGrowth:    4, automationRisk:   8, category: "Service", emp:    64200, seedWage:   38760 },
  { title: "Funeral Service Workers", soc: "39-4021", soc6:"394021", projectedGrowth:    4, automationRisk:   5, category: "Service", emp:    27000, seedWage:   57580 },
  { title: "Personal Care Aides", soc: "39-9021", soc6:"399021", projectedGrowth:   22, automationRisk:  10, category: "Service", emp:   895200, seedWage:   29760 },
  { title: "Ushers & Lobby Attendants", soc: "39-3031", soc6:"393031", projectedGrowth:    5, automationRisk:  25, category: "Service", emp:    98700, seedWage:   26930 },
  { title: "Nannies", soc: "39-9011", soc6:"399011", projectedGrowth:    0, automationRisk:  12, category: "Service", emp:   153000, seedWage:   30000 },
  { title: "Retail Salespersons", soc: "41-2031", soc6:"412031", projectedGrowth:   -2, automationRisk:  65, category: "Retail", emp:  4280000, seedWage:   30750 },
  { title: "Cashiers", soc: "41-2011", soc6:"412011", projectedGrowth:   -9, automationRisk:  78, category: "Retail", emp:  3367000, seedWage:   28760 },
  { title: "Counter & Rental Clerks", soc: "41-2021", soc6:"412021", projectedGrowth:   -2, automationRisk:  55, category: "Retail", emp:   474000, seedWage:   32980 },
  { title: "Sales Representatives (B2B)", soc: "41-4012", soc6:"414012", projectedGrowth:    1, automationRisk:  28, category: "Business", emp:  1457600, seedWage:   68710 },
  { title: "Insurance Sales Agents", soc: "41-3021", soc6:"413021", projectedGrowth:    7, automationRisk:  20, category: "Finance", emp:   530400, seedWage:   57860 },
  { title: "Securities & Financial Sales", soc: "41-3031", soc6:"413031", projectedGrowth:    7, automationRisk:  20, category: "Finance", emp:   460900, seedWage:   96090 },
  { title: "Real Estate Agents", soc: "41-9021", soc6:"419021", projectedGrowth:    3, automationRisk:  22, category: "Business", emp:   476700, seedWage:   61480 },
  { title: "Real Estate Brokers", soc: "41-9022", soc6:"419022", projectedGrowth:    3, automationRisk:  18, category: "Business", emp:   105600, seedWage:   76080 },
  { title: "Travel Agents", soc: "41-3041", soc6:"413041", projectedGrowth:    3, automationRisk:  35, category: "Hospitality", emp:    76200, seedWage:   45390 },
  { title: "Door-to-Door Sales Workers", soc: "41-9011", soc6:"419011", projectedGrowth:   -8, automationRisk:  55, category: "Business", emp:    93100, seedWage:   30400 },
  { title: "Telemarketers", soc: "41-9041", soc6:"419041", projectedGrowth:  -18, automationRisk:  82, category: "Business", emp:   212100, seedWage:   30660 },
  { title: "Bill & Account Collectors", soc: "43-3011", soc6:"433011", projectedGrowth:  -15, automationRisk:  72, category: "Business", emp:   197300, seedWage:   40580 },
  { title: "Bookkeeping Clerks", soc: "43-3031", soc6:"433031", projectedGrowth:   -5, automationRisk:  78, category: "Finance", emp:  1660000, seedWage:   45860 },
  { title: "Payroll Clerks", soc: "43-3051", soc6:"433051", projectedGrowth:   -7, automationRisk:  72, category: "Business", emp:   174000, seedWage:   49630 },
  { title: "Customer Service Reps", soc: "43-4051", soc6:"434051", projectedGrowth:   -5, automationRisk:  72, category: "Service", emp:  2900000, seedWage:   37780 },
  { title: "File Clerks", soc: "43-4071", soc6:"434071", projectedGrowth:  -25, automationRisk:  82, category: "Business", emp:   113100, seedWage:   35750 },
  { title: "Hotel Desk Clerks", soc: "43-4081", soc6:"434081", projectedGrowth:    0, automationRisk:  42, category: "Hospitality", emp:   251200, seedWage:   28380 },
  { title: "Human Resources Assistants", soc: "43-4161", soc6:"434161", projectedGrowth:   -5, automationRisk:  62, category: "Business", emp:   152100, seedWage:   44960 },
  { title: "Receptionists", soc: "43-4171", soc6:"434171", projectedGrowth:   -4, automationRisk:  55, category: "Business", emp:  1027700, seedWage:   33350 },
  { title: "Secretaries & Admin Assistants", soc: "43-6014", soc6:"436014", projectedGrowth:   -9, automationRisk:  58, category: "Business", emp:  1854000, seedWage:   44990 },
  { title: "Data Entry Keyers", soc: "43-9021", soc6:"439021", projectedGrowth:  -18, automationRisk:  90, category: "Business", emp:   191900, seedWage:   37130 },
  { title: "Word Processors & Typists", soc: "43-9022", soc6:"439022", projectedGrowth:  -35, automationRisk:  92, category: "Business", emp:    35500, seedWage:   45090 },
  { title: "Mail Clerks & Processors", soc: "43-9051", soc6:"439051", projectedGrowth:  -18, automationRisk:  75, category: "Business", emp:    91100, seedWage:   36480 },
  { title: "Shipping & Receiving Clerks", soc: "43-5071", soc6:"435071", projectedGrowth:   -1, automationRisk:  48, category: "Business", emp:   697700, seedWage:   39560 },
  { title: "Postal Service Mail Carriers", soc: "43-5052", soc6:"435052", projectedGrowth:  -14, automationRisk:  52, category: "Public Service", emp:   313100, seedWage:   58940 },
  { title: "Postal Service Mail Sorters", soc: "43-5053", soc6:"435053", projectedGrowth:  -28, automationRisk:  85, category: "Public Service", emp:    34500, seedWage:   56030 },
  { title: "Office Clerks (General)", soc: "43-9061", soc6:"439061", projectedGrowth:   -8, automationRisk:  58, category: "Business", emp:  2785400, seedWage:   38060 },
  { title: "Executive Secretaries", soc: "43-6011", soc6:"436011", projectedGrowth:  -14, automationRisk:  55, category: "Business", emp:   524400, seedWage:   60890 },
  { title: "Agricultural Workers", soc: "45-2090", soc6:"452090", projectedGrowth:   -2, automationRisk:   8, category: "Agriculture", emp:   771000, seedWage:   31890 },
  { title: "Fishers & Fishing Workers", soc: "45-3011", soc6:"453011", projectedGrowth:    0, automationRisk:   5, category: "Agriculture", emp:    30500, seedWage:   31930 },
  { title: "Forest & Conservation Workers", soc: "45-4011", soc6:"454011", projectedGrowth:    8, automationRisk:   8, category: "Agriculture", emp:    11300, seedWage:   40380 },
  { title: "Logging Workers", soc: "45-4020", soc6:"454020", projectedGrowth:   -2, automationRisk:   8, category: "Agriculture", emp:    57700, seedWage:   44390 },
  { title: "Boilermakers", soc: "47-2011", soc6:"472011", projectedGrowth:    7, automationRisk:  14, category: "Trades", emp:    20100, seedWage:   71220 },
  { title: "Bricklayers", soc: "47-2021", soc6:"472021", projectedGrowth:    3, automationRisk:  10, category: "Trades", emp:    87400, seedWage:   59550 },
  { title: "Carpenters", soc: "47-2031", soc6:"472031", projectedGrowth:    2, automationRisk:   8, category: "Trades", emp:   917600, seedWage:   57690 },
  { title: "Carpet Installers", soc: "47-2041", soc6:"472041", projectedGrowth:   -2, automationRisk:  18, category: "Trades", emp:    29600, seedWage:   47470 },
  { title: "Cement Masons", soc: "47-2051", soc6:"472051", projectedGrowth:    3, automationRisk:   8, category: "Trades", emp:   202000, seedWage:   50810 },
  { title: "Construction Laborers", soc: "47-2061", soc6:"472061", projectedGrowth:    3, automationRisk:   8, category: "Trades", emp:  1398000, seedWage:   40770 },
  { title: "Electricians", soc: "47-2111", soc6:"472111", projectedGrowth:   11, automationRisk:  14, category: "Trades", emp:   762600, seedWage:   60240 },
  { title: "Glaziers", soc: "47-2121", soc6:"472121", projectedGrowth:    1, automationRisk:   8, category: "Trades", emp:    44100, seedWage:   50270 },
  { title: "Insulation Workers", soc: "47-2131", soc6:"472131", projectedGrowth:    2, automationRisk:   8, category: "Trades", emp:    72100, seedWage:   47880 },
  { title: "Painters (Construction)", soc: "47-2141", soc6:"472141", projectedGrowth:    1, automationRisk:   8, category: "Trades", emp:   379400, seedWage:   45590 },
  { title: "Plumbers & Pipefitters", soc: "47-2152", soc6:"472152", projectedGrowth:    2, automationRisk:   8, category: "Trades", emp:   531100, seedWage:   59880 },
  { title: "Roofers", soc: "47-2181", soc6:"472181", projectedGrowth:    2, automationRisk:   8, category: "Trades", emp:   147600, seedWage:   47110 },
  { title: "Sheet Metal Workers", soc: "47-2211", soc6:"472211", projectedGrowth:    2, automationRisk:  10, category: "Trades", emp:   138200, seedWage:   56840 },
  { title: "Solar Panel Installers", soc: "47-2231", soc6:"472231", projectedGrowth:   52, automationRisk:  18, category: "Green Energy", emp:    14500, seedWage:   47670 },
  { title: "Structural Iron & Steel Workers", soc: "47-2221", soc6:"472221", projectedGrowth:    5, automationRisk:   8, category: "Trades", emp:    86100, seedWage:   57360 },
  { title: "Tile & Stone Setters", soc: "47-2044", soc6:"472044", projectedGrowth:    3, automationRisk:   8, category: "Trades", emp:    51100, seedWage:   49580 },
  { title: "Drywall Installers", soc: "47-2081", soc6:"472081", projectedGrowth:    2, automationRisk:   8, category: "Trades", emp:   117600, seedWage:   48890 },
  { title: "Mining & Quarrying Workers", soc: "47-5040", soc6:"475040", projectedGrowth:   -8, automationRisk:  18, category: "Mining", emp:    29500, seedWage:   55720 },
  { title: "Oil & Gas Extraction Workers", soc: "47-5010", soc6:"475010", projectedGrowth:    5, automationRisk:  18, category: "Energy", emp:    38500, seedWage:   60700 },
  { title: "Automotive Service Technicians", soc: "49-3023", soc6:"493023", projectedGrowth:    2, automationRisk:  18, category: "Trades", emp:   728200, seedWage:   46880 },
  { title: "Aircraft Mechanics", soc: "49-3011", soc6:"493011", projectedGrowth:    6, automationRisk:  12, category: "Trades", emp:   138300, seedWage:   72290 },
  { title: "HVAC Mechanics & Installers", soc: "49-9021", soc6:"499021", projectedGrowth:    6, automationRisk:  10, category: "Trades", emp:   397600, seedWage:   57300 },
  { title: "Industrial Machinery Mechanics", soc: "49-9041", soc6:"499041", projectedGrowth:    9, automationRisk:  14, category: "Trades", emp:   385000, seedWage:   58200 },
  { title: "Electrical Power-Line Installers", soc: "49-9051", soc6:"499051", projectedGrowth:    7, automationRisk:  10, category: "Trades", emp:   114000, seedWage:   81890 },
  { title: "Electronic Equipment Repairers", soc: "49-2090", soc6:"492090", projectedGrowth:    2, automationRisk:  28, category: "Trades", emp:   199800, seedWage:   57750 },
  { title: "Wind Turbine Technicians", soc: "49-9081", soc6:"499081", projectedGrowth:   45, automationRisk:  15, category: "Green Energy", emp:    12300, seedWage:   57320 },
  { title: "Telecommunications Equip. Installers", soc: "49-2022", soc6:"492022", projectedGrowth:   -4, automationRisk:  35, category: "Technology", emp:   228700, seedWage:   59900 },
  { title: "Computer Repairers", soc: "49-2011", soc6:"492011", projectedGrowth:   -7, automationRisk:  45, category: "Technology", emp:   150100, seedWage:   57910 },
  { title: "Medical Equipment Repairers", soc: "49-9062", soc6:"499062", projectedGrowth:   10, automationRisk:  18, category: "Healthcare", emp:    59300, seedWage:   56990 },
  { title: "Maintenance Workers (General)", soc: "49-9071", soc6:"499071", projectedGrowth:    3, automationRisk:  15, category: "Trades", emp:  1481200, seedWage:   42600 },
  { title: "Locksmiths", soc: "49-9094", soc6:"499094", projectedGrowth:    3, automationRisk:  12, category: "Trades", emp:    26200, seedWage:   46890 },
  { title: "Bakers", soc: "51-3011", soc6:"513011", projectedGrowth:    5, automationRisk:  18, category: "Manufacturing", emp:   204500, seedWage:   33590 },
  { title: "Butchers & Meat Cutters", soc: "51-3021", soc6:"513021", projectedGrowth:   -1, automationRisk:  20, category: "Manufacturing", emp:   164300, seedWage:   36950 },
  { title: "Printing Press Operators", soc: "51-5112", soc6:"515112", projectedGrowth:  -11, automationRisk:  55, category: "Manufacturing", emp:   118200, seedWage:   44810 },
  { title: "Machinists", soc: "51-4041", soc6:"514041", projectedGrowth:    7, automationRisk:  25, category: "Manufacturing", emp:   382700, seedWage:   50840 },
  { title: "Welders", soc: "51-4121", soc6:"514121", projectedGrowth:    3, automationRisk:  22, category: "Manufacturing", emp:   413600, seedWage:   47010 },
  { title: "CNC Machine Tool Operators", soc: "51-4011", soc6:"514011", projectedGrowth:   -2, automationRisk:  45, category: "Manufacturing", emp:   143700, seedWage:   44380 },
  { title: "Semiconductor Processors", soc: "51-9141", soc6:"519141", projectedGrowth:   20, automationRisk:  30, category: "Technology", emp:    45500, seedWage:   45750 },
  { title: "Chemical Plant Operators", soc: "51-9011", soc6:"519011", projectedGrowth:    2, automationRisk:  28, category: "Manufacturing", emp:   124700, seedWage:   59820 },
  { title: "Power Plant Operators", soc: "51-8013", soc6:"518013", projectedGrowth:   -5, automationRisk:  22, category: "Energy", emp:    31100, seedWage:   93680 },
  { title: "Water Treatment Plant Oper.", soc: "51-8031", soc6:"518031", projectedGrowth:    4, automationRisk:  20, category: "Public Service", emp:    97100, seedWage:   49740 },
  { title: "Food Processing Workers", soc: "51-3090", soc6:"513090", projectedGrowth:    1, automationRisk:  25, category: "Manufacturing", emp:   355600, seedWage:   32750 },
  { title: "Inspectors & Testers", soc: "51-9061", soc6:"519061", projectedGrowth:   -1, automationRisk:  35, category: "Manufacturing", emp:   460800, seedWage:   42040 },
  { title: "Packaging & Filling Machine Op.", soc: "51-9111", soc6:"519111", projectedGrowth:    0, automationRisk:  45, category: "Manufacturing", emp:   291600, seedWage:   36460 },
  { title: "Textile Workers", soc: "51-6000", soc6:"516000", projectedGrowth:  -10, automationRisk:  52, category: "Manufacturing", emp:   240600, seedWage:   31980 },
  { title: "Woodworkers", soc: "51-7000", soc6:"517000", projectedGrowth:   -3, automationRisk:  28, category: "Manufacturing", emp:   230200, seedWage:   37130 },
  { title: "Airline Pilots", soc: "53-2011", soc6:"532011", projectedGrowth:    4, automationRisk:   5, category: "Transportation", emp:   133400, seedWage:  203990 },
  { title: "Commercial Pilots", soc: "53-2012", soc6:"532012", projectedGrowth:    6, automationRisk:   8, category: "Transportation", emp:    49800, seedWage:   99640 },
  { title: "Air Traffic Controllers", soc: "53-2021", soc6:"532021", projectedGrowth:   -5, automationRisk:  15, category: "Transportation", emp:    24700, seedWage:  134380 },
  { title: "Bus Drivers (Transit)", soc: "53-3052", soc6:"535052", projectedGrowth:    5, automationRisk:  25, category: "Transportation", emp:   173200, seedWage:   50560 },
  { title: "School Bus Drivers", soc: "53-3053", soc6:"535053", projectedGrowth:    2, automationRisk:  20, category: "Transportation", emp:   490800, seedWage:   38940 },
  { title: "Truck Drivers (Heavy)", soc: "53-3032", soc6:"533032", projectedGrowth:    4, automationRisk:  55, category: "Transportation", emp:  2080000, seedWage:   49920 },
  { title: "Delivery Drivers", soc: "53-3031", soc6:"533031", projectedGrowth:   10, automationRisk:  40, category: "Transportation", emp:  1414400, seedWage:   38850 },
  { title: "Taxi Drivers & Chauffeurs", soc: "53-3054", soc6:"535054", projectedGrowth:    1, automationRisk:  45, category: "Transportation", emp:   236700, seedWage:   31340 },
  { title: "Railroad Workers", soc: "53-4000", soc6:"534000", projectedGrowth:   -2, automationRisk:  25, category: "Transportation", emp:    76400, seedWage:   66770 },
  { title: "Ship & Boat Officers", soc: "53-5020", soc6:"535020", projectedGrowth:    3, automationRisk:   8, category: "Transportation", emp:    22700, seedWage:   84740 },
  { title: "Material Moving Workers", soc: "53-7000", soc6:"537000", projectedGrowth:    3, automationRisk:  42, category: "Transportation", emp:  2059200, seedWage:   37100 },
  { title: "Crane & Tower Operators", soc: "53-7021", soc6:"537021", projectedGrowth:    2, automationRisk:  15, category: "Trades", emp:    48900, seedWage:   60040 },
  { title: "Forklift Operators", soc: "53-7051", soc6:"537051", projectedGrowth:    1, automationRisk:  42, category: "Transportation", emp:   534200, seedWage:   38810 },
  { title: "Parking Lot Attendants", soc: "53-6021", soc6:"536021", projectedGrowth:   -4, automationRisk:  55, category: "Transportation", emp:    76200, seedWage:   28740 },
  { title: "Flight Attendants", soc: "53-2031", soc6:"532031", projectedGrowth:    3, automationRisk:   8, category: "Transportation", emp:   101300, seedWage:   63760 },
];

const CATS = ["All", ...new Set(OCCUPATIONS.map(j => j.category))];
const riskColor = r => r < 20 ? "#4ade80" : r < 40 ? "#facc15" : r < 60 ? "#fb923c" : "#f87171";
const riskLabel = r => r < 20 ? "LOW" : r < 40 ? "MODERATE" : r < 60 ? "HIGH" : "CRITICAL";
const fmtW = w => w ? `$${Number(w).toLocaleString()}` : "—";
const fmtE = e => !e ? "—" : e >= 1e6 ? `${(e/1e6).toFixed(1)}M` : `${Math.round(e/1000)}K`;

// ─── BLS FETCH (batched — API allows max 50 series per call) ─────────────────
async function fetchBLSWages() {
  const ids = OCCUPATIONS.map(o => `OEUN000000000000${o.soc6}08`);
  const BATCH = 50;
  const out = {};
  for (let i = 0; i < ids.length; i += BATCH) {
    const batch = ids.slice(i, i + BATCH);
    try {
      const res = await fetch("https://api.bls.gov/publicAPI/v1/timeseries/data/", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ seriesid: batch }),
      });
      if (!res.ok) continue;
      const json = await res.json();
      if (json.status !== "REQUEST_SUCCEEDED") continue;
      for (const s of json.Results?.series || []) {
        const soc6 = s.seriesID.slice(16, 22);
        const val = parseFloat(s.data?.[0]?.value);
        if (!isNaN(val) && s.data?.[0]?.value !== "-") out[soc6] = Math.round(val);
      }
    } catch { continue; }
  }
  return out;
}

// ─── CLAUDE via server route ──────────────────────────────────────────────────
async function claudeJSON(system, userMsg) {
  const res = await fetch("/api/claude", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1000,
      system,
      messages: [{ role: "user", content: userMsg }],
    }),
  });
  const d = await res.json();
  const txt = (d.content?.[0]?.text || "{}").replace(/```json|```/g, "").trim();
  return JSON.parse(txt);
}

// ─── SHARE CARD (Canvas) — redesigned for LinkedIn scroll-stop ───────────────
function generateShareCard(job, analysis, wage, live) {
  const W = 1200, H = 630;
  const canvas = document.createElement("canvas");
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext("2d");

  // ── Background ──
  ctx.fillStyle = "#020817";
  ctx.fillRect(0, 0, W, H);

  // Subtle dot grid
  ctx.fillStyle = "rgba(30,58,95,0.35)";
  for (let x = 0; x < W; x += 40) {
    for (let y = 0; y < H; y += 40) {
      ctx.beginPath(); ctx.arc(x, y, 1, 0, Math.PI * 2); ctx.fill();
    }
  }

  // Left color bar — risk color
  const rc = riskColor(job.automationRisk);
  const barGrad = ctx.createLinearGradient(0, 0, 0, H);
  barGrad.addColorStop(0, rc);
  barGrad.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = barGrad;
  ctx.fillRect(0, 0, 6, H);

  // Top-right glow behind the big number
  const glow = ctx.createRadialGradient(980, 200, 10, 980, 200, 320);
  glow.addColorStop(0, `${rc}22`);
  glow.addColorStop(1, "transparent");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  // ── LEFT COLUMN ──────────────────────────────────────────── x: 60–660
  // Category + SOC chip
  ctx.fillStyle = "rgba(56,189,248,0.1)";
  ctx.beginPath(); ctx.roundRect(60, 52, 320, 28, 5); ctx.fill();
  ctx.strokeStyle = "rgba(56,189,248,0.25)";
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.roundRect(60, 52, 320, 28, 5); ctx.stroke();
  ctx.font = "bold 11px monospace";
  ctx.fillStyle = "#38bdf8";
  ctx.fillText(`${job.category.toUpperCase()}  ·  BLS SOC ${job.soc}`, 76, 71);

  // Job title — large
  ctx.font = "bold 58px Georgia";
  ctx.fillStyle = "#ffffff";
  // Word-wrap title if long
  const words = job.title.split(" ");
  let line = "", lines = [], maxW = 580;
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (ctx.measureText(test).width > maxW && line) { lines.push(line); line = w; }
    else line = test;
  }
  lines.push(line);
  lines.forEach((l, i) => ctx.fillText(l, 60, 148 + i * 66));

  const titleBottom = 148 + lines.length * 66;

  // Divider
  ctx.fillStyle = "rgba(56,189,248,0.2)";
  ctx.fillRect(60, titleBottom + 10, 560, 1);

  // Headline quote
  if (analysis?.headline) {
    ctx.font = "italic 19px Georgia";
    ctx.fillStyle = "#93c5fd";
    const hl = `"${analysis.headline}"`;
    // Word wrap headline
    const hWords = hl.split(" ");
    let hLine = "", hLines = [];
    for (const w of hWords) {
      const test = hLine ? `${hLine} ${w}` : w;
      if (ctx.measureText(test).width > 540 && hLine) { hLines.push(hLine); hLine = w; }
      else hLine = test;
    }
    hLines.push(hLine);
    hLines.slice(0, 3).forEach((l, i) => ctx.fillText(l, 60, titleBottom + 46 + i * 28));
  }

  // Survival strategy label + text
  const stratY = titleBottom + 160;
  ctx.font = "bold 10px monospace";
  ctx.fillStyle = "#4ade80";
  ctx.fillText("◈ SURVIVAL STRATEGY", 60, stratY);
  if (analysis?.survivalStrategy) {
    ctx.font = "14px Georgia";
    ctx.fillStyle = "#bbf7d0";
    const sWords = analysis.survivalStrategy.split(" ");
    let sLine = "", sLines = [];
    for (const w of sWords) {
      const test = sLine ? `${sLine} ${w}` : w;
      if (ctx.measureText(test).width > 540 && sLine) { sLines.push(sLine); sLine = w; }
      else sLine = test;
    }
    sLines.push(sLine);
    sLines.slice(0, 3).forEach((l, i) => ctx.fillText(l, 60, stratY + 22 + i * 22));
  }

  // ── RIGHT COLUMN ─────────────────────────────────────────── x: 720–1140

  // BIG automation risk number
  ctx.font = "bold 130px Georgia";
  ctx.fillStyle = rc;
  ctx.textAlign = "right";
  ctx.fillText(`${job.automationRisk}%`, 1140, 220);
  ctx.textAlign = "left";

  // Risk label
  ctx.font = "bold 14px monospace";
  ctx.fillStyle = rc;
  ctx.textAlign = "right";
  ctx.fillText("AUTOMATION RISK", 1140, 250);
  ctx.textAlign = "left";

  // Risk verdict sentence
  const verdicts = {
    LOW:      "This role is well-positioned for the future.",
    MODERATE: "Significant transformation ahead — adapt now.",
    HIGH:     "This job is running out of time.",
    CRITICAL: "Automation will fundamentally eliminate this role.",
  };
  const verdict = verdicts[riskLabel(job.automationRisk)];
  ctx.font = "italic 14px Georgia";
  ctx.fillStyle = "#94a3b8";
  ctx.textAlign = "right";
  // word wrap verdict
  const vWords = verdict.split(" ");
  let vLine = "", vLines = [];
  for (const w of vWords) {
    const test = vLine ? `${vLine} ${w}` : w;
    if (ctx.measureText(test).width > 390 && vLine) { vLines.push(vLine); vLine = w; }
    else vLine = test;
  }
  vLines.push(vLine);
  vLines.forEach((l, i) => ctx.fillText(l, 1140, 278 + i * 22));
  ctx.textAlign = "left";

  // Divider right
  ctx.fillStyle = "rgba(30,58,95,0.6)";
  ctx.fillRect(720, 320, 420, 1);

  // Stats — growth + wage stacked
  const statsR = [
    { label: "10-YR GROWTH",   val: `${job.projectedGrowth > 0 ? "+" : ""}${job.projectedGrowth}%`, color: job.projectedGrowth >= 0 ? "#38bdf8" : "#f87171" },
    { label: "MEDIAN WAGE",    val: fmtW(wage), color: "#f1f5f9" },
    { label: "U.S. WORKFORCE", val: job.emp >= 1e6 ? `${(job.emp/1e6).toFixed(1)}M` : `${Math.round(job.emp/1000)}K`, color: "#f1f5f9" },
  ];
  statsR.forEach((s, i) => {
    const sx = 720 + i * 145, sy = 340;
    ctx.font = "bold 9px monospace";
    ctx.fillStyle = "#64748b";
    ctx.fillText(s.label, sx, sy);
    ctx.font = "bold 26px Georgia";
    ctx.fillStyle = s.color;
    ctx.fillText(s.val, sx, sy + 34);
  });

  // ── BOTTOM BAR ───────────────────────────────────────────────────────────
  ctx.fillStyle = "rgba(15,39,68,0.8)";
  ctx.fillRect(0, 570, W, 60);

  // 00IA brand
  ctx.font = "bold 24px Georgia";
  ctx.fillStyle = "#38bdf8";
  ctx.fillText("00IA", 60, 607);

  ctx.font = "bold 11px monospace";
  ctx.fillStyle = "#475569";
  ctx.fillText("THOUGHTS, CODE, AND COGNITION  ·  00IA.COM", 120, 607);

  // CTA right
  ctx.font = "bold 12px monospace";
  ctx.fillStyle = "#f1f5f9";
  ctx.textAlign = "right";
  ctx.fillText("Is YOUR job future-proof? → 00ia.com", W - 60, 600);
  ctx.textAlign = "left";

  // BLS badge
  ctx.font = "10px monospace";
  ctx.fillStyle = live ? "#4ade80" : "#fb923c";
  ctx.textAlign = "right";
  ctx.fillText(live ? "⬤ LIVE BLS DATA" : "◯ BLS ESTIMATE", W - 60, 616);
  ctx.textAlign = "left";

  return canvas;
}

// ─── UI PIECES ────────────────────────────────────────────────────────────────
const GrowthBar = ({ v }) => (
  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
    <div style={{ width:110, height:5, background:"#1e293b", borderRadius:3, position:"relative" }}>
      <div style={{ position:"absolute", height:"100%", borderRadius:3,
        width:`${(Math.min(Math.abs(v),55)/55)*100}%`,
        background: v >= 0 ? "#38bdf8" : "#f87171" }} />
    </div>
    <span style={{ fontFamily:"monospace", fontSize:11, fontWeight:700, color: v>=0?"#38bdf8":"#f87171" }}>
      {v>0?"+":""}{v}%
    </span>
  </div>
);

const Typewriter = ({ text }) => {
  const [out, setOut] = useState(""); const [done, setDone] = useState(false);
  useEffect(() => {
    setOut(""); setDone(false); let i=0;
    const t = setInterval(()=>{ i++; setOut(text.slice(0,i)); if(i>=text.length){clearInterval(t);setDone(true);}}, 14);
    return ()=>clearInterval(t);
  }, [text]);
  return <>{out}{!done&&<span style={{animation:"blink .8s infinite",color:"#38bdf8"}}>▍</span>}</>;
};

const SimilarCard = ({ job, wage, onClick }) => (
  <div onClick={() => onClick(job)} style={{
    background:"#0a1929", border:"1px solid #0f2744", borderRadius:8, padding:"12px 14px",
    cursor:"pointer", transition:"all .2s", flex:1, minWidth:0,
  }}
  onMouseEnter={e => { e.currentTarget.style.borderColor="#38bdf8"; e.currentTarget.style.background="rgba(56,189,248,.06)"; }}
  onMouseLeave={e => { e.currentTarget.style.borderColor="#0f2744"; e.currentTarget.style.background="#0a1929"; }}>
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8 }}>
      <div style={{ fontSize:12, fontWeight:600, color:"#f1f5f9", lineHeight:1.3, flex:1, paddingRight:8 }}>{job.title}</div>
      <div style={{ fontFamily:"monospace", fontSize:9, fontWeight:700, color:riskColor(job.automationRisk),
        background:`${riskColor(job.automationRisk)}15`, padding:"2px 6px", borderRadius:3, whiteSpace:"nowrap",
        border:`1px solid ${riskColor(job.automationRisk)}30`, flexShrink:0 }}>
        {job.automationRisk}%
      </div>
    </div>
    <GrowthBar v={job.projectedGrowth} />
    <div style={{ fontFamily:"monospace", fontSize:10, color:"#c9d5e3", marginTop:7 }}>{fmtW(wage)}/yr</div>
  </div>
);

// ─── APP ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [mounted, setMounted]    = useState(false);
  const [wages, setWages]        = useState({});
  const [wageStatus, setWStatus] = useState("loading");
  const [selected, setSelected]  = useState(null);
  const [analysis, setAnalysis]  = useState(null);
  const [aiLoading, setAiLoad]   = useState(false);
  const [filter, setFilter]      = useState("All");
  const [search, setSearch]      = useState("");
  const [sortBy, setSort]        = useState("growth");
  const [mapping, setMapping]    = useState(false);
  const [mapHint, setMapHint]    = useState("");
  const [sharing, setSharing]    = useState(false);
  const [showModal, setShowModal] = useState(false);
  const detailRef = useRef(null);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    fetchBLSWages()
      .then(d => { setWages(d); setWStatus("live"); })
      .catch(() => setWStatus("fallback"));
  }, []);

  if (!mounted) return null;

  const getWage = (occ) => {
    const live = wages[occ.soc6];
    return live ? { value: live, live: true } : { value: occ.seedWage, live: false };
  };

  const allWithWages = OCCUPATIONS.map(o => ({ ...o, ...getWage(o) }));

  const jobs = allWithWages
    .filter(j => (filter === "All" || j.category === filter) && j.title.toLowerCase().includes(search.toLowerCase()))
    .sort((a,b) =>
      sortBy === "growth" ? b.projectedGrowth - a.projectedGrowth :
      sortBy === "risk"   ? a.automationRisk  - b.automationRisk  :
                            (b.value||0)       - (a.value||0)
    );

  const noMatch = search.length > 2 && jobs.length === 0;

  const mapWithClaude = async () => {
    setMapping(true); setMapHint("");
    try {
      const occupationList = OCCUPATIONS.map(o => `${o.title} (${o.soc})`).join(", ");
      const result = await claudeJSON(
        `You map job titles to the closest BLS occupation. Reply ONLY with valid JSON: {"soc":"XX-XXXX","title":"matched title","reasoning":"brief"}`,
        `User typed: "${search}". Available occupations: ${occupationList}. Pick the single closest match.`
      );
      const match = OCCUPATIONS.find(o => o.soc === result.soc);
      if (match) {
        setSearch("");
        setMapHint(`Mapped "${search}" → ${match.title}`);
        analyze({ ...match, ...getWage(match) });
      }
    } catch { setMapHint("Couldn't map — try a different term"); }
    setMapping(false);
  };

  const analyze = async (job) => {
    setSelected(job); setAnalysis(null); setAiLoad(true);
    setTimeout(() => detailRef.current?.scrollIntoView({ behavior:"smooth" }), 50);
    const w = getWage(job);
    try {
      const result = await claudeJSON(
        `You are a US labor market futurist. Reply ONLY with valid JSON, no markdown:
{"headline":"sharp 10-word prediction","outlook":"2-3 sentence 2035 narrative","killedBy":["up to 3 specific threats"],"evolvedBy":["up to 3 uplifting forces"],"emergingSkills":["4 must-develop skills"],"survivalStrategy":"one concrete actionable sentence"}`,
        `Occupation: ${job.title} (SOC ${job.soc}) | Category: ${job.category}
BLS Wage: ${fmtW(w.value)} (${w.live ? "live BLS OEWS" : "BLS estimate"}) | Workforce: ${fmtE(job.emp)}
10-yr Growth: ${job.projectedGrowth}% | Automation Risk: ${job.automationRisk}/100`
      );
      setAnalysis(result);
    } catch { setAnalysis({ error: true }); }
    setAiLoad(false);
  };

  const similarRoles = selected ? allWithWages
    .filter(j => j.soc !== selected.soc)
    .map(j => ({ ...j, score: (j.category === selected.category ? 0 : 50) + Math.abs(j.automationRisk - selected.automationRisk) }))
    .sort((a,b) => a.score - b.score)
    .slice(0, 3) : [];

  const shareCard = () => {
    if (!selected || !analysis) return;
    setSharing(true);
    try {
      const w = getWage(selected);
      const canvas = generateShareCard(selected, analysis, w.value, w.live);
      canvas.toBlob(blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url; a.download = `00ia-${selected.title.replace(/\s+/g,"-").toLowerCase()}.png`;
        a.click(); URL.revokeObjectURL(url);
        setSharing(false);
        setShowModal("download");
      }, "image/png");
    } catch { setSharing(false); }
  };

  const shareLinkedIn = () => {
    if (!selected || !analysis) return;
    setSharing(true);
    try {
      const w = getWage(selected);
      const canvas = generateShareCard(selected, analysis, w.value, w.live);
      canvas.toBlob(blob => {
        // 1. Download card
        const cardUrl = URL.createObjectURL(blob);
        const dl = document.createElement("a");
        dl.href = cardUrl;
        dl.download = `00ia-${selected.title.replace(/\s+/g,"-").toLowerCase()}.png`;
        document.body.appendChild(dl);
        dl.click();
        document.body.removeChild(dl);
        setTimeout(() => URL.revokeObjectURL(cardUrl), 1000);

        // 2. Open LinkedIn via anchor (never blocked unlike window.open)
        const liText = encodeURIComponent(
          `Is your job future-proof?\n\n${selected.title} has a ${selected.automationRisk}% automation risk and ${selected.projectedGrowth > 0 ? "+" : ""}${selected.projectedGrowth}% projected 10-year growth.\n\n"${analysis.headline}"\n\nExplore: https://00ia.com\n\n#FutureOfWork #AI #Labor #00IA`
        );
        const li = document.createElement("a");
        li.href = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent("https://00ia.com")}&summary=${liText}`;
        li.target = "_blank";
        li.rel = "noopener noreferrer";
        document.body.appendChild(li);
        li.click();
        document.body.removeChild(li);

        setSharing(false);
        setShowModal("linkedin");
      }, "image/png");
    } catch (e) { console.error(e); setSharing(false); }
  };

  return (
    <div style={{ background:"#020817", minHeight:"100vh", color:"#f1f5f9", fontFamily:"Georgia,serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Playfair+Display:wght@700;900&display=swap');
        @keyframes blink  {0%,100%{opacity:1}50%{opacity:0}}
        @keyframes fadeIn {from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse  {0%,100%{opacity:.45}50%{opacity:1}}
        @keyframes spin   {from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        @keyframes scan   {0%{top:-4px}100%{top:100vh}}
        .jrow:hover{background:rgba(56,189,248,.07)!important;cursor:pointer}
        .jrow.on{background:rgba(56,189,248,.12)!important;border-left:3px solid #38bdf8!important}
        .catbtn:hover{background:rgba(56,189,248,.14)!important}
        .catbtn.on{background:rgba(56,189,248,.22)!important;color:#38bdf8!important;border-color:#38bdf8!important}
        .sbtn{background:none;border:none;cursor:pointer;font-family:'DM Mono',monospace;font-size:11px;letter-spacing:1px;padding:0 0 2px;transition:color .2s;color:#94a3b8}
        .sbtn:hover,.sbtn.on{color:#38bdf8!important}
        .sbtn.on{border-bottom:2px solid #38bdf8}
        input::placeholder{color:#475569}
        ::-webkit-scrollbar{width:5px}::-webkit-scrollbar-track{background:#0f172a}::-webkit-scrollbar-thumb{background:#1e3a5f;border-radius:3px}
      `}</style>

      <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:99,overflow:"hidden",opacity:.022}}>
        <div style={{position:"absolute",width:"100%",height:3,background:"#38bdf8",animation:"scan 9s linear infinite"}}/>
      </div>

      {/* Instruction Modal */}
      {showModal && (
        <div onClick={() => setShowModal(false)} style={{
          position:"fixed",inset:0,zIndex:300,background:"rgba(2,8,23,.85)",
          display:"flex",alignItems:"center",justifyContent:"center",animation:"fadeIn .2s ease",
          backdropFilter:"blur(4px)",cursor:"pointer"
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            background:"#0a1929",border:"1px solid #1e3a5f",borderRadius:12,
            padding:"32px 36px",maxWidth:480,width:"90%",cursor:"default",
            boxShadow:"0 24px 80px rgba(0,0,0,.8)",animation:"fadeIn .25s ease"
          }}>
            {/* Header */}
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:24}}>
              <div>
                <div style={{fontFamily:"monospace",fontSize:10,color:"#38bdf8",letterSpacing:3,marginBottom:6}}>
                  {showModal === "linkedin" ? "◈ SHARING TO LINKEDIN" : "◈ CARD DOWNLOADED"}
                </div>
                <div style={{fontFamily:"'Playfair Display',serif",fontSize:20,fontWeight:700,color:"#f1f5f9"}}>
                  {showModal === "linkedin" ? "Here's what just happened" : "Your card is ready"}
                </div>
              </div>
              <button onClick={() => setShowModal(false)} style={{
                background:"none",border:"none",color:"#475569",fontSize:20,cursor:"pointer",padding:"0 0 0 16px",lineHeight:1
              }}>✕</button>
            </div>

            {/* Steps */}
            <div style={{display:"flex",flexDirection:"column",gap:16,marginBottom:28}}>
              {showModal === "linkedin" ? [
                { n:"1", icon:"↓", color:"#38bdf8", title:"Card downloaded", desc:`Your share card (1200×630 PNG) was saved to your Downloads folder as "00ia-${selected?.title?.replace(/\s+/g,"-").toLowerCase()}.png"` },
                { n:"2", icon:"↗", color:"#60a5fa", title:"LinkedIn opened", desc:"A LinkedIn post dialog opened with pre-written text including the risk score, growth rate, and a link to 00ia.com" },
                { n:"3", icon:"📎", color:"#4ade80", title:"Attach the image", desc:"In the LinkedIn composer, click the image icon and attach the downloaded card from your Downloads folder" },
                { n:"4", icon:"✓",  color:"#4ade80", title:"Review and post", desc:"Check the pre-filled text, make any edits, then hit Post — the card image will stop the scroll" },
              ] : [
                { n:"1", icon:"↓", color:"#38bdf8", title:"Card downloaded", desc:`Your share card was saved to your Downloads folder as "00ia-${selected?.title?.replace(/\s+/g,"-").toLowerCase()}.png"` },
                { n:"2", icon:"↗", color:"#60a5fa", title:"Post it anywhere", desc:"Upload the PNG to LinkedIn, Twitter/X, or any platform. It's 1200×630 — the ideal size for social sharing" },
                { n:"3", icon:"✓",  color:"#4ade80", title:"Drive traffic", desc:'Add a link to 00ia.com in your post caption to send people to the full explorer' },
              ].map(s => (
                <div key={s.n} style={{display:"flex",gap:14,alignItems:"flex-start"}}>
                  <div style={{
                    width:32,height:32,borderRadius:"50%",background:`${s.color}18`,
                    border:`1px solid ${s.color}40`,display:"flex",alignItems:"center",
                    justifyContent:"center",fontSize:14,color:s.color,flexShrink:0,fontWeight:700
                  }}>{s.icon}</div>
                  <div>
                    <div style={{fontSize:13,fontWeight:600,color:"#f1f5f9",marginBottom:3}}>{s.title}</div>
                    <div style={{fontSize:12,color:"#94a3b8",lineHeight:1.6}}>{s.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA */}
            {showModal === "linkedin" && (
              <div style={{background:"rgba(56,189,248,.06)",border:"1px solid rgba(56,189,248,.15)",borderRadius:8,padding:"12px 16px",marginBottom:16}}>
                <div style={{fontFamily:"monospace",fontSize:10,color:"#38bdf8",letterSpacing:2,marginBottom:4}}>💡 TIP</div>
                <div style={{fontSize:12,color:"#cbd5e1",lineHeight:1.6}}>
                  Can't find the file? Check your <strong style={{color:"#f1f5f9"}}>Downloads</strong> folder or search for <strong style={{color:"#f1f5f9"}}>00ia-{selected?.title?.replace(/\s+/g,"-").toLowerCase()}.png</strong>
                </div>
              </div>
            )}

            <button onClick={() => setShowModal(false)} style={{
              width:"100%",background:"rgba(56,189,248,.1)",border:"1px solid rgba(56,189,248,.3)",
              color:"#38bdf8",padding:"10px",borderRadius:7,fontFamily:"monospace",fontSize:12,
              cursor:"pointer",letterSpacing:1,transition:"all .2s"
            }}>Got it</button>
          </div>
        </div>
      )}

      <header style={{borderBottom:"1px solid #0f2744",padding:"22px 30px 18px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",flexWrap:"wrap",gap:12}}>
          <div>
            <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:6,flexWrap:"wrap"}}>
              <div style={{fontFamily:"'DM Mono',monospace",fontSize:10,color:"#38bdf8",letterSpacing:4}}>
                U.S. BUREAU OF LABOR STATISTICS · OCCUPATIONAL PROJECTIONS 2024–2034
              </div>
              <a href="https://00ia.com" target="_blank" rel="noopener noreferrer"
                style={{fontFamily:"'DM Mono',monospace",fontSize:10,fontWeight:500,color:"#020817",
                  background:"#38bdf8",padding:"3px 10px",borderRadius:4,letterSpacing:2,
                  textDecoration:"none",whiteSpace:"nowrap",opacity:1,transition:"opacity .2s"}}
                onMouseEnter={e=>e.currentTarget.style.opacity=".75"}
                onMouseLeave={e=>e.currentTarget.style.opacity="1"}>
                00IA.COM ↗
              </a>
            </div>
            <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:"clamp(22px,3vw,38px)",fontWeight:900,margin:0,lineHeight:1.1}}>
              The Future of <span style={{color:"#38bdf8"}}>American Work</span>
            </h1>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:8,background:"#0a1929",border:"1px solid #0f2744",borderRadius:7,padding:"8px 14px"}}>
            {wageStatus === "loading"  && <><div style={{width:7,height:7,border:"1.5px solid #38bdf8",borderTopColor:"transparent",borderRadius:"50%",animation:"spin .7s linear infinite"}}/><span style={{fontFamily:"monospace",fontSize:11,color:"#38bdf8"}}>Connecting to BLS API…</span></>}
            {wageStatus === "live"     && <><div style={{width:7,height:7,borderRadius:"50%",background:"#4ade80"}}/><span style={{fontFamily:"monospace",fontSize:11,color:"#4ade80"}}>Live · BLS OEWS 2024</span></>}
            {wageStatus === "fallback" && <><div style={{width:7,height:7,borderRadius:"50%",background:"#fb923c"}}/><span style={{fontFamily:"monospace",fontSize:11,color:"#fb923c"}}>BLS API unavailable · using published estimates</span></>}
            <div style={{width:1,height:20,background:"#0f2744",margin:"0 4px"}}/>
            <div style={{width:7,height:7,borderRadius:"50%",background:"#38bdf8"}}/>
            <span style={{fontFamily:"monospace",fontSize:11,color:"#a0aec0"}}>Projections · BLS EP Program</span>
          </div>
        </div>
      </header>

      <div style={{display:"flex",minHeight:"calc(100vh - 110px)"}}>

        {/* LEFT PANEL */}
        <div style={{width:"min(380px,42%)",borderRight:"1px solid #0f2744",display:"flex",flexDirection:"column"}}>
          <div style={{padding:"14px 18px",borderBottom:"1px solid #0f2744",background:"#030d1c"}}>
            <div style={{position:"relative",marginBottom:10}}>
              <input
                value={search}
                onChange={e => { setSearch(e.target.value); setMapHint(""); }}
                onKeyDown={e => e.key === "Enter" && noMatch && mapWithClaude()}
                placeholder="Search or type any job title…"
                style={{width:"100%",background:"#0f172a",border:"1px solid #1e3a5f",borderRadius:5,
                  color:"#f1f5f9",padding:"8px 12px",fontFamily:"monospace",fontSize:12,
                  outline:"none",boxSizing:"border-box"}}
              />
            </div>

            {noMatch && (
              <div style={{marginBottom:10,display:"flex",alignItems:"center",gap:8}}>
                <span style={{fontFamily:"monospace",fontSize:11,color:"#c9d5e3"}}>No preset match —</span>
                <button onClick={mapWithClaude} disabled={mapping} style={{
                  background:"rgba(56,189,248,.1)",border:"1px solid rgba(56,189,248,.3)",
                  color:"#38bdf8",padding:"4px 12px",borderRadius:4,fontFamily:"monospace",
                  fontSize:11,cursor:"pointer",display:"flex",alignItems:"center",gap:6}}>
                  {mapping
                    ? <><div style={{width:9,height:9,border:"1.5px solid #38bdf8",borderTopColor:"transparent",borderRadius:"50%",animation:"spin .7s linear infinite"}}/>Mapping…</>
                    : <>◈ Map with AI</>}
                </button>
              </div>
            )}
            {mapHint && (
              <div style={{fontFamily:"monospace",fontSize:10,color:"#4ade80",marginBottom:8,animation:"fadeIn .3s ease"}}>
                ✓ {mapHint}
              </div>
            )}

            <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:9}}>
              {CATS.map(c => (
                <button key={c} className={`catbtn${filter===c?" on":""}`} onClick={()=>setFilter(c)}
                  style={{background:"transparent",border:"1px solid #1e3a5f",color:"#a0aec0",
                    padding:"3px 8px",borderRadius:4,fontFamily:"monospace",fontSize:9,cursor:"pointer",transition:"all .2s"}}>
                  {c.toUpperCase()}
                </button>
              ))}
            </div>
            <div style={{display:"flex",gap:12,alignItems:"center",fontFamily:"monospace",fontSize:10,color:"#c9d5e3"}}>
              <span>SORT:</span>
              {[["growth","GROWTH"],["risk","SAFETY"],["wage","WAGE"]].map(([v,l])=>(
                <button key={v} className={`sbtn${sortBy===v?" on":""}`} onClick={()=>setSort(v)}>{l}</button>
              ))}
              <span style={{marginLeft:"auto",color:"#64748b"}}>{jobs.length} roles</span>
            </div>
          </div>

          <div style={{flex:1,overflowY:"auto"}}>
            {jobs.map(job => (
              <div key={job.soc} className={`jrow${selected?.soc===job.soc?" on":""}`}
                onClick={()=>analyze(job)}
                style={{padding:"11px 18px",borderBottom:"1px solid #0a1929",borderLeft:"3px solid transparent",transition:"all .2s"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}>
                  <div>
                    <div style={{fontSize:13,fontWeight:600,color:"#f1f5f9",marginBottom:1}}>{job.title}</div>
                    <div style={{fontFamily:"monospace",fontSize:9,color:"#c9d5e3"}}>
                      {job.category.toUpperCase()} · <span style={{color:job.live?"#4ade80":"#64748b"}}>{fmtW(job.value)}</span>
                      {job.live && <span style={{color:"#4ade80",marginLeft:3}}>●</span>}
                    </div>
                  </div>
                  <div style={{fontFamily:"monospace",fontSize:9,fontWeight:700,color:riskColor(job.automationRisk),
                    background:`${riskColor(job.automationRisk)}15`,padding:"2px 7px",borderRadius:3,
                    border:`1px solid ${riskColor(job.automationRisk)}30`,whiteSpace:"nowrap"}}>
                    {riskLabel(job.automationRisk)}
                  </div>
                </div>
                <GrowthBar v={job.projectedGrowth}/>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div ref={detailRef} style={{flex:1,overflowY:"auto",padding:"26px 30px"}}>
          {!selected ? (
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"100%",gap:14,opacity:.28}}>
              <div style={{fontSize:42}}>◈</div>
              <div style={{fontFamily:"monospace",fontSize:12,letterSpacing:4,color:"#38bdf8"}}>SELECT AN OCCUPATION</div>
              <div style={{fontSize:13,color:"#c9d5e3",textAlign:"center",maxWidth:260,lineHeight:1.7}}>
                Select any role — or type any job title to map it with AI
              </div>
            </div>
          ) : (()=>{
            const w = getWage(selected);
            return (
              <div style={{animation:"fadeIn .35s ease",maxWidth:660}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6,flexWrap:"wrap",gap:8}}>
                  <div>
                    <div style={{fontFamily:"monospace",fontSize:10,color:"#38bdf8",letterSpacing:3,marginBottom:5}}>
                      {selected.category.toUpperCase()} · SOC {selected.soc}
                    </div>
                    <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:"clamp(22px,3vw,32px)",fontWeight:900,margin:0,lineHeight:1.1}}>
                      {selected.title}
                    </h2>
                  </div>
                  {analysis && !analysis.error && (
                    <div style={{display:"flex",gap:8,flexWrap:"wrap",marginTop:4}}>
                      <button onClick={shareCard} disabled={sharing} style={{
                        background: sharing?"rgba(56,189,248,.05)":"rgba(56,189,248,.1)",
                        border:"1px solid rgba(56,189,248,.3)",color:"#38bdf8",
                        padding:"8px 14px",borderRadius:6,fontFamily:"monospace",fontSize:11,
                        cursor: sharing?"default":"pointer",display:"flex",alignItems:"center",gap:7,
                        transition:"all .2s",letterSpacing:1,whiteSpace:"nowrap"
                      }}>
                        {sharing
                          ? <><div style={{width:9,height:9,border:"1.5px solid #38bdf8",borderTopColor:"transparent",borderRadius:"50%",animation:"spin .7s linear infinite"}}/>Generating…</>
                          : <>↓ Download Card</>}
                      </button>
                      <button onClick={shareLinkedIn} disabled={sharing} style={{
                        background: sharing?"rgba(10,102,194,.05)":"rgba(10,102,194,.15)",
                        border:"1px solid rgba(10,102,194,.4)",color:"#60a5fa",
                        padding:"8px 14px",borderRadius:6,fontFamily:"monospace",fontSize:11,
                        cursor: sharing?"default":"pointer",display:"flex",alignItems:"center",gap:7,
                        transition:"all .2s",letterSpacing:1,whiteSpace:"nowrap"
                      }}>
                        {sharing
                          ? <><div style={{width:9,height:9,border:"1.5px solid #60a5fa",borderTopColor:"transparent",borderRadius:"50%",animation:"spin .7s linear infinite"}}/>Opening…</>
                          : <><svg width="13" height="13" viewBox="0 0 24 24" fill="#60a5fa"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg> Share on LinkedIn</>}
                      </button>
                    </div>
                  )}
                </div>

                <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:16}}>
                  {[
                    { label:"MEDIAN WAGE",    val:fmtW(w.value), sub: w.live ? "● LIVE BLS OEWS" : "◯ BLS ESTIMATE", subColor: w.live?"#4ade80":"#94a3b8" },
                    { label:"U.S. WORKFORCE", val:fmtE(selected.emp), sub:"workers · OES" },
                    { label:"10-YR GROWTH",   val:`${selected.projectedGrowth>0?"+":""}${selected.projectedGrowth}%`, sub:"BLS EP 2024–34", color:selected.projectedGrowth>=0?"#38bdf8":"#f87171" },
                  ].map(s=>(
                    <div key={s.label} style={{background:"#0a1929",border:"1px solid #0f2744",borderRadius:8,padding:"13px 15px"}}>
                      <div style={{fontFamily:"monospace",fontSize:9,color:"#a0aec0",letterSpacing:2,marginBottom:6}}>{s.label}</div>
                      <div style={{fontFamily:"'Playfair Display',serif",fontSize:22,fontWeight:700,lineHeight:1,color:s.color||"#f1f5f9"}}>{s.val}</div>
                      <div style={{fontFamily:"monospace",fontSize:9,color:s.subColor||"#94a3b8",marginTop:4}}>{s.sub}</div>
                    </div>
                  ))}
                </div>

                <div style={{background:"#0a1929",border:"1px solid #0f2744",borderRadius:8,padding:"14px 18px",marginBottom:24}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:9}}>
                    <span style={{fontFamily:"monospace",fontSize:9,color:"#a0aec0",letterSpacing:2}}>AUTOMATION RISK INDEX</span>
                    <span style={{fontFamily:"monospace",fontSize:11,fontWeight:700,color:riskColor(selected.automationRisk)}}>
                      {selected.automationRisk}/100 · {riskLabel(selected.automationRisk)}
                    </span>
                  </div>
                  <div style={{height:7,background:"#1e293b",borderRadius:4,overflow:"hidden"}}>
                    <div style={{height:"100%",borderRadius:4,transition:"width 1s ease",
                      width:`${selected.automationRisk}%`,
                      background:`linear-gradient(90deg,#4ade80,${riskColor(selected.automationRisk)})`}}/>
                  </div>
                  <div style={{display:"flex",justifyContent:"space-between",fontFamily:"monospace",fontSize:9,color:"#c9d5e3",marginTop:5}}>
                    {["SAFE","MODERATE","HIGH","CRITICAL"].map(l=><span key={l}>{l}</span>)}
                  </div>
                </div>

                <div style={{borderTop:"1px solid #0f2744",paddingTop:22}}>
                  <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:18}}>
                    <span style={{fontFamily:"monospace",fontSize:10,color:"#38bdf8",letterSpacing:3}}>◈ AI FUTURE ANALYSIS</span>
                    <div style={{flex:1,height:1,background:"#0f2744"}}/>
                    <span style={{fontFamily:"monospace",fontSize:9,color:"#64748b"}}>CLAUDE HAIKU · {wageStatus.toUpperCase()} BLS</span>
                  </div>

                  {aiLoading && (
                    <div style={{display:"flex",flexDirection:"column",gap:9}}>
                      {[72,52,85,42].map((w,i)=>(
                        <div key={i} style={{height:12,background:"#0a1929",borderRadius:4,width:`${w}%`,
                          animation:`pulse 1.5s ease ${i*.17}s infinite`}}/>
                      ))}
                      <div style={{fontFamily:"monospace",fontSize:10,color:"#8b9eb8",marginTop:5,letterSpacing:2,animation:"pulse 1.5s infinite"}}>
                        PROCESSING BLS DATA…
                      </div>
                    </div>
                  )}

                  {analysis && !analysis.error && (
                    <div style={{animation:"fadeIn .5s ease"}}>
                      <div style={{background:"linear-gradient(135deg,#0c1f35,#0a1929)",border:"1px solid #1e3a5f",
                        borderLeft:"4px solid #38bdf8",borderRadius:8,padding:"16px 20px",marginBottom:20}}>
                        <div style={{fontFamily:"'Playfair Display',serif",fontSize:18,fontWeight:700,lineHeight:1.4,color:"#f1f5f9"}}>
                          <Typewriter text={`"${analysis.headline}"`}/>
                        </div>
                      </div>

                      <div style={{marginBottom:20}}>
                        <div style={{fontFamily:"monospace",fontSize:9,color:"#a0aec0",letterSpacing:2,marginBottom:9}}>OUTLOOK 2035</div>
                        <p style={{lineHeight:1.8,color:"#f1f5f9",fontSize:14,margin:0}}>{analysis.outlook}</p>
                      </div>

                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:18}}>
                        <div style={{background:"#100a0a",border:"1px solid #2a1515",borderRadius:8,padding:"14px 16px"}}>
                          <div style={{fontFamily:"monospace",fontSize:9,color:"#f87171",letterSpacing:2,marginBottom:9}}>⚠ DISRUPTED BY</div>
                          {analysis.killedBy?.map((k,i)=>(
                            <div key={i} style={{display:"flex",gap:7,marginBottom:6,alignItems:"flex-start"}}>
                              <span style={{color:"#f87171",flexShrink:0,marginTop:2}}>▸</span>
                              <span style={{fontSize:12,color:"#fecaca",lineHeight:1.5}}>{k}</span>
                            </div>
                          ))}
                        </div>
                        <div style={{background:"#050f1a",border:"1px solid #0c2a3d",borderRadius:8,padding:"14px 16px"}}>
                          <div style={{fontFamily:"monospace",fontSize:9,color:"#38bdf8",letterSpacing:2,marginBottom:9}}>↑ ELEVATED BY</div>
                          {analysis.evolvedBy?.map((e,i)=>(
                            <div key={i} style={{display:"flex",gap:7,marginBottom:6,alignItems:"flex-start"}}>
                              <span style={{color:"#38bdf8",flexShrink:0,marginTop:2}}>▸</span>
                              <span style={{fontSize:12,color:"#bae6fd",lineHeight:1.5}}>{e}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div style={{marginBottom:18}}>
                        <div style={{fontFamily:"monospace",fontSize:9,color:"#a0aec0",letterSpacing:2,marginBottom:10}}>CRITICAL SKILLS TO DEVELOP</div>
                        <div style={{display:"flex",flexWrap:"wrap",gap:7}}>
                          {analysis.emergingSkills?.map((s,i)=>(
                            <div key={i} style={{background:"rgba(56,189,248,.1)",border:"1px solid rgba(56,189,248,.25)",
                              borderRadius:5,padding:"5px 11px",fontSize:12,color:"#bae6fd",fontFamily:"monospace"}}>{s}</div>
                          ))}
                        </div>
                      </div>

                      <div style={{background:"linear-gradient(135deg,#0a1f12,#050f1a)",border:"1px solid #14532d",borderRadius:8,padding:"16px 20px",marginBottom:28}}>
                        <div style={{fontFamily:"monospace",fontSize:9,color:"#4ade80",letterSpacing:2,marginBottom:7}}>◈ SURVIVAL STRATEGY</div>
                        <p style={{margin:0,fontSize:14,color:"#bbf7d0",lineHeight:1.7,fontStyle:"italic"}}>
                          "{analysis.survivalStrategy}"
                        </p>
                      </div>

                      {similarRoles.length > 0 && (
                        <div style={{borderTop:"1px solid #0f2744",paddingTop:22}}>
                          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
                            <span style={{fontFamily:"monospace",fontSize:10,color:"#a0aec0",letterSpacing:3}}>EXPLORE SIMILAR ROLES</span>
                            <div style={{flex:1,height:1,background:"#0f2744"}}/>
                          </div>
                          <div style={{display:"flex",gap:10}}>
                            {similarRoles.map(job => (
                              <SimilarCard key={job.soc} job={job} wage={job.value} onClick={j => { setMapHint(""); analyze(j); window.scrollTo({top:0,behavior:"smooth"}); }}/>
                            ))}
                          </div>
                          <div style={{fontFamily:"monospace",fontSize:9,color:"#c9d5e3",marginTop:10,textAlign:"center"}}>
                            Click any role to load its full analysis
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {analysis?.error && (
                    <div style={{color:"#f87171",fontFamily:"monospace",fontSize:12}}>Analysis failed — please try again.</div>
                  )}
                </div>

                <div style={{borderTop:"1px solid #0f2744",marginTop:28,paddingTop:16,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <a href="https://00ia.com" target="_blank" rel="noopener noreferrer"
                    style={{fontFamily:"'DM Mono',monospace",fontSize:13,fontWeight:700,color:"#38bdf8",textDecoration:"none",letterSpacing:2,transition:"opacity .2s"}}
                    onMouseEnter={e=>e.currentTarget.style.opacity=".7"}
                    onMouseLeave={e=>e.currentTarget.style.opacity="1"}>
                    00IA ↗
                  </a>
                  <span style={{fontFamily:"'Playfair Display',serif",fontSize:12,color:"#8b9eb8",lineHeight:1.6,textAlign:"right"}}>
                    THOUGHTS,<br/>CODE,<br/>AND COGNITION.
                  </span>
                </div>
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
