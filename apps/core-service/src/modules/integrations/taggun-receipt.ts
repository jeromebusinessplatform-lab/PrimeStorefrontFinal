export interface TaggunAnalysis {
  status: "analyzed" | "failed";
  result?: unknown;
}

export async function analyzeReceiptWithTaggun(
  image: Blob,
  apiKey: string,
): Promise<TaggunAnalysis> {
  if (!apiKey) throw new Error("taggun_api_key_missing");
  const form = new FormData();
  form.append("file", image, "receipt");
  form.append("extractTime", "false");
  form.append("refresh", "false");

  try {
    const response = await fetch("https://api.taggun.io/api/receipt/v1/simple/file", {
      method: "POST",
      headers: { accept: "application/json", apikey: apiKey },
      body: form,
    });
    if (!response.ok) return { status: "failed" };
    return { status: "analyzed", result: await response.json() };
  } catch {
    return { status: "failed" };
  }
}

export function receiptAnalysisMustNotBlockSubmission(): true {
  return true;
}
