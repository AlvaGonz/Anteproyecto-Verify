"""Apply changes to CertificadoTituloExtractionCard.tsx using regex."""
import re

path = r'src\frontend\web\src\features\documents\components\CertificadoTituloExtractionCard.tsx'
with open(path, 'r', encoding='utf-8') as f:
    src = f.read()

# 1) Insert import + helpers after the existing lucide-react import
helpers = '''import { AlertTriangle, FileText, Loader2, Info, Pencil, Check, X, BadgeCheck, AlertCircle, MinusCircle } from "lucide-react";
import { formatMatricula, formatSuperficieM2, isNumericMatricula, isNumericSuperficieM2 } from "../utils/numericFormatter";

type NumericKind = "matricula" | "superficieM2";

const NUMERIC_FIELDS: Record<string, NumericKind> = {
  matricula: "matricula",
  superficieM2: "superficieM2",
};

const formatNumeric = (fieldKey: string, raw: string): string => {
  switch (NUMERIC_FIELDS[fieldKey]) {
    case "matricula":
      return formatMatricula(raw);
    case "superficieM2":
      return formatSuperficieM2(raw);
    default:
      return raw;
  }
};

const isValidNumeric = (fieldKey: string, raw: string): boolean => {
  switch (NUMERIC_FIELDS[fieldKey]) {
    case "matricula":
      return isNumericMatricula(raw);
    case "superficieM2":
      return isNumericSuperficieM2(raw);
    default:
      return true;
  }
};
'''
# Already inserted? Check by searching for the import.
if 'from "../utils/numericFormatter"' not in src:
    src = src.replace(
        'import { AlertTriangle, FileText, Loader2, Info, Pencil, Check, X, BadgeCheck, AlertCircle, MinusCircle } from "lucide-react";',
        helpers,
    )

# 2) Update renderField header to compute rawValue/displayValue/isNumeric
old_render = '''  const renderField = (label: string, fieldKey: string, field?: ExtractedField, isPrimary = false) => {
    const safeField = field || { rawValue: '', normalizedValue: '', confidence: 0, status: FieldStatus.Missing, sourcePage: 1 };
    const displayValue = safeField.normalizedValue || safeField.rawValue || '';
    const isMissing = safeField.status === FieldStatus.Missing && !displayValue;
    const isLowConfidence = safeField.status === FieldStatus.LowConfidence || safeField.confidence < 0.8;
    const isEditing = editingField === fieldKey;'''
new_render = '''  const renderField = (label: string, fieldKey: string, field?: ExtractedField, isPrimary = false) => {
    const safeField = field || { rawValue: '', normalizedValue: '', confidence: 0, status: FieldStatus.Missing, sourcePage: 1 };
    const rawValue = safeField.normalizedValue || safeField.rawValue || '';
    const displayValue = NUMERIC_FIELDS[fieldKey] ? formatNumeric(fieldKey, rawValue) : rawValue;
    const isMissing = safeField.status === FieldStatus.Missing && !displayValue;
    const isLowConfidence = safeField.status === FieldStatus.LowConfidence || safeField.confidence < 0.8;
    const isEditing = editingField === fieldKey;
    const isNumeric = !!NUMERIC_FIELDS[fieldKey];'''
assert old_render in src, 'renderField header not found'
src = src.replace(old_render, new_render)

# 3) Replace the input element block using regex
input_re = re.compile(
    r'<input \s*\n\s*type="text" \s*\n\s*className="flex-1[^"]*" \s*\n\s*value=\{editValue\} \s*\n\s*onChange=\{\(e\) => setEditValue\(e\.target\.value\)\}\s*\n\s*autoFocus\s*\n\s*disabled=\{isSaving\}\s*\n\s*onKeyDown=\{\(e\) => \{\s*\n\s*if \(e\.key === \'Enter\'\) handleSave\(fieldKey\);\s*\n\s*if \(e\.key === \'Escape\'\) handleCancel\(\);\s*\n\s*\}\}',
    re.MULTILINE,
)
new_input = '''<input
                 type={isNumeric ? "number" : "text"}
                 inputMode={isNumeric ? "numeric" : undefined}
                 pattern={isNumeric ? "[0-9.]*" : undefined}
                 step={fieldKey === "superficieM2" ? "0.01" : "1"}
                 min={isNumeric ? "0" : undefined}
                 data-testid={`field-input-${fieldKey}`}
                 className="flex-1 text-sm border-b border-primary outline-none px-1 py-0.5 bg-transparent"
                 value={editValue}
                 onChange={(e) => {
                    const next = e.target.value;
                    if (!isNumeric) {
                      setEditValue(next);
                      return;
                    }
                    const filtered = next.replace(/[^0-9.]/g, "");
                    const sanitized = fieldKey === "superficieM2"
                      ? (() => {
                          const firstDot = filtered.indexOf(".");
                          if (firstDot === -1) return filtered;
                          return filtered.slice(0, firstDot + 1) + filtered.slice(firstDot + 1).replace(/\\./g, "");
                        })()
                      : filtered;
                    setEditValue(sanitized);
                 }}
                 autoFocus
                 disabled={isSaving}
                 onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSave(fieldKey);
                    if (e.key === 'Escape') handleCancel();
                 }}
               />'''
m = input_re.search(src)
assert m is not None, 'input element not found'
src = src[:m.start()] + new_input + src[m.end():]

# 4) Update handleEditClick to pass rawValue (not formatted display)
old_edit = 'onClick={() => handleEditClick(fieldKey, displayValue)}'
new_edit = 'onClick={() => handleEditClick(fieldKey, rawValue)}'
assert old_edit in src, 'handleEditClick call not found'
src = src.replace(old_edit, new_edit)

with open(path, 'w', encoding='utf-8') as f:
    f.write(src)

print('All changes applied successfully')
