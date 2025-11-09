import { NextRequest, NextResponse } from "next/server";

// Types
interface PDFParseResult {
  text: string;
  numPages: number;
}

interface DocumentMetrics {
  totalClauses: number;
  expiringSoon: boolean;
  complianceScore: number;
  rentAmount: string;
}

interface DocumentAnalysisResult {
  fileName: string;
  numPages: number;
  metrics: DocumentMetrics;
  aiSummary: string;
}

// ✅ Helper: safely import pdf-parse at runtime
async function loadPdfParse() {
  try {
    const mod = await import("pdf-parse");
    return mod.default || mod;
  } catch (err) {
    console.error("Failed to import pdf-parse:", err);
    throw new Error("Failed to import pdf-parse library");
  }
}

// ✅ Core helper: extract text + metadata
async function extractTextFromPDF(buffer: Buffer): Promise<PDFParseResult> {
  try {
    const pdfParse = await loadPdfParse();

    if (typeof pdfParse !== "function") {
      throw new Error("Invalid pdf-parse import — expected a function.");
    }

    console.log("Parsing PDF buffer, size:", buffer.length, "bytes");

    const data = await pdfParse(buffer);
    if (!data) throw new Error("No data returned from pdf-parse.");

    const text = data.text || "";
    const numPages = data.numpages || data.numPages || 0;

    console.log("✅ PDF parsed successfully:", { numPages, textLength: text.length });
    return { text, numPages };
  } catch (err: any) {
    console.error("❌ Error parsing PDF:", err);
    throw new Error(`Failed to extract text from PDF: ${err.message || "Unknown error"}`);
  }
}

// ✅ Analyze document text to extract metrics
function analyzeDocument(text: string, fileName: string): DocumentMetrics {
  const lowerText = text.toLowerCase();
  const lowerFileName = fileName.toLowerCase();

  // Extract clauses - look for common clause keywords
  const clauseKeywords = [
    'clause', 'section', 'article', 'paragraph', 'term', 'condition',
    'renewal', 'termination', 'maintenance', 'insurance', 'indemnification',
    'sublease', 'assignment', 'force majeure', 'default', 'penalty',
    'energy', 'utility', 'hvac', 'compliance', 'warranty', 'liability'
  ];
  
  let totalClauses = 0;
  for (const keyword of clauseKeywords) {
    const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
    const matches = text.match(regex);
    if (matches) {
      totalClauses += matches.length;
    }
  }
  
  // Normalize clause count (divide by common words to get unique clauses)
  totalClauses = Math.max(1, Math.floor(totalClauses / 3));

  // Extract rent amount - look for currency patterns
  const rentPatterns = [
    /\$[\d,]+(?:\.\d{2})?/g,
    /(?:rent|monthly rent|base rent)[\s\S]{0,100}?\$[\d,]+(?:\.\d{2})?/gi,
    /(?:rental|lease amount)[\s\S]{0,100}?\$[\d,]+(?:\.\d{2})?/gi,
  ];
  
  let rentAmount = "N/A";
  for (const pattern of rentPatterns) {
    const matches = text.match(pattern);
    if (matches && matches.length > 0) {
      // Extract the dollar amount
      const dollarMatch = matches[0].match(/\$[\d,]+(?:\.\d{2})?/);
      if (dollarMatch) {
        rentAmount = dollarMatch[0];
        break;
      }
    }
  }

  // Check for expiration dates - look for date patterns near expiration keywords
  const expirationKeywords = ['expire', 'expiration', 'expiry', 'terminate', 'end date', 'lease end'];
  const datePatterns = [
    /\d{1,2}\/\d{1,2}\/\d{4}/g,
    /\d{4}-\d{2}-\d{2}/g,
    /(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}/gi,
  ];
  
  let expiringSoon = false;
  const now = new Date();
  const sixMonthsFromNow = new Date(now.getTime() + 180 * 24 * 60 * 60 * 1000);
  
  for (const keyword of expirationKeywords) {
    const keywordIndex = lowerText.indexOf(keyword);
    if (keywordIndex !== -1) {
      // Look for dates near the keyword
      const context = text.substring(Math.max(0, keywordIndex - 200), Math.min(text.length, keywordIndex + 200));
      for (const pattern of datePatterns) {
        const dates = context.match(pattern);
        if (dates) {
          for (const dateStr of dates) {
            try {
              const date = new Date(dateStr);
              if (date <= sixMonthsFromNow && date >= now) {
                expiringSoon = true;
                break;
              }
            } catch (e) {
              // Invalid date, skip
            }
          }
          if (expiringSoon) break;
        }
      }
      if (expiringSoon) break;
    }
  }

  // Calculate compliance score based on keywords and patterns
  let complianceScore = 95; // Start high
  
  // Negative indicators reduce compliance
  const riskKeywords = ['risk', 'warning', 'violation', 'non-compliance', 'breach', 'default'];
  for (const keyword of riskKeywords) {
    const matches = lowerText.match(new RegExp(`\\b${keyword}\\b`, 'gi'));
    if (matches) {
      complianceScore -= matches.length * 2;
    }
  }
  
  // Positive indicators increase compliance
  const complianceKeywords = ['compliance', 'compliant', 'certified', 'approved', 'validated'];
  for (const keyword of complianceKeywords) {
    const matches = lowerText.match(new RegExp(`\\b${keyword}\\b`, 'gi'));
    if (matches) {
      complianceScore += matches.length;
    }
  }
  
  // Ensure compliance score is between 50 and 100
  complianceScore = Math.max(50, Math.min(100, complianceScore));
  
  // Round to nearest integer
  complianceScore = Math.round(complianceScore);

  return {
    totalClauses,
    expiringSoon,
    complianceScore,
    rentAmount,
  };
}

// ✅ Generate AI summary (optional - falls back to rule-based summary)
async function generateAISummary(
  text: string,
  fileName: string,
  metrics: DocumentMetrics
): Promise<string> {
  try {
    // Check if OpenAI API key is available
    const openaiApiKey = process.env.OPENAI_API_KEY;
    
    if (!openaiApiKey) {
      // Fallback to rule-based summary
      return generateRuleBasedSummary(fileName, metrics);
    }

    // Use OpenAI API for summary
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are a real estate document analyst. Summarize key findings in 2-3 sentences, highlighting risk, rent, and compliance indicators.",
          },
          {
            role: "user",
            content: `Analyze this document (${fileName}):\n\n${text.substring(0, 4000)}...\n\nKey metrics: ${metrics.totalClauses} clauses, ${metrics.complianceScore}% compliance, Rent: ${metrics.rentAmount}, Expiring soon: ${metrics.expiringSoon}`,
          },
        ],
        max_tokens: 150,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error("OpenAI API request failed");
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || generateRuleBasedSummary(fileName, metrics);
  } catch (error) {
    console.error("Error generating AI summary:", error);
    // Fallback to rule-based summary
    return generateRuleBasedSummary(fileName, metrics);
  }
}

// ✅ Generate rule-based summary as fallback
function generateRuleBasedSummary(fileName: string, metrics: DocumentMetrics): string {
  const location = fileName.match(/([A-Z][a-z]+)/)?.[1] || "the document";
  const clausesText = metrics.totalClauses === 1 ? "1 clause" : `${metrics.totalClauses} clauses`;
  const complianceText = `${metrics.complianceScore}% compliance`;
  const rentText = metrics.rentAmount !== "N/A" ? ` with rent of ${metrics.rentAmount}` : "";
  const expiringText = metrics.expiringSoon ? " (expiring soon)" : "";
  
  return `${location} lease shows ${clausesText} and ${complianceText}${rentText}${expiringText}.`;
}

// ✅ Main route: handles PDF upload and analysis
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
    }

    const fileName = file.name;
    const fileType = file.type;
    const ext = fileName.split(".").pop()?.toLowerCase();

    if (fileType !== "application/pdf" && ext !== "pdf") {
      return NextResponse.json(
        { error: "Invalid file type. Only PDF files are supported." },
        { status: 400 }
      );
    }

    console.log(`📄 Received file: ${fileName} (${fileType})`);

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // ✅ Extract text + page count from buffer
    const { text, numPages } = await extractTextFromPDF(buffer);

    // ✅ Analyze document to extract metrics
    const metrics = analyzeDocument(text, fileName);

    // ✅ Generate AI summary (with fallback)
    const aiSummary = await generateAISummary(text, fileName, metrics);

    // ✅ Return structured response
    const result: DocumentAnalysisResult = {
      fileName,
      numPages,
      metrics,
      aiSummary,
    };

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (err: any) {
    console.error("❌ Document processing error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to process PDF" },
      { status: 500 }
    );
  }
}
