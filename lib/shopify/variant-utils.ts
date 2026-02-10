export const normalizeVariantId = (id: unknown): string | undefined => {
  if (typeof id === "string") {
    return id;
  }

  if (!id || typeof id !== "object") {
    return undefined;
  }

  const record = id as {
    variantId?: unknown;
    id?: unknown;
    gid?: unknown;
  };

  if (typeof record.variantId === "string") {
    return record.variantId;
  }

  if (typeof record.id === "string") {
    return record.id;
  }

  if (typeof record.gid === "string") {
    return record.gid;
  }

  return undefined;
};
