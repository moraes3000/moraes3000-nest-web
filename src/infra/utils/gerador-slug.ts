import * as randomstring from 'randomstring';

export function generateSlug(name: string): string {
  const trimmedName = name.trim();
  const withoutSpecialChars = trimmedName.replace(/[^\w\s]/gi, '');
  const slug = withoutSpecialChars.replace(/\s+/g, '-');
  return slug.toLowerCase();
}

export function generateUniqueHash(): string {
  return randomstring.generate({
    length: 5,
    charset: 'alphanumeric',
  });
}
