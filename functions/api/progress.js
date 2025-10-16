/**
 * Cloudflare Pages Function for student progress API
 * Handles GET and POST requests to /api/progress
 */

export async function onRequest(context) {
  const { request, env } = context;
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

  // Handle GET request
  if (request.method === 'GET') {
    return handleGetProgress(url, env, corsHeaders);
  }

  // Handle POST request
  if (request.method === 'POST') {
    return handleSaveProgress(request, env, corsHeaders);
  }

  return new Response('Method not allowed', { status: 405, headers: corsHeaders });
}

/**
 * GET /api/progress?studentId=xxx
 */
async function handleGetProgress(url, env, corsHeaders) {
  try {
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
