#!/usr/bin/env node

// Quick test of translation providers with sample French HOA text
require('dotenv').config();

const { OpenAI } = require('openai');
const { Anthropic } = require('@anthropic-ai/sdk');

const sampleText = `
Rapport de l'Assemblée Générale Costa Beach

Chers propriétaires,

L'assemblée générale de la copropriété Costa Beach s'est tenue le 15 juin 2025. Voici les principales décisions prises :

1. BUDGET 2025
Le budget prévisionnel s'élève à 180 000 euros, répartis comme suit :
- Charges courantes : 120 000 €
- Travaux programmés : 45 000 €
- Fonds de réserve : 15 000 €

2. TRAVAUX DE RÉNOVATION
- Réfection de la piscine communautaire : approuvée à l'unanimité
- Installation de bornes de recharge électrique : approuvée (18 voix pour, 2 abstentions)
- Rénovation des espaces verts : reportée au prochain exercice

3. SÉCURITÉ
Installation d'un nouveau système de vidéosurveillance dans les parties communes, incluant l'entrée principale et le parking.

Cordialement,
Le Syndic
`;

async function testProviders() {
    console.log('🧪 Testing translation providers with sample French text...\n');
    
    // Test OpenAI
    if (process.env.OPENAI_API_KEY) {
        console.log('🤖 Testing OpenAI...');
        try {
            const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
            const response = await openai.chat.completions.create({
                model: 'gpt-4o-mini',
                messages: [
                    { role: 'system', content: 'Translate the following French text to English while preserving the structure and formatting.' },
                    { role: 'user', content: sampleText }
                ],
                max_tokens: 1000,
                temperature: 0.1
            });
            
            console.log('✅ OpenAI translation successful!');
            console.log('Translation preview:', response.choices[0].message.content.substring(0, 200) + '...\n');
            
        } catch (error) {
            console.log('❌ OpenAI failed:', error.message, '\n');
        }
    } else {
        console.log('⚠️  OpenAI API key not found\n');
    }
    
    // Test Anthropic
    if (process.env.ANTHROPIC_API_KEY) {
        console.log('🧠 Testing Anthropic...');
        try {
            const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
            const response = await anthropic.messages.create({
                model: 'claude-3-5-haiku-20241022',
                max_tokens: 1000,
                messages: [
                    { role: 'user', content: `Translate this French text to English while preserving structure:\n\n${sampleText}` }
                ]
            });
            
            console.log('✅ Anthropic translation successful!');
            console.log('Translation preview:', response.content[0].text.substring(0, 200) + '...\n');
            
        } catch (error) {
            console.log('❌ Anthropic failed:', error.message, '\n');
        }
    } else {
        console.log('⚠️  Anthropic API key not found\n');
    }
}

testProviders().catch(console.error);