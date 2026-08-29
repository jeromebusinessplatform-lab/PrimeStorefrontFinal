export interface TaggunAnalysis {
  status: "analyzed" | "failed";
  result?: unknown;
  confidence?: number;
  totalAmount?: number;
  merchantName?: string;
  receiptDate?: string;
}

export async function analyzeReceiptWithTaggun(
  image: Blob,
  apiKey: string,
  fetchImpl: typeof fetch = fetch,
): Promise<TaggunAnalysis> {
  if (!apiKey) return { status: "failed" };
  if (image.size <= 0) return { status: "failed" };

  const form = new FormData();
  form.append("file", image, "receipt");
  form.append("extractTime", "false");
  form.append("refresh", "false");

  try {
    const response = await fetchImpl("https://api.taggun.io/api/receipt/v1/simple/file", {
      method: "POST",
      headers: { accept: "application/json", apikey: apiKey },
      body: form,
    });
    if (!response.ok) return { status: "failed" };

    const result = await response.json() as Record<string, unknown>;
    const totalAmount = result.totalAmount as Record<string, unknown> | undefined;
    const merchantName = result.merchantName as Record<string, unknown> | undefined;
    const date = result.date as Record<string, unknown> | undefined;
    return {
      status: "analyzed",
      result,
      confidence: typeof result.confidenceLevel === "number" ? result.confidenceLevel : undefined,
      totalAmount: typeof totalAmount?.data === "number" ? totalAmount.data : undefined,
      merchantName: typeof merchantName?.data === "string" ? merchantName.data : undefined,
      receiptDate: typeof date?.data === "string" ? date.data : undefined,
    };
  } catch {
    return { status: "failed" };
  }
}

export function receiptAnalysisMustNotBlockSubmission(): true {
  return true;
}
