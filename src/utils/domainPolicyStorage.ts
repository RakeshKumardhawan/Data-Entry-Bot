import { DomainPolicy, DomainCheckResult, PolicyStatus } from '../types';

const DOMAIN_POLICIES_KEY = 'e_vedhika_domain_automation_policies_v1';

export const INITIAL_DOMAIN_POLICIES: DomainPolicy[] = [
  {
    id: 'pol-1',
    domain: 'portal.grampanchayat.gov.in',
    portalName: 'TMP Official Gram Panchayat Portal',
    status: 'allowed',
    policyNotes: 'అధికారిక పంచాయతీ డేటా ఎంట్రీ ఆపరేటర్లకు బల్క్ ఎక్సెల్ బ్యాచ్ ఎంట్రీకి అనుమతి ఉంది.',
    termsUrl: 'https://portal.grampanchayat.gov.in/terms-of-service',
    lastReviewed: '2026-10-09',
    reviewedBy: 'Admin (Rakesh Kumar)',
  },
  {
    id: 'pol-2',
    domain: 'panchayat.telangana.gov.in',
    portalName: 'Telangana PR & RD Portal',
    status: 'allowed',
    policyNotes: 'పంచాయతీ సెక్రటరీ లాగిన్ ద్వారా అధీకృత బ్యాచ్ డేటా అప్‌లోడ్ నిబంధనలకు అనుగుణంగా ఉంది.',
    termsUrl: 'https://panchayat.telangana.gov.in/guidelines',
    lastReviewed: '2026-10-08',
    reviewedBy: 'Admin (Rakesh Kumar)',
  },
  {
    id: 'pol-3',
    domain: 'strict-portal.ap.gov.in',
    portalName: 'Direct Citizen Self-Service Portal',
    status: 'restricted',
    policyNotes: 'నిబంధనల సెక్షన్ 8.1 ప్రకారం: ఆటోమేటెడ్ హెడ్‌లెస్ బాట్ స్క్రిప్టులు నిషేధించబడ్డాయి. మాన్యువల్ ఎంట్రీ మాత్రమే అవసరం.',
    termsUrl: 'https://strict-portal.ap.gov.in/terms-of-use',
    lastReviewed: '2026-10-07',
    reviewedBy: 'Admin (Rakesh Kumar)',
  }
];

export const getStoredDomainPolicies = (): DomainPolicy[] => {
  try {
    const raw = localStorage.getItem(DOMAIN_POLICIES_KEY);
    if (!raw) {
      localStorage.setItem(DOMAIN_POLICIES_KEY, JSON.stringify(INITIAL_DOMAIN_POLICIES));
      return INITIAL_DOMAIN_POLICIES;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_DOMAIN_POLICIES;
  } catch {
    return INITIAL_DOMAIN_POLICIES;
  }
};

export const saveDomainPolicies = (policies: DomainPolicy[]) => {
  localStorage.setItem(DOMAIN_POLICIES_KEY, JSON.stringify(policies));
};

export const extractDomain = (urlOrDomain: string): string => {
  try {
    let clean = urlOrDomain.trim().toLowerCase();
    if (clean.startsWith('http://') || clean.startsWith('https://')) {
      const parsed = new URL(clean);
      return parsed.hostname;
    }
    // Remove paths if present
    clean = clean.split('/')[0];
    return clean;
  } catch {
    return urlOrDomain.trim().toLowerCase();
  }
};

/**
 * Checks whether automated data entry is permitted on the specified domain.
 * Does NOT guess blacklists.
 * If domain is unknown, safely halts and requests manual review.
 */
export const checkDomainPolicy = (inputDomainOrUrl: string): DomainCheckResult => {
  const policies = getStoredDomainPolicies();
  const targetDomain = extractDomain(inputDomainOrUrl);

  const matched = policies.find((p) => {
    const pDomain = extractDomain(p.domain);
    return targetDomain === pDomain || targetDomain.endsWith(`.${pDomain}`);
  });

  if (!matched) {
    return {
      allowed: false,
      status: 'unknown',
      message: `Unknown Automation Policy for '${targetDomain}'. Automated entry halted safely for manual review.`,
      teluguMessage: `'${targetDomain}' డొమైన్ ఆటోమేషన్ పాలసీ ఇంకా ధృవీకరించబడలేదు. నిబంధనల ఉల్లంఘన జరగకుండా సేఫ్‌గా ఆపి మాన్యువల్ రివ్యూ కోరడం జరిగింది.`,
    };
  }

  if (matched.status === 'restricted') {
    return {
      allowed: false,
      status: 'restricted',
      message: `Automated Entry Blocked: '${matched.domain}' terms strictly prohibit automated scripts. ${matched.policyNotes}`,
      teluguMessage: `ఆటోమేషన్ నిలిపివేయబడింది: '${matched.domain}' వెబ్‌సైట్ నిబంధనల ప్రకారం ఆటోమేటెడ్ ఎంట్రీ అనుమతించబడదు. ${matched.policyNotes}`,
      policy: matched,
    };
  }

  return {
    allowed: true,
    status: 'allowed',
    message: `Automation Verified: '${matched.domain}' allows authorized automated data entry.`,
    teluguMessage: `నిబంధనలు ధృవీకరించబడ్డాయి: '${matched.domain}' అధీకృత ఆటోమేటెడ్ డేటా ఎంట్రీని అనుమతిస్తుంది.`,
    policy: matched,
  };
};

export const addOrUpdateDomainPolicy = (policy: Omit<DomainPolicy, 'id'> & { id?: string }): DomainPolicy[] => {
  const policies = getStoredDomainPolicies();
  const id = policy.id || `pol-${Date.now()}`;
  const existingIdx = policies.findIndex((p) => p.id === id || extractDomain(p.domain) === extractDomain(policy.domain));

  const updatedItem: DomainPolicy = {
    ...policy,
    id,
    domain: extractDomain(policy.domain),
    lastReviewed: new Date().toISOString().split('T')[0],
  };

  let updatedList: DomainPolicy[];
  if (existingIdx >= 0) {
    updatedList = [...policies];
    updatedList[existingIdx] = updatedItem;
  } else {
    updatedList = [updatedItem, ...policies];
  }

  saveDomainPolicies(updatedList);
  return updatedList;
};

export const deleteDomainPolicy = (id: string): DomainPolicy[] => {
  const policies = getStoredDomainPolicies();
  const filtered = policies.filter((p) => p.id !== id);
  saveDomainPolicies(filtered);
  return filtered;
};
