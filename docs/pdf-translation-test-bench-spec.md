# PDF Translation Test Bench Specification

## Overview

This document specifies the requirements and design for a CLI-based test bench to compare translation quality between the current CostaBeach translation implementation and the pdf-translator package across multiple AI providers.

## Objectives

1. **Compare Translation Quality**: Evaluate the current CostaBeach implementation vs pdf-translator package
2. **Multi-Provider Testing**: Test all available AI providers (OpenAI, Anthropic, Google Gemini)
3. **Language Coverage**: Focus on French ↔ Arabic ↔ English translations
4. **Quality Assessment**: Generate comprehensive comparison reports for decision-making

## Test Scope

### Target Languages
- **French (fr)** - Primary language of the HOA
- **Arabic (ar)** - RTL support required
- **English (en)** - International standard

### Translation Pairs
- French → Arabic
- French → English
- Arabic → French
- Arabic → English
- English → French
- English → Arabic

## Architecture

### Current CostaBeach Implementation
- **AI Provider**: Anthropic Claude (via existing service)
- **Integration**: Uses existing `translationService.ts`
- **Processing**: Text-based translation with PDF reconstruction
- **Models**: Claude 3.5 Sonnet (as configured in main app)

### PDF-Translator Package Implementation
- **OpenAI Provider**:
  - gpt-4o
  - gpt-4o-mini
  - gpt-4-turbo
  - gpt-3.5-turbo
- **Anthropic Provider**:
  - claude-3-5-sonnet-20241022
  - claude-3-5-haiku-20241022
  - claude-3-opus-20240229
  - claude-3-sonnet-20240229
  - claude-3-haiku-20240307
- **Google Gemini Provider**:
  - gemini-1.5-pro
  - gemini-1.5-flash
  - gemini-1.0-pro

## Test Implementation Design

### CLI Interface
```bash
node test-translations.js [pdf-file] [options]

Options:
  --source-lang     Source language (fr, ar, en)
  --target-lang     Target language (fr, ar, en)
  --providers       Comma-separated list (current,openai,anthropic,gemini,all)
  --output-dir      Output directory for results
  --format          Report format (json, markdown, both)
```

### Test Process Flow

1. **PDF Text Extraction**
   - Use `pdf-parse` to extract text content
   - Preserve formatting and structure metadata
   - Handle RTL text properly for Arabic

2. **Translation Execution**
   - **Current Implementation**: Use existing translation service
   - **PDF-Translator Package**: Test each provider/model combination
   - Track execution time and API costs

3. **Quality Assessment**
   - **Length Ratio Analysis**: Compare source vs translation length
   - **Formatting Preservation**: Check structure retention
   - **Content Completeness**: Ensure no missing sections
   - **Technical Terminology**: Verify HOA-specific term handling

4. **Cost Analysis**
   - Token usage per provider
   - Cost per translation
   - Processing time comparison

### Output Structure

```
test-results/
├── input/
│   └── source-document.pdf
├── translations/
│   ├── current-implementation/
│   │   ├── fr-to-ar.pdf
│   │   ├── fr-to-en.pdf
│   │   └── metadata.json
│   ├── openai-gpt4o/
│   │   ├── fr-to-ar.pdf
│   │   ├── fr-to-en.pdf
│   │   └── metadata.json
│   └── ... (other providers)
├── comparison-report.md
├── cost-analysis.json
└── quality-metrics.json
```

## Quality Metrics

### Automated Metrics
- **Length Ratio**: Target/Source text length ratio
- **Processing Time**: Seconds per translation
- **API Cost**: Cost per translation in USD
- **Error Rate**: Failed translations percentage

### Manual Assessment Criteria
- **Translation Accuracy**: Correctness of meaning
- **Cultural Appropriateness**: Context-aware translations
- **Technical Terminology**: HOA/legal term handling
- **Formatting Preservation**: Layout and structure retention
- **RTL Support**: Arabic text rendering quality

## Setup Instructions

### 1. Prerequisites
- Node.js >= 18
- Git repository cloned locally
- PDF documents to test (HOA documents work best)

### 2. Install Dependencies
```bash
# Install required packages (already included in package.json)
npm install
```

### 3. Configure API Keys
Add the following to your `.env` file:
```bash
# Required for translation testing
ANTHROPIC_API_KEY=sk-ant-your-anthropic-key
OPENAI_API_KEY=sk-your-openai-key

# Optional (can skip for initial testing)
GOOGLE_GENERATIVE_AI_API_KEY=your-google-key
```

### 4. Test Setup
```bash
# Verify installation
node test-translations-fixed.js --help

# Test with sample PDF (should show extraction working, translation will fail without API keys)
node test-translations-fixed.js path/to/your/document.pdf --source-lang fr --target-lang en
```

## How to Use

### Basic Usage
```bash
# Test specific document with all providers
node test-translations-fixed.js "your-document.pdf" --source-lang fr --target-lang en

# Test only certain providers
node test-translations-fixed.js "document.pdf" --providers current,openai

# Limit text length for faster testing
node test-translations-fixed.js "document.pdf" --max-chars 1000
```

### Common Commands
```bash
# Test French to English (most common)
node test-translations-fixed.js "meeting-minutes.pdf" --source-lang fr --target-lang en

# Test French to Arabic (for multilingual community)
node test-translations-fixed.js "budget.pdf" --source-lang fr --target-lang ar

# Compare current implementation vs OpenAI
node test-translations-fixed.js "report.pdf" --providers current,openai

# Full test with all providers (requires all API keys)
node test-translations-fixed.js "document.pdf" --providers all
```

### Understanding Results
After running a test, you'll find results in `./test-results-fixed/[test-id]/`:
- `report.md` - Human-readable comparison report
- `results.json` - Raw data and metrics
- `translations/` - Individual translation files from each provider

### Troubleshooting
```bash
# Debug PDF extraction issues
node debug-pdf-extract.js

# Test API providers without PDF
node test-sample-text.js

# Check if PDFs are text-based or scanned
# - Text-based: High word count (>100 words for typical documents)
# - Scanned: Low word count (<10 words) - requires OCR
```

## Environment Requirements

### Required API Keys
```bash
# Existing
ANTHROPIC_API_KEY=sk-ant-your-key
OPENAI_API_KEY=sk-your-key

# New requirement
GOOGLE_GENERATIVE_AI_API_KEY=your-google-key
```

### Dependencies
- Node.js >= 18
- All existing project dependencies
- pdf-parse for text extraction
- pdf-lib for PDF generation
- Provider SDKs (@anthropic-ai/sdk, openai, @google/generative-ai)

## Test Data

The test bench will use real HOA documents provided by the user, including:
- Meeting minutes
- Financial reports
- Legal documents
- Community announcements
- Maintenance notices

## Success Criteria

1. **Completeness**: All providers tested successfully
2. **Accuracy**: Meaningful quality comparison data generated
3. **Usability**: Clear recommendation for best implementation
4. **Performance**: Processing time and cost analysis complete
5. **Documentation**: Comprehensive report for decision-making

## Implementation Phases

### Phase 1: Core Infrastructure
- CLI script setup
- PDF text extraction
- Provider integration

### Phase 2: Translation Testing
- Current implementation integration
- PDF-translator package testing
- All provider/model combinations

### Phase 3: Analysis & Reporting
- Quality metrics calculation
- Cost analysis
- Comparison report generation

## Expected Outcomes

1. **Performance Ranking**: Providers ranked by translation quality
2. **Cost Analysis**: Price/performance comparison
3. **Implementation Recommendation**: Best approach for CostaBeach
4. **Integration Strategy**: How to merge/replace current implementation

## Usage Example

```bash
# Test all providers for French to Arabic translation
node test-translations.js ./sample-hoa-document.pdf --source-lang fr --target-lang ar --providers all

# Test only current vs best Anthropic model
node test-translations.js ./legal-document.pdf --source-lang fr --target-lang en --providers current,anthropic

# Generate detailed report
node test-translations.js ./meeting-minutes.pdf --source-lang ar --target-lang fr --format both --output-dir ./detailed-results
```

## Post-Test Analysis

The test results will inform:
1. Whether to keep current implementation or switch to pdf-translator package
2. Which AI provider offers best quality for HOA content
3. Cost optimization strategies
4. Implementation roadmap for selected approach