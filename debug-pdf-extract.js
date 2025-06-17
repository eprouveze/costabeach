#!/usr/bin/env node

const pdfParse = require('pdf-parse');
const fs = require('fs');

async function debugPDFContent(pdfPath) {
    console.log(`🔍 Debugging PDF extraction: ${pdfPath}\n`);
    
    try {
        const dataBuffer = fs.readFileSync(pdfPath);
        const pdfData = await pdfParse(dataBuffer);
        
        console.log('📊 PDF Metadata:');
        console.log('- Pages:', pdfData.numpages);
        console.log('- Text length:', pdfData.text.length);
        console.log('- Word count:', pdfData.text.split(/\s+/).filter(w => w.length > 0).length);
        console.log('- Info:', pdfData.info);
        
        console.log('\n📝 First 500 characters of extracted text:');
        console.log('---');
        console.log(pdfData.text.substring(0, 500));
        console.log('---');
        
        console.log('\n🔤 Character analysis:');
        console.log('- First 50 chars as array:', JSON.stringify(pdfData.text.substring(0, 50).split('')));
        
        return pdfData;
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

// Test all PDFs
const testFiles = [
    'tmp/Costa/Rapport costa Beach au 30-04-2025.pptx (2).pdf',
    'tmp/Costa/BUDGET COSTA.pdf',
    'tmp/Costa/Charte-Ethique-Costa-III.pdf',
    'tmp/Costa/Pv Ag costa beach 2 GH4.pdf'
];

async function testAllPDFs() {
    for (const file of testFiles) {
        if (fs.existsSync(file)) {
            await debugPDFContent(file);
            console.log('\n' + '='.repeat(80) + '\n');
        } else {
            console.log(`⚠️  File not found: ${file}\n`);
        }
    }
}

testAllPDFs().catch(console.error);