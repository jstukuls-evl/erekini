import type { UrCompanyHit, UrSearchResponse } from "@/lib/ur/types";

/**
 * Server-side UR (Uzņēmumu reģistrs) company search.
 *
 * TODO: Replace stub with real open-data client using UR_OPEN_DATA_BASE_URL
 * (and UR_API_KEY if required). Prefer official / licensed datasets only.
 */
export async function searchUrCompanies(
  query: string,
): Promise<UrSearchResponse> {
  const q = query.trim();

  if (q.length < 2) {
    return { query: q, results: [], stub: true };
  }

  const baseUrl = process.env.UR_OPEN_DATA_BASE_URL;

  if (!baseUrl) {
    return {
      query: q,
      results: stubResults(q),
      stub: true,
      note: "UR_OPEN_DATA_BASE_URL nav iestatīts — tiek rādīti stub rezultāti.",
    };
  }

  // TODO: real HTTP fetch against the chosen UR open-data API.
  // Keep this function server-only; never call from the browser with secrets.
  return {
    query: q,
    results: stubResults(q),
    stub: true,
    note: "UR klients vēl nav implementēts — stub rezultāti.",
  };
}

function stubResults(query: string): UrCompanyHit[] {
  const needle = query.toLowerCase();
  const samples: UrCompanyHit[] = [
    {
      sourceId: "ur-stub-40003000000",
      legalName: "SIA Demo Rēķini",
      registrationNumber: "40003000000",
      vatNumber: "LV40003000000",
      addressLine1: "Brīvības iela 1",
      city: "Rīga",
      postalCode: "LV-1010",
      countryCode: "LV",
    },
    {
      sourceId: "ur-stub-40003111111",
      legalName: "SIA Ziemeļu IT",
      registrationNumber: "40003111111",
      vatNumber: "LV40003111111",
      addressLine1: "Dzirnavu iela 10",
      city: "Rīga",
      postalCode: "LV-1010",
      countryCode: "LV",
    },
    {
      sourceId: "ur-stub-50002222222",
      legalName: "IK Meža Grāmata",
      registrationNumber: "50002222222",
      addressLine1: "Lielā iela 5",
      city: "Liepāja",
      postalCode: "LV-3401",
      countryCode: "LV",
    },
  ];

  return samples.filter(
    (s) =>
      s.legalName.toLowerCase().includes(needle) ||
      s.registrationNumber.includes(needle.replace(/\s/g, "")),
  );
}
