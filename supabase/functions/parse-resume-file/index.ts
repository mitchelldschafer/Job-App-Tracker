import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { extract } from "npm:@extractus/article-extractor@8.0.7";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface PDFDocument {
  text: string;
}

async function parsePDF(arrayBuffer: ArrayBuffer): Promise<string> {
  const pdfParse = (await import("npm:pdf-parse@1.1.1")).default;
  const data: PDFDocument = await pdfParse(Buffer.from(arrayBuffer));
  return data.text;
}

async function parseDOCX(arrayBuffer: ArrayBuffer): Promise<string> {
  const mammoth = await import("npm:mammoth@1.6.0");
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const contentType = req.headers.get("content-type") || "";
    let fileBuffer: ArrayBuffer;
    let fileType: string;

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File;
      
      if (!file) {
        return new Response(
          JSON.stringify({ error: "No file provided" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      fileBuffer = await file.arrayBuffer();
      fileType = file.type;
    } else {
      return new Response(
        JSON.stringify({ error: "Invalid content type. Expected multipart/form-data" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    let extractedText = "";

    if (fileType === "application/pdf") {
      extractedText = await parsePDF(fileBuffer);
    } else if (
      fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      fileType === "application/msword"
    ) {
      extractedText = await parseDOCX(fileBuffer);
    } else {
      return new Response(
        JSON.stringify({ error: "Unsupported file type. Please upload a PDF or DOCX file." }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({ text: extractedText }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error parsing file:", error);
    return new Response(
      JSON.stringify({ 
        error: "Failed to parse file",
        details: error instanceof Error ? error.message : String(error)
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});