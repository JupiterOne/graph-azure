/**
 * When getting Diagnostic Settings for some Azure Resources, the Diagnostic Settings id is returned from the client without the leading slash.
 * This function adds the leading slash to an id, if it does not exist
 * @param id The resource URI of an Azure resource
 */
export function normalizeId(id: string | undefined): string | undefined {
  if (!id) return id;
  return id.startsWith('/') ? id : `/${id}`;
}
