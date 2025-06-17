#!/usr/bin/env node

/**
 * PDF Translation Test Bench
 * 
 * Compares translation quality between:
 * 1. Current CostaBeach implementation (Anthropic Claude)
 * 2. PDF-translator package (OpenAI, Anthropic, Google Gemini)
 * 
 * Usage: node test-translations.js [pdf-file] [options]
 */

const fs = require('fs');
const path = require('path');
const { Command } = require('commander');
require('dotenv').config();

// PDF processing
const pdfParse = require('pdf-parse');
const { PDFDocument } = require('pdf-lib');

// AI Providers
const { OpenAI } = require('openai');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { Anthropic } = require('@anthropic-ai/sdk');

class TranslationTestBench {
    constructor(options = {}) {
        this.options = options;
        this.results = [];
        this.startTime = null;
        this.outputDir = options.outputDir || './test-results';
        
        // Initialize providers
        this.initializeProviders();
        
        // Ensure output directory exists
        if (!fs.existsSync(this.outputDir)) {
            fs.mkdirSync(this.outputDir, { recursive: true });
        }
    }

    initializeProviders() {
        // OpenAI
        if (process.env.OPENAI_API_KEY) {
            this.openai = new OpenAI({
                apiKey: process.env.OPENAI_API_KEY,
            });
        }

        // Anthropic
        if (process.env.ANTHROPIC_API_KEY) {
            this.anthropic = new Anthropic({
                apiKey: process.env.ANTHROPIC_API_KEY,
            });
        }

        // Google Gemini
        if (process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
            this.gemini = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY);
        }

        // Current implementation will use direct Anthropic API calls
        this.currentImplementation = null;
    }

    async extractTextFromPDF(pdfPath) {
        console.log(`📄 Extracting text from: ${pdfPath}`);
        
        const dataBuffer = fs.readFileSync(pdfPath);
        const pdfData = await pdfParse(dataBuffer);
        
        const extractedText = {
            text: pdfData.text,
            pages: pdfData.numpages,
            metadata: {
                title: pdfData.info?.Title || 'Unknown',
                author: pdfData.info?.Author || 'Unknown',
                subject: pdfData.info?.Subject || 'Unknown',
                pages: pdfData.numpages,
                wordCount: pdfData.text.split(/\\s+/).length,
                charCount: pdfData.text.length
            }
        };

        console.log(`✅ Extracted ${extractedText.metadata.wordCount} words from ${extractedText.pages} pages`);
        return extractedText;
    }

    async testCurrentImplementation(text, sourceLang, targetLang) {
        console.log(`🔄 Testing current CostaBeach implementation: ${sourceLang} → ${targetLang}`);
        
        const startTime = Date.now();
        
        try {
            // Simulate current implementation with direct Anthropic API call
            const prompt = `Translate the following text from ${sourceLang} to ${targetLang}. Preserve formatting and structure. Text to translate:\\n\\n${text}`;
            
            const response = await this.anthropic.messages.create({
                model: 'claude-3-5-sonnet-20241022',
                max_tokens: 4000,
                messages: [
                    {
                        role: 'user',
                        content: prompt
                    }
                ]
            });
            
            const translation = response.content[0].text;
            const executionTime = Date.now() - startTime;
            
            // Estimate cost (rough approximation)
            const inputTokens = Math.ceil(text.length / 4); // ~4 chars per token
            const outputTokens = Math.ceil(translation.length / 4);
            const estimatedCost = (inputTokens * 0.003 + outputTokens * 0.015) / 1000; // Claude 3.5 Sonnet pricing
            
            return {
                provider: 'current-implementation',
                model: 'claude-3-5-sonnet-20241022',
                translation,
                executionTime,
                inputTokens,
                outputTokens,
                estimatedCost,
                success: true,
                metadata: {
                    lengthRatio: translation.length / text.length,
                    wordCount: translation.split(/\\s+/).length
                }
            };
            
        } catch (error) {
            console.error(`❌ Current implementation failed:`, error.message);
            return {
                provider: 'current-implementation',
                model: 'claude-3-5-sonnet-20241022',
                translation: null,
                executionTime: Date.now() - startTime,
                success: false,
                error: error.message
            };
        }
    }

    async testOpenAI(text, sourceLang, targetLang, model = 'gpt-4o') {
        console.log(`🤖 Testing OpenAI ${model}: ${sourceLang} → ${targetLang}`);
        
        const startTime = Date.now();
        
        try {
            const response = await this.openai.chat.completions.create({
                model: model,
                messages: [
                    {
                        role: 'system',
                        content: `You are a professional translator. Translate text from ${sourceLang} to ${targetLang} while preserving formatting and structure.`
                    },
                    {
                        role: 'user',
                        content: text
                    }
                ],
                max_tokens: 4000,
                temperature: 0.1
            });
            
            const translation = response.choices[0].message.content;
            const executionTime = Date.now() - startTime;
            
            return {
                provider: 'openai',
                model,
                translation,
                executionTime,
                inputTokens: response.usage.prompt_tokens,
                outputTokens: response.usage.completion_tokens,
                estimatedCost: this.calculateOpenAICost(model, response.usage),
                success: true,
                metadata: {
                    lengthRatio: translation.length / text.length,
                    wordCount: translation.split(/\\s+/).length
                }
            };
            
        } catch (error) {
            console.error(`❌ OpenAI ${model} failed:`, error.message);
            return {
                provider: 'openai',
                model,
                translation: null,
                executionTime: Date.now() - startTime,
                success: false,
                error: error.message
            };
        }
    }

    async testAnthropic(text, sourceLang, targetLang, model = 'claude-3-5-sonnet-20241022') {
        console.log(`🧠 Testing Anthropic ${model}: ${sourceLang} → ${targetLang}`);
        
        const startTime = Date.now();
        
        try {
            const response = await this.anthropic.messages.create({
                model: model,
                max_tokens: 4000,
                messages: [
                    {
                        role: 'user',
                        content: `Translate the following text from ${sourceLang} to ${targetLang}. Preserve formatting and structure.\\n\\n${text}`
                    }
                ]
            });
            
            const translation = response.content[0].text;
            const executionTime = Date.now() - startTime;
            
            // Estimate tokens and cost
            const inputTokens = Math.ceil(text.length / 4);
            const outputTokens = Math.ceil(translation.length / 4);
            const estimatedCost = this.calculateAnthropicCost(model, inputTokens, outputTokens);
            
            return {
                provider: 'anthropic',
                model,
                translation,
                executionTime,
                inputTokens,
                outputTokens,
                estimatedCost,
                success: true,
                metadata: {
                    lengthRatio: translation.length / text.length,
                    wordCount: translation.split(/\\s+/).length
                }
            };
            
        } catch (error) {
            console.error(`❌ Anthropic ${model} failed:`, error.message);
            return {
                provider: 'anthropic',
                model,
                translation: null,
                executionTime: Date.now() - startTime,
                success: false,
                error: error.message
            };
        }
    }

    async testGemini(text, sourceLang, targetLang, model = 'gemini-1.5-pro') {
        console.log(`💎 Testing Google Gemini ${model}: ${sourceLang} → ${targetLang}`);
        
        const startTime = Date.now();
        
        try {
            const genModel = this.gemini.getGenerativeModel({ model: model });
            
            const prompt = `Translate the following text from ${sourceLang} to ${targetLang}. Preserve formatting and structure:\\n\\n${text}`;
            
            const result = await genModel.generateContent(prompt);
            const translation = result.response.text();
            const executionTime = Date.now() - startTime;
            
            // Estimate tokens and cost
            const inputTokens = Math.ceil(text.length / 4);
            const outputTokens = Math.ceil(translation.length / 4);
            const estimatedCost = this.calculateGeminiCost(model, inputTokens, outputTokens);
            
            return {
                provider: 'gemini',
                model,
                translation,
                executionTime,
                inputTokens,
                outputTokens,
                estimatedCost,
                success: true,
                metadata: {
                    lengthRatio: translation.length / text.length,
                    wordCount: translation.split(/\\s+/).length
                }
            };
            
        } catch (error) {
            console.error(`❌ Gemini ${model} failed:`, error.message);
            return {
                provider: 'gemini',
                model,
                translation: null,
                executionTime: Date.now() - startTime,
                success: false,
                error: error.message
            };
        }
    }

    calculateOpenAICost(model, usage) {
        const pricing = {
            'gpt-4o': { input: 0.005, output: 0.015 },
            'gpt-4o-mini': { input: 0.00015, output: 0.0006 },
            'gpt-4-turbo': { input: 0.01, output: 0.03 },
            'gpt-3.5-turbo': { input: 0.0015, output: 0.002 }
        };
        
        const rates = pricing[model] || pricing['gpt-4o'];
        return (usage.prompt_tokens * rates.input + usage.completion_tokens * rates.output) / 1000;
    }

    calculateAnthropicCost(model, inputTokens, outputTokens) {
        const pricing = {
            'claude-3-5-sonnet-20241022': { input: 0.003, output: 0.015 },
            'claude-3-5-haiku-20241022': { input: 0.00025, output: 0.00125 },
            'claude-3-opus-20240229': { input: 0.015, output: 0.075 },
            'claude-3-sonnet-20240229': { input: 0.003, output: 0.015 },
            'claude-3-haiku-20240307': { input: 0.00025, output: 0.00125 }
        };
        
        const rates = pricing[model] || pricing['claude-3-5-sonnet-20241022'];
        return (inputTokens * rates.input + outputTokens * rates.output) / 1000;
    }

    calculateGeminiCost(model, inputTokens, outputTokens) {
        const pricing = {
            'gemini-1.5-pro': { input: 0.0035, output: 0.0105 },
            'gemini-1.5-flash': { input: 0.00035, output: 0.00105 },
            'gemini-1.0-pro': { input: 0.0005, output: 0.0015 }
        };
        
        const rates = pricing[model] || pricing['gemini-1.5-pro'];
        return (inputTokens * rates.input + outputTokens * rates.output) / 1000;
    }

    async runAllTests(text, sourceLang, targetLang, providers = ['all']) {
        console.log(`\\n🚀 Starting translation tests: ${sourceLang} → ${targetLang}`);
        console.log(`📊 Providers: ${providers.join(', ')}`);
        
        const results = [];
        
        // Test current implementation
        if (providers.includes('all') || providers.includes('current')) {
            const result = await this.testCurrentImplementation(text, sourceLang, targetLang);
            results.push(result);
        }

        // Test OpenAI models
        if (providers.includes('all') || providers.includes('openai')) {
            const models = ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo'];
            for (const model of models) {
                if (this.openai) {
                    const result = await this.testOpenAI(text, sourceLang, targetLang, model);
                    results.push(result);
                }
            }
        }

        // Test Anthropic models
        if (providers.includes('all') || providers.includes('anthropic')) {
            const models = [
                'claude-3-5-sonnet-20241022',
                'claude-3-5-haiku-20241022',
                'claude-3-opus-20240229',
                'claude-3-sonnet-20240229',
                'claude-3-haiku-20240307'
            ];
            for (const model of models) {
                if (this.anthropic) {
                    const result = await this.testAnthropic(text, sourceLang, targetLang, model);
                    results.push(result);
                }
            }
        }

        // Test Gemini models
        if (providers.includes('all') || providers.includes('gemini')) {
            const models = ['gemini-1.5-pro', 'gemini-1.5-flash', 'gemini-1.0-pro'];
            for (const model of models) {
                if (this.gemini) {
                    const result = await this.testGemini(text, sourceLang, targetLang, model);
                    results.push(result);
                }
            }
        }

        return results;
    }

    async saveResults(results, pdfData, sourceLang, targetLang) {
        console.log(`\\n💾 Saving results to ${this.outputDir}`);
        
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const testId = `${sourceLang}-to-${targetLang}-${timestamp}`;
        
        // Create test-specific directory
        const testDir = path.join(this.outputDir, testId);
        if (!fs.existsSync(testDir)) {
            fs.mkdirSync(testDir, { recursive: true });
        }

        // Save individual translation results
        const translationsDir = path.join(testDir, 'translations');
        if (!fs.existsSync(translationsDir)) {
            fs.mkdirSync(translationsDir, { recursive: true });
        }

        for (const result of results) {
            if (result.success && result.translation) {
                const fileName = `${result.provider}-${result.model}.txt`;
                const filePath = path.join(translationsDir, fileName);
                fs.writeFileSync(filePath, result.translation);
                
                // Save metadata
                const metadataPath = path.join(translationsDir, `${result.provider}-${result.model}-metadata.json`);
                fs.writeFileSync(metadataPath, JSON.stringify(result, null, 2));
            }
        }

        // Save comprehensive results
        const resultsData = {
            testId,
            timestamp: new Date().toISOString(),
            sourceLang,
            targetLang,
            sourceDocument: pdfData.metadata,
            results: results,
            summary: this.generateSummary(results)
        };

        fs.writeFileSync(
            path.join(testDir, 'results.json'),
            JSON.stringify(resultsData, null, 2)
        );

        // Generate markdown report
        const report = this.generateMarkdownReport(resultsData);
        fs.writeFileSync(path.join(testDir, 'report.md'), report);

        console.log(`✅ Results saved to: ${testDir}`);
        return testDir;
    }

    generateSummary(results) {
        const successful = results.filter(r => r.success);
        const failed = results.filter(r => !r.success);
        
        const summary = {
            totalTests: results.length,
            successful: successful.length,
            failed: failed.length,
            avgExecutionTime: successful.reduce((sum, r) => sum + r.executionTime, 0) / successful.length,
            totalCost: successful.reduce((sum, r) => sum + (r.estimatedCost || 0), 0),
            avgLengthRatio: successful.reduce((sum, r) => sum + (r.metadata?.lengthRatio || 0), 0) / successful.length,
            providerStats: {}
        };

        // Group by provider
        for (const result of successful) {
            if (!summary.providerStats[result.provider]) {
                summary.providerStats[result.provider] = {
                    tests: 0,
                    avgTime: 0,
                    avgCost: 0,
                    models: []
                };
            }
            
            const stats = summary.providerStats[result.provider];
            stats.tests++;
            stats.avgTime += result.executionTime;
            stats.avgCost += result.estimatedCost || 0;
            stats.models.push(result.model);
        }

        // Calculate averages
        for (const provider in summary.providerStats) {
            const stats = summary.providerStats[provider];
            stats.avgTime = stats.avgTime / stats.tests;
            stats.avgCost = stats.avgCost / stats.tests;
            stats.models = [...new Set(stats.models)]; // Remove duplicates
        }

        return summary;
    }

    generateMarkdownReport(data) {
        const { testId, timestamp, sourceLang, targetLang, sourceDocument, results, summary } = data;
        
        let report = `# Translation Test Report\\n\\n`;
        report += `**Test ID:** ${testId}\\n`;
        report += `**Timestamp:** ${timestamp}\\n`;
        report += `**Translation:** ${sourceLang.toUpperCase()} → ${targetLang.toUpperCase()}\\n\\n`;
        
        report += `## Source Document\\n\\n`;
        report += `- **Title:** ${sourceDocument.title}\\n`;
        report += `- **Pages:** ${sourceDocument.pages}\\n`;
        report += `- **Word Count:** ${sourceDocument.wordCount}\\n`;
        report += `- **Character Count:** ${sourceDocument.charCount}\\n\\n`;
        
        report += `## Summary\\n\\n`;
        report += `- **Total Tests:** ${summary.totalTests}\\n`;
        report += `- **Successful:** ${summary.successful}\\n`;
        report += `- **Failed:** ${summary.failed}\\n`;
        report += `- **Average Execution Time:** ${(summary.avgExecutionTime / 1000).toFixed(2)}s\\n`;
        report += `- **Total Estimated Cost:** $${summary.totalCost.toFixed(4)}\\n`;
        report += `- **Average Length Ratio:** ${summary.avgLengthRatio.toFixed(2)}\\n\\n`;
        
        report += `## Provider Performance\\n\\n`;
        report += `| Provider | Tests | Avg Time (s) | Avg Cost ($) | Models |\\n`;
        report += `|----------|-------|--------------|--------------|--------|\\n`;
        
        for (const [provider, stats] of Object.entries(summary.providerStats)) {
            report += `| ${provider} | ${stats.tests} | ${(stats.avgTime / 1000).toFixed(2)} | ${stats.avgCost.toFixed(4)} | ${stats.models.join(', ')} |\\n`;
        }
        
        report += `\\n## Detailed Results\\n\\n`;
        
        const successful = results.filter(r => r.success);
        const failed = results.filter(r => !r.success);
        
        if (successful.length > 0) {
            report += `### Successful Translations\\n\\n`;
            report += `| Provider | Model | Time (s) | Cost ($) | Length Ratio | Word Count |\\n`;
            report += `|----------|-------|----------|----------|--------------|------------|\\n`;
            
            for (const result of successful) {
                report += `| ${result.provider} | ${result.model} | ${(result.executionTime / 1000).toFixed(2)} | ${(result.estimatedCost || 0).toFixed(4)} | ${(result.metadata?.lengthRatio || 0).toFixed(2)} | ${result.metadata?.wordCount || 0} |\\n`;
            }
        }
        
        if (failed.length > 0) {
            report += `\\n### Failed Translations\\n\\n`;
            report += `| Provider | Model | Error |\\n`;
            report += `|----------|-------|-------|\\n`;
            
            for (const result of failed) {
                report += `| ${result.provider} | ${result.model} | ${result.error} |\\n`;
            }
        }
        
        report += `\\n## Recommendations\\n\\n`;
        
        // Find best performer by cost-effectiveness
        const bestByCost = successful.reduce((best, current) => {
            const currentScore = (current.metadata?.lengthRatio || 0) / (current.estimatedCost || 1);
            const bestScore = (best.metadata?.lengthRatio || 0) / (best.estimatedCost || 1);
            return currentScore > bestScore ? current : best;
        }, successful[0]);
        
        // Find fastest
        const fastest = successful.reduce((fastest, current) => {
            return current.executionTime < fastest.executionTime ? current : fastest;
        }, successful[0]);
        
        if (bestByCost) {
            report += `- **Most Cost-Effective:** ${bestByCost.provider} (${bestByCost.model}) - $${(bestByCost.estimatedCost || 0).toFixed(4)}\\n`;
        }
        
        if (fastest) {
            report += `- **Fastest:** ${fastest.provider} (${fastest.model}) - ${(fastest.executionTime / 1000).toFixed(2)}s\\n`;
        }
        
        return report;
    }
}

// CLI Interface
const program = new Command();

program
    .name('test-translations')
    .description('Compare PDF translation quality across multiple AI providers')
    .version('1.0.0')
    .argument('<pdf-file>', 'PDF file to translate')
    .option('-s, --source-lang <lang>', 'Source language (fr, ar, en)', 'fr')
    .option('-t, --target-lang <lang>', 'Target language (fr, ar, en)', 'en')
    .option('-p, --providers <providers>', 'Comma-separated providers (current,openai,anthropic,gemini,all)', 'all')
    .option('-o, --output-dir <dir>', 'Output directory', './test-results')
    .option('-f, --format <format>', 'Report format (json, markdown, both)', 'both')
    .action(async (pdfFile, options) => {
        try {
            console.log('🔬 PDF Translation Test Bench v1.0.0\\n');
            
            // Validate PDF file
            if (!fs.existsSync(pdfFile)) {
                console.error(`❌ PDF file not found: ${pdfFile}`);
                process.exit(1);
            }
            
            // Validate languages
            const supportedLangs = ['fr', 'ar', 'en'];
            if (!supportedLangs.includes(options.sourceLang) || !supportedLangs.includes(options.targetLang)) {
                console.error(`❌ Unsupported language. Supported: ${supportedLangs.join(', ')}`);
                process.exit(1);
            }
            
            if (options.sourceLang === options.targetLang) {
                console.error(`❌ Source and target languages cannot be the same`);
                process.exit(1);
            }
            
            // Parse providers
            const providers = options.providers.split(',').map(p => p.trim());
            
            // Initialize test bench
            const testBench = new TranslationTestBench({
                outputDir: options.outputDir,
                format: options.format
            });
            
            // Extract text from PDF
            const pdfData = await testBench.extractTextFromPDF(pdfFile);
            
            // Limit text for testing (first 2000 characters to avoid hitting API limits)
            const testText = pdfData.text.substring(0, 2000);
            console.log(`📝 Using first 2000 characters for testing`);
            
            // Run tests
            const results = await testBench.runAllTests(
                testText,
                options.sourceLang,
                options.targetLang,
                providers
            );
            
            // Save results
            const resultDir = await testBench.saveResults(
                results,
                pdfData,
                options.sourceLang,
                options.targetLang
            );
            
            console.log(`\\n🎉 Test completed successfully!`);
            console.log(`📊 View results at: ${resultDir}`);
            
        } catch (error) {
            console.error(`\\n❌ Test failed:`, error.message);
            console.error(error.stack);
            process.exit(1);
        }
    });

program.parse();