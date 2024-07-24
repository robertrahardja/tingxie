// src/pages/api/translate.js
export async function get({ request }) {
  console.log("Translate API called");
  const url = new URL(request.url);
  const text = url.searchParams.get("text");
  const lang = url.searchParams.get("lang");

  console.log(`Text: ${text}, Language: ${lang}`);

  if (!text || !lang) {
    console.log("Missing parameters");
    return new Response(JSON.stringify({ error: "Missing parameters" }), {
      status: 400,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  const googleUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=${lang}&client=tw-ob`;

  try {
    console.log("Fetching from Google Translate");
    const response = await fetch(googleUrl);
    if (!response.ok) {
      console.log("Google Translate response not ok");
      throw new Error(
        `Google Translate responded with status: ${response.status}`,
      );
    }
    const audioBuffer = await response.arrayBuffer();

    console.log("Sending audio back to client");
    return new Response(audioBuffer, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
      },
    });
  } catch (error) {
    console.error("Error in translate API:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}
