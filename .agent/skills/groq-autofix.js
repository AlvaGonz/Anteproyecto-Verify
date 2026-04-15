import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const GROQ_API_KEY = process.env.GROQ_API_KEY || process.env.VITE_GROQ_API_KEY;
const MODEL = process.env.GROQ_MODEL_PRIMARY || 'llama-3.3-70b-versatile';

async function auditFile(filePath) {
    console.log(`\n🔍 Auditing: ${filePath}`);
    const content = fs.readFileSync(filePath, 'utf8');

    const prompt = `
Act as a Senior Architect and Security Expert. Audit the following file and provide a COMPLETE FIXED VERSION.
Follow these rules:
1. No 1px borders (use background shifts like 'bg-surface-raised' or 'bg-primary/5').
2. Institutional Authority feel (Manrope for headings, Inter for body).
3. Use THESE CSS color variables:
   - Primary: var(--color-primary) #F98513 (Habañero)
   - Secondary: var(--color-secondary) #223382 (Deep Space Royal)
   - Background: var(--color-surface) and var(--color-surface-raised) (Luster White)
   - Text: var(--color-text-primary)
4. Security First: Validations and sanitization (use guard clauses).
5. Clean Code: Fix TypeScript errors, use DRY and atomic functions.
6. Animations: Use Framer Motion and 'animate-fade-in-up' where appropriate.

FILE CONTENT:
'''
${content}
'''

RESPONSE FORMAT: Only provide the code inside triple backticks. No explanations.
`;

    try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${GROQ_API_KEY}`
            },
            body: JSON.stringify({
                model: MODEL,
                messages: [{ role: 'user', content: prompt }]
            })
        });

        const data = await response.json();
        if (data.error) throw new Error(data.error.message);
        
        let fixedCode = data.choices[0].message.content;
        
        // Extract content between backticks if present
        const match = fixedCode.match(/```(?:[a-z]*)\n?([\s\S]*?)\n?```/);
        if (match) fixedCode = match[1];

        fs.writeFileSync(filePath, fixedCode);
        console.log(`✅ Fixed: ${filePath}`);
    } catch (error) {
        console.error(`❌ Error in ${filePath}:`, error.message);
    }
}

const filesToFix = process.argv.slice(2);
if (filesToFix.length === 0) {
    console.log("Usage: node groq-autofix.js <file1> <file2> ...");
} else {
    for (const file of filesToFix) {
        await auditFile(file);
    }
}
