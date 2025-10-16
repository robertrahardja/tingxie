/**
 * Tingxie Student Progress API
 * Cloudflare Worker to sync student progress across devices using KV
 */

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // API Routes
    if (url.pathname === '/api/progress') {
      if (request.method === 'GET') {
        return handleGetProgress(request, env, corsHeaders);
      } else if (request.method === 'POST') {
        return handleSaveProgress(request, env, corsHeaders);
      }
    }

    // Serve static files (fallback to the static site)
    return env.ASSETS.fetch(request);
  },
};

/**
 * GET /api/progress?studentId=xxx
 * Retrieve student progress from KV
 */
async function handleGetProgress(request, env, corsHeaders) {
  try {
    const url = new URL(request.url);
    const studentId = url.searchParams.get('studentId');

    if (!studentId) {
      return new Response(
        JSON.stringify({ error: 'studentId is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const key = `student:${studentId}:tingxie:progress`;
    const progress = await env.STUDENT_PROGRESS.get(key, 'json');

    if (!progress) {
      // Return empty progress if student not found
      return new Response(
        JSON.stringify({
          knownWords: [],
          unknownWords: [],
          lastUpdated: null
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify(progress),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

/**
 * POST /api/progress
 * Save student progress to KV
 * Body: { studentId, knownWords, unknownWords }
 */
async function handleSaveProgress(request, env, corsHeaders) {
  try {
    const body = await request.json();
    const { studentId, knownWords, unknownWords } = body;

    if (!studentId) {
      return new Response(
        JSON.stringify({ error: 'studentId is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const key = `student:${studentId}:tingxie:progress`;
    const progress = {
      knownWords: knownWords || [],
      unknownWords: unknownWords || [],
      lastUpdated: Date.now()
    };

    await env.STUDENT_PROGRESS.put(key, JSON.stringify(progress));

    return new Response(
      JSON.stringify({ success: true, progress }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}
