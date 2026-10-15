/**
 * Helper to identify if a priest is marked deceased
 */
export const isPriestDeceased = (p) => {
  if (!p) return false;
  if (p.isDeceased === true || p.isDeceased === 'true') return true;
  if (p.priestStatus === 'DECEASED' || p.priestStatus === 'FORMER_DECEASED') return true;
  if (p.fullName && (p.fullName.includes('†') || p.fullName.includes('✝'))) return true;
  if (p.title && p.title.toLowerCase().includes('deceased')) return true;
  if (p.serviceEnd && p.serviceEnd.toLowerCase().includes('deceased')) return true;
  return false;
};

/**
 * Utility to parse year numbers from terms like "2025", "Present", "2018-2025"
 */
export const parseYear = (val) => {
  if (!val) return 0;
  if (val.toString().toLowerCase().trim() === 'present') return 9999;
  const match = val.toString().match(/\d{4}/);
  return match ? parseInt(match[0], 10) : 0;
};

/**
 * Rank titles so Team Moderator / Parochial Vicar appear ahead within the same term
 */
export const getRoleRank = (title = '') => {
  const t = title.toLowerCase();
  if (t.includes('moderator')) return 1;
  if (t.includes('vicar')) return 2;
  if (t.includes('parish priest')) return 3;
  return 4;
};

/**
 * Autosorts priests:
 * 1. Current set ('CURRENT') on top
 * 2. Year descending (serviceEnd, then serviceStart)
 * 3. Role hierarchy (Moderator > Parochial Vicar > Parish Priest)
 * 4. Display order / id tie-breaker
 */
export const sortPriests = (list = []) => {
  return [...list].sort((a, b) => {
    // 1. CURRENT status on top
    const aCurrent = a.priestStatus === 'CURRENT' ? 1 : 0;
    const bCurrent = b.priestStatus === 'CURRENT' ? 1 : 0;
    if (aCurrent !== bCurrent) {
      return bCurrent - aCurrent; // CURRENT (1) comes before FORMER (0)
    }

    // 2. Sort by serviceEnd year descending (Present = 9999)
    const aEnd = aCurrent ? (parseYear(a.serviceEnd) || 9999) : parseYear(a.serviceEnd);
    const bEnd = bCurrent ? (parseYear(b.serviceEnd) || 9999) : parseYear(b.serviceEnd);
    if (aEnd !== bEnd) return bEnd - aEnd;

    // 3. Within the year range, Team Moderator is unconditionally first!
    const rankDiff = getRoleRank(a.title) - getRoleRank(b.title);
    if (rankDiff !== 0) return rankDiff;

    // 4. Sort by serviceStart year descending
    const aStart = parseYear(a.serviceStart);
    const bStart = parseYear(b.serviceStart);
    if (aStart !== bStart) return bStart - aStart;

    // 5. Display order / id
    const aOrder = a.displayOrder != null ? a.displayOrder : 0;
    const bOrder = b.displayOrder != null ? b.displayOrder : 0;
    if (aOrder !== bOrder) return aOrder - bOrder;

    return (a.id || 0) - (b.id || 0);
  });
};
