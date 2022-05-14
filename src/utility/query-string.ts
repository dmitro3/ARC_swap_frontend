/**
 * Parses the search string in the URL into an object.
 *
 * @returns a generic object containing all the query params
 */
function parseQueryString(): {
  [key: string]: string;
} {
  const queryObj: any = {};
  const query = window.location.search;
  if (query.length) {
    const parts = query.replace('?', '').split('&');
    parts.forEach((part: string) => {
      const queryParams = part.split('=');
      if (Array.isArray(queryParams) && queryParams.length === 2) {
        const [key, value] = queryParams;
        queryObj[key] = value;
      }
    });
  }
  return queryObj;
}

export default parseQueryString;
