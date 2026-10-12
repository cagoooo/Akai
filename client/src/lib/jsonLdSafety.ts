/** JSON-LD 放在 script 原始文字時，JSON.stringify 本身不會阻止 </script>。 */
export function serializeJsonLd(value: unknown): string {
  return (JSON.stringify(value) ?? 'null').replace(/[<>&\u2028\u2029]/g, (character) => ({
    '<': '\\u003c',
    '>': '\\u003e',
    '&': '\\u0026',
    '\u2028': '\\u2028',
    '\u2029': '\\u2029',
  })[character]!);
}
