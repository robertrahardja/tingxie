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

    // Serve static assets from R2
    try {
      let pathname = url.pathname;

      // Remove leading slash
      if (pathname.startsWith('/')) {
        pathname = pathname.slice(1);
      }

      // Decode URL-encoded characters
      pathname = decodeURIComponent(pathname);

      // Handle root path
      if (pathname === '' || pathname === '/') {
        pathname = 'index.html';
      }

      // Try to get the requested asset from R2
      const object = await env.ASSETS.get(pathname);

      if (object !== null) {
        // Determine content type
        const contentType = getContentType(pathname);
        return new Response(object.body, {
          status: 200,
          headers: {
            'Content-Type': contentType,
            'Cache-Control': 'public, max-age=3600',
          },
        });
      }

      // For SPA routing, fallback to index.html ONLY for HTML routes
      // Don't fallback for JS, CSS, JSON, or other assets
      const isAssetPath = /\.(js|css|json|mp3|png|jpg|jpeg|gif|svg|woff|woff2|ttf)$/i.test(pathname);

      if (!isAssetPath) {
        const fallback = await env.ASSETS.get('index.html');
        if (fallback !== null) {
          return new Response(fallback.body, {
            status: 200,
            headers: {
              'Content-Type': 'text/html',
              'Cache-Control': 'public, max-age=3600',
            },
          });
        }
      }

      return new Response('Not found', { status: 404 });
    } catch (e) {
      return new Response('Error serving asset: ' + e.message, { status: 500 });
    }
  },
};

/**
 * Handle /api/vocabulary request
 */
async function handleVocabularyRequest(env) {
  try {
    const object = await env.ASSETS.get('data/tingxie/tingxie_vocabulary.json');

    if (object !== null) {
      return new Response(object.body, {
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

/**
 * Get content type based on file extension
 */
function getContentType(pathname) {
  const ext = pathname.split('.').pop();
  const types = {
    html: 'text/html',
    css: 'text/css',
    js: 'application/javascript',
    json: 'application/json',
    mp3: 'audio/mpeg',
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    gif: 'image/gif',
    svg: 'image/svg+xml',
  };
  return types[ext] || 'application/octet-stream';
}
