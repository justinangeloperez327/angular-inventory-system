export function toActiveFilter(status: string): boolean | undefined {
  if (status === 'active') {
    return true;
  }

  if (status === 'inactive') {
    return false;
  }

  return undefined;
}
