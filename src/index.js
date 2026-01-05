/**
 * Main Worker entry point
 * Handles routing and asset serving
 */

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Handle API routes
    if (url.pathname.startsWith('/api/')) {
      if (url.pathname === '/api/vocabulary') {
        return await handleVocabularyRequest(env);
      }
      if (url.pathname.startsWith('/api/progress')) {
        return await handleProgress(request, env);
      }
    }

    // Handle root path - redirect to latest.html
    if (url.pathname === '' || url.pathname === '/') {
      return Response.redirect(new URL('/latest.html', url.origin), 302);
    }

    // Serve static assets from Worker assets binding
    return await env.ASSETS.fetch(request);
  },
};

/**
 * Handle /api/vocabulary request
 */
async function handleVocabularyRequest(env) {
  try {
    // Fetch the vocabulary JSON file using the assets binding
    const assetRequest = new Request('https://dummy.com/data/tingxie/tingxie_vocabulary.json');
    const response = await env.ASSETS.fetch(assetRequest);

    if (response.ok) {
      return new Response(response.body, {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Vocabulary data not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

/**
 * Handle /api/progress requests
 */
async function handleProgress(request, env) {
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
    return await handleGetProgress(url, env, corsHeaders);
  }

  // Handle POST request
  if (request.method === 'POST') {
    return await handleSaveProgress(request, env, corsHeaders);
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
          lastUpdated: null,
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(JSON.stringify(progress), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
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

    // Remove duplicates by converting to Set and back to Array
    const uniqueKnownWords = [...new Set(knownWords || [])];
    const uniqueUnknownWords = [...new Set(unknownWords || [])];

    const progress = {
      knownWords: uniqueKnownWords,
      unknownWords: uniqueUnknownWords,
      lastUpdated: Date.now(),
    };

    await env.STUDENT_PROGRESS.put(key, JSON.stringify(progress));

    return new Response(JSON.stringify({ success: true, progress }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}

