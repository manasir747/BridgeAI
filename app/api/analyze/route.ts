import { NextRequest, NextResponse } from 'next/server';
import { analysisRequestSchema } from '@/lib/validation/input.schema';
import { geminiAnalyzer } from '@/services/gemini/analyzer';
import { GeminiServiceError } from '@/services/gemini/client';
import { AnalysisResponse } from '@/types/analysis';

export async function POST(request: NextRequest): Promise<NextResponse<AnalysisResponse>> {
  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_JSON',
            message: 'Request body must be a valid JSON object.',
          },
        },
        { status: 400 }
      );
    }

    // Validate and sanitize input payload
    const parsed = analysisRequestSchema.safeParse(body);
    if (!parsed.success) {
      const issueMessages = parsed.error.issues.map((i) => i.message).join(' ');
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_FAILED',
            message: issueMessages || 'Invalid request parameters.',
            details: parsed.error.issues,
          },
        },
        { status: 400 }
      );
    }

    // Execute analysis
    const result = await geminiAnalyzer.analyze(parsed.data);

    return NextResponse.json(
      {
        success: true,
        data: result,
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    if (err instanceof GeminiServiceError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: err.code,
            message: err.message,
          },
        },
        { status: err.statusCode as 400 | 401 | 422 | 429 | 500 }
      );
    }

    const fallbackMessage =
      process.env.NODE_ENV === 'production'
        ? 'An unexpected error occurred while analyzing the input.'
        : err instanceof Error
        ? err.message
        : 'Unknown server error';

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: fallbackMessage,
        },
      },
      { status: 500 }
    );
  }
}
