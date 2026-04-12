# Product Requirements Document (PRD): VeriFinca

## 1. Executive Summary
**VeriFinca** is an integrated web-based system designed to verify and authenticate real estate projects in the Dominican Republic. Its primary mission is to prevent financial fraud by validating legal, financial, and property documentation through automated cross-referencing with official government sources and credit bureaus.

## 2. Project Overview
*   **Project Name:** VeriFinca (Anteproyecto-Verify)
*   **Target Market:** Dominican Republic Real Estate Sector.
*   **Key Stakeholders:** Real Estate Developers, Investors, Financial Institutions, and Government Regulatory Bodies (RI, DGII, Catastro Nacional).
*   **Core Value Proposition:** Reducing the manual verification process from 5–15 days to approximately 2 minutes through a unified digital platform.

## 3. Goals and Objectives
### 3.1 General Objective
To develop an integral web system for the verification and authentication of real estate projects to prevent financial scams through the validation of legal, financial, and property documentation in the Dominican Republic.

### 3.2 Specific Objectives
1.  **Diagnose** essential documentation requirements based on RI (Registro Inmobiliario) regulations.
2.  **Automate** project validation by contrasting data with DGII, Catastro Nacional, and Municipalities.
3.  **Detect** registry and documentary duplicities to prevent fraud.
4.  **Identify** inconsistencies in document validity, completeness, and formality.
5.  **Validate** territorial correspondence using georeferencing.
6.  **Verify** financial and credit status of developers (with express consent under Law 172-13).
7.  **Certify** project integrity via a "Digital Integrity Seal" (Sello de Integridad) with QR codes and digital signatures.

## 4. Target Audience & User Personas
| Persona | Description | Key Needs |
| :--- | :--- | :--- |
| **Developer** | Real estate firms initiating projects. | Fast validation, project credibility, easy document management. |
| **Professional/Validator** | Legal or technical experts reviewing files. | Efficient auditing tools, clear alert systems, reporting. |
| **Investor/Buyer** | Individuals or entities looking to purchase. | Transparency, verification of project legitimacy via QR. |
| **Administrator** | System managers. | Rule configuration, user management, audit trail monitoring. |

## 5. Functional Requirements (FR)
| ID | Requirement Name | Description |
| :--- | :--- | :--- |
| **RF-1** | Project Registration | Allow registration of digital files with essential metadata (GPS, developer info). |
| **RF-2** | Documentary Diagnosis | Identify missing or incomplete essential documents based on project type. |
| **RF-3** | Integrity Validation | Verify presence of mandatory fields (title, date, signature) via OCR. |
| **RF-4** | RI Integration | Query DGRI for title validity, ownership, and legal encumbrances. |
| **RF-5** | Catastro Contrast | Compare declared area and boundaries with National Cadastre records. |
| **RF-6** | DGII Validation | Verify developer's fiscal status (RNC, tax compliance). |
| **RF-7** | Territorial Mapping | Use georeferencing to ensure project location matches cadastre data. |
| **RF-8** | Consent Management | Legally capture and store developer consent for credit checks (Law 172-13). |
| **RF-9** | Credit Verification | Consult TransUnion or equivalent for developer credit history. |
| **RF-10** | Integrity Seal | Generate a signed QR code (Law 126-02) for projects passing all checks. |
| **RF-11** | Public Consultation | Enable controlled public verification of the Integrity Seal. |

## 6. Non-Functional Requirements (NFR)
| ID | Requirement Name | Specification |
| :--- | :--- | :--- |
| **RNF-1** | Security | AES-256 encryption at rest, TLS 1.2+ in transit. |
| **RNF-2** | Performance | Simple validations < 2 mins; complex projects < 5 mins. |
| **RNF-3** | Availability | 99.2% uptime with planned maintenance. |
| **RNF-4** | Scalability | Support minimum 500 concurrent users. |
| **RNF-5** | Compliance | Strict adherence to Law 172-13 (Data Protection) and Law 126-02 (Digital Commerce). |
| **RNF-6** | UI/UX | Responsive interface following the official VeriFinca design tokens. |

## 7. Technical Architecture
The system follows a **Clean Architecture** (Backend) and **SPA** (Frontend) approach.

*   **Frontend:** React 19, TypeScript, Vite.
*   **Backend:** ASP.NET Core 8 Web API.
*   **Database:** Azure SQL (Relational data), Azure Blob Storage (Document storage).
*   **Key Modules:**
    *   **Document Rules Engine:** Evaluates validity and completeness.
    *   **Georeferencing Module:** Validates territorial data.
    *   **Consent Manager:** Handles legal permissions for financial checks.
    *   **Certification Engine:** Issues the Digital Integrity Seal.

## 8. Design & Branding
Following the **DESIGN.md** specifications:
-   **Primary Color**: `#F98513` - This is our brand's most distinctive color, used for primary actions, key interactive elements, and prominent branding.

-   **Secondary Color**: `#223382` - A supporting color, suitable for less prominent UI elements, chips, and secondary actions.

-   **Tertiary Color**: `#9BACD8` - An additional accent color, used for highlights, badges, or decorative elements.

-   **Neutral Color**: `#DAD1C8` - This serves as our base for backgrounds, surfaces, and non-chromatic elements, providing a balanced and clean canvas.
*   **Typography:** Focus on technical clarity and legal trust.

## 9. Roadmap & Future Features
1.  **Phase 1 (MVP):** Core document validation, RI/DGII integration, and Integrity Seal.
2.  **Phase 2:** Advanced georeferencing and automated credit bureau integration.
3.  **Phase 3 (Future):**
    *   **AI/OCR+ML:** Automatic detection of forged documents.
    *   **Blockchain:** Immutable registry of issued seals.
    *   **Fraud Prediction:** Risk scoring (0-100) based on historical patterns.

## 10. Risk & Mitigation
*   **API Availability:** Dependency on government API uptime. *Mitigation:* Implement caching and manual fallback flags.
*   **Data Privacy:** Risk of unauthorized access to financial data. *Mitigation:* Multi-factor authentication (2FA) and strict role-based access control (RBAC).
