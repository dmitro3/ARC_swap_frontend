/**
 * Copies a content to the clipboard. Note that if the content is `typeof object`, then the content
 * will be JSON.stringified.
 *
 * @param content the content to be copied
 * @returns void
 */
export default function copyToClipboard(content: any): void {
  let clipboard;
  if (typeof content === 'object') {
    clipboard = JSON.stringify(content);
  } else clipboard = content;

  const target = document.createElement('textarea');
  target.value = clipboard;
  document.body.appendChild(target);

  target.select();

  document.execCommand('copy');
  document.body.removeChild(target);
}
